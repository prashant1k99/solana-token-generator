import { NetworkSwitcher } from "./NetworkSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { WalletSwitcher } from "./WalletSwitcher";

export function Navbar() {
  // Check if the device is less then 600px then render it in col

  return (
    <div className="flex flex-col gap-4 md:flex-row justify-between items-center">
      <div className="">
        <img className="w-12 h-12" src="coin.svg" />
      </div>
      <div className="flex flex-row gap-2">
        <ThemeSwitcher />
        <NetworkSwitcher />
        <WalletSwitcher />
      </div>
    </div>
  )
}
