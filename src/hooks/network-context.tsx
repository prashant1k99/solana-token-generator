import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { clusterApiUrl } from "@solana/web3.js";

export type Network = 'mainnet-beta' | 'devnet' | 'testnet' | 'custom';
// export type Network = "devnet" | "testnet" | "custom";

interface NetworkContextType {
  network: Network;
  customEndpoint: string;
  endpoint: string;
  setNetwork: (network: Network) => void;
  setCustomEndpoint: (endpoint: string) => void;
  checkEndpoint: (url: string) => Promise<boolean>;
  getExplorerUrl: (path: string) => string;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: React.ReactNode;
  defaultNetwork?: Network;
  defaultCustomEndpoint?: string;
}

function getClusterUrlParam(network: Network, endpoint: string): string {
  let suffix = ''
  switch (network) {
    case "custom":
      suffix = `custom&customUrl=${encodeURIComponent(endpoint)}`
      break
    case "mainnet-beta":
      suffix = ''
      break
    case "testnet":
      suffix = 'testnet'
      break
    default:
      suffix = 'devnet'
      break
  }

  return suffix.length ? `?cluster=${suffix}` : ''
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
  defaultNetwork = "devnet",
  defaultCustomEndpoint = "http://localhost:8899/",
}) => {
  const [network, setNetwork] = useState<Network>(defaultNetwork);
  const [customEndpoint, setCustomEndpoint] = useState(defaultCustomEndpoint);
  const [isValidEndpoint, setIsValidEndpoint] = useState(true);

  const validateEndpoint = useCallback(async (endpoint: string) => {
    await checkEndpoint(endpoint);
  }, []);

  const checkEndpoint = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getHealth",
        }),
      });
      const valid = response.status === 200;
      return valid;
    } catch {
      return false;
    }
  };

  const handleSetNetwork = useCallback((newNetwork: Network) => {
    setNetwork(newNetwork);
    if (newNetwork === "custom") {
      validateEndpoint(customEndpoint);
    } else {
      setIsValidEndpoint(true);
    }
  }, [customEndpoint, validateEndpoint]);

  const handleSetCustomEndpoint = useCallback(async (newEndpoint: string) => {
    setCustomEndpoint(newEndpoint);
    if (network === "custom") {
      await validateEndpoint(newEndpoint);
    }
  }, [network, validateEndpoint]);

  const endpoint = useMemo(() => {
    if (network === "custom") {
      return customEndpoint;
    }
    return clusterApiUrl(network);
  }, [network, customEndpoint]);

  const value = useMemo(() => ({
    network,
    customEndpoint,
    endpoint,
    setNetwork: handleSetNetwork,
    setCustomEndpoint: handleSetCustomEndpoint,
    checkEndpoint,
    getExplorerUrl: (path: string) => `https://explorer.solana.com/${path}${getClusterUrlParam(network, endpoint)}`,
  }), [
    network,
    customEndpoint,
    endpoint,
    handleSetNetwork,
    handleSetCustomEndpoint,
    isValidEndpoint,
  ]);

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

// Custom hook to use the network context
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};
