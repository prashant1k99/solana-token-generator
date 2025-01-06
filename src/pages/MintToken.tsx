import { ResponsiveDrawer } from "@/components/ResponsiveDrawer";
import { ReactNode } from "react";

interface MintTokenProps {
  mintAddress: string;
  children: ReactNode;
}

export function MintToken({ mintAddress, children }: MintTokenProps) {
  console.log("Minting: ", mintAddress)
  return (
    <ResponsiveDrawer smallSize trigger={children} title="Mint Tokens">
      <form>

      </form>
    </ResponsiveDrawer>
  )
}
