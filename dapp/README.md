# WalletConnect Sandbox Dapp

Vite + React + **Reown AppKit** (WalletConnect) + Wagmi + Viem + Zustand + shadcn + Tailwind.

## Run

```bash
npm install
npm run dev
```

## WalletConnect / Reown AppKit

- **Project ID**: [Reown Dashboard](https://dashboard.reown.com)에서 프로젝트 생성 후 ID 발급.
- 로컬 테스트 시에는 기본 공용 ID가 사용되며, 프로덕션/커스텀 도메인에서는 `.env`에 `VITE_PROJECT_ID` 설정 권장.

```bash
cp .env.example .env
# .env에 VITE_PROJECT_ID=발급받은_ID 입력
```

- 연결: **AppKitConnectButton** → 지갑 선택(WalletConnect QR, MetaMask, Coinbase 등)
- 연결 후: **AppKitAccountButton**(계정/연결 해제), **AppKitNetworkButton**(네트워크 전환)

---

# 연구용 dApp에 반드시 포함해야 할 5가지 핵심 기능

## 1. 멀티 네트워크 연결 및 전환 (Switch Network)

자체 메인넷뿐만 아니라 이더리움 메인넷이나 테스트넷을 함께 리스트에 넣고, 네트워크 간 전환이 매끄러운지 확인해야 합니다.검증 포인트: dApp에서 네트워크 변경 요청을 보냈을 때, 지갑 앱이 wallet_switchEthereumChain 요청을 수신하고 UI가 Xphere 체인으로 정상적으로 바뀌는지 확인합니다.

## 2. 신원 인증 서명 (Personal Sign)

앞서 테스트하셨던 가장 기본적인 서명 기능입니다.검증 포인트: 단순 텍스트 메시지에 지갑의 개인키로 서명하고, 그 결과값($0x...$)이 dApp으로 돌아와 **"Verification Success"**가 뜨는지 확인합니다.

## 3. 구조화된 데이터 서명 (Sign Typed Data v4)

EIP-712 표준에 따른 서명입니다. 텍스트가 아니라 JSON 형태의 데이터를 서명합니다.검증 포인트: 오픈씨의 오퍼(Offer)나 리스팅(Listing) 기능을 구현할 때 필수입니다. 지갑 앱이 데이터를 파싱해서 사용자에게 "어떤 계약 내용인지" 예쁘게 보여주는지 테스트하세요.

## 4. 자산 전송 (Send Transaction)

가장 중요한 '돈'이 움직이는 기능입니다.검증 포인트: \_ 네이티브 토큰(XPH) 전송 요청 시 지갑에 가스비와 금액이 정확히 뜨는지.사용자가 승인했을 때 실제 메인넷 블록체인에 트랜잭션이 기록되고 TX Hash가 dApp으로 반환되는지.

## 5. 세션 관리 및 연결 해제 (Disconnect & Session Restore)

검증 포인트: \_ 사용자가 dApp에서 로그아웃했을 때 지갑 앱에서도 세션이 즉시 종료되는지.브라우저를 새로고침했을 때 다시 QR을 찍지 않고도 기존 연결(Session)이 잘 복구되는지.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
