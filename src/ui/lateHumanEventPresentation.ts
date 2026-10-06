import type { ChapterNode, FactionId, ResourceWallet } from '../game/types';
import { crownroadResourceSites } from '../game/chapter4';
import { capitalResourceSites } from '../game/chapter5';
import { crownspireResourceSites } from '../game/chapter6';
import type { SemanticTone } from './semanticColors';

export type LateHumanEventId =
  | 'empty_throne' | 'broken_archives' | 'royal_ledger'
  | 'grand_council' | 'concord_vault' | 'forced_beacon';
export type LateHumanEventAction =
  | 'completeEmptyThrone' | 'completeBrokenArchives' | 'completeRoyalLedger'
  | 'completeGrandCouncil' | 'completeConcordVault' | 'completeForcedBeacon';

type Finding = { title: string; detail: string; portrait?: 'human' | 'ashen' };
type Definition = {
  chapter: 4 | 5 | 6;
  nodeId: string;
  title: string;
  body: string;
  purpose: { label: string; tone: SemanticTone };
  action: LateHumanEventAction;
  actionLabel: string;
  continueLabel: string;
  scene: 'crownspire' | 'broken_archives' | 'royal_ledger' | 'grand_council' | 'forced_beacon';
  findings: readonly Finding[];
  loreId?: string;
  siteId?: string;
  resources?: Partial<ResourceWallet>;
  showDecree?: boolean;
  showSeal?: boolean;
};

// Presentation only. Regression tests compare grants and unlocks against the current
// GameProvider action bodies. No reward, progression or combat mutation belongs here.
const definitions: Record<LateHumanEventId, Definition> = {
  empty_throne: {
    chapter: 4, nodeId: 'ch4_node_6', title: 'Prepare for Battle',
    body: 'Recovered royal records, wagon inventories and abandoned standards give Greenkeep enough logistical clarity to formalize reusable army preparations before the harder Crownroad fights.',
    purpose: { label: 'Army preparation', tone: 'blue' },
    action: 'completeEmptyThrone', actionLabel: 'Organize the Battle Plans', continueLabel: 'Test the new loadout',
    scene: 'crownspire', loreId: 'empty_throne_records', siteId: 'crownroad_salvage',
    findings: [{ title: 'Preparation matters', portrait: 'human', detail: 'The recovered stores make it practical to maintain more than one viable army setup. The next encounters are built to punish a single habitual high-Power loadout.' }]
  },
  broken_archives: {
    chapter: 5, nodeId: 'ch5_node_5', title: 'Answers to the Sky',
    body: 'After the first Flying assault, recovered archives and field reports reveal practical anti-air doctrine without making one dedicated counter mandatory.',
    purpose: { label: 'Anti-air preparation', tone: 'cyan' },
    action: 'completeBrokenArchives', actionLabel: 'Organize the Anti-Air Response', continueLabel: "Continue to Commander's Hand",
    scene: 'broken_archives', loreId: 'archive_ash_marks', siteId: 'royal_archive_stores',
    findings: [{ title: 'The same hand', detail: 'The false Orc evidence, the marcher warnings and the royal orders were not separate conspiracies. The archive marks all point to one hidden network.' }]
  },
  royal_ledger: {
    chapter: 5, nodeId: 'ch5_node_6', title: "Commander's Hand",
    body: 'The command staff formalizes the army’s mature doctrine. Existing evidence also confirms that the Ashen Court has been coordinating the Crownroad war from behind the front.',
    purpose: { label: 'Commander doctrine', tone: 'blue' },
    action: 'completeRoyalLedger', actionLabel: 'Commit the Commander Doctrine', continueLabel: 'Continue to Three Lines Deep',
    scene: 'royal_ledger', loreId: 'ashen_court_identified',
    findings: [
      { title: 'Ashen Court', portrait: 'ashen', detail: 'A cross-racial network used legitimate institutions, false flags and manufactured emergencies to push every faction toward the same crisis.' },
      { title: 'Crownspire was always the target', detail: 'The final payment trail ends at Crownspire. The Court was not simply exploiting the Crownfall—it was positioning people around the old Concord Beacon.' }
    ]
  },
  grand_council: {
    chapter: 6, nodeId: 'ch6_node_3', title: 'Call the Arcanist',
    body: 'After seeing wards in battle, Greenkeep formally calls an Arcanist into the army and opens the existing magical research path for the first time.',
    purpose: { label: 'Mage unlock', tone: 'violet' },
    action: 'completeGrandCouncil', actionLabel: 'Call the Arcanist', continueLabel: 'Test the new caster under pressure',
    scene: 'grand_council', resources: { gold: 50, provisions: 30 }, showDecree: true, findings: []
  },
  concord_vault: {
    chapter: 6, nodeId: 'ch6_node_6', title: 'Paths of the Arcane',
    body: 'Recovered Concord records let the army choose how its new magical capability develops: pressure, battlefield control, or protection remain tactical sidegrades rather than a single best path.',
    purpose: { label: 'Arcane specialization', tone: 'violet' },
    action: 'completeConcordVault', actionLabel: 'Open the Arcane Paths', continueLabel: 'Continue to Fire from Above',
    scene: 'crownspire', loreId: 'shared_concord_beacon', siteId: 'concord_cache',
    findings: [{ title: 'The Beacon was shared', detail: 'The maintenance plans confirm the Concord Beacon was never Human property. Its safeguards required all three peoples to participate, explaining why the Ashen Court needed every faction destabilized at once.' }]
  },
  forced_beacon: {
    chapter: 6, nodeId: 'ch6_node_5', title: 'The Forced Beacon',
    body: 'Ashen Court records show the Crownfall began when the Court bypassed the Concord safeguards and tried to force the Beacon to answer a single authority.',
    purpose: { label: 'Seal objective', tone: 'violet' },
    action: 'completeForcedBeacon', actionLabel: 'Commit to the Final Assault', continueLabel: 'Return to Crownspire',
    scene: 'forced_beacon', loreId: 'forced_beacon_truth', showSeal: true,
    findings: [{ title: 'Forced activation', portrait: 'ashen', detail: 'The Beacon fractured because one faction’s authority was substituted for the three-part Concord. The disaster was engineered, not accidental.' }]
  }
};

