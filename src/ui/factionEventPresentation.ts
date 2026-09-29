import type { ChapterNode, FactionId, ResourceWallet } from '../game/types';
import { factionChapterTwoResourceSites } from '../game/factionChapter2';
import { factionChapterThreeResourceSites } from '../game/factionChapter3';
import type { SemanticTone } from './semanticColors';

// Presentation only. Resource grants are checked against live GameProvider actions in CI.
// The provider remains authoritative for rewards, unlocks and advancement.
export type EarlyFactionEventRequest =
  | { chapter: 1; stage: 'investigation' | 'supply' }
  | { chapter: 2 | 3; stage: 'resource' | 'council' };
type EventKey = '1:investigation' | '1:supply' | '2:resource' | '2:council' | '3:resource' | '3:council';
export type EarlyFactionEvent = {
  title: string;
  body: string;
  resources: Partial<ResourceWallet>;
  continueLabel: string;
  evidence?: string;
  siteId?: string;
  buildingRole?: 'SUPPLY' | 'MOUNT';
  expansion?: { name: string; boss: string };
};

const events: Record<'elf' | 'orc', Record<EventKey, EarlyFactionEvent>> = {
  elf: {
    '1:investigation': {
      title: 'Whispering Roots',
      body: 'The damaged roots remember metal tools, ash-grey residue and footsteps that deliberately avoided normal forest paths.',
      evidence: 'The ash residue matches traces found near the failing wardstones.',
      resources: { gold: 5, wood: 4 }, continueLabel: 'Follow the Ashen Tracks'
    },
    '1:supply': {
      title: 'Wayfarer Camp',
      body: 'Wardens establish a light Wayfarer camp beside a living rootway, gathering herbs, timber and enough provisions for the next hunt.',
      resources: { wood: 24, provisions: 14 }, continueLabel: 'Challenge the Hollow Warden'
    },
    '2:resource': {
      title: 'Moonwell Grove',
      body: 'The Wardens restore a moonwell grove that feeds both the sanctuary wards and the Wayfarer Caravan.',
      resources: { wood: 12, provisions: 8 }, siteId: 'elf_moonwell_herbs', buildingRole: 'SUPPLY',
      continueLabel: 'Hunt the Ward Hunters'
    },
    '2:council': {
      title: 'Root Council',
      body: 'Heartgrove elders agree to extend the rootway beyond the sanctuary and prepare Stag riders for Moonlit Pass.',
      resources: { gold: 20, stone: 6 }, buildingRole: 'MOUNT', continueLabel: 'Track the Ashroot Stalker'
    },
    '3:resource': {
      title: 'Silent Beacons',
      body: 'The Wardhold relights the silent moon-beacons and reopens a protected route through the pass.',
      resources: { gold: 12, provisions: 6 }, siteId: 'elf_moonlit_watch', continueLabel: 'Enter the Ashen Groves'
    },
    '3:council': {
      title: 'Rootway Council',
      body: 'Heartgrove agrees to bind the Moonlit Pass rootways into one protected network before confronting the Pale Ranger.',
      resources: { gold: 24, wood: 10 }, expansion: { name: 'Enclave', boss: 'the Pale Ranger' },
      continueLabel: 'Confront the Pale Ranger'
    }
  },
  orc: {
    '1:investigation': {
      title: 'Broken Clan Marks',
      body: 'The stolen clan marks were painted over foreign-made straps and buckles. Someone wanted the attack blamed on a real Orc clan.',
      evidence: 'The forged marks prove the attackers were disguised.',
      resources: { gold: 5, iron: 2 }, continueLabel: 'Hunt the Invader Scouts'
    },
    '1:supply': {
      title: 'Gathering Fire',
      body: 'Nearby clans answer Emberclan’s fire signal with food, timber and spare iron. The warband can now hunt the leader spreading the false blame.',
      resources: { wood: 20, iron: 4, provisions: 16 }, continueLabel: 'Confront the Blamecaller'
    },
    '2:resource': {
      title: 'Warg Pens',
      body: 'Emberclan secures old Warg pens and the surrounding Red Plains hunting routes.',
      resources: { provisions: 12, iron: 3 }, siteId: 'orc_red_plains_hunt', buildingRole: 'SUPPLY',
      continueLabel: 'Face the Stonejaw Challengers'
    },
    '2:council': {
      title: 'Warfire Council',
      body: 'The gathered clans accept a temporary Warfire pact and open Warg training for the road toward Stonejaw.',
      resources: { gold: 18, wood: 10 }, buildingRole: 'MOUNT', continueLabel: 'Confront the Clanbreaker'
    },
    '3:resource': {
      title: 'Trial Fires',
      body: 'Stonejaw allows Emberclan to light trial fires along the quarry roads after the first challenge is passed.',
      resources: { stone: 8, iron: 5 }, siteId: 'orc_stonejaw_quarry', continueLabel: 'Cross the Broken Steppe'
    },
    '3:council': {
      title: 'Clan Oath',
      body: 'The clans swear a temporary Stonejaw Oath: no clan may answer a false standard without first calling the others.',
      resources: { gold: 22, provisions: 8 }, expansion: { name: 'Great Warhold', boss: 'the Stonejaw Champion' },
      continueLabel: 'Face the Stonejaw Champion'
    }
  }
};
const purpose: Record<EarlyFactionEventRequest['stage'], { label: string; tone: SemanticTone }> = {
  investigation: { label: 'Evidence', tone: 'violet' },
  supply: { label: 'Supplies', tone: 'green' },
  resource: { label: 'Regional production', tone: 'cyan' },
  council: { label: 'Council', tone: 'blue' }
};
const actions: Record<EventKey, string> = {
  '1:investigation': 'Record the Evidence', '1:supply': 'Prepare the Campaign',
  '2:resource': 'Secure the Site', '2:council': 'Complete the Council',
  '3:resource': 'Restore the Route', '3:council': 'Seal the Agreement'
};

export function getEarlyFactionEvent(faction: FactionId, request: EarlyFactionEventRequest) {
  if (faction !== 'elf' && faction !== 'orc') return null;
  const key = `${request.chapter}:${request.stage}` as EventKey;
  const definition = events[faction][key];
  if (!definition) return null;
  const position = request.stage === 'investigation' || request.stage === 'resource' ? 3 : 5;
  const prefix = request.chapter === 1 ? faction : faction + request.chapter;
  const sites = [...factionChapterTwoResourceSites, ...factionChapterThreeResourceSites];
  return {
    ...definition, faction, chapter: request.chapter, stage: request.stage,
    nodeId: `${prefix}_node_${position}`,
    bossNodeId: `${prefix}_node_6`,
    actionLabel: actions[key], purpose: purpose[request.stage],
    site: sites.find(site => site.id === definition.siteId && site.faction === faction) ?? null
  };
}

/** A future/foreign event is only a preview. Never infer completion from chapter number alone. */
export function getFactionEventState(
  nodes: readonly ChapterNode[], currentChapter: number, eventChapter: number, nodeId: string
) {
  const node = nodes.find(candidate => candidate.id === nodeId);
  return {
    completed: Boolean(node?.completed),
    canResolve: currentChapter === eventChapter && Boolean(node?.current) && !node?.completed
  };
}
