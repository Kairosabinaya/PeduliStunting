# export-model-from-rds.R
#
# One-shot helper that converts the fitted GTWENOLR object stored in
# `docs/source/tahap5D_gtwenolr_adaptif.rds` into flat CSV/JSON files that
# the TypeScript `scripts/import-model.ts` can ingest.
#
# Run from the project root:
#   Rscript scripts/export-model-from-rds.R
#
# Output (written to docs/source/_generated/, gitignored):
#   - model_metadata.json    -> populates `model_metadata`
#   - model_predictions.csv  -> populates `model_predictions`
#   - model_coefficients.csv -> populates `model_coefficients` (optional)
#
# The RDS may contain a list with different field names depending on the
# training pipeline. This script attempts a few canonical shapes and falls
# back to writing what it can find — `import-model.ts` skips gracefully when
# any one CSV is absent.

suppressPackageStartupMessages({
  library(jsonlite)
})

# Null-coalescing helper (avoids needing rlang/tidyverse).
`%||%` <- function(a, b) if (is.null(a)) b else a

ROOT <- normalizePath(file.path(dirname(sys.frame(1)$ofile), ".."))
SOURCE_RDS <- file.path(ROOT, "docs", "source", "tahap5D_gtwenolr_adaptif.rds")
OUT_DIR <- file.path(ROOT, "docs", "source", "_generated")
dir.create(OUT_DIR, recursive = TRUE, showWarnings = FALSE)

if (!file.exists(SOURCE_RDS)) {
  stop(sprintf("RDS not found: %s", SOURCE_RDS))
}

cat(sprintf("[export-model] reading %s\n", SOURCE_RDS))
model <- readRDS(SOURCE_RDS)

# --- helpers -----------------------------------------------------------------

pluck <- function(obj, ...) {
  keys <- c(...)
  for (k in keys) {
    if (!is.null(obj[[k]])) return(obj[[k]])
  }
  return(NULL)
}

as_numeric_safe <- function(x) {
  if (is.null(x)) return(NA_real_)
  as.numeric(x)
}

# --- metadata ----------------------------------------------------------------

version_id <- pluck(model, "version", "model_version", "id")
if (is.null(version_id)) version_id <- "gtwenolr-adaptive-1.0"

metadata <- list(
  version = version_id,
  name = pluck(model, "name") %||% "GTWENOLR (adaptive bandwidth)",
  hyperparameters = list(
    hs = as_numeric_safe(pluck(model, "hs", "h_s", "bandwidth_spatial")),
    ht = as_numeric_safe(pluck(model, "ht", "h_t", "bandwidth_temporal")),
    lambda = as_numeric_safe(pluck(model, "lambda")),
    theta = as_numeric_safe(pluck(model, "theta", "alpha_enet"))
  ),
  metrics = list(
    accuracy = as_numeric_safe(pluck(model, "accuracy", "acc_oos")),
    qwk = as_numeric_safe(pluck(model, "qwk")),
    mae = as_numeric_safe(pluck(model, "mae")),
    log_score = as_numeric_safe(pluck(model, "log_score", "logScore"))
  ),
  moran_per_year = pluck(model, "moran_per_year", "moran") %||% list(),
  is_default = TRUE
)

writeLines(
  toJSON(metadata, pretty = TRUE, auto_unbox = TRUE, null = "null"),
  file.path(OUT_DIR, "model_metadata.json")
)
cat(sprintf("[export-model] wrote model_metadata.json (version=%s)\n", version_id))

# --- predictions -------------------------------------------------------------

predictions_df <- pluck(model, "predictions", "preds", "yhat_table")
if (!is.null(predictions_df) && is.data.frame(predictions_df)) {
  colnames(predictions_df) <- tolower(colnames(predictions_df))
  required <- c("kode_bps", "tahun", "predicted_category")
  missing_cols <- setdiff(required, colnames(predictions_df))
  if (length(missing_cols) == 0) {
    write.csv(
      predictions_df,
      file.path(OUT_DIR, "model_predictions.csv"),
      row.names = FALSE,
      na = ""
    )
    cat(sprintf("[export-model] wrote model_predictions.csv (%d rows)\n",
                nrow(predictions_df)))
  } else {
    cat(sprintf("[export-model] skipping predictions (missing cols: %s)\n",
                paste(missing_cols, collapse = ", ")))
  }
} else {
  cat("[export-model] no predictions data frame in RDS; skipping\n")
}

# --- coefficients ------------------------------------------------------------

coefficients_df <- pluck(model, "coefficients", "coefs", "beta_local")
if (!is.null(coefficients_df) && is.data.frame(coefficients_df)) {
  colnames(coefficients_df) <- tolower(colnames(coefficients_df))
  required <- c("kode_bps", "tahun", "predictor_code", "coefficient")
  missing_cols <- setdiff(required, colnames(coefficients_df))
  if (length(missing_cols) == 0) {
    write.csv(
      coefficients_df,
      file.path(OUT_DIR, "model_coefficients.csv"),
      row.names = FALSE,
      na = ""
    )
    cat(sprintf("[export-model] wrote model_coefficients.csv (%d rows)\n",
                nrow(coefficients_df)))
  } else {
    cat(sprintf("[export-model] skipping coefficients (missing cols: %s)\n",
                paste(missing_cols, collapse = ", ")))
  }
} else {
  cat("[export-model] no coefficients data frame in RDS; skipping\n")
}

cat("[export-model] done.\n")
