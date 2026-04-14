# WireCosmos

WireCosmos refers to the underlying Cosmos SDK infrastructure powering WireFluid.

#### SDK Version

- **Cosmos SDK:** v0.53.1

#### Enabled Modules

WireFluid uses standard Cosmos SDK modules without modification:

- `auth` - Account authentication and signature verification
- `bank` - Token transfers and balance management
- `staking` - Validator delegation and network security
- `distribution` - Reward distribution to validators and delegators
- `slashing` - Penalty enforcement for validator misbehavior
- `governance` - On-chain governance and parameter changes
- `ibc` - Inter-Blockchain Communication for cross-chain transfers

#### Design Philosophy

- Maximum compatibility with upstream Cosmos SDK
- Reduced attack surface and maintenance overhead
