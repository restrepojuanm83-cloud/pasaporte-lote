require("dotenv").config();
const {
  Contract,
  Keypair,
  rpc,
  TransactionBuilder,
  Networks,
  xdr
} = require("@stellar/stellar-sdk");

const CONTRACT_ID = "CAJ7ONIUSPKD2XVPTVVWIMZVYYSBKFCHYZGNKO4MCQI5ACUOZHBRVWHF";
const RPC_SERVER = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

async function registrarEnSoroban(idLote, producto, fabricante, certificadoUrl) {
  console.log("🔗 Conectando a Stellar Soroban Testnet...");
  const server = new rpc.Server(RPC_SERVER);

  const secretKey = process.env.STELLAR_SECRET_KEY;
  if (!secretKey) {
    console.error("❌ Error: Define STELLAR_SECRET_KEY en tu archivo .env");
    return;
  }

  const signerKeyPair = Keypair.fromSecret(secretKey);
  const account = await server.getAccount(signerKeyPair.publicKey());
  const contract = new Contract(CONTRACT_ID);

  console.log(`📝 Preparando invocación del contrato para ${idLote}...`);

  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "registrar_lote",
        xdr.ScVal.scvString(idLote),
        xdr.ScVal.scvString(producto),
        xdr.ScVal.scvString(fabricante),
        xdr.ScVal.scvString(certificadoUrl)
      )
    )
    .setTimeout(30)
    .build();

  console.log("⚡ Simulando transacción Soroban...");
  const preparedTx = await server.prepareTransaction(tx);

  preparedTx.sign(signerKeyPair);
  console.log("🚀 Enviando transacción a la red Stellar Testnet...");
  const response = await server.sendTransaction(preparedTx);

  if (response.status === "PENDING" || response.status === "SUCCESS") {
    console.log("⏳ Transacción procesada. Hash:", response.hash);
    console.log("🔍 Ver en Explorer:", `https://stellar.expert/explorer/testnet/tx/${response.hash}`);
  } else {
    console.error("⚠️ Estado de transacción:", response);
  }
}

registrarEnSoroban(
  "LOTE-2026-002",
  "Extracto Concentrado de Romero",
  "SaaS Traceability Lab",
  "https://violet-realistic-hookworm-4.mypinata.cloud/ipfs/QmNUSfZXu9qBoHWusaG7fKcHoBciZuioxqddCK2cm35MKH"
);
