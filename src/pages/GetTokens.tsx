import { Button } from "@/components/ui/button";
import { useNetwork } from "@/hooks/network-context";
import { fetchAllTokensAndMetadata } from "@/lib/getAllToken";
import { useWallet } from "@solana/wallet-adapter-react";
import { Suspense, useCallback, useEffect, useState } from "react";

// Create a loading state component
function LoadingState() {
  return (
    <div className="animate-pulse">
      Loading tokens...
    </div>
  );
}

// Separate component for displaying token data
function TokenDataFetcher({ data }: { data: string[] | null }) {
  if (!data) {
    return <LoadingState />;
  }

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export function GetTokens() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<string[] | null>(null);
  const { publicKey } = useWallet();
  const { endpoint } = useNetwork();

  const handleRefresh = useCallback(async () => {
    if (!publicKey) return;
    console.log("Refreshing")
    setIsLoading(true);
    try {
      const fetchedData = await fetchAllTokensAndMetadata({
        publicKey,
        endpoint,
      });
      setData(fetchedData);
      console.log(fetchedData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, endpoint]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh Tokens'}
        </Button>
      </div>
      <Suspense fallback={<LoadingState />}>
        <TokenDataFetcher data={data} />
      </Suspense>
    </div>
  );
}
