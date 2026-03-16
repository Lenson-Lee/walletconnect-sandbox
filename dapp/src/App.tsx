import { useState, useMemo } from "react";
import {
  useAccount,
  useChainId,
  useSignMessage,
  useSendTransaction,
  useWalletClient,
  usePublicClient,
} from "wagmi";
import { parseEther } from "viem";
import {
  AppKitConnectButton,
  AppKitAccountButton,
  AppKitNetworkButton,
} from "@reown/appkit/react";
import { Button } from "@/components/ui/button";

// 1. 상수는 컴포넌트 외부에서 관리
const CHAIN_ID_TO_NAME: Record<number, string> = {
  1: "Ethereum",
  42161: "Arbitrum One",
  20250217: "Xphere Mainnet",
};

const TEST_RECEIVER = "0xb88de9e47c5bb82d6b028f77b08d4bbca6590bee" as const;
const TEST_AMOUNT = "0.00001";

function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // 상태 관리
  const [signedNetwork, setSignedNetwork] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [rawTxHash, setRawTxHash] = useState<string | null>(null);
  const [isRawTxPending, setIsRawTxPending] = useState(false);

  // Wagmi Hooks
  const { mutateAsync: signMessage, isPending: isSigning } = useSignMessage();
  const { sendTransactionAsync, isPending: isTransactionPending } =
    useSendTransaction();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // 현재 네트워크 이름 계산
  const currentNetworkName = useMemo(
    () => CHAIN_ID_TO_NAME[chainId] ?? `Chain ${chainId}`,
    [chainId]
  );

  /**
   * [메시지 서명] eth_sign 처리
   */
  const handleSign = async () => {
    try {
      setSignedNetwork(null);

      const signature = await signMessage({
        message: `WalletConnect Sandbox 서명 테스트 - ${new Date().toISOString()}`,
      });

      console.log("Signature received:", signature);
      setSignedNetwork(currentNetworkName);
      alert("서명이 완료되었습니다!");
    } catch (error: any) {
      console.error("Signing failed:", error);
      alert(
        error.shortMessage || "서명 요청이 거절되었거나 오류가 발생했습니다."
      );
    }
  };

  /**
   * [일반 송금] sendTransaction (지갑에서 서명+전송 동시 처리)
   */
  const handleTransfer = async () => {
    try {
      const result = await sendTransactionAsync({
        to: TEST_RECEIVER,
        value: parseEther(TEST_AMOUNT),
      });

      console.log("Transaction hash:", result);
      setLastTxHash(typeof result === "string" ? result : result.hash);
    } catch (error: any) {
      console.error("Transfer failed:", error);
      alert(error.shortMessage || "송금 중 오류가 발생했습니다.");
    }
  };

  /**
   * [Raw 트랜잭션] signTransaction -> sendRawTransaction 분리 처리
   */
  const handleSendRawTransaction = async () => {
    if (!walletClient || !publicClient || !address) return;

    try {
      setIsRawTxPending(true);
      setRawTxHash(null);

      // 1. 지갑 서명 (eth_signTransaction)
      const signedTx = await walletClient.signTransaction({
        account: address,
        to: TEST_RECEIVER,
        value: parseEther(TEST_AMOUNT),
        chain: walletClient.chain,
      });

      // 2. 네트워크 브로드캐스트 (eth_sendRawTransaction)
      const txHash = await publicClient.sendRawTransaction({
        serializedTransaction: signedTx,
      });

      setRawTxHash(txHash);
    } catch (error: any) {
      console.error("Raw transaction failed:", error);
      alert(error.shortMessage || "Raw 트랜잭션 전송에 실패했습니다.");
    } finally {
      setIsRawTxPending(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold italic tracking-tight">WC Sandbox</h1>

      {/* 지갑 연결 섹션 */}
      <div className="flex flex-col items-center gap-4">
        {isConnected ? (
          <div className="flex items-center gap-2">
            <AppKitAccountButton />
            <AppKitNetworkButton />
          </div>
        ) : (
          <AppKitConnectButton />
        )}
        {address && (
          <p className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded">
            {address}
          </p>
        )}
      </div>

      {/* 액션 버튼 섹션 */}
      {isConnected && (
        <div className="flex flex-col w-full max-w-xs gap-3">
          <Button variant="outline" onClick={handleSign} disabled={isSigning}>
            {isSigning ? "서명 대기 중…" : "메시지 서명 테스트"}
          </Button>

          <Button onClick={handleTransfer} disabled={isTransactionPending}>
            {isTransactionPending
              ? "전송 승인 대기 중..."
              : "0.1 XP 전송 테스트"}
          </Button>

          <Button
            variant="secondary"
            onClick={handleSendRawTransaction}
            disabled={isRawTxPending || !walletClient}
          >
            {isRawTxPending ? "Raw Tx 처리 중..." : "Raw Transaction 테스트"}
          </Button>

          {/* 결과 표시 UI */}
          <StatusDisplay
            signedNetwork={signedNetwork}
            lastTxHash={lastTxHash}
            rawTxHash={rawTxHash}
          />
        </div>
      )}
    </div>
  );
}

/**
 * 상태 표시 전용 서브 컴포넌트 (가독성을 위해 분리)
 */
function StatusDisplay({ signedNetwork, lastTxHash, rawTxHash }: any) {
  if (!signedNetwork && !lastTxHash && !rawTxHash) return null;

  return (
    <div className="mt-4 p-4 border rounded-lg bg-muted/20 text-xs space-y-2 font-mono">
      {signedNetwork && <p>✅ 서명 완료: {signedNetwork}</p>}
      {lastTxHash && (
        <p className="truncate text-blue-500">Hash: {lastTxHash}</p>
      )}
      {rawTxHash && (
        <p className="truncate text-green-600">Raw Hash: {rawTxHash}</p>
      )}
    </div>
  );
}

export default App;
