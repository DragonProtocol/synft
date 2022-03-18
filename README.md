# Enchanft.xyz 💎

Enchanft Protocol is a set a instruction to build Composable NFTs on Solana.

It consists of some features:

- [x] Synthetic NFTs minter ⚡ - responsible for creating synthetic (fake) NFTs using uri from the original + embedding SOL to add intrinsic value. 
- [x] Embed NFTs minter 📦 - responsible for embedding SOL, SPL token, other NFTs into your own NFTs, it can be set flexibly as a tree structure.
- [x] Extract SOl 💲 - you can extract SOl that it is in your NFT out to your wallet.
- [x] Tranfer out ➡️ - you can transfer out any NFTs that you owned to anyone.
- [x] Burn 🔥  - responsible for burning your NFT, transfer sol into your account.
- [ ] Crank 🔧 - responsible for refreshing your NFT tree to be correct status.

# Deploy your own version 🛠

- `git clone` the repo 
- Make sure you have `solana-cli` installed, keypair configured, and at least 10 sol on devnet beforehand
- Update path to your keypair in `Anchor.toml` that begins with `wallet =`
- Run `anchor build` to build the programs
- Run `anchor test` to test the programs
- Run `anchor deploy --provider.cluster devnet` to deploy to devnet

# Official deployment 🚀

```
nftbxaFtUMxSip8eMTKCPbX9HvjKQmcREG6NyQ23auD
```
You can interact with them using this [enchanft.xyz](https://enchanft.xyz/)

# Docs ✏️

![Architecture](docs/architecture.jpg)


# License 🧾

MIT
