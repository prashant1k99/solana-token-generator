import { SolanaWalletProvider } from "@/hooks/wallet-context.tsx";
import { ThemeProvider } from "@/hooks/theme-provider";
import { NetworkProvider } from "./hooks/network-context";
import { Navbar } from "./components/Navbar";
import { AirdropTokens } from "./pages/Airdrop";

function App() {

  return (
    <ThemeProvider>
      <NetworkProvider>
        <SolanaWalletProvider>
          <div className="my-4 px-4 max-w-7xl max-h-dvh m-auto">
            <Navbar />
            <AirdropTokens />
          </div>
        </SolanaWalletProvider>
      </NetworkProvider>
    </ThemeProvider>
  )
}

export default App
