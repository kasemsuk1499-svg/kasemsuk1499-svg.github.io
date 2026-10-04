# Card Base — Roblox

Roblox/Luau port of the Card Base prototype.

## Current V1 target
- Server-authoritative card RNG/economy.
- 3-floor physical Card Tower, 10 stands per floor.
- Base Lv.1 → 40, then Ascension back to Lv.1.
- Ascension roman numerals and permanent +20% Income / +2% Luck per cycle.
- Card Level, Grade, Mutation, Dual Mutation, Awakening.
- Endless Tower + Ascension Core.
- DataStore save + session lock + offline income.
- Game Pass / Developer Product infrastructure.
- No paid random items: Robux never buys a random card/pack in V1.

## Monetization IDs
Set real Roblox IDs in `src/ReplicatedStorage/Shared/GameConfig.lua`.

Game Passes:
- VIP Collector — target 399 R$
- Turbo Collector — target 249 R$
- Offline Vault — target 199 R$
- Showcase Pro — target 149 R$

Developer Products:
- 15 min income — target 19 R$
- 1 hour income — target 49 R$
- 3 hour income — target 99 R$
- 2x Income 30m — target 39 R$
- 2x Income 2h — target 99 R$
- Tip 10 / 50 / 100

Prices shown in game must come from MarketplaceService product info, not hard-coded UI text, so regional pricing stays correct.

## Sync
The folder is Rojo-ready. From this directory:
```
rojo serve
```
Then connect Roblox Studio using the Rojo plugin.

The connected PC was offline when this scaffold was created, so the initial implementation lives in GitHub first and can be synced into Studio when the machine is online.
