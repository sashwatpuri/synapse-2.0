const APP_STATE_KEY = "synapse-app-state-v1";
const SESSION_KEY = "synapse-session-v1";

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson(key, fallback) {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function slugifyName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 14);
}

export function buildPublicFarmerId(farmerId) {
  return `FRM-2026-${String(farmerId).padStart(6, "0")}`;
}

function buildFarmerAccount(farmer) {
  const contactSuffix = String(farmer.contact || "").slice(-4) || String(farmer.farmer_id).padStart(4, "0");
  return {
    username: `farmer_${slugifyName(farmer.name) || farmer.farmer_id}`,
    password: `soil${contactSuffix}`,
    role: "farmer",
    farmer_id: farmer.farmer_id
  };
}

export function loadAppState() {
  return readJson(APP_STATE_KEY, {
    farmerOverrides: {},
    farmerAccounts: [],
    certificateOverrides: {}
  });
}

export function saveAppState(state) {
  writeJson(APP_STATE_KEY, state);
}

export function loadSession() {
  return readJson(SESSION_KEY, null);
}

export function saveSession(session) {
  writeJson(SESSION_KEY, session);
}

export function clearSession() {
  if (!hasStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function mergeFarmers(seedFarmers, state) {
  return seedFarmers.map((farmer) => {
    const override = state.farmerOverrides[farmer.farmer_id] || {};
    return {
      ...farmer,
      public_farmer_uid: override.public_farmer_uid || buildPublicFarmerId(farmer.farmer_id),
      status: override.status || "ACTIVE",
      village: override.village || "",
      notes: override.notes || "",
      created_at: override.created_at || new Date().toISOString(),
      updated_at: override.updated_at || null
    };
  });
}

export function ensureAccounts(farmers, state) {
  const existing = state.farmerAccounts || [];
  const accountsByFarmerId = new Map(existing.map((account) => [account.farmer_id, account]));
  const farmerAccounts = farmers.map((farmer) => accountsByFarmerId.get(farmer.farmer_id) || buildFarmerAccount(farmer));

  return [
    {
      username: "admin_user",
      password: "admin123",
      role: "admin",
      farmer_id: null
    },
    ...farmerAccounts
  ];
}

export function buildNextFarmer(seed, draft) {
  const nextId = seed.reduce((maxId, farmer) => Math.max(maxId, farmer.farmer_id), 0) + 1;
  const timestamp = new Date().toISOString();

  return {
    farmer_id: nextId,
    name: draft.name.trim(),
    contact: draft.contact.trim(),
    pincode: draft.pincode.trim(),
    registration_no: draft.registration_no.trim() || `REG${String(nextId).padStart(3, "0")}`,
    public_farmer_uid: buildPublicFarmerId(nextId),
    status: draft.status || "PENDING",
    village: draft.village.trim(),
    notes: draft.notes.trim(),
    created_at: timestamp,
    updated_at: timestamp
  };
}

export function upsertFarmerState(farmers, accounts) {
  return {
    farmerOverrides: farmers.reduce((acc, farmer) => {
      acc[farmer.farmer_id] = {
        public_farmer_uid: farmer.public_farmer_uid,
        status: farmer.status,
        village: farmer.village || "",
        notes: farmer.notes || "",
        created_at: farmer.created_at || new Date().toISOString(),
        updated_at: farmer.updated_at || null
      };
      return acc;
    }, {}),
    farmerAccounts: accounts.filter((account) => account.role === "farmer")
  };
}

export function mergeCertificates(records, state) {
  const overrides = state.certificateOverrides || {};

  return records.map((record) => {
    const override = overrides[record.reportId] || {};
    return {
      ...record,
      certificateId: override.certificateId || `CERT-2026-${String(record.reportId).padStart(6, "0")}`,
      certificateStatus: override.certificateStatus || "DRAFT",
      certificateIssuedOn: override.certificateIssuedOn || null,
      certificateValidUntil: override.certificateValidUntil || null,
      verifierName: override.verifierName || "Admin Authority",
      approvalNotes: override.approvalNotes || "",
      verificationCode: override.verificationCode || `VC-${String(record.reportId).padStart(8, "0")}`
    };
  });
}

export function buildNextAppState({ farmers, accounts, certificates }) {
  return {
    farmerOverrides: farmers.reduce((acc, farmer) => {
      acc[farmer.farmer_id] = {
        public_farmer_uid: farmer.public_farmer_uid,
        status: farmer.status,
        village: farmer.village || "",
        notes: farmer.notes || "",
        created_at: farmer.created_at || new Date().toISOString(),
        updated_at: farmer.updated_at || null
      };
      return acc;
    }, {}),
    farmerAccounts: accounts.filter((account) => account.role === "farmer"),
    certificateOverrides: certificates.reduce((acc, record) => {
      acc[record.reportId] = {
        certificateId: record.certificateId,
        certificateStatus: record.certificateStatus,
        certificateIssuedOn: record.certificateIssuedOn,
        certificateValidUntil: record.certificateValidUntil,
        verifierName: record.verifierName,
        approvalNotes: record.approvalNotes,
        verificationCode: record.verificationCode
      };
      return acc;
    }, {})
  };
}

export function createFarmerAccount(farmer) {
  return buildFarmerAccount(farmer);
}
