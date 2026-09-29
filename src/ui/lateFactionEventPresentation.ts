import type { FactionId, ResourceWallet } from '../game/types';
import {
  elfChapterFiveReinforcement,
  orcChapterFiveReinforcement,
  factionChapterFourResourceSites
} from '../game/factionChapter4';
import { factionChapterFiveResourceSites } from '../game/factionChapter5';
import type { SemanticTone } from './semanticColors';

// Presentation metadata only. CI compares every grant and lore key with the current
// provider actions. No reward, unlock, combat or campaign action is implemented here.
export type LateFactionEventRequest =
  | { chapter: 4; stage: 'resource' | 'council' }
  | { chapter: 5; stage: 'muster' | 'resource' | 'seal' }
  | { chapter: 6; stage: 'concord' | 'seal' };
type EventKey = '4:resource' | '4:council' | '5:muster' | '5:resource' | '5:seal' | '6:concord' | '6:seal';
type Definition = {
  title: string;
  body: string;
  resources: Partial<ResourceWallet>;
  continueLabel: string;
  siteId?: string;
  lore?: { id: string; title: string; detail: string };
};
export const lateFactionEventRequests: readonly LateFactionEventRequest[] = [
  { chapter: 4, stage: 'resource' }, { chapter: 4, stage: 'council' },
  { chapter: 5, stage: 'muster' }, { chapter: 5, stage: 'resource' }, { chapter: 5, stage: 'seal' },
  { chapter: 6, stage: 'concord' }, { chapter: 6, stage: 'seal' }
];
const events: Record<'elf' | 'orc', Record<EventKey, Definition>> = {
  elf: {
    '4:resource': {
      title: 'The Burned Ward',
      body: 'The Enclave rebuilds a burned ward line instead of abandoning it, proving the corrupted groves can be restored rather than cut away.',
      resources: { wood: 14, provisions: 8 }, siteId: 'elf_burned_ward_reclamation',
      continueLabel: 'Fight on Two Fronts'
    },
    '4:council': {
      title: 'Living Root Council',
      body: 'The Enclave binds living rootways into the campaign network and authorizes Stag riders to carry ward-signals through ash territory.',
      resources: { gold: 28, provisions: 8 }, continueLabel: 'Confront the Ashen Druid'
    },
    '5:muster': {
      title: 'Worldroot Muster',
      body: 'The Worldroot Sanctuary calls in a veteran Spear Warden, then commits food and repair stock to keep the campaign column moving together.',
      resources: { gold: 25, provisions: 25 }, continueLabel: 'March to the Wounded Worldroot'
    },
    '5:resource': {
      title: 'Rootscar Records',
      body: 'The Worldroot scars contain maintenance records from before the Crownfall. They show the Root Seal was one part of a three-part Concord safeguard.',
      resources: { wood: 16, provisions: 10 }, siteId: 'elf_worldroot_nursery',
      lore: { id: 'worldroot_concord_records', title: 'Worldroot maintenance records', detail: 'Evidence of a shared Concord safeguard, not an army stat bonus.' },
      continueLabel: 'Confront the Ashen Rootkeepers'
    },
    '5:seal': {
      title: 'Echo of the Root Seal',
      body: 'The records do not contain the Root Seal itself. They reveal that its living signature still points toward Crownspire, where the real Seal must be recovered.',
      resources: {},
      lore: { id: 'elf_root_seal_location', title: 'Root Seal trail', detail: 'The trail points toward Crownspire. The Worldroot Guardian still blocks the road; recovering the Seal requires the final Chapter 6 battle.' },
      continueLabel: 'Face the Worldroot Guardian'
    },
    '6:concord': {
      title: 'Concord Rootway',
      body: 'The rootway beneath Crownspire contains Human engineering marks and Orc oath-stones beside Elven ward roots. The old Concord was physical infrastructure shared by all three peoples.',
      resources: {},
      lore: { id: 'elf_concord_rootway', title: 'Three peoples, one system', detail: 'Shared maintenance records prove the Root Seal was designed to work only beside the Human and Orc Seals.' },
      continueLabel: 'Assault the Ashen Starwatch'
    },
    '6:seal': {
      title: 'The Root Seal',
      body: 'The Root Seal is finally within reach, but an Ashen Regent tears it from the living cradle and retreats deeper into Crownspire. The final battle will decide whether Heartgrove actually recovers it.',
      resources: {},
      lore: { id: 'elf_root_seal_reached', title: 'The Seal chamber reached', detail: 'This event records reaching the chamber. It does not award the Root Seal or complete the Elven campaign.' },
      continueLabel: 'Return through the Roots'
    }
  },
  orc: {
    '4:resource': {
      title: 'Split Warfire',
      body: 'Emberclan establishes a permanent war camp between both fronts so false orders cannot isolate one clan from the other.',
      resources: { gold: 12, provisions: 10 }, siteId: 'orc_steppe_war_camp',
      continueLabel: 'Enter the Broken Steppe War'
    },
    '4:council': {
      title: 'Two-Front Council',
      body: 'The clans agree that no front may be reinforced at the cost of abandoning another. Warg riders become the Warhold’s rapid response force.',
      resources: { gold: 26, iron: 6 }, continueLabel: 'Confront the Split-Chieftain'
    },
    '5:muster': {
      title: 'High Warhold Muster',
      body: 'The High Warhold adds a veteran Spear Raider. Every clan contributes to one campaign column instead of sending separate warbands.',
      resources: { gold: 20, provisions: 28 }, continueLabel: 'Leave No Clan Behind'
    },
    '5:resource': {
      title: 'Missing Warfires',
      body: 'The missing Warfires were not destroyed. Their keepers were bribed to extinguish them at specific times, isolating clans during the Crownfall.',
      resources: { iron: 10, provisions: 10 }, siteId: 'orc_united_clan_depot',
      lore: { id: 'missing_warfire_pattern', title: 'Missing Warfire pattern', detail: 'The timing reveals deliberate isolation of the clans. This discovery is evidence, not a new combat modifier.' },
      continueLabel: 'Hunt the Ashen Clanbreakers'
    },
    '5:seal': {
      title: 'Echo of the Clan Seal',
      body: 'Old clan oath-stones confirm the Clan Seal survived the Crownfall and was taken toward Crownspire. The High Warhold now knows what it must recover.',
      resources: {},
      lore: { id: 'orc_clan_seal_location', title: 'Clan Seal trail', detail: 'The trail points toward Crownspire. The Last Clanbreaker still blocks the road; recovering the Seal requires the final Chapter 6 battle.' },
      continueLabel: 'Face the Last Clanbreaker'
    },
    '6:concord': {
      title: 'Concord Warpath',
      body: 'The warpath beneath Crownspire was maintained jointly: Human roadworks, Elven root supports and Orc oath-stones all guarded the same Beacon approach.',
      resources: {},
      lore: { id: 'orc_concord_warpath', title: 'Three peoples, one system', detail: 'The warpath records prove the Clan Seal was never an Orc weapon; it was one-third of a shared safeguard.' },
      continueLabel: 'Break the Ashen Warfires'
    },
    '6:seal': {
      title: 'The Clan Seal',
      body: 'The Clan Seal is found inside an old oath chamber, but an Ashen Warmaster seizes it before the clans can restore the oath. The final battle will decide whether the Seal returns to Orc hands.',
      resources: {},
      lore: { id: 'orc_clan_seal_reached', title: 'The Seal chamber reached', detail: 'This event records reaching the chamber. It does not award the Clan Seal or complete the Orc campaign.' },
      continueLabel: 'Take the Truth at Crownspire'
    }
  }
};
const purpose: Record<LateFactionEventRequest['stage'], { label: string; tone: SemanticTone }> = {
  resource: { label: 'Regional recovery', tone: 'cyan' },
  council: { label: 'Council', tone: 'blue' },
  muster: { label: 'Reinforcements', tone: 'green' },
  concord: { label: 'Concord evidence', tone: 'violet' },
  seal: { label: 'Seal objective', tone: 'violet' }
};
const actions: Record<EventKey, string> = {
  '4:resource': 'Secure the Recovery Site', '4:council': 'Complete the Council',
  '5:muster': 'Commit the Campaign Stores', '5:resource': 'Secure the Records',
  '5:seal': 'Trace the Seal to Crownspire', '6:concord': 'Secure the Concord Route', '6:seal': 'Pursue the Seal'
};

