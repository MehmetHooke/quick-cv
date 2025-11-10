// app/utils/pdfTemplates.ts

export const getPdfTemplate = (cv: any) => {
  switch (cv.theme) {
    case "classic":
      return classicTemplate(cv);
    case "modern":
      return modernTemplate(cv);
    case "minimal":
      return minimalTemplate(cv);
    default:
      return minimalTemplate(cv);
  }
};

// Ortak yardımcı: GPA metni üret (boşsa "")
const gpaText = (e: any) => {
  const raw =
    e?.gpa ??
    e?.average ??
    e?.ortalama ??
    e?.cgpa ??
    e?.grade ??
    null;

  if (raw === null || raw === undefined || raw === "") return "";

  // Sayıysa 2 ondalığa yuvarla
  const val =
    typeof raw === "number"
      ? raw.toFixed(2)
      : ("" + raw).trim();

  return val ? ` - Ortalama: ${val}` : "";
};

// 🎨 CLASSIC TEMA
const classicTemplate = (cv: any) => `
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; background: #f9fafb; color: #111827; }
    h1 { color: #0c4a6e; border-bottom: 2px solid #0ea5e9; padding-bottom: 6px; }
    h2 { color: #0369a1; margin-top: 20px; }
    p { margin: 4px 0; }
    .section { margin-top: 24px; }
  </style>
</head>
<body>
  <h1>${cv.personalInfo.firstName} ${cv.personalInfo.lastName}</h1>
  <p>${cv.personalInfo.email} | ${cv.personalInfo.phone}</p>

  <div class="section">
    <h2>Eğitim</h2>
    ${cv.education.map((e: any) => `
      <p><strong>${e.school}</strong> - ${e.department} (${e.year})${gpaText(e)}</p>
    `).join("")}
  </div>

  <div class="section">
    <h2>Deneyimler</h2>
    ${cv.experiences.map((e: any) => `
      <p><strong>${e.company}</strong> - ${e.position}</p>
    `).join("")}
  </div>

  <div class="section">
    <h2>Yetenekler</h2>
    <p>${cv.skills.map((s: any) => s.name).join(", ")}</p>
  </div>

  <div class="section">
    <h2>Hakkımda</h2>
    <p>${cv.about}</p>
  </div>
</body>
</html>
`;

// 🎨 MODERN TEMA
const modernTemplate = (cv: any) => `
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, sans-serif; padding: 40px; color: #1f2937; }
    .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 12px; }
    .section { margin-top: 25px; }
    h2 { color: #0ea5e9; border-left: 4px solid #0ea5e9; padding-left: 8px; }
    p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${cv.personalInfo.firstName} ${cv.personalInfo.lastName}</h1>
    <p>${cv.personalInfo.email} | ${cv.personalInfo.phone}</p>
  </div>

  <div class="section">
    <h2>Eğitim</h2>
    ${cv.education.map((e: any) => `
      <p><strong>${e.school}</strong> - ${e.department} (${e.year})${gpaText(e)}</p>
    `).join("")}
  </div>

  <div class="section">
    <h2>Deneyimler</h2>
    ${cv.experiences.map((e: any) => `
      <p><strong>${e.company}</strong> - ${e.position}</p>
    `).join("")}
  </div>

  <div class="section">
    <h2>Yetenekler</h2>
    <p>${cv.skills.map((s: any) => s.name).join(", ")}</p>
  </div>

  <div class="section">
    <h2>Hakkımda</h2>
    <p>${cv.about}</p>
  </div>
</body>
</html>
`;

// 🎨 MINIMAL TEMA
const minimalTemplate = (cv: any) => `
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Georgia, serif; background: white; padding: 30px; color: #111; }
    h1 { font-size: 26px; margin-bottom: 0; }
    h2 { font-size: 18px; margin-top: 20px; border-bottom: 1px solid #ddd; }
    p { margin: 4px 0; line-height: 1.4; }
  </style>
</head>
<body>
  <h1>${cv.personalInfo.firstName} ${cv.personalInfo.lastName}</h1>
  <p>${cv.personalInfo.email} | ${cv.personalInfo.phone}</p>

  <h2>Eğitim</h2>
  ${cv.education.map((e: any) => `
    <p>${e.school} - ${e.department} (${e.year})${gpaText(e)}</p>
  `).join("")}

  <h2>Deneyimler</h2>
  ${cv.experiences.map((e: any) => `
    <p>${e.company} - ${e.position}</p>
  `).join("")}

  <h2>Yetenekler</h2>
  <p>${cv.skills.map((s: any) => s.name).join(", ")}</p>

  <h2>Hakkımda</h2>
  <p>${cv.about}</p>
</body>
</html>
`;