export function getLateHumanEvent(id: LateHumanEventId) {
  if (!Object.prototype.hasOwnProperty.call(definitions, id)) return null;
  const definition = definitions[id];
  const sites = [...crownroadResourceSites, ...capitalResourceSites, ...crownspireResourceSites];
  return {
    ...definition, id,
    site: sites.find(site => site.id === definition.siteId && site.faction === 'human') ?? null
  };
}

export function getLateHumanEventState(
  faction: FactionId, chapter: number, nodes: readonly ChapterNode[], id: LateHumanEventId
) {
  const event = getLateHumanEvent(id);
  const node = event ? nodes.find(candidate => candidate.id === event.nodeId) : undefined;
  const completed = faction === 'human' && Boolean(node?.completed);
  return {
    completed,
    canResolve: faction === 'human' && chapter === event?.chapter && Boolean(node?.current) && !completed
  };
}

export function getHumanOathSealStatus(
  eventCompleted: boolean, completedCampaigns: readonly FactionId[]
): { label: string; tone: SemanticTone; detail: string } {
  if (completedCampaigns.includes('human')) return {
    label: 'Human Oath Seal recovered', tone: 'positive',
    detail: 'Recovered through the final Human battle. Reopening this event does not grant another Seal or replay the victory reward.'
  };
  return eventCompleted ? {
    label: 'Oath Seal located · not recovered', tone: 'warning',
    detail: 'The Human Oath Seal is still held inside Crownspire. Win Return to Crownspire to recover it; recording this evidence does not complete the Human campaign.'
  } : {
    label: 'Oath Seal objective · preview', tone: 'blue',
    detail: 'The Oath Seal is the Human component of the original safeguard. Recording this event advances the final assault, not Seal ownership.'
  };
}
