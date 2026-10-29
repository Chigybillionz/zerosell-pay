import { useState, useEffect, useCallback } from "react";

export interface AssetPrice {
  symbol: string;
  name: string;
  priceUsd: number;
  scaledPrice: string;
}

export interface PricesMap {
  [symbol: string]: AssetPrice;
}

const DEFAULT_PRICES: PricesMap = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    priceUsd: 185.45,
    scaledPrice: "185450000",
  },
  NVDAx: {
    symbol: "NVDAx",
    name: "Tokenized NVIDIA Corp",
    priceUsd: 142.8,
    scaledPrice: "142800000",
  },
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    priceUsd: 68500.0,
    scaledPrice: "68500000000",
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    priceUsd: 2650.0,
    scaledPrice: "2650000000",
  },
};

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:4000";

export function usePythPrices() {
  const [prices, setPrices] = useState<PricesMap>(DEFAULT_PRICES);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/prices`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.prices) {
          setPrices(data.prices);
          setLastUpdated(new Date());
          return;
        }
      }
    } catch (e) {
      // Graceful fallback to default prices
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const solPrice = prices.SOL?.priceUsd || 185.45;
  const nvdaPrice = prices.NVDAx?.priceUsd || 142.8;

  /**
   * Calculates required collateral units for a given USDC invoice and target LTV
   * e.g. for $50 USDC at 50% LTV, Required Value = $100.
   * Required SOL = $100 / solPrice.
   */
  const calculateCollateralNeeded = useCallback(
    (usdcAmount: number, symbol: "SOL" | "NVDAx" = "SOL", ltvPercent: number = 50.0) => {
      const price = symbol === "SOL" ? solPrice : nvdaPrice;
      const targetLtv = ltvPercent / 100.0; // 0.50
      const collateralValueUsd = usdcAmount / targetLtv; // e.g. 50 / 0.5 = 100
      const units = collateralValueUsd / price; // e.g. 100 / 185.45 = 0.539 SOL

      return {
        collateralUnits: units,
        collateralValueUsd,
        assetPriceUsd: price,
        formattedUnits: units.toFixed(4),
      };
    },
    [solPrice, nvdaPrice]
  );

  return {
    prices,
    solPrice,
    nvdaPrice,
    loading,
    lastUpdated,
    refreshPrices: fetchPrices,
    calculateCollateralNeeded,
  };
}

