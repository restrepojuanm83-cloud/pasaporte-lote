require("dotenv").config();
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const GATEWAY = "violet-realistic-hookworm-4.mypinata.cloud";
const WEB_URL = "https://restrepojuanm83-cloud.github.io/pasaporte-lote/";

async function crearPasaporteLote(batchId, producto, especificacion) {
  console.log("🚀 Iniciando emisión de Pasaporte Digital de Lote para: " + batchId);

  // 1. Crear PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 420]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText("CERTIFICADO DE ANÁLISIS (CoA)", { x: 50, y: 360, size: 20, font: fontBold, color: rgb(0.01, 0.52, 0.78) });
  page.drawText("PASAPORTE DIGITAL DE LOTE - STELLAR / SOROBAN", { x: 50, y: 340, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawLine({ start: { x: 50, y: 325 }, end: { x: 550, y: 325 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

  page.drawText("Producto: " + producto, { x: 50, y: 280, size: 12, font: fontRegular });
  page.drawText("Lote ID: " + batchId, { x: 50, y: 255, size: 12, font: fontBold });
  page.drawText("Estado de Calidad: APROBADO", { x: 50, y: 230, size: 12, font: fontBold, color: rgb(0.08, 0.63, 0.29) });
  page.drawText("Especificaciones / Pureza: " + especificacion, { x: 50, y: 205, size: 12, font: fontRegular });
  page.drawText("Fecha de Emisión: " + new Date().toISOString().split("T")[0], { x: 50, y: 180, size: 12, font: fontRegular });

  page.drawText("Verificado Criptográficamente mediante IPFS & Stellar Soroban", { x: 50, y: 40, size: 9, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });

  const pdfPath = "CoA_" + batchId + ".pdf";
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfPath, pdfBytes);
  console.log("📄 1. PDF generado exitosamente: " + pdfPath);

  // 2. Subir a IPFS
  const data = new FormData();
  data.append("file", fs.createReadStream(pdfPath));

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
    maxBodyLength: "Infinity",
    headers: {
      "Content-Type": "multipart/form-data; boundary=" + data._boundary,
      "Authorization": "Bearer " + process.env.PINATA_JWT
    }
  });

  const cid = res.data.IpfsHash;
  console.log("📌 2. Subido a IPFS con CID: " + cid);
  console.log("🔗 URL Documento: https://" + GATEWAY + "/ipfs/" + cid);

  // 3. Generar Código QR
  const qrPath = "qr_" + batchId + ".png";
  await QRCode.toFile(qrPath, WEB_URL, {
    color: { dark: "#0284c7", light: "#ffffff" },
    width: 400
  });
  console.log("📱 3. Código QR generado: " + qrPath);
  console.log("🎉 ¡Pasaporte emitido con éxito!");
}

crearPasaporteLote("LOTE-2026-002", "Extracto Concentrado de Romero", "Pureza 99.9% - Rosmarinic Acid Active");
