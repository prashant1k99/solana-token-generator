import { useWallet } from '@solana/wallet-adapter-react';
import { Loader2 } from "lucide-react"
import { WalletReadyState } from '@solana/wallet-adapter-base';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@radix-ui/react-dropdown-menu';
import { Button } from './ui/button';
import { RadioGroup } from './ui/radio-group';
import { Copy, Unplug } from 'lucide-react';
import { ResponsiveDrawer } from './ResponsiveDrawer';
import { useState } from 'react';

export function WalletSwitcher() {
  const { wallets, connected, publicKey, wallet: activeWallet, disconnect, connecting, select } = useWallet();
  const [viewMore, setViewMore] = useState(false)

  const copyWalletAddress = () => {
    if (!publicKey) return;

    navigator.clipboard.writeText(publicKey.toString())
      .catch((err) => console.error('Failed to copy text: ', err));
  }

  if (connected) {
    if (!publicKey) {
      return (
        <div>
          Something went wrong while connecting
        </div>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"lg"} variant={"secondary"}>
            <img className='h-6 w-6' src={activeWallet?.adapter.icon} />
            {publicKey.toString().slice(0, 4)}...
            {publicKey.toString().slice(-4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-48 mt-4 '>
          <DropdownMenuItem onClick={copyWalletAddress} className='flex gap-2 items-center py-2 my-2 px-4 rounded-md cursor-pointer bg-secondary'>
            <Copy className='h-4 w-4' />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnect} className='flex gap-2 items-center py-2 my-2 px-4 rounded-md cursor-pointer bg-secondary hover:bg-destructive'>
            <Unplug className='h-4 w-4' />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu >
    )
  }

  const connectButton = () => {
    if (connecting) {
      return (
        <Button disabled size={"lg"}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting
        </Button>
      )
    }
    return (
      <Button size={"lg"}>
        Connect Wallet
      </Button>
    )
  }

  return (
    <div>
      <ResponsiveDrawer title="Connect Wallet on Solana to Conitnue" trigger={
        connectButton()
      }>
        <RadioGroup className='pt-4'>
          {wallets.filter(wallet => wallet.readyState == WalletReadyState.Installed).map(wallet => (
            <Button
              variant={"ghost"}
              key={wallet.adapter.name}
              onClick={() => select(wallet.adapter.name)}
            >
              <div className='flex gap-2'>
                <img className='w-5 h-5' src={wallet.adapter.icon} />
                {wallet.adapter.name}
              </div>
            </Button>
          ))}
          <hr />
          {viewMore ?
            wallets.filter(wallet => wallet.readyState != WalletReadyState.Installed).map(wallet => (
              <Button
                key={wallet.adapter.name}
                variant={"ghost"}
                disabled={[WalletReadyState.NotDetected, WalletReadyState.Unsupported].includes(wallet.readyState)}
                onClick={() => select(wallet.adapter.name)}
              >
                <div className='flex gap-2'>
                  <img className='w-5 h-5' src={wallet.adapter.icon} />
                  {wallet.adapter.name}
                </div>
              </Button>
            ))
            : (
              <Button variant={"link"} onClick={() => setViewMore(true)}>View More</Button>
            )}

        </RadioGroup>
      </ResponsiveDrawer>
    </div >
  )
}
