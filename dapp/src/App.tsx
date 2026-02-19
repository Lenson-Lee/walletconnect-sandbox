import { useState } from "react";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import {
  AppKitConnectButton,
  AppKitAccountButton,
  AppKitNetworkButton,
} from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";

const CHAIN_ID_TO_NAME: Record<number, string> = {
  1: "Ethereum",
  42161: "Arbitrum One",
  20250217: "Xphere Mainnet",
};

function App() {
  const { count, increment, reset } = useAppStore();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [signedNetwork, setSignedNetwork] = useState<string | null>(null);

  const { mutateAsync: signMessage, isPending: isSigning } = useSignMessage();

  const handleSign = () => {
    setSignedNetwork(null);
    signMessage({
      message: `WalletConnect Sandbox 서명 테스트 - ${new Date().toISOString()}`,
    }).then(() => {
      setSignedNetwork(CHAIN_ID_TO_NAME[chainId] ?? `Chain ${chainId}`);
    });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">WalletConnect Sandbox</h1>

      <div className="flex flex-col items-center gap-4">
        {isConnected ? (
          <>
            <div className="flex items-center gap-2">
              <AppKitAccountButton />
              <AppKitNetworkButton />
            </div>
          </>
        ) : (
          <AppKitConnectButton />
        )}
        {address && (
          <p className="text-sm text-muted-foreground font-mono max-w-full truncate">
            {address}
          </p>
        )}
      </div>

      {isConnected && (
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleSign}
            disabled={isSigning}
          >
            {isSigning ? "서명 대기 중…" : "메시지 서명하기"}
          </Button>
          {signedNetwork && (
            <p className="text-sm font-medium text-foreground">
              서명된 네트워크: {signedNetwork}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button onClick={increment}>Count is {count}</Button>
        <Button variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

export default App;
