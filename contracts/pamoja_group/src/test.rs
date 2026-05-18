#![cfg(test)]

use soroban_sdk::{
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
    token, Address, Env, String, Vec,
};

use crate::{Member, PamojaGroup, PamojaGroupClient};

// ── Helpers ───────────────────────────────────────────────────────────────────

fn setup_token(env: &Env, admin: &Address) -> (Address, token::StellarAssetClient<'_>) {
    let token_admin = Address::generate(env);
    let contract_id = env.register_stellar_asset_contract_v2(token_admin.clone());
    let sac = token::StellarAssetClient::new(env, &contract_id.address());
    sac.mint(admin, &1_000_000_000);
    (contract_id.address(), sac)
}

fn two_members(env: &Env, a: &Address, b: &Address) -> Vec<Member> {
    let mut v = Vec::new(env);
    v.push_back(Member {
        address: a.clone(),
        bps: 6_000,
    });
    v.push_back(Member {
        address: b.clone(),
        bps: 4_000,
    });
    v
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[test]
fn test_initialize_and_views() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let contract_id = env.register(PamojaGroup, ());
    let client = PamojaGroupClient::new(&env, &contract_id);

    let name = String::from_str(&env, "Team Alpha");
    client.initialize(&admin, &name, &two_members(&env, &alice, &bob));

    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.get_name(), name);
    assert!(client.is_active());
    assert_eq!(client.total_distributed(), 0);

    let members = client.get_members();
    assert_eq!(members.get(alice).unwrap(), 6_000);
    assert_eq!(members.get(bob).unwrap(), 4_000);
}

#[test]
#[should_panic(expected = "already initialised")]
fn test_double_initialize_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let contract_id = env.register(PamojaGroup, ());
    let client = PamojaGroupClient::new(&env, &contract_id);
    let name = String::from_str(&env, "Group");

    client.initialize(&admin, &name, &two_members(&env, &alice, &bob));
    client.initialize(&admin, &name, &two_members(&env, &alice, &bob)); // should panic
}

#[test]
fn test_distribute_splits_correctly() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let (token_id, _sac) = setup_token(&env, &admin);
    let token_client = token::Client::new(&env, &token_id);

    let contract_id = env.register(PamojaGroup, ());
    let client = PamojaGroupClient::new(&env, &contract_id);

    client.initialize(
        &admin,
        &String::from_str(&env, "Splits"),
        &two_members(&env, &alice, &bob),
    );

    // admin sends 1000 tokens
    client.distribute(&admin, &token_id, &1_000);

    assert_eq!(token_client.balance(&alice), 600);
    assert_eq!(token_client.balance(&bob), 400);
    assert_eq!(client.total_distributed(), 1_000);
}

#[test]
fn test_distribute_dust_goes_to_first_member() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let (token_id, _sac) = setup_token(&env, &admin);
    let token_client = token::Client::new(&env, &token_id);

    let contract_id = env.register(PamojaGroup, ());
    let client = PamojaGroupClient::new(&env, &contract_id);

    // 3333 + 6667 = 10000 bps
    let mut members = Vec::new(&env);
    members.push_back(Member {
        address: alice.clone(),
        bps: 3_333,
    });
    members.push_back(Member {
        address: bob.clone(),
        bps: 6_667,
    });

    client.initialize(&admin, &String::from_str(&env, "Dust"), &members);

    // 10 tokens: alice gets 3, bob gets 6, dust=1 → alice
    client.distribute(&admin, &token_id, &10);

    assert_eq!(token_client.balance(&alice), 4); // 3 + 1 dust
    assert_eq!(token_client.balance(&bob), 6);
}

#[test]
fn test_update_members() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let carol = Address::generate(&env);

    let contract_id = env.register(PamojaGroup, ());
    let client = PamojaGroupClient::new(&env, &contract_id);

    client.initialize(
        &admin,
        &String::from_str(&env, "G"),
        &two_members(&env, &alice, &bob),
    );

    // Replace with carol taking 100%
    let mut new_members = Vec::new(&env);
    new_members.push_back(Member {
        address: carol.clone(),
        bps: 10_000,
    });
    client.update_members(&new_members);

    let members = client.get_members();
    assert!(members.get(alice).is_none());
    assert_eq!(members.get(carol).unwrap(), 10_000);
}

#[test]
fn test_deactivate_and_reactivate() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let contract_id = env.register(PamojaGroup, ());
    let client = PamojaGroupClient::new(&env, &contract_id);

    client.initialize(
        &admin,
        &String::from_str(&env, "G"),
        &two_members(&env, &alice, &bob),
    );

    client.deactivate();
    assert!(!client.is_active());

    client.reactivate();
    assert!(client.is_active());
}

#[test]
#[should_panic(expected = "group is inactive")]
fn test_distribute_on_inactive_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let (token_id, _sac) = setup_token(&env, &admin);

    let contract_id = env.register(PamojaGroup, ());
    let client = PamojaGroupClient::new(&env, &contract_id);

    client.initialize(
        &admin,
        &String::from_str(&env, "G"),
        &two_members(&env, &alice, &bob),
    );
    client.deactivate();
    client.distribute(&admin, &token_id, &100);
}

#[test]
#[should_panic(expected = "member bps must sum to 10000")]
fn test_invalid_bps_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let alice = Address::generate(&env);

    let contract_id = env.register(PamojaGroup, ());
    let client = PamojaGroupClient::new(&env, &contract_id);

    let mut bad_members = Vec::new(&env);
    bad_members.push_back(Member {
        address: alice.clone(),
        bps: 5_000,
    }); // only 50%

    client.initialize(&admin, &String::from_str(&env, "Bad"), &bad_members);
}
