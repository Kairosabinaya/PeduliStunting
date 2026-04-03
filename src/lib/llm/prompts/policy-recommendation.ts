/** Prompt template for policy recommendation. */

export function buildRecommendationPrompt(data: {
  provinceName: string;
  predictedCategory: string;
  significantVars: string[];
  changedVariables: { name: string; before: number; after: number }[];
}): string {
  const changedList = data.changedVariables
    .map((v) => `  - ${v.name}: ${v.before.toFixed(1)} → ${v.after.toFixed(1)}`)
    .join("\n");

  return `Kamu adalah konsultan kebijakan kesehatan masyarakat Indonesia.

Berdasarkan hasil simulasi stunting untuk Provinsi ${data.provinceName}, buatkan rekomendasi kebijakan:

- Kategori prediksi: ${data.predictedCategory}
- Variabel signifikan: ${data.significantVars.join(", ")}
- Perubahan yang disimulasikan:
${changedList}

Berikan 3-5 rekomendasi kebijakan konkret dan actionable. Setiap rekomendasi harus:
1. Spesifik dan terukur
2. Relevan dengan konteks lokal
3. Mempertimbangkan variabel yang signifikan

Gunakan bahasa Indonesia formal. Format sebagai daftar bernomor.`;
}
