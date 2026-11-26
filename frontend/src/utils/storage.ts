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
 * Legacy dummy demo invoice IDs that should be purged from stored user data
 */
const LEGACY_DUMMY_INVOICE_IDS = [984321, 876543, 765432];

/**
 * Loads all stored user positions from localStorage.
 * Only returns transactions that the user/device has actually created.
 * Automatically purges any legacy dummy records from earlier demo sessions.
 */
export function getUserPositions(walletAddress?: string): StoredPosition[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY_POSITIONS);
  if (!raw) {
    return [];
  }

  try {
    const list: StoredPosition[] = JSON.parse(raw);
    // Purge legacy mock invoice IDs so user dashboard starts with clean real records only
    const cleanList = list.filter((p) => !LEGACY_DUMMY_INVOICE_IDS.includes(p.invoiceId));
    if (cleanList.length !== list.length) {
      localStorage.setItem(STORAGE_KEY_POSITIONS, JSON.stringify(cleanList));
    }

    if (!walletAddress) return cleanList;

    const currentDeviceId = getDeviceId();
    const userList = cleanList.filter(
      (p) =>
        p.borrower === walletAddress ||
        p.deviceId === currentDeviceId
    );

    return userList;
  } catch (e) {
    console.error("Failed to parse stored positions:", e);
    return [];
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
    const cleanHistory = history.filter((h) => !LEGACY_DUMMY_INVOICE_IDS.includes(h.invoiceId));
    if (cleanHistory.length !== history.length) {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(cleanHistory));
    }

    if (!walletAddress) return cleanHistory;
    const currentDeviceId = getDeviceId();
    return cleanHistory.filter(
      (h) => h.borrower === walletAddress || h.deviceId === currentDeviceId
    );
  } catch (e) {
    console.error("Failed to parse history:", e);
    return [];
  }
}

/**
 * Completely clears all local vault data and transaction history, resetting the dashboard to 0
 */
export function clearUserVaultData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_POSITIONS);
  localStorage.removeItem(STORAGE_KEY_HISTORY);
  window.dispatchEvent(new CustomEvent("zerosell_storage_updated"));
}
