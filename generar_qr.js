const QRCode = require('qrcode');
const urlPasaporte = 'https://restrepojuanm83-cloud.github.io/pasaporte-lote/';
const idLote = 'LOTE-2026-001';
const archivoSalida = 'qr_' + idLote + '.png';

QRCode.toFile(archivoSalida, urlPasaporte, {
  color: { dark: '#000000', light: '#FFFFFF' },
  width: 400
}, function (err) {
  if (err) throw err;
  console.log('✅ ¡Código QR oficial generado con éxito!: ' + archivoSalida);
});
