require("dotenv").config();
const {
  Contract,
  Keypair,
  rpc,
  TransactionBuilder,
  Networks,
  Address,
  xdr
} = require("@stellar/stellar-sdk");

const CONTRACT_ID = "CAOSHQGF2J54GFIB5AADH2CRAQ6DNJWBPZMDYP7KEK26ETRRHY5BMJCM";
const RPC_SERVER = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

async function transferirYActualizarLote(batchId, nuevoPropietarioAddress, nuevoEstadoNum) {
  console.log("==================================================");
  console.log("GESTIONANDO TITULARIDAD Y ESTADO EN SOROBAN");
  console.log("==================================================");

  const secretKey = process.env.STELLAR_SECRET_KEY;
  if (!secretKey) throw new Error("STELLAR_SECRET_KEY no definido en .env");

  const signerKeyPair = Keypair.fromSecret(secretKey);
  const currentOwnerAddress = signerKeyPair.publicKey();

  const server = new rpc.Server(RPC_SERVER);
  const account = await server.getAccount(currentOwnerAddress);
  const contract = new Contract(CONTRACT_ID);

  console.log("1. Transfiriendo titularidad del lote " + batchId + "...");
  const txTransfer = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "transferir_titularidad",
        Address.fromString(currentOwnerAddress).toScVal(),
        xdr.ScVal.scvString(batchId),
        Address.fromString(nuevoPropietarioAddress).toScVal()
      )
    )
    .setTimeout(30)
    .build();

  const preparedTxTransfer = await server.prepareTransaction(txTransfer);
  preparedTxTransfer.sign(signerKeyPair);
  const resTransfer = await server.sendTransaction(preparedTxTransfer);
  console.log("Titularidad transferida con exito. Hash: " + resTransfer.hash);

  const refreshedAccount = await server.getAccount(currentOwnerAddress);

  console.log("2. Actualizando estado logistico del lote (Estado: " + nuevoEstadoNum + ")...");
  const txState = new TransactionBuilder(refreshedAccount, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "actualizar_estado",
        Address.fromString(currentOwnerAddress).toScVal(),
        xdr.ScVal.scvString(batchId),
        xdr.ScVal.scvU32(nuevoEstadoNum)
      )
    )
    .setTimeout(30)
    .build();

  const preparedTxState = await server.prepareTransaction(txState);
  preparedTxState.sign(signerKeyPair);
  const resState = await server.sendTransaction(preparedTxState);
  console.log("Estado logistico actualizado con exito. Hash: " + resState.hash);
  console.log("==================================================");
}

// Usamos la misma clave de alice como destinatario de prueba valido
const alicePublicKey = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY).publicKey();

transferirYActualizarLote(
  "LOTE-BIOTECH-2026-19",
  alicePublicKey,
  1
);
