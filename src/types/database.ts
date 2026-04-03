/**
 * Domain class interfaces and Supabase Database type.
 * Interfaces map 1:1 to the Class Diagram in the spec.
 * Property names use camelCase; database columns use snake_case.
 */

// ---- Enum types ----

export type UserRole = "free" | "premium" | "admin";
export type SubscriptionTier = "profesional" | "institusi";
export type SubscriptionStatus = "active" | "expired" | "cancelled";
export type PaymentStatus = "pending" | "success" | "failed";
export type StuntingCategory = "Rendah" | "Sedang" | "Tinggi";
export type ArticleStatus = "draft" | "published";
export type SimulationType = "province" | "national";
export type UploadStatus = "queued" | "processing" | "complete" | "failed";
export type ModelType = "GTWENOLR" | "GWENOLR" | "ENOLR";

// ---- Domain Interfaces (camelCase) ----

/** Class Diagram: Province */
export interface Province {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  geojson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/** Class Diagram: StuntingData */
export interface StuntingData {
  id: string;
  provinceId: number;
  year: number;
  prevalenceRate: number;
  category: StuntingCategory;
  createdAt: string;
}

/** Class Diagram: PredictorData */
export interface PredictorData {
  id: string;
  provinceId: number;
  year: number;
  x1Ikt: number;
  x2Sanitasi: number;
  x3AirMinum: number;
  x4Kemiskinan: number;
  x5RlsPerempuan: number;
  x6HamilMuda: number;
  x7AsiEksklusif: number;
  x8UnmetNeed: number;
  x9Pph: number;
  x10HunianLayak: number;
  x11Lpp: number;
  x12PersenPenduduk: number;
  x13Kepadatan: number;
  x14RasioJk: number;
  x15Aps: number;
  x16ButaAksara: number;
  x17Imunisasi: number;
  x18Pengangguran: number;
  x19Ipm: number;
  x20Pengeluaran: number;
  createdAt: string;
}

/** Class Diagram: ModelCoefficient */
export interface ModelCoefficient {
  id: string;
  provinceId: number;
  year: number;
  alpha1: number;
  alpha2: number;
  betaCoefficients: Record<string, number>;
  significantVars: string[];
  modelVersion: string;
  createdAt: string;
}

/** Class Diagram: PredictorMeta */
export interface PredictorMeta {
  id: number;
  code: string;
  nameId: string;
  nameEn: string | null;
  description: string | null;
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  meanValue: number;
  stdValue: number;
  source: string | null;
  category: string | null;
  displayOrder: number;
}

/** Class Diagram: Fact */
export interface Fact {
  id: string;
  content: string;
  provinceId: number | null;
  source: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: string;
}

/** Class Diagram: User (maps to profiles table) */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Class Diagram: Subscription */
export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startsAt: string;
  expiresAt: string;
  midtransSubId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Class Diagram: Payment */
export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string | null;
  midtransId: string | null;
  createdAt: string;
}

/** Class Diagram: SimulationHistory */
export interface SimulationHistory {
  id: string;
  userId: string;
  type: SimulationType;
  provinceId: number | null;
  inputParams: Record<string, number>;
  outputResults: PredictionResult;
  reportPdfUrl: string | null;
  createdAt: string;
}

