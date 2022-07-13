## 1

❯ ts-node scripts/createCollectionNFT.ts                                   ─╯
payerInfo 3112ASdPyfQFAvoyatxRdUrhe6MwN3TrWzxiBia6UdqA 70.242617562
snowballNftMetadata GrCdYsvTWxkAtG33LAjGH4yybm4KNAXoEN3XMqrskprP
CollectionMint 7MHE1EyGn7GEcj8sDvpBLA4gC4S77eefkgQREMZvQxXS

## 2

修改 candy-machine programID

❯ ts-node src/candy-machine-v2-cli.ts upload -e devnet -k ~/.config/solana/id.json -cp assets-copy-config.json -c four assets-copy -m 7MHE1EyGn7GEcj8sDvpBLA4gC4S77eefkgQREMZvQxXS

## 3

将 candy machine config 的收益人改为 GrCdYsvTWxkAtG33LAjGH4yybm4KNAXoEN3XMqrskprP
将 GrCdYsvTWxkAtG33LAjGH4yybm4KNAXoEN3XMqrskprP 加入到 creator 中

