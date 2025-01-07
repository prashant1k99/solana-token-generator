import { RenderTokens, TokenData } from "@/components/RenderTokens";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNetwork } from "@/hooks/network-context";
import { RefreshProvider } from "@/hooks/refresh-context";
import { fetchAllTokensAndMetadata } from "@/lib/getAllToken";
import { useWallet } from "@solana/wallet-adapter-react";
import { RefreshCw } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

// Create a loading state component
function LoadingState() {
  return (
    <div className="animate-pulse">
      Loading tokens...
    </div>
  );
}

export function ListTokens() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TokenData[] | null>(null);
  const { publicKey } = useWallet();
  const { endpoint } = useNetwork();

  const handleRefresh = async (): Promise<void> => {
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
  }

  // Add useEffect for initial load
  useEffect(() => {
    handleRefresh();
  }, [publicKey, endpoint]);

  if (!publicKey) {
    return (
      <div className="w-full h-[50px] flex justify-center items-center">
        Please connect your wallet first
      </div>
    )
  }

  return (
    <RefreshProvider onRefresh={handleRefresh}>
      <div className="space-y-4">
        <div className="flex gap-2 justify-between px-4 py-2 items-center">
          <span className="font-bold text-xl">All my Tokens</span>
          <Button size={"icon"} variant={"outline"} onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`${isLoading ? "animate-spin " : ""} w-4 h-4`} />
          </Button>
        </div>
        <Separator className="bg-primary" />
        <Suspense fallback={<LoadingState />}>
          <RenderTokens data={data} />
        </Suspense>
      </div>
    </RefreshProvider>
  );
}
