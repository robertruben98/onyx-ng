/**
 * Data model for the "Python Libraries" docs section. These are the Python
 * crypto-API client libraries published to PyPI by the same author; this model
 * captures everything the index and detail pages need to render, authored from
 * each library's README.
 */

/** Maturity / recommendation tier shown as a badge on each library. */
export type LibraryTier = "stable" | "beta";

/** Broad capability grouping used to organize and badge libraries. */
export type LibraryCategory =
  | "Price Oracle"
  | "DEX Aggregator"
  | "Bridge"
  | "Lending"
  | "Market Data";

/** One entry in a library's API reference table. */
export interface LibraryApiRow {
  /** Client method or model name, e.g. "get_quote(...)". */
  name: string;
  /** Underlying endpoint or signature, e.g. "GET /quote". */
  signature: string;
  /** Short description of what it does. */
  description: string;
}

/** A titled group of {@link LibraryApiRow}s (e.g. one client's methods). */
export interface LibraryApiGroup {
  /** Group heading, e.g. "HermesClient" or "Models". */
  title: string;
  rows: LibraryApiRow[];
}

/** Everything needed to render one Python library's documentation page. */
export interface LibraryDoc {
  /** Route segment, e.g. "pyth-hermes". */
  id: string;
  /** Display name, e.g. "pyth-hermes". */
  name: string;
  /** Importable PyPI distribution name. */
  pypiName: string;
  /** Published version string. */
  version: string;
  /** One-line summary shown on cards and the detail header. */
  tagline: string;
  /** Prose description (1–3 sentences). */
  description: string;
  /** Capability grouping. */
  category: LibraryCategory;
  /** Maturity tier. */
  tier: LibraryTier;
  /** Source repository URL. */
  githubUrl: string;
  /** PyPI project URL. */
  pypiUrl: string;
  /** Upstream API/protocol docs URL. */
  docsUrl: string;
  /** `pip install` command shown in the install code block. */
  install: string;
  /** Runnable quickstart, rendered as Python. */
  quickstart: string;
  /** Headline capabilities as short bullet strings. */
  features: string[];
  /** Grouped API reference (clients, helper methods, models). */
  api: LibraryApiGroup[];
  /** Authentication and rate-limit notes (one paragraph per line). */
  notes: string[];
}
