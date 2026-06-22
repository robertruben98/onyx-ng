import { LibraryDoc } from "../library-model";
import { pythHermesDoc } from "./pyth-hermes.doc";
import { odosPyDoc } from "./odos-py.doc";
import { lifiPyDoc } from "./lifi-py.doc";
import { relayLinkPyDoc } from "./relay-link-py.doc";
import { morphoBluePyDoc } from "./morpho-blue-py.doc";
import { debridgePyDoc } from "./debridge-py.doc";
import { acrossProtocolPyDoc } from "./across-protocol-py.doc";
import { squidrouterPyDoc } from "./squidrouter-py.doc";
import { kaminoPyDoc } from "./kamino-py.doc";
import { redstonePyDoc } from "./redstone-py.doc";
import { mobulaPyDoc } from "./mobula-py.doc";
import { meteoraPyDoc } from "./meteora-py.doc";
import { pendlePyDoc } from "./pendle-py.doc";
import { mayanPyDoc } from "./mayan-py.doc";
import { zeroxSwapPyDoc } from "./zerox-swap-py.doc";
import { bungeePyDoc } from "./bungee-py.doc";
import { rangoPyDoc } from "./rango-py.doc";

/**
 * Single source of truth for the Python Libraries section. The index renders
 * cards from this list, the router derives detail routes from it, and the
 * nav/search pick it up via {@link NAV}.
 */
export const LIBRARY_DOCS: LibraryDoc[] = [
  pythHermesDoc,
  odosPyDoc,
  lifiPyDoc,
  relayLinkPyDoc,
  morphoBluePyDoc,
  debridgePyDoc,
  acrossProtocolPyDoc,
  squidrouterPyDoc,
  kaminoPyDoc,
  redstonePyDoc,
  mobulaPyDoc,
  meteoraPyDoc,
  pendlePyDoc,
  mayanPyDoc,
  zeroxSwapPyDoc,
  bungeePyDoc,
  rangoPyDoc,
];
