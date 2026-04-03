/** Prompt template for executive summary generation. */

export function buildSummaryPrompt(data: {
  provinceName: string;
  year: number;
  predictedCategory: string;
  pRendah: number;
  pSedang: number;
  pTinggi: number;
}): string {
  return `Kamu adalah analis kebijakan kesehatan masyarakat Indonesia.

Buatkan ringkasan eksekutif singkat (2-3 paragraf) berdasarkan hasil simulasi stunting berikut:

- Provinsi: ${data.provinceName}
- Tahun Basis: ${data.year}
- Kategori Prediksi: ${data.predictedCategory}
- Probabilitas Rendah: ${(data.pRendah * 100).toFixed(1)}%
- Probabilitas Sedang: ${(data.pSedang * 100).toFixed(1)}%
- Probabilitas Tinggi: ${(data.pTinggi * 100).toFixed(1)}%

Gunakan bahasa Indonesia formal tapi mudah dipahami. Fokus pada implikasi kebijakan.`;
}
