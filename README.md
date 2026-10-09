# Cadastra

![Cadastra home page](docs/images/cadastra-home.jpg)

Cadastra is Terra Ledger's NFT marketplace on Tezos. Members collect art, property and gaming
assets priced in tez, follow seasonal drops from brand partners, and track the crypto markets
alongside. Every price, account and trade in this build is demo data.

## Running the project

### 1. Set up Node.js

```bash
nvm install
```

### 2. Install packages

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

## Development plan

1. **Wallet connection and purchases** — connect Tezos wallets and WalletConnect, add the sale
   contract, and mint each work on Tezos at its first sale.
2. **Launch catalogue** — replace placeholder images with the original artworks and property
   photographs, set final prices, and add the artists' high-resolution photos.
3. **Fees and payouts** — set the platform fee schedule and pay creator royalties on-chain.
4. **Property tokens** — open property sales once legal review approves the structure.
5. **Staff tools** — staff sign-in with two-factor authentication for the sales team.
6. **Production launch** — managed PostgreSQL, hosting, monitoring, and the launch of
   Cadastra's own domain.
