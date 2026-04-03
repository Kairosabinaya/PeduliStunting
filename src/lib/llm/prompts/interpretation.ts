/** Prompt template for simulation interpretation. */

export function buildInterpretationPrompt(data: {
  provinceName: string;
  year: number;
  changedVariables: { name: string; before: number; after: number }[];
  significantVars: string[];
  beforeCategory: string;
  afterCategory: string;
}): string {
  const changedList = data.changedVariables
    .map((v) => `  - ${v.name}: ${v.before.toFixed(1)} → ${v.after.toFixed(1)}`)
    .join("\n");

  return `Kamu adalah analis kebijakan kesehatan masyarakat Indonesia.

Berdasarkan hasil simulasi stunting, berikan interpretasi yang:
1. Menggunakan bahasa Indonesia formal tapi mudah dipahami
2. Menjelaskan MENGAPA perubahan variabel tersebut berdampak pada stunting
3. Mengaitkan dengan konteks lokal provinsi ${data.provinceName}

Data Simulasi:
- Provinsi: ${data.provinceName}
- Tahun Basis: ${data.year}
- Variabel yang diubah:
${changedList}
- Prediksi sebelum: ${data.beforeCategory}
- Prediksi sesudah: ${data.afterCategory}
- Variabel signifikan: ${data.significantVars.join(", ")}

Berikan interpretasi dalam 2-3 paragraf.`;
}
