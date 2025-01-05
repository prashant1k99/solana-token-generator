import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Network, useNetwork } from "@/hooks/network-context";
import { ResponsiveDrawer } from "./ResponsiveDrawer";
import { FormEvent, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function NetworkSwitcher() {
  const {
    network,
    customEndpoint,
    setNetwork,
    setCustomEndpoint,
    checkEndpoint,
  } = useNetwork();

  const [showRPCEditor, setShowRPCEditor] = useState(false)
  const [endpointError, setEndpointError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNetworkChange = (value: Network) => {
    if (value == "custom") {
      setShowRPCEditor(true)
    } else {
      setNetwork(value);
    }
  };

  const onCustomEndpointChangeSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsProcessing(true);
    checkEndpoint(customEndpoint).then((response) => {
      if (response) {
        // true
        setNetwork("custom");
        setShowRPCEditor(false);
        setEndpointError(false);
      } else {
        setEndpointError(true);
      }
    }).finally(() => setIsProcessing(false));
  };


  return (
    <Select value={network} onValueChange={handleNetworkChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Network" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Network</SelectLabel>
          <SelectItem disabled value="mainnet-beta">Mainnet Beta</SelectItem>
          <SelectItem value="devnet">Devent</SelectItem>
          <SelectItem value="testnet">Testnet</SelectItem>
          <SelectItem value="custom">Custom RPC</SelectItem>
        </SelectGroup>
        <ResponsiveDrawer smallSize open={showRPCEditor} onOpenChange={setShowRPCEditor} trigger={
          <Button className="hidden">
            Show RPC Model
          </Button>
        } title="Enter custom RPC Endpoint">
          <form onSubmit={onCustomEndpointChangeSubmit}>
            <Input
              placeholder="Enter your custom RPC endpoint"
              value={customEndpoint}
              className={endpointError ? "border-destructive" : ""}
              onChange={(e) => setCustomEndpoint(e.target.value)}
            />
            {endpointError && (
              <span className="text-xs text-destructive">Error while connecting to the Custom URL</span>
            )}
            <Button disabled={isProcessing} type="submit" className="w-full mt-4">Submit</Button>
          </form>
        </ResponsiveDrawer>
      </SelectContent>
    </Select>
  )
}
