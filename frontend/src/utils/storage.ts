import { PositionData } from "../hooks/useZeroSellProgram.js";

export interface StoredPosition extends PositionData {
  signature?: string;
  solscanUrl?: string;
  title?: string;
  deviceId?: string;
}

export interface TransactionRecord {
  signature: string;
  invoiceId: number;
  title?: string;
  usdcAmount: number;
  collateralAmount: number;
  collateralMint: string;
  borrower: string;
  timestamp: number;
  type: "LOCK_AND_PAY" | "REPAY";
  solscanUrl: string;
  deviceId: string;
}

const STORAGE_KEY_POSITIONS = "zerosell_user_positions";
const STORAGE_KEY_HISTORY = "zerosell_user_history";
const STORAGE_KEY_DEVICE_ID = "zerosell_device_id";

/**
 * Returns a persistent device ID stored in localStorage so transactions
 * can be identified and recovered on this device even across wallet disconnects.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server_device";
  let id = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
  if (!id) {
    id = "dev_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY_DEVICE_ID, id);
  }
  return id;
}

/**
 * Default initial demo positions shown if no custom transactions have been made yet
 */
const DEFAULT_POSITIONS: StoredPosition[] = [
  {
    publicKey: "4dDHE2Vco8AtNbvW2q9mUnH4b4QnWyQRNrJkifJbkGeT",
    invoiceId: 984321,
    title: "Cloud GPU Render Credits",
    borrower: "DUaNPqVtrf8rS3ZUH3FVVAbhVmVyJknFfM5zP2Jm79wZ",
    merchant: "MrcHnt1111111111111111111111111111111111111",
    collateralMint: "So11111111111111111111111111111111111111112",
    collateralAmount: 0.539,
    collateralAmountRaw: "539000000",
    debtUsdcAmount: 50.25,
    entryPriceUsd: 185.0,
    currentCollateralValueUsd: 99.715,
    currentLtvPercent: 50.39,
    createdAt: Date.now() - 86400000 * 2,
    status: "Active",
    statusRaw: 0,
    unrealizedGainUsd: 12.5,
  },
  {
    publicKey: "FsRUbgmFkYTxfr5nBRfFoid6VUgJzMm4tCite1izSVuS",
    invoiceId: 876543,
    title: "Figma Pro Enterprise Annual",
    borrower: "DUaNPqVtrf8rS3ZUH3FVVAbhVmVyJknFfM5zP2Jm79wZ",
    merchant: "MrcHnt1111111111111111111111111111111111111",
    collateralMint: "So11111111111111111111111111111111111111112",
    collateralAmount: 1.294,
    collateralAmountRaw: "1294000000",
    debtUsdcAmount: 120.6,
    entryPriceUsd: 180.0,
    currentCollateralValueUsd: 239.39,
    currentLtvPercent: 50.38,
    createdAt: Date.now() - 86400000 * 5,
    status: "Active",
    statusRaw: 0,
    unrealizedGainUsd: 24.8,
  },
];

/**
 * Loads all stored user positions from localStorage.
 * If user has a connected wallet, filters/merges by wallet address or device ID.
 */
export function getUserPositions(walletAddress?: string): StoredPosition[] {
  if (typeof window === "undefined") return DEFAULT_POSITIONS;
  const raw = localStorage.getItem(STORAGE_KEY_POSITIONS);
  if (!raw) {
    // Seed with defaults
    localStorage.setItem(STORAGE_KEY_POSITIONS, JSON.stringify(DEFAULT_POSITIONS));
    return DEFAULT_POSITIONS;
  }

  try {
    const list: StoredPosition[] = JSON.parse(raw);
    if (!walletAddress) return list;

    // Filter by matching wallet or device id, but ensure at least demo positions show if empty
    const currentDeviceId = getDeviceId();
    const userList = list.filter(
      (p) =>
        p.borrower === walletAddress ||
        p.deviceId === currentDeviceId ||
        p.borrower.startsWith("DUaNPq") // default deployer address
    );

    return userList.length > 0 ? userList : list;
  } catch (e) {
    console.error("Failed to parse stored positions:", e);
    return DEFAULT_POSITIONS;
  }
}

/**
 * Saves a new position into localStorage
 */
export function saveUserPosition(position: StoredPosition): void {
  if (typeof window === "undefined") return;
  try {
    const currentList = getUserPositions();
    // Prepend new position or update existing by invoiceId
    const existingIndex = currentList.findIndex((p) => p.invoiceId === position.invoiceId);
    let updated: StoredPosition[];
    if (existingIndex >= 0) {
      updated = [...currentList];
      updated[existingIndex] = { ...updated[existingIndex], ...position };
    } else {
      updated = [position, ...currentList];
    }
    localStorage.setItem(STORAGE_KEY_POSITIONS, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save position:", e);
  }
}

/**
 * Updates a position's status (e.g. from Active to Repaid)
 */
export function updatePositionStatus(
  invoiceId: number,
  status: "Active" | "Repaid" | "Liquidated"
): void {
  if (typeof window === "undefined") return;
  try {
    const list = getUserPositions();
    const statusRaw = status === "Active" ? 0 : status === "Repaid" ? 1 : 2;
    const updated = list.map((p) =>
      p.invoiceId === invoiceId ? { ...p, status, statusRaw } : p
    );
    localStorage.setItem(STORAGE_KEY_POSITIONS, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update position status:", e);
  }
}

/**
 * Logs a transaction to the persistent user history
 */
export function logUserTransaction(tx: Omit<TransactionRecord, "deviceId">): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    const history: TransactionRecord[] = raw ? JSON.parse(raw) : [];
    const record: TransactionRecord = {
      ...tx,
      deviceId: getDeviceId(),
    };
    history.unshift(record);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to log transaction:", e);
  }
}

/**
 * Retrieves transaction history filtered by wallet address or device ID
 */
export function getUserTransactionHistory(walletAddress?: string): TransactionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const history: TransactionRecord[] = JSON.parse(raw);
    if (!walletAddress) return history;
    const currentDeviceId = getDeviceId();
    return history.filter(
      (h) => h.borrower === walletAddress || h.deviceId === currentDeviceId
    );
  } catch (e) {
    console.error("Failed to parse history:", e);
    return [];
  }
}
