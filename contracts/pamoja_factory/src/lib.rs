//! Pamoja Factory Contract
//!
//! Deploys and tracks `pamoja_group` child contracts.
//! Users call `create_group` to get a fresh group contract address.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, xdr::ToXdr, Address, BytesN, Env, IntoVal, Map, String,
    Symbol, Val, Vec,
};

use pamoja_group::Member;

#[contracttype]
pub enum DataKey {
    Admin,
    GroupWasm,
    Groups,
    GroupCount,
}

#[contract]
pub struct PamojaFactory;

#[contractimpl]
impl PamojaFactory {
    pub fn initialize(env: Env, admin: Address, group_wasm_hash: BytesN<32>) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialised");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::GroupWasm, &group_wasm_hash);
        env.storage().instance().set(&DataKey::GroupCount, &0_u32);
        env.storage()
            .instance()
            .set(&DataKey::Groups, &Map::<Address, String>::new(&env));
    }

    /// Deploy a new group child contract and initialise it.
    /// Returns the new contract's address.
    pub fn create_group(env: Env, creator: Address, name: String, members: Vec<Member>) -> Address {
        creator.require_auth();

        let wasm_hash: BytesN<32> = env
            .storage()
            .instance()
            .get(&DataKey::GroupWasm)
            .expect("factory not initialised");

        let salt = env.crypto().sha256(&env.ledger().sequence().to_xdr(&env));

        let group_address = env
            .deployer()
            .with_current_contract(salt)
            .deploy_v2(wasm_hash, ());

        // Build args vec and call initialize on the child contract
        let mut args: Vec<Val> = Vec::new(&env);
        args.push_back(creator.clone().into_val(&env));
        args.push_back(name.clone().into_val(&env));
        args.push_back(members.into_val(&env));

        let _: Val = env.invoke_contract(&group_address, &Symbol::new(&env, "initialize"), args);

        let mut groups: Map<Address, String> = env
            .storage()
            .instance()
            .get(&DataKey::Groups)
            .unwrap_or(Map::new(&env));
        groups.set(group_address.clone(), name);
        env.storage().instance().set(&DataKey::Groups, &groups);

        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::GroupCount)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::GroupCount, &(count + 1));

        group_address
    }

    pub fn get_groups(env: Env) -> Map<Address, String> {
        env.storage()
            .instance()
            .get(&DataKey::Groups)
            .unwrap_or(Map::new(&env))
    }

    pub fn group_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::GroupCount)
            .unwrap_or(0)
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialised")
    }

    pub fn update_wasm(env: Env, new_hash: BytesN<32>) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialised");
        admin.require_auth();
        env.storage().instance().set(&DataKey::GroupWasm, &new_hash);
    }
}

mod test;
