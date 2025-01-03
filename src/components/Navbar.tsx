import { NetworkSwitcher } from "./NetworkSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { WalletSwitcher } from "./WalletSwitcher";

export function Navbar() {
  // Check if the device is less then 600px then render it in col

  return (
    <div className="flex flex-col gap-4 md:flex-row justify-between items-center">
      <div className="flex items-center cursor-pointer">
        <img className="w-12 h-12" src="coin.svg" />
        <span className="text-3xl font-bold bg-gradient-to-tr from-green-200 to-green-500 bg-clip-text text-transparent">STG</span>
      </div>
      <div className="flex flex-row gap-2">
        <div className="hidden sm:block">
          <ThemeSwitcher />
        </div>
        <NetworkSwitcher />
        <WalletSwitcher />
      </div>
      <div className="fixed sm:hidden bottom-4 right-4 z-10">
        <ThemeSwitcher />
      </div>
    </div>
  )
}
