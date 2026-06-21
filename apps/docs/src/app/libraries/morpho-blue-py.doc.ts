import { LibraryDoc } from "../library-model";

export const morphoBluePyDoc: LibraryDoc = {
  id: "morpho-blue-py",
  name: "morpho-blue-py",
  pypiName: "morpho-blue-py",
  version: "0.1.0",
  tagline: "Typed client for the Morpho Blue lending GraphQL API.",
  description:
    "A typed client for the Morpho Blue GraphQL API — lending markets, MetaMorpho vaults, and user positions analytics. Sync and async, fully typed pydantic v2 models, automatic pagination, and optional pandas export.",
  category: "Lending",
  tier: "beta",
  githubUrl: "https://github.com/robertruben98/morpho-blue-py",
  pypiUrl: "https://pypi.org/project/morpho-blue-py/",
  docsUrl: "https://docs.morpho.org/tools/offchain/api/get-started/",
  install: `pip install morpho-blue-py
# with pandas export helpers:
pip install "morpho-blue-py[pandas]"`,
  quickstart: `from morpho_blue import MorphoClient

# supply_apy / borrow_apy are decimal fractions (0.0366 == 3.66%)
with MorphoClient() as client:
    markets = client.get_markets(
        chain_id=1,
        first=5,
        order_by="supply_assets_usd",
        where={"utilization_lte": 0.99},  # skip 100%-utilized (distorted rates)
    )

for market in markets:
    loan = market.loan_asset.symbol if market.loan_asset else "?"
    apy = market.state.supply_apy if market.state else None
    print(f"{loan:8} supply APY: {apy:.2%}" if apy is not None else loan)
# USDC     supply APY: 3.66%
# USDT     supply APY: 3.16%`,
  features: [
    "Sync (MorphoClient) and async (AsyncMorphoClient) clients built on httpx.",
    "Fully typed pydantic v2 models; ships py.typed.",
    "Helper methods: top markets by APY, market/vault lookups, wallet positions.",
    "Automatic pagination (iter_markets) and multi-chain support.",
    "Optional pandas export (markets_to_dataframe).",
    "Public, read-only API — no API key required.",
  ],
  api: [
    {
      title: "Markets",
      rows: [
        {
          name: "get_markets(chain_id=, first=, order_by=, where=)",
          signature: "GraphQL markets",
          description: "A page of markets, sortable and filterable.",
        },
        {
          name: "get_market(market_id, chain_id=)",
          signature: "GraphQL market",
          description: "A single market by its marketId (not uniqueKey).",
        },
        {
          name: "iter_markets(chain_id=, page_size=)",
          signature: "auto-paginated",
          description: "Iterate all markets across pages via skip.",
        },
        {
          name: "top_markets_by_supply_apy(chain_id=, limit=)",
          signature: "helper",
          description: "Highest supply-APY markets.",
        },
      ],
    },
    {
      title: "Vaults & users",
      rows: [
        {
          name: "top_vaults_by_apy(chain_id=, limit=)",
          signature: "GraphQL vaults",
          description: "Top MetaMorpho vaults by APY.",
        },
        {
          name: "get_vault(address, chain_id=)",
          signature: "GraphQL vault",
          description: "A single vault with state and allocations.",
        },
        {
          name: "get_user(address, chain_id=)",
          signature: "GraphQL user",
          description: "Wallet market_positions and vault_positions.",
        },
        {
          name: "markets_to_dataframe(markets)",
          signature: "morpho_blue.export",
          description: "Optional pandas export (pandas extra).",
        },
      ],
    },
  ],
  notes: [
    "Authentication: the Morpho Blue GraphQL API is public and read-only — no API key is required.",
    "Conventions: supply_apy / borrow_apy are decimal fractions (0.0366 == 3.66%); format with :.2%. The schema's unique market key is marketId, NOT uniqueKey. Filter out 100%-utilized markets (where utilization_lte) to avoid distorted instantaneous rates.",
  ],
};
