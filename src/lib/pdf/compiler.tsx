/**
 * PDF Compiler — uses @react-pdf/renderer to generate professional PDF reports.
 * Sesuai dengan ReportService.compilePDF() di Class Diagram.
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ReportContent, SimulationReportData } from "@/lib/llm/types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 50,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1C1917",
  },
  coverPage: {
    paddingTop: 150,
    paddingHorizontal: 50,
    backgroundColor: "#0D9488",
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  coverSubtitle: {
    fontSize: 14,
    color: "#CCFBF1",
    marginBottom: 8,
  },
  coverMeta: {
    fontSize: 11,
    color: "#99F6E4",
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0D9488",
    marginBottom: 12,
    marginTop: 20,
  },
  paragraph: {
    marginBottom: 10,
    lineHeight: 1.6,
  },
  header: {
    fontSize: 9,
    color: "#999",
    marginBottom: 20,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 9,
    color: "#999",
    textAlign: "center",
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-start",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  methodology: {
    fontSize: 10,
    color: "#666",
    lineHeight: 1.5,
  },
});

const CATEGORY_COLORS = {
  Rendah: "#22C55E",
  Sedang: "#EAB308",
  Tinggi: "#EF4444",
};

function ReportDocument({
  content,
  data,
}: {
  content: ReportContent;
  data: SimulationReportData;
}) {
  const catColor =
    CATEGORY_COLORS[data.predictedCategory as keyof typeof CATEGORY_COLORS] ?? "#999";

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>Laporan Simulasi Stunting</Text>
        <Text style={styles.coverSubtitle}>
          Provinsi {data.provinceName}
        </Text>
        <Text style={styles.coverSubtitle}>Tahun Basis: {data.year}</Text>
        <Text style={styles.coverMeta}>
          PeduliStunting.id — Simulasi Kebijakan Berbasis GTWENOLR
        </Text>
        <Text style={styles.coverMeta}>
          Dibuat: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </Text>
      </Page>

      {/* Executive Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>PeduliStunting.id — Laporan Simulasi</Text>
        <Text style={styles.sectionTitle}>Ringkasan Eksekutif</Text>
        <Text style={styles.paragraph}>{content.summary}</Text>

        <Text style={styles.sectionTitle}>Hasil Prediksi</Text>
        <View style={{ marginBottom: 16 }}>
          <View style={[styles.categoryBadge, { backgroundColor: catColor }]}>
            <Text>{data.predictedCategory}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <Text>Probabilitas Rendah</Text>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            {(data.pRendah * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text>Probabilitas Sedang</Text>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            {(data.pSedang * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text>Probabilitas Tinggi</Text>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            {(data.pTinggi * 100).toFixed(1)}%
          </Text>
        </View>
        <Text style={styles.footer}>Halaman 2</Text>
      </Page>

      {/* Interpretation */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>PeduliStunting.id — Laporan Simulasi</Text>
        <Text style={styles.sectionTitle}>Interpretasi Hasil</Text>
        <Text style={styles.paragraph}>{content.interpretation}</Text>

        <Text style={styles.sectionTitle}>Rekomendasi Kebijakan</Text>
        <Text style={styles.paragraph}>{content.recommendation}</Text>
        <Text style={styles.footer}>Halaman 3</Text>
      </Page>

      {/* Methodology Note */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>PeduliStunting.id — Laporan Simulasi</Text>
        <Text style={styles.sectionTitle}>Catatan Metodologi</Text>
        <Text style={styles.methodology}>
          Laporan ini dihasilkan menggunakan model GTWENOLR (Geographically and
          Temporally Weighted Elastic Net Ordinal Logistic Regression). Model ini
          menghasilkan koefisien lokal untuk setiap kombinasi lokasi dan waktu,
          mempertimbangkan variasi spasial dan temporal dalam determinan stunting.
          {"\n\n"}
          Prediksi kategori stunting (Rendah, Sedang, Tinggi) dihitung menggunakan
          formula cumulative logit: P(Y ≤ g | x) = exp(αg + x&apos;β) / (1 + exp(αg +
          x&apos;β)). Nilai variabel prediktor distandardisasi menggunakan mean dan
          standar deviasi dari data historis sebelum dimasukkan ke formula.
          {"\n\n"}
          Interpretasi dan rekomendasi dalam laporan ini dihasilkan menggunakan
          kecerdasan buatan (AI) berdasarkan data simulasi. Hasil ini bersifat
          indikatif dan harus divalidasi oleh ahli sebelum digunakan sebagai dasar
          pengambilan keputusan kebijakan.
        </Text>
        <Text style={styles.footer}>Halaman 4</Text>
      </Page>
    </Document>
  );
}

/** Compile report content into a PDF buffer. */
export async function compilePDF(
  content: ReportContent,
  data: SimulationReportData
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <ReportDocument content={content} data={data} />
  );
  return Buffer.from(buffer);
}
