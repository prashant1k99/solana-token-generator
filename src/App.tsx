import { SolanaWalletProvider } from "@/hooks/wallet-context.tsx";
import { ThemeProvider } from "@/hooks/theme-provider";
import { NetworkProvider } from "./hooks/network-context";
import { Navbar } from "./components/Navbar";
import { Toaster } from "@/components/ui/toaster"
import { CreateToken } from "./pages/CreateToken";
import { AirdropTokens } from "./pages/Airdrop";

function App() {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <SolanaWalletProvider>
          <div className="my-4 px-4 max-w-7xl max-h-dvh m-auto">
            <Navbar />
            <div className="mt-4 flex justify-end gap-4">
              <AirdropTokens />
              <CreateToken />
            </div>
          </div>
          <Toaster />
        </SolanaWalletProvider>
      </NetworkProvider>
    </ThemeProvider>
  )
}

export default App
