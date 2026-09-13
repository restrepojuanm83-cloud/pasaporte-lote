#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Lote(String),
}

#[contracttype]
pub struct LotePasaporte {
    pub id_lote: String,
    pub producto: String,
    pub fabricante: Address,
    pub titular_actual: Address,
    // Tridente Documental (IPFS CIDs)
    pub cid_coa: String,
    pub cid_tds: String,
    pub cid_sds: String,
    // Capa Comercial / RWA
    pub precio_usdc: i128, // Representado en centavos o unidades mínimas de USDC
    pub stock: u32,
    pub estado: Symbol, // Ej: "DISPONIBLE", "VENDIDO", "EN_TRANSITO"
}

#[contract]
pub struct PasaporteRwaContract;

#[contractimpl]
impl PasaporteRwaContract {
    
    // 1. Registrar un nuevo lote con identidad, documentos técnicos y variables comerciales RWA
    pub fn emitir_lote(
        env: Env,
        fabricante: Address,
        id_lote: String,
        producto: String,
        cid_coa: String,
        cid_tds: String,
        cid_sds: String,
        precio_usdc: i128,
        stock: u32,
    ) {
        // Asegurar que la transacción sea firmada por el fabricante
        fabricante.require_auth();

        let key = DataKey::Lote(id_lote.clone());
        
        // Verificar que el lote no exista previamente
        if env.storage().persistent().has(&key) {
            panic!("El lote ya se encuentra registrado en el sistema.");
        }

        let lote = LotePasaporte {
            id_lote,
            producto,
            fabricante: fabricante.clone(),
            titular_actual: fabricante, // Inicialmente el fabricante es el titular
            cid_coa,
            cid_tds,
            cid_sds,
            precio_usdc,
            stock,
            estado: Symbol::new(&env, "DISPONIBLE"),
        };

        env.storage().persistent().set(&key, &lote);
    }

    // 2. Consultar la información completa del lote mediante su ID
    pub fn obtener_lote(env: Env, id_lote: String) -> LotePasaporte {
        let key = DataKey::Lote(id_lote);
        env.storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| panic!("Lote no encontrado en el registro."))
    }

    // 3. Transferir titularidad del RWA (Trazabilidad B2B / Cadena de suministro)
    pub fn transferir_titularidad(env: Env, titular_actual: Address, nuevo_titular: Address, id_lote: String) {
        titular_actual.require_auth();

        let key = DataKey::Lote(id_lote.clone());
        let mut lote: LotePasaporte = env.storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| panic!("Lote no encontrado."));

        if lote.titular_actual != titular_actual {
            panic!("La billetera no es la titular actual del lote.");
        }

        lote.titular_actual = nuevo_titular;
        env.storage().persistent().set(&key, &lote);
    }
}