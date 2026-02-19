# WalletConnect Sandbox Dapp

WalletConnect(Reown AppKit) 연동을 테스트하기 위한 React dApp입니다.  
지갑 연결, 네트워크 전환, Personal Sign, 서명된 네트워크 표시 등을 포함합니다.

---

## 기술 스택

| 구분      | 기술                          |
| --------- | ----------------------------- |
| 빌드      | Vite 7, React 19, TypeScript  |
| 지갑/Web3 | **Reown AppKit**, Wagmi, Viem |
| 상태      | Zustand                       |
| UI        | shadcn/ui, Tailwind CSS 4     |

---

## 실행 방법

```bash
npm install
npm run dev
```

- **Project ID**: [Reown Dashboard](https://dashboard.reown.com)에서 프로젝트 생성 후 ID 발급.
- 로컬에서는 기본 공용 ID가 fallback으로 동작합니다.
- 프로덕션/커스텀 도메인에서는 `.env`에 `VITE_PROJECT_ID`를 설정하는 것을 권장합니다.

```bash
# .env 생성 후
VITE_PROJECT_ID=발급받은_프로젝트_ID
```

---

## 프로젝트 구조

```
src/
├── config/
│   └── appkit.ts      # Reown AppKit·Wagmi 설정, 커스텀 체인 정의
├── components/
│   └── ui/            # shadcn 컴포넌트
├── lib/
│   ├── utils.ts       # cn() 등 유틸 (shadcn)
│   └── web3.ts        # viem publicClient (선택 사용)
├── stores/
│   └── useAppStore.ts # Zustand 예제 스토어
├── App.tsx            # 연결/서명 UI, 서명된 네트워크 표시
├── main.tsx           # Provider 래핑 진입점
└── index.css          # Tailwind + shadcn 테마
```

---

## 유의해야 할 코드

### 1. `src/config/appkit.ts`

- **`projectId`**  
  `VITE_PROJECT_ID`가 없으면 로컬용 공용 ID가 사용됩니다. 프로덕션에서는 반드시 본인 Project ID를 설정하세요.

- **커스텀 체인 (Xphere 등)**  
  `defineChain()`으로 정의할 때 다음을 맞춰야 합니다.

  - `id`: 숫자 chain id
  - `nativeCurrency`: `{ name, symbol, decimals }`
  - `rpcUrls.default.http`: 문자열 배열
  - `blockExplorers.default`: `{ name, url }`
  - EVM이면 `chainNamespace: "eip155"`, `caipNetworkId: "eip155:<chainId>"`

- **`networks`**  
  `WagmiAdapter`와 `createAppKit`에 **동일한** `networks` 배열을 넘겨야 합니다.  
  모달(네트워크 버튼)에서만 일부 체인을 숨기고 싶다면, adapter용 목록과 modal용 목록을 분리해 사용할 수 있습니다.

- **Provider 초기화 순서**  
  `createAppKit()`은 **컴포넌트 밖**에서 한 번만 호출해야 합니다. `main.tsx`에서 `wagmiAdapter`를 import할 때 이 파일이 로드되며 실행됩니다.

### 2. `src/main.tsx`

- **Provider 순서**  
  `WagmiProvider` → `QueryClientProvider` 순서를 바꾸면 안 됩니다. AppKit(Wagmi)가 React Query를 사용합니다.

### 3. `src/App.tsx`

- **`CHAIN_ID_TO_NAME`**  
  서명된 네트워크 이름 표시용입니다. **새 체인을 추가하면** `appkit.ts`의 `networks`에 넣은 뒤, 여기에도 `chainId → 이름`을 추가해야 UI에 올바른 네트워크명이 나옵니다.

- **서명 시점의 체인**  
  `useChainId()`는 **현재 연결된 체인**을 반환합니다. 사용자가 네트워크 전환 직후 서명하면, 그 체인 기준으로 “서명된 네트워크”가 표시됩니다.

### 4. 환경 변수

- `VITE_` 접두사가 붙은 변수만 클라이언트에 노출됩니다.
- `.env`는 `.gitignore`에 포함되어 있어 커밋되지 않습니다. 배포 시 호스팅 환경에서 `VITE_PROJECT_ID`를 설정하세요.

### 5. Reown AppKit 옵션

- **요청 권한(메서드·체인)** 을 직접 제어하려면 `createAppKit()` 옵션에 `universalProviderConfigOverride`를 사용합니다.
  - `methods.eip155`: `eth_accounts`, `personal_sign`, `eth_sendTransaction` 등
  - `chains.eip155`: 요청할 chain id 문자열 배열
  - `events.eip155`: `chainChanged`, `accountsChanged` 등
- 지정하지 않으면 AppKit/Wagmi 기본값이 적용됩니다.

---

## 연구용 dApp 검증 체크리스트 (5가지 핵심 기능)

### 1. 멀티 네트워크 연결 및 전환 (Switch Network)

자체 메인넷(Xphere)과 이더리움/테스트넷을 함께 두고, 네트워크 전환이 되는지 확인.  
**검증**: dApp에서 네트워크 변경 요청 시 지갑이 `wallet_switchEthereumChain`을 받고, 지갑 UI가 해당 체인으로 바뀌는지.

### 2. 신원 인증 서명 (Personal Sign)

**검증**: 단순 텍스트 메시지에 지갑으로 서명하고, 서명 결과가 dApp에 반환되며 “서명된 네트워크: …”가 올바르게 표시되는지.

### 3. 구조화된 데이터 서명 (Sign Typed Data v4)

EIP-712 서명. **검증**: 지갑이 타입드 데이터를 파싱해 사용자에게 내용을 보여주는지.

### 4. 자산 전송 (Send Transaction)

**검증**: 네이티브 토큰 전송 시 지갑에 가스비·금액이 정확히 표시되고, 승인 후 실제 체인에 트랜잭션이 기록·TX Hash가 반환되는지.

### 5. 세션 관리 및 연결 해제 (Disconnect & Session Restore)

**검증**: dApp에서 로그아웃 시 지갑 세션도 종료되는지, 새로고침 후 재접속 시 기존 연결이 복구되는지.

---

## 스크립트

| 명령어            | 설명                      |
| ----------------- | ------------------------- |
| `npm run dev`     | 개발 서버 (Vite)          |
| `npm run build`   | 프로덕션 빌드             |
| `npm run preview` | 빌드 결과물 로컬 미리보기 |
| `npm run lint`    | ESLint 실행               |
