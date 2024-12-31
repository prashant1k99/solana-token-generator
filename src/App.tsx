import { SolanaWalletProvider } from "@/hooks/wallet-context.tsx";
import { WalletSwitcher } from "@/components/WalletSwitcher";
import { ThemeProvider } from "@/hooks/theme-provider";

function App() {

  return (
    <ThemeProvider>
      <SolanaWalletProvider>
        <div className="m-10">

          <WalletSwitcher />
        </div>
      </SolanaWalletProvider>
    </ThemeProvider>
  )
}

export default App
