#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, String};

// Estructura que define los datos inmutables de cada lote
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct PasaporteLote {
    pub id_lote: String,
    pub fabricante: String,
    pub producto: String,
    pub certificado_url: String, // Enlace al PDF/CoA en almacenamiento seguro/IPFS
    pub timestamp: u64,
}

#[contract]
pub struct PasaporteContract;

#[contractimpl]
impl PasaporteContract {
    // Función para registrar un nuevo lote en Stellar
    pub fn registrar_lote(
        env: Env,
        id_lote: String,
        fabricante: String,
        producto: String,
        certificado_url: String,
    ) {
        let timestamp = env.ledger().timestamp();

        let pasaporte = PasaporteLote {
            id_lote: id_lote.clone(),
            fabricante,
            producto,
            certificado_url,
            timestamp,
        };

        // Guardar de forma permanente usando el id_lote como clave
        env.storage().persistent().set(&id_lote, &pasaporte);
    }

    // Función pública para consultar los datos del lote (vía QR)
    pub fn consultar_lote(env: Env, id_lote: String) -> Option<PasaporteLote> {
        env.storage().persistent().get(&id_lote)
    }
}