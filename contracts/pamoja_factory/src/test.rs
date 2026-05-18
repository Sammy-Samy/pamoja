#![cfg(test)]

use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

use crate::{PamojaFactory, PamojaFactoryClient};
use pamoja_group::PamojaGroup;

fn dummy_wasm_hash(env: &Env) -> BytesN<32> {
    // Register the group contract and get its wasm hash for testing
    let _id = env.register(PamojaGroup, ());
    // In tests we use a zeroed hash as a stand-in; real deployment uses stellar CLI
    BytesN::from_array(env, &[0u8; 32])
}

#[test]
fn test_factory_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let hash = dummy_wasm_hash(&env);

    let factory_id = env.register(PamojaFactory, ());
    let client = PamojaFactoryClient::new(&env, &factory_id);

    client.initialize(&admin, &hash);

    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.group_count(), 0);
}

#[test]
#[should_panic(expected = "already initialised")]
fn test_factory_double_init_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let hash = dummy_wasm_hash(&env);

    let factory_id = env.register(PamojaFactory, ());
    let client = PamojaFactoryClient::new(&env, &factory_id);

    client.initialize(&admin, &hash);
    client.initialize(&admin, &hash);
}
