import { SolanaWalletProvider } from "@/hooks/wallet-context.tsx";
import { ThemeProvider } from "@/hooks/theme-provider";
import { NetworkProvider } from "./hooks/network-context";
import { Navbar } from "./components/Navbar";
import { Toaster } from "@/components/ui/toaster"
import { CreateToken } from "./pages/CreateToken";
import { AirdropTokens } from "./pages/Airdrop";
import { Separator } from "./components/ui/separator";
import { ListTokens } from "./pages/ListTokens";

function App() {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <SolanaWalletProvider>
          <div className="p-4 max-w-7xl h-full max-h-dvh min-h-dvh m-auto gap-4 flex flex-col">
            <Navbar />
            <Separator />
            <div className="flex justify-between sm:justify-end gap-4">
              <AirdropTokens />
              <CreateToken />
            </div>
            <div className="bg-secondary h-full min-h-full rounded-lg p-2">
              <ListTokens />
            </div>
          </div>
          <Toaster />
        </SolanaWalletProvider>
      </NetworkProvider>
    </ThemeProvider>
  )
}

export default App
