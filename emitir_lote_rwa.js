require("dotenv").config();
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const {
  Contract,
  Keypair,
  rpc,
  TransactionBuilder,
  Networks,
  Address,
  nativeToScVal,
  xdr
} = require("@stellar/stellar-sdk");

const CONTRACT_ID = "CAOSHQGF2J54GFIB5AADH2CRAQ6DNJWBPZMDYP7KEK26ETRRHY5BMJCM";
const RPC_SERVER = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const BASE_URL_VERCEL = "https://pasaporte-lote.vercel.app";

async function generarYSubirArchivo(filePath, fileNameTipo) {
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "multipart/form-data; boundary=" + data._boundary,
      "Authorization": "Bearer " + process.env.PINATA_JWT
    }
  });
  console.log("[IPFS] " + fileNameTipo + " subido. CID: " + res.data.IpfsHash);
  return res.data.IpfsHash;
}

async function generarYSubirPdf(tipoDoc, batchId, producto, contenidoTexto) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 420]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(tipoDoc + " - " + batchId, { x: 50, y: 360, size: 18, font: fontBold, color: rgb(0.01, 0.52, 0.78) });
  page.drawText("Producto: " + producto, { x: 50, y: 325, size: 12, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
  page.drawLine({ start: { x: 50, y: 310 }, end: { x: 550, y: 310 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

  page.drawText(contenidoTexto, { x: 50, y: 260, size: 11, font: fontRegular });
  page.drawText("Fecha de Emision: " + new Date().toISOString().split("T")[0] + " | RWA Soroban / IPFS", { x: 50, y: 40, size: 9, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });

  const fileName = tipoDoc + "_" + batchId + ".pdf";
  fs.writeFileSync(fileName, await pdfDoc.save());
  return await generarYSubirArchivo(fileName, tipoDoc);
}

async function emitirLoteRWAConTitularidad(batchId, producto, precioUsdc, stock) {
  console.log("==================================================");
  console.log("EMITIENDO LOTE RWA CON TITULARIDAD EN SOROBAN");
  console.log("==================================================");

  const secretKey = process.env.STELLAR_SECRET_KEY;
  if (!secretKey) throw new Error("STELLAR_SECRET_KEY no definido en .env");

  const signerKeyPair = Keypair.fromSecret(secretKey);
  const fabricanteAddress = signerKeyPair.publicKey();

  console.log("Generando documentos del tridente para el nuevo lote...");
  const cidCoa = await generarYSubirPdf("CoA", batchId, producto, "Control microbiologico y estatus de postbioticos verificado.");
  const cidTds = await generarYSubirPdf("TDS", batchId, producto, "Especificaciones fisicoquimicas y de estabilidad optimizadas.");
  const cidSds = await generarYSubirPdf("SDS", batchId, producto, "Ficha de datos de seguridad para materias primas cosmeticas.");

  console.log("Conectando a Stellar Soroban Testnet...");
  const server = new rpc.Server(RPC_SERVER);
  const account = await server.getAccount(fabricanteAddress);
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "emitir_lote",
        Address.fromString(fabricanteAddress).toScVal(),
        xdr.ScVal.scvString(batchId),
        xdr.ScVal.scvString(producto),
        xdr.ScVal.scvString(cidCoa),
        xdr.ScVal.scvString(cidTds),
        xdr.ScVal.scvString(cidSds),
        nativeToScVal(BigInt(precioUsdc), { type: "i128" }),
        xdr.ScVal.scvU32(stock)
      )
    )
    .setTimeout(30)
    .build();

  console.log("Simulando y enviando transaccion al contrato RWA...");
  const preparedTx = await server.prepareTransaction(tx);
  preparedTx.sign(signerKeyPair);
  const txResponse = await server.sendTransaction(preparedTx);

  let txHash = "";
  if (txResponse.status === "PENDING" || txResponse.status === "SUCCESS") {
    txHash = txResponse.hash;
    console.log("Lote RWA registrado con titularidad! Hash: " + txHash);
  }

  const qrTargetUrl = `${BASE_URL_VERCEL}/?lote=${batchId}&coa=${cidCoa}&tds=${cidTds}&sds=${cidSds}&tx=${txHash}`;
  
  const qrPath = "qr_" + batchId + ".png";
  await QRCode.toFile(qrPath, qrTargetUrl, { 
    color: { dark: "#0284c7", light: "#ffffff" }, 
    width: 400 
  });

  console.log("Codigo QR generado: " + qrPath);
  console.log("URL del Pasaporte RWA:");
  console.log(qrTargetUrl);
  console.log("==================================================");
}

emitirLoteRWAConTitularidad(
  "LOTE-BIOTECH-2026-19",
  "Complejo Postbiotico Antienvejecimiento v16",
  5500,
  400
);