/** Class Diagram: UploadJob */
export interface UploadJob {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  status: UploadStatus;
  modelType: ModelType;
  resultData: Record<string, unknown> | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

/** Class Diagram: Article */
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string | null;
  status: ArticleStatus;
  authorId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- Service types (used by PredictionEngine and ReportService) ----

export interface Coefficients {
  alpha1: number;
  alpha2: number;
  betaCoefficients: Record<string, number>;
  significantVars: string[];
}

export interface StandardizationParams {
  mean: number;
  std: number;
}

export interface PredictionResult {
  pRendah: number;
  pSedang: number;
  pTinggi: number;
  predictedCategory: StuntingCategory;
}

// ---- Supabase Database type (snake_case, matches actual DB columns) ----

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          role?: UserRole;
          avatar_url?: string | null;
        };
        Update: {
          email?: string;
          name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: SubscriptionTier;
          status: SubscriptionStatus;
          starts_at: string;
          expires_at: string;
          midtrans_sub_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier: SubscriptionTier;
          status?: SubscriptionStatus;
          starts_at?: string;
          expires_at: string;
          midtrans_sub_id?: string | null;
        };
        Update: {
          tier?: SubscriptionTier;
          status?: SubscriptionStatus;
          starts_at?: string;
          expires_at?: string;
          midtrans_sub_id?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          subscription_id: string;
          amount: number;
          status: PaymentStatus;
          payment_method: string | null;
          midtrans_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          amount: number;
          status?: PaymentStatus;
          payment_method?: string | null;
          midtrans_id?: string | null;
        };
        Update: {
          status?: PaymentStatus;
          payment_method?: string | null;
          midtrans_id?: string | null;
        };
      };
      provinces: {
        Row: {
          id: number;
          name: string;
          slug: string;
          latitude: number;
          longitude: number;
          geojson: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: number;
          name: string;
          slug: string;
          latitude: number;
          longitude: number;
          geojson?: Record<string, unknown> | null;
        };
        Update: {
          name?: string;
          slug?: string;
          latitude?: number;
          longitude?: number;
          geojson?: Record<string, unknown> | null;
          updated_at?: string;
        };
      };
      stunting_data: {
        Row: {
          id: string;
          province_id: number;
          year: number;
          prevalence_rate: number;
          category: StuntingCategory;
          created_at: string;
        };
        Insert: {
          id?: string;
          province_id: number;
          year: number;
          prevalence_rate: number;
          category: StuntingCategory;
        };
        Update: {
          province_id?: number;
          year?: number;
          prevalence_rate?: number;
          category?: StuntingCategory;
        };
      };
      predictor_data: {
        Row: {
          id: string;
          province_id: number;
          year: number;
          x1_ikt: number | null;
          x2_sanitasi: number | null;
          x3_air_minum: number | null;
          x4_kemiskinan: number | null;
          x5_rls_perempuan: number | null;
          x6_hamil_muda: number | null;
          x7_asi_eksklusif: number | null;
          x8_unmet_need: number | null;
          x9_pph: number | null;
          x10_hunian_layak: number | null;
          x11_lpp: number | null;
          x12_persen_penduduk: number | null;
          x13_kepadatan: number | null;
          x14_rasio_jk: number | null;
          x15_aps: number | null;
          x16_buta_aksara: number | null;
          x17_imunisasi: number | null;
          x18_pengangguran: number | null;
          x19_ipm: number | null;
          x20_pengeluaran: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          province_id: number;
          year: number;
          x1_ikt?: number | null;
          x2_sanitasi?: number | null;
          x3_air_minum?: number | null;
          x4_kemiskinan?: number | null;
          x5_rls_perempuan?: number | null;
          x6_hamil_muda?: number | null;
          x7_asi_eksklusif?: number | null;
          x8_unmet_need?: number | null;
          x9_pph?: number | null;
          x10_hunian_layak?: number | null;
          x11_lpp?: number | null;
          x12_persen_penduduk?: number | null;
          x13_kepadatan?: number | null;
          x14_rasio_jk?: number | null;
          x15_aps?: number | null;
          x16_buta_aksara?: number | null;
          x17_imunisasi?: number | null;
          x18_pengangguran?: number | null;
          x19_ipm?: number | null;
          x20_pengeluaran?: number | null;
        };
        Update: {
          x1_ikt?: number | null;
          x2_sanitasi?: number | null;
          x3_air_minum?: number | null;
          x4_kemiskinan?: number | null;
          x5_rls_perempuan?: number | null;
          x6_hamil_muda?: number | null;
          x7_asi_eksklusif?: number | null;
          x8_unmet_need?: number | null;
          x9_pph?: number | null;
          x10_hunian_layak?: number | null;
          x11_lpp?: number | null;
          x12_persen_penduduk?: number | null;
          x13_kepadatan?: number | null;
          x14_rasio_jk?: number | null;
          x15_aps?: number | null;
          x16_buta_aksara?: number | null;
          x17_imunisasi?: number | null;
          x18_pengangguran?: number | null;
          x19_ipm?: number | null;
          x20_pengeluaran?: number | null;
        };
      };
      predictor_meta: {
        Row: {
          id: number;
          code: string;
          name_id: string;
          name_en: string | null;
          description: string | null;
          unit: string | null;
          min_value: number | null;
          max_value: number | null;
          mean_value: number;
          std_value: number;
          source: string | null;
          category: string | null;
          display_order: number;
        };
        Insert: {
          code: string;
          name_id: string;
          name_en?: string | null;
          description?: string | null;
          unit?: string | null;
          min_value?: number | null;
          max_value?: number | null;
          mean_value: number;
          std_value: number;
          source?: string | null;
          category?: string | null;
          display_order?: number;
        };
        Update: {
          code?: string;
          name_id?: string;
          name_en?: string | null;
          description?: string | null;
          unit?: string | null;
          min_value?: number | null;
          max_value?: number | null;
          mean_value?: number;
          std_value?: number;
          source?: string | null;
          category?: string | null;
          display_order?: number;
        };
      };
      model_coefficients: {
        Row: {
          id: string;
          province_id: number;
          year: number;
          alpha_1: number;
          alpha_2: number;
          beta_coefficients: Record<string, number>;
          significant_vars: string[];
          model_version: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          province_id: number;
          year: number;
          alpha_1: number;
          alpha_2: number;
          beta_coefficients: Record<string, number>;
          significant_vars?: string[];
          model_version?: string | null;
        };
        Update: {
          alpha_1?: number;
          alpha_2?: number;
          beta_coefficients?: Record<string, number>;
          significant_vars?: string[];
          model_version?: string | null;
        };
      };
      facts: {
        Row: {
          id: string;
          content: string;
          province_id: number | null;
          source: string | null;
          category: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          province_id?: number | null;
          source?: string | null;
          category?: string | null;
          is_active?: boolean;
        };
        Update: {
          content?: string;
          province_id?: number | null;
          source?: string | null;
          category?: string | null;
          is_active?: boolean;
        };
      };
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          cover_image_url: string | null;
          category: string | null;
          status: ArticleStatus;
          author_id: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content?: string;
          excerpt?: string | null;
          cover_image_url?: string | null;
          category?: string | null;
          status?: ArticleStatus;
          author_id: string;
          published_at?: string | null;
        };
        Update: {
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          cover_image_url?: string | null;
          category?: string | null;
          status?: ArticleStatus;
          published_at?: string | null;
          updated_at?: string;
        };
      };
      simulation_history: {
        Row: {
          id: string;
          user_id: string;
          type: SimulationType;
          province_id: number | null;
          input_params: Record<string, number>;
          output_results: Record<string, unknown>;
          report_pdf_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: SimulationType;
          province_id?: number | null;
          input_params: Record<string, number>;
          output_results: Record<string, unknown>;
          report_pdf_url?: string | null;
        };
        Update: {
          type?: SimulationType;
          province_id?: number | null;
          input_params?: Record<string, number>;
          output_results?: Record<string, unknown>;
          report_pdf_url?: string | null;
        };
      };
      upload_jobs: {
        Row: {
          id: string;
          user_id: string;
          file_url: string;
          file_name: string;
          status: UploadStatus;
          model_type: ModelType;
          result_data: Record<string, unknown> | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_url: string;
          file_name: string;
          status?: UploadStatus;
          model_type?: ModelType;
          result_data?: Record<string, unknown> | null;
          error_message?: string | null;
        };
        Update: {
          status?: UploadStatus;
          model_type?: ModelType;
          result_data?: Record<string, unknown> | null;
          error_message?: string | null;
          completed_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
      payment_status: PaymentStatus;
      stunting_category: StuntingCategory;
      article_status: ArticleStatus;
      simulation_type: SimulationType;
      upload_status: UploadStatus;
      model_type: ModelType;
    };
  };
}