export function getLateFactionEvent(faction: FactionId, request: LateFactionEventRequest) {
  if (faction !== 'elf' && faction !== 'orc') return null;
  const key = `${request.chapter}:${request.stage}` as EventKey;
  const definition = events[faction][key];
  if (!definition) return null;
  const position = request.stage === 'muster' ? 1 : request.stage === 'resource' || request.stage === 'concord' ? 3 : 5;
  const sites = [...factionChapterFourResourceSites, ...factionChapterFiveResourceSites];
  return {
    ...definition, faction, chapter: request.chapter, stage: request.stage,
    nodeId: `${faction}${request.chapter}_node_${position}`,
    bossNodeId: `${faction}6_node_6`,
    actionLabel: actions[key], purpose: purpose[request.stage],
    site: sites.find(site => site.id === definition.siteId && site.faction === faction) ?? null,
    reinforcement: request.chapter === 5 && request.stage === 'muster'
      ? faction === 'elf' ? elfChapterFiveReinforcement : orcChapterFiveReinforcement
      : null
  };
}

/** Only actual faction-campaign completion can mark a Seal recovered, never an event flag. */
export function getSealReportStatus(
  faction: 'elf' | 'orc', chapter: 5 | 6, eventCompleted: boolean, completedCampaigns: readonly FactionId[]
): { label: string; tone: SemanticTone; detail: string } {
  const name = faction === 'elf' ? 'Root Seal' : 'Clan Seal';
  if (completedCampaigns.includes(faction)) return {
    label: name + ' recovered', tone: 'positive',
    detail: 'Recovered through the final faction battle. This event report does not grant another Seal or replay that reward.'
  };
  if (!eventCompleted) return {
    label: 'Objective preview · not recovered', tone: 'blue',
    detail: 'Recording this event advances the pursuit. The final Chapter 6 battle is still required to recover the ' + name + '.'
  };
  return {
    label: chapter === 5 ? 'Trail recorded · not recovered' : 'Chamber reached · not recovered',
    tone: 'warning',
    detail: 'The ' + name + ' remains an objective, not an owned reward. Only victory in the final Chapter 6 battle completes its recovery.'
  };
}
