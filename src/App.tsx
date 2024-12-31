import { SolanaWalletProvider } from "@/hooks/wallet-context.tsx";
import { ThemeProvider } from "@/hooks/theme-provider";
import { NetworkSwitcher } from "./components/NetworkSwitcher";
import { NetworkProvider } from "./hooks/network-context";

function App() {

  return (
    <ThemeProvider>
      <NetworkProvider>
        <SolanaWalletProvider>
          <div className="m-10">
            <NetworkSwitcher />
          </div>
        </SolanaWalletProvider>
      </NetworkProvider>
    </ThemeProvider>
  )
}

export default App
