import type { AppKitNetwork } from "@reown/appkit-common";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { defineChain, mainnet, arbitrum } from "@reown/appkit/networks";
import { QueryClient } from "@tanstack/react-query";

// Project ID from https://dashboard.reown.com (fallback is public ID for localhost only)
const projectId =
  import.meta.env.VITE_PROJECT_ID ?? "b56e18d47c72ab683b10814fe9495694";

const metadata = {
  name: "WalletConnect Sandbox Dapp",
  description: "Reown AppKit test dApp",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:5173",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// !Xphere 메인넷 커스텀 추가
const xphereMainnet = defineChain({
  id: 20250217,
  name: "Xphere Mainnet",
  nativeCurrency: { name: "Xphere", symbol: "XP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://en-bkk.x-phere.com"] },
  },
  blockExplorers: {
    default: { name: "Xphere Explorer", url: "https://xp.tamsa.io" },
  },
  chainNamespace: "eip155",
  caipNetworkId: "eip155:20250217",
});

// 네트워크 전환(AppKitNetworkButton)에 모두 노출 (mainnet, Xphere, arbitrum)
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  xphereMainnet,
  arbitrum,
];

export const queryClient = new QueryClient();

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
  },

  //** 추가옵션 참고용 */
  // 요청 권한(메서드·체인·이벤트)을 직접 정할 때
  //  universalProviderConfigOverride: {
  //   methods: {
  //     eip155: [ // 지갑에 어떤 RPC 메서드를 용청할지 정의
  //       "eth_accounts",
  //       "eth_chainId",
  //       "eth_sendTransaction",
  //       "personal_sign",
  //       "eth_signTypedData_v4",
  //       "wallet_switchEthereumChain",
  //       "wallet_addEthereumChain",
  //       // 필요하면 더 추가
  //     ],
  //   },
  //   chains: { // 어떤 chain ID를 세션에 요청할지 (문자열 배열)
  //     eip155: ["1", "42161", "20250217"], // mainnet, arbitrum, xphere chain id 문자열
  //   },
  //   events: { //구독할 이벤트
  //     eip155: ["chainChanged", "accountsChanged"],
  //   },
  // defaultChain: "eip155:1",
});
