import { Button } from "@/components/ui/button";
import { useNetwork } from "@/hooks/network-context";
import { fetchAllTokensAndMetadata } from "@/lib/getAllToken";
import { useWallet } from "@solana/wallet-adapter-react";

export function GetTokens() {
  const { publicKey } = useWallet()
  const { endpoint } = useNetwork()

  const fetchTokens = () => {
    if (!publicKey) return
    fetchAllTokensAndMetadata({
      publicKey,
      endpoint
    }).then((data) => {
      console.log(data)
    }).catch((e) => {
      console.error(e)
    })
  }

  return (
    <div>
      <Button onClick={fetchTokens}>Fetch All tokens</Button>
    </div>
  )
}
