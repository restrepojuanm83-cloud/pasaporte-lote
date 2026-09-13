#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, symbol_short};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BatchState {
    Created = 0,
    InTransit = 1,
    Delivered = 2,
    Liquidated = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BatchData {
    pub fabricante: Address,
    pub propietario: Address,
    pub producto: String,
    pub cid_coa: String,
    pub cid_tds: String,
    pub cid_sds: String,
    pub precio_usdc: i128,
    pub stock: u32,
    pub estado: BatchState,
}

#[contract]
pub struct RWABatchContract;

#[contractimpl]
impl RWABatchContract {
    pub fn emitir_lote(
        env: Env,
        fabricante: Address,
        batch_id: String,
        producto: String,
        cid_coa: String,
        cid_tds: String,
        cid_sds: String,
        precio_usdc: i128,
        stock: u32,
    ) {
        fabricante.require_auth();

        let batch = BatchData {
            fabricante: fabricante.clone(),
            propietario: fabricante,
            producto,
            cid_coa,
            cid_tds,
            cid_sds,
            precio_usdc,
            stock,
            estado: BatchState::Created,
        };

        env.storage().instance().set(&batch_id, &batch);
    }

    pub fn transferir_titularidad(
        env: Env,
        de: Address,
        batch_id: String,
        para: Address,
    ) {
        de.require_auth();

        let mut batch: BatchData = env.storage().instance().get(&batch_id).unwrap();
        if batch.propietario != de {
            panic!("No autorizado para transferir este lote");
        }

        batch.propietario = para;
        env.storage().instance().set(&batch_id, &batch);
    }

    pub fn actualizar_estado(
        env: Env,
        propietario: Address,
        batch_id: String,
        nuevo_estado: u32,
    ) {
        propietario.require_auth();

        let mut batch: BatchData = env.storage().instance().get(&batch_id).unwrap();
        if batch.propietario != propietario {
            panic!("No autorizado para actualizar este lote");
        }

        batch.estado = match nuevo_estado {
            0 => BatchState::Created,
            1 => BatchState::InTransit,
            2 => BatchState::Delivered,
            3 => BatchState::Liquidated,
            _ => panic!("Estado invalido"),
        };

        env.storage().instance().set(&batch_id, &batch);
    }

    pub fn comprar_lote(
        env: Env,
        comprador: Address,
        batch_id: String,
    ) {
        comprador.require_auth();

        let mut batch: BatchData = env.storage().instance().get(&batch_id).unwrap();
        
        if batch.estado == BatchState::Liquidated {
            panic!("El lote ya fue liquidado");
        }

        batch.propietario = comprador.clone();
        batch.estado = BatchState::Liquidated;

        env.storage().instance().set(&batch_id, &batch);
    }
}
