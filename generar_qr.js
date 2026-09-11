const QRCode = require('qrcode');
const contratoId = 'CAJ7ONIUSPKD2XVPTVVWIMZVYYSBKFCHYZGNKO4MCQI5ACUOZHBRVWHF';
const idLote = 'LOTE-2026-001';
const urlPasaporte = 'https://stellar.expert/explorer/testnet/contract/' + contratoId;
const archivoSalida = 'qr_' + idLote + '.png';

QRCode.toFile(archivoSalida, urlPasaporte, {
  color: { dark: '#000000', light: '#FFFFFF' },
  width: 400
}, function (err) {
  if (err) throw err;
  console.log('✅ Código QR generado exitosamente: ' + archivoSalida);
});
