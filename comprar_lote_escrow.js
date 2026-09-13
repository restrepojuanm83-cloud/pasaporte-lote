require("dotenv").config();
const {
  Contract,
  Keypair,
  rpc,
  TransactionBuilder,
  Networks,
  Address,
  xdr,
  nativeToScVal
} = require("@stellar/stellar-sdk");

const CONTRACT_ID = process.env.CONTRACT_ID;
const RPC_SERVER = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

async function comprarLoteEscrow(batchId) {
  console.log("==================================================");
  console.log("LIQUIDACION ATOMICA (ESCROW) Y COMPRA DE LOTE RWA");
  console.log("==================================================");

  const secretKey = process.env.STELLAR_SECRET_KEY;
  if (!secretKey) throw new Error("STELLAR_SECRET_KEY no definido en .env");

  const compradorKeyPair = Keypair.fromSecret(secretKey);
  const compradorAddress = compradorKeyPair.publicKey();

  const server = new rpc.Server(RPC_SERVER);
  const account = await server.getAccount(compradorAddress);
  const contract = new Contract(CONTRACT_ID);

  console.log("Invocando contrato de escrow/compra para el lote " + batchId + "...");
  const tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "comprar_lote",
        Address.fromString(compradorAddress).toScVal(),
        xdr.ScVal.scvString(batchId)
      )
    )
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  preparedTx.sign(compradorKeyPair);
  const txResponse = await server.sendTransaction(preparedTx);

  console.log("Liquidacion financiera y transferencia completadas con exito!");
  console.log("Hash de transaccion (Escrow): " + txResponse.hash);
  console.log("==================================================");
}

comprarLoteEscrow("LOTE-BIOTECH-2026-19");





