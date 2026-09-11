const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");

async function generarPDF() {
const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([600, 400]);
const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

page.drawText("CERTIFICADO DE ANÁLISIS (CoA)", { x: 50, y: 340, size: 20, font, color: rgb(0.01, 0.52, 0.78) });
page.drawText("PASAPORTE DIGITAL DE LOTE - STELLAR / SOROBAN", { x: 50, y: 320, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

page.drawLine({ start: { x: 50, y: 305 }, end: { x: 550, y: 305 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

page.drawText("Producto: Extracto de Romero Quimiotipado", { x: 50, y: 260, size: 12, font: fontRegular });
page.drawText("Lote ID: LOTE-2026-001", { x: 50, y: 235, size: 12, font });
page.drawText("Estado de Calidad: APROBADO", { x: 50, y: 210, size: 12, font, color: rgb(0.08, 0.63, 0.29) });
page.drawText("Fecha de Inspección: 11-09-2026", { x: 50, y: 185, size: 12, font: fontRegular });
page.drawText("Pureza / Densidad: 99.8% | Cumple Especificación USP/Ph. Eur.", { x: 50, y: 160, size: 12, font: fontRegular });

page.drawText("Verificado Criptográficamente mediante IPFS & Stellar Soroban", { x: 50, y: 50, size: 9, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });

const pdfBytes = await pdfDoc.save();
fs.writeFileSync("certificado.pdf", pdfBytes);
console.log("✅ Archivo certificado.pdf generado en formato binario real!");
}

generarPDF();
