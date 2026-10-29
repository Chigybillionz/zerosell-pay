# 📋 ZeroSell Pay — End-to-End Execution Pipeline (TODO.md)

Tracking roadmap for the Dev3pack Solana Hackathon ($10,000 "Best App Overall" track).

---

## 📌 Global Engineering Guardrails Checklist
- [x] **DRY Architecture**: PDA seeds, Pyth feed IDs, token mints centralized in `/packages/shared` & Rust `constants.rs`.
- [x] **Clean Code & Modularity**: Single-responsibility functions (< 40 lines), strict TypeScript typing, router-only `lib.rs`.
- [x] **Security-First Consciousness**:
  - [x] Rust: Checked math (`checked_*`), CEI pattern, Pyth staleness (`<= 60s`) & confidence (`<= 2%`) validation.
  - [x] Backend: Instruction decompilation & Program ID whitelisting in Gasless Relayer, `timingSafeEqual` webhook auth, `zod` validation.
  - [x] Frontend: `simulateTransaction` before wallet signing, `zod` input and URL query sanitization.

---

## 🚀 Tasks Breakdown

### 🛠️ Task 1: Monorepo Scaffolding & Shared Constants Setup
- [x] Initialize `/packages/shared` for shared TypeScript constants, PDA helpers, and IDL types.
- [x] Create `/packages/shared/src/constants.ts` with all PDA seeds (`"protocol_config"`, `"user_position"`, `"liquidity_vault"`, `"collateral_vault"`), Pyth Feed IDs, and token constants.
- [x] Create `/packages/shared/src/pda.ts` with centralized PDA derivation helpers.
- [x] Export generated IDL types in `/packages/shared/src/idl/`.
- [x] Add root `tsconfig.base.json` with `strict: true` and strict null checks.
- [x] Add `.gitignore` rules blocking `.env`, `*.json` keypairs, `.anchor`, and `node_modules`.

### ⚡ Task 2: On-Chain Smart Contract Architecture (`programs/zerosell_vault`)
- [x] `state.rs`: Define `ProtocolConfig` (admin, treasury, max LTV 5000 bps, liquidation threshold 7500 bps, fee 30 bps, paused) and `UserLoanPosition`.
- [x] `errors.rs`: Granular error codes (`OraclePriceStale`, `OracleConfidenceTooWide`, `LtvLimitExceeded`, `ProtocolPaused`, `MathOverflow`, `InvalidRepaymentAmount`, etc.).
- [x] `utils/oracle.rs`: Implement `get_validated_pyth_price()` (staleness $\le 60\text{s}$, confidence $\le 2\%$).
- [x] `utils/math.rs`: Precision-safe math calculations using `u128` intermediate casting with checked arithmetic.
- [x] `instructions/initialize_protocol.rs`: Set up global `ProtocolConfig` PDA and USDC liquidity vault PDA.
- [x] `instructions/lock_collateral_and_pay.rs`: Atomic collateral locking, Pyth price verification, net USDC transfer to merchant, and 0.30% fee routing to treasury with CEI pattern.
- [x] `instructions/repay_and_unlock.rs`: Full and partial USDC debt repayment with proportional collateral unlocking.
- [x] `instructions/liquidate_or_settle.rs`: Keeper liquidation when LTV $\ge 75\%$ with 5% liquidation bonus.
- [x] `lib.rs`: Router entry-point under 50 lines with `assert_not_paused!` macro.

### 🧪 Task 3: Smart Contract Integration Testing & Devnet Deployment
- [ ] Create `tests/setup.ts` fixture helper for token minting, devnet SOL airdrop, and PDA derivation.
- [ ] Write integration test cases in `tests/zerosell_vault.ts`:
  - [ ] Happy path: Initialize protocol $\rightarrow$ Fund vault $\rightarrow$ Atomic Lock & Pay $\rightarrow$ Repay & Unlock.
  - [ ] Adversarial: LTV limit exceeded (> 50%), stale oracle price rejection, unauthorized vault withdrawal.
- [ ] Devnet deployment verification and update README with on-chain Program ID & sample signatures.

### 🌐 Task 4: Node.js Gasless Relayer, Solana Pay & Blinks Backend (`/backend`)
- [ ] `TransactionBuilderService.ts`: Centralized transaction constructor for both frontend checkout and Solana Blinks.
- [ ] `RelayerService.ts`: Decompile and inspect incoming transactions, whitelist Program IDs, sign as `feePayer`, and broadcast.
- [ ] `BlinkActionService.ts`: Implement `GET /api/actions/checkout` and `POST /api/actions/checkout` conforming to `@solana/actions`.
- [ ] `WebhookService.ts`: Helius webhook receiver with `timingSafeEqual` authentication and SSE live event stream.
- [ ] Add `express-rate-limit` and `zod` input validation middleware.

### 💻 Task 5: React + TypeScript + Tailwind CSS Frontend (`/frontend`)
- [ ] Custom Hooks:
  - [ ] `useZeroSellProgram.ts`: Typed Anchor Program client initialization.
  - [ ] `usePythPrices.ts`: Live Pyth Hermes price & confidence interval poller.
  - [ ] `useAtomicCheckout.ts`: VersionedTransaction builder, simulation check, and relayer sponsor submission.
- [ ] View 1: ZeroSell Checkout Widget (`/checkout`) with collateral selector, LTV health gauge, and Solana Pay QR modal.
- [ ] View 2: Borrower Position Dashboard (`/dashboard`) with active credit lines, LTV gauge, and Repay modal.
- [ ] View 3: Merchant POS Generator (`/merchant`) with instant invoice generation, shareable Solana Blink, and live SSE settlement feed.
- [ ] Sanitize URL query parameters with `zod` and run `simulateTransaction` before wallet signing.

### 🔗 Task 6: End-to-End Integration, Polish & Edge-Case Verification
- [ ] Smoke test full loop on Devnet: Generate invoice $\rightarrow$ Checkout with SOL collateral $\rightarrow$ Relayer pays gas $\rightarrow$ Merchant gets USDC $\rightarrow$ Repay on dashboard.
- [ ] Clickable Solana Explorer links on all transaction confirmation toasts and settlement logs.

### 📦 Task 7: Dev3pack Submission Packaging & Documentation
- [ ] Update `README.md` with complete architecture diagram, security/risk analysis, and Devnet addresses.
- [ ] Prepare deployment scripts for Vercel (frontend) and Render/Railway (backend).
- [ ] Record <3-minute crisp video demonstration following the exact timing storyboard.
