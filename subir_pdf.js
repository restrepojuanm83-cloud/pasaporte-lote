require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

async function subirAIPFS(rutaArchivo) {
try {
if (!fs.existsSync(rutaArchivo)) {
  console.error("❌ El archivo " + rutaArchivo + " no existe en esta carpeta.");
  return;
}

const data = new FormData();
data.append("file", fs.createReadStream(rutaArchivo));

const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
  maxBodyLength: "Infinity",
  headers: {
    "Content-Type": "multipart/form-data; boundary=" + data._boundary,
    "Authorization": "Bearer " + process.env.PINATA_JWT
  }
});

console.log("✅ PDF subido exitosamente a IPFS!");
console.log("📌 IPFS CID (Hash único):", res.data.IpfsHash);
console.log("🔗 URL pública:", "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash);
return res.data.IpfsHash;
} catch (error) {
console.error("❌ Error al subir a IPFS:", error.response ? error.response.data : error.message);
}
}

subirAIPFS("certificado.pdf");
