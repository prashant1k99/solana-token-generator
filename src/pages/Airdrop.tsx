import { ResponsiveDrawer } from "@/components/ResponsiveDrawer";
import { Button } from "@/components/ui/button";

export function AirdropTokens() {
  return (
    <ResponsiveDrawer title="Airdrop SOL" trigger={
      <Button>Aidrop Tokens</Button>
    } >
      <div>
        Airdrop
      </div>
    </ResponsiveDrawer >
  )
}
