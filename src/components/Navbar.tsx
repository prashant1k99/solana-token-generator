import { NetworkSwitcher } from "./NetworkSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { WalletSwitcher } from "./WalletSwitcher";

export function Navbar() {
  // Check if the device is less then 600px then render it in col

  return (
    <div className="flex flex-col gap-4 md:flex-row justify-between items-center">
      <div className="flex items-center cursor-pointer">
        <img className="w-14 h-14" src="coin.svg" />
        <span className="text-5xl font-bold bg-gradient-to-tr from-green-200 to-green-500 bg-clip-text text-transparent">STG</span>
      </div>
      <div className="flex flex-row gap-2">
        <ThemeSwitcher />
        <NetworkSwitcher />
        <WalletSwitcher />
      </div>
    </div>
  )
}
