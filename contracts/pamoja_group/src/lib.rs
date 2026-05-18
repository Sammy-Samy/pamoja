//! Pamoja Group Contract
//!
//! Each payment group deploys one instance of this contract.
//! It stores member wallet addresses with percentage splits and
//! distributes any incoming token payment proportionally.

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Map, String, Vec};

// ── Storage keys ────────────────────────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    Admin,
    GroupName,
    Members, // Map<Address, u32>  — address → basis points (total must = 10_000)
    Active,
    TotalDistributed,
}

// ── Types ────────────────────────────────────────────────────────────────────

/// A single group member with their share in basis points (1 bp = 0.01%).
/// Total across all members must equal 10_000 (= 100%).
#[contracttype]
#[derive(Clone)]
pub struct Member {
    pub address: Address,
    pub bps: u32, // basis points
}

// ── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct PamojaGroup;

#[contractimpl]
impl PamojaGroup {
    // ── Initialisation ───────────────────────────────────────────────────────

    /// Initialise the group. Called once by the factory (or directly on testnet).
    ///
    /// * `admin`   – address that can update the group
    /// * `name`    – human-readable group name
    /// * `members` – list of (address, bps) pairs; bps must sum to 10_000
    pub fn initialize(env: Env, admin: Address, name: String, members: Vec<Member>) {
        // Prevent re-initialisation
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialised");
        }

        admin.require_auth();
        Self::validate_members(&env, &members);

        let mut map: Map<Address, u32> = Map::new(&env);
        for m in members.iter() {
            map.set(m.address.clone(), m.bps);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::GroupName, &name);
        env.storage().instance().set(&DataKey::Members, &map);
        env.storage().instance().set(&DataKey::Active, &true);
        env.storage()
            .instance()
            .set(&DataKey::TotalDistributed, &0_i128);
    }

    // ── Distribution ─────────────────────────────────────────────────────────

    /// Distribute `amount` of `token` from `sender` to all members.
    ///
    /// The caller must have approved this contract to transfer `amount` tokens
    /// on their behalf before calling this function.
    pub fn distribute(env: Env, sender: Address, token: Address, amount: i128) {
        sender.require_auth();

        let active: bool = env
            .storage()
            .instance()
            .get(&DataKey::Active)
            .unwrap_or(false);
        assert!(active, "group is inactive");
        assert!(amount > 0, "amount must be positive");

        let members: Map<Address, u32> = env
            .storage()
            .instance()
            .get(&DataKey::Members)
            .expect("not initialised");

        let token_client = token::Client::new(&env, &token);

        // Pull funds from sender into this contract
        token_client.transfer(&sender, &env.current_contract_address(), &amount);

        // Distribute proportionally; accumulate rounding dust to first member
        let mut distributed: i128 = 0;
        let mut first_address: Option<Address> = None;

        for (addr, bps) in members.iter() {
            if first_address.is_none() {
                first_address = Some(addr.clone());
            }
            let share = amount * bps as i128 / 10_000;
            if share > 0 {
                token_client.transfer(&env.current_contract_address(), &addr, &share);
                distributed += share;
            }
        }

        // Send any dust to the first member
        let dust = amount - distributed;
        if dust > 0 {
            if let Some(first) = first_address {
                token_client.transfer(&env.current_contract_address(), &first, &dust);
            }
        }

        // Update total distributed counter
        let prev: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDistributed)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalDistributed, &(prev + amount));
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    /// Replace the member list. Admin only.
    pub fn update_members(env: Env, members: Vec<Member>) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialised");
        admin.require_auth();
        Self::validate_members(&env, &members);

        let mut map: Map<Address, u32> = Map::new(&env);
        for m in members.iter() {
            map.set(m.address.clone(), m.bps);
        }
        env.storage().instance().set(&DataKey::Members, &map);
    }

    /// Deactivate the group. Admin only.
    pub fn deactivate(env: Env) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialised");
        admin.require_auth();
        env.storage().instance().set(&DataKey::Active, &false);
    }

    /// Reactivate the group. Admin only.
    pub fn reactivate(env: Env) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialised");
        admin.require_auth();
        env.storage().instance().set(&DataKey::Active, &true);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialised")
    }

    pub fn get_name(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::GroupName)
            .expect("not initialised")
    }

    pub fn get_members(env: Env) -> Map<Address, u32> {
        env.storage()
            .instance()
            .get(&DataKey::Members)
            .expect("not initialised")
    }

    pub fn is_active(env: Env) -> bool {
        env.storage()
            .instance()
            .get(&DataKey::Active)
            .unwrap_or(false)
    }

    pub fn total_distributed(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalDistributed)
            .unwrap_or(0)
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    fn validate_members(env: &Env, members: &Vec<Member>) {
        assert!(!members.is_empty(), "members list cannot be empty");
        let total: u32 = members.iter().map(|m| m.bps).sum();
        assert!(total == 10_000, "member bps must sum to 10000");
        // Ensure no duplicate addresses
        let mut seen: Vec<Address> = Vec::new(env);
        for m in members.iter() {
            assert!(!seen.contains(&m.address), "duplicate member address");
            seen.push_back(m.address.clone());
        }
    }
}

mod test;
