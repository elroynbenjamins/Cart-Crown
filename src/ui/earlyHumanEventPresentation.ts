import { humanResourceSites } from '../game/chapter2';
import type { FactionId, ResourceWallet } from '../game/types';
import type { SemanticTone } from './semanticColors';

export type EarlyHumanEventId = 'marked_raiders' | 'refugee_camp' | 'timber_claim';
type EventDefinition = {
  id: EarlyHumanEventId;
  chapter: number;
  nodeId: string;
  title: string;
  body: string;
  purpose: { label: string; tone: SemanticTone };
  action: 'completeMarkedRaiders' | 'completeRefugeeCamp' | 'unlockTimberCamp';
  actionLabel: string;
  resources?: Partial<ResourceWallet>;
  building?: { id: string; name: string; detail: string };
  siteId?: string;
};

const events: Record<EarlyHumanEventId, EventDefinition> = {
  marked_raiders: {
    id: 'marked_raiders', chapter: 1, nodeId: 'node_3', title: 'Marked Raiders',
    body: 'The road is secure, but the weapons left behind do not match the story everyone expects. Someone wants the attack to look Orcish.',
    purpose: { label: 'Evidence', tone: 'violet' },
    action: 'completeMarkedRaiders', actionLabel: 'Recover materials & record the clue',
    resources: { wood: 5, iron: 2 },
    building: {
      id: 'forge', name: 'Field Forge',
      detail: 'Unlocks construction of the Field Forge. Recovering this evidence does not build it or grant usable equipment.'
    }
  },
  refugee_camp: {
    id: 'refugee_camp', chapter: 1, nodeId: 'node_6', title: 'Refugee Camp',
    body: 'Families displaced from the western road have gathered outside Greenkeep. Among them are experienced teamsters, cooks and storekeepers, bringing carts, tools and preserved food.',
    purpose: { label: 'Supplies', tone: 'positive' },
    action: 'completeRefugeeCamp', actionLabel: 'Welcome the Refugees',
    resources: { wood: 45, iron: 8, provisions: 20 },
    building: {
      id: 'quartermaster', name: 'Quartermaster',
      detail: 'Unlocks the Quartermaster blueprint. Construction, later upgrades and Expedition access still have their own requirements.'
    }
  },
  timber_claim: {
    id: 'timber_claim', chapter: 2, nodeId: 'ch2_node_7', title: 'Timber Claim',
    body: 'The Iron Road bends through an abandoned forestry camp. Securing the site gives Greenkeep a steady source of structural timber.',
    purpose: { label: 'Regional production', tone: 'cyan' },
    action: 'unlockTimberCamp', actionLabel: 'Secure the Timber Camp', siteId: 'greenwood_camp'
  }
};

export type EarlyHumanEventState = {
  activeFaction: FactionId;
  chapterNumber: number;
  chapterNodes: readonly { id: string; current?: boolean; completed?: boolean }[];
  holdTheRoadWon: boolean;
  markedRaidersInvestigated: boolean;
  forgeUnlocked: boolean;
  mercenaryPatrolWon: boolean;
  commanderPathId: string | null;
  refugeeCampSecured: boolean;
  unlockedResourceSites: readonly string[];
  buildingLevels: Record<string, number>;
};

/** Presentation only. A completed node without its persisted event marker is not permission to re-claim. */
export function getEarlyHumanEventView(id: EarlyHumanEventId, state: EarlyHumanEventState) {
  const event = events[id];
  if (!event || state.activeFaction !== 'human') return null;
  const node = state.chapterNodes.find(candidate => candidate.id === event.nodeId);
  const completed = id === 'marked_raiders' ? state.markedRaidersInvestigated
    : id === 'refugee_camp' ? state.refugeeCampSecured
      : state.unlockedResourceSites.includes('greenwood_camp');
  const prerequisites = id === 'marked_raiders' ? state.holdTheRoadWon
    : id === 'refugee_camp' ? state.mercenaryPatrolWon && Boolean(state.commanderPathId) : true;
  const inconsistent = Boolean(node?.completed && !completed);
  const canResolve = !completed && !inconsistent && state.chapterNumber === event.chapter &&
    Boolean(node?.current) && prerequisites;
  const requirement = inconsistent ? 'This event node is recorded, but its completion marker needs review. No rewards can be claimed again from this report.'
    : state.chapterNumber !== event.chapter || !node?.current ? 'Reach ' + event.title + ' in Chapter ' + event.chapter + ' before completing this event.'
      : id === 'marked_raiders' && !state.holdTheRoadWon ? 'Win Hold the Road before recovering this evidence.'
        : id === 'refugee_camp' && !state.mercenaryPatrolWon ? 'Win Mercenary Patrol before welcoming the refugees.'
          : id === 'refugee_camp' && !state.commanderPathId ? 'Choose a commander specialization before welcoming the refugees.'
            : null;
  const buildingUnlocked = id === 'marked_raiders' ? state.forgeUnlocked : id === 'refugee_camp' ? state.refugeeCampSecured : false;
  const rawLevel = event.building ? state.buildingLevels[event.building.id] ?? 0 : 0;
  const buildingLevel = Number.isFinite(rawLevel) ? Math.max(0, Math.floor(rawLevel)) : 0;
  const buildingLabel = buildingLevel > 0 ? 'Built · Level ' + buildingLevel
    : buildingUnlocked ? 'Blueprint unlocked · Not built' : 'Blueprint preview · Locked';
  const site = event.siteId ? humanResourceSites.find(candidate => candidate.id === event.siteId) : undefined;

  return {
    event, completed, inconsistent, canResolve, requirement, site,
    buildingUnlocked, buildingLevel, buildingLabel,
    buildingTone: (buildingLevel > 0 ? 'positive' : buildingUnlocked ? 'blue' : 'neutral') as SemanticTone,
    status: completed ? 'Event recorded' : inconsistent ? 'Progress needs review' : canResolve ? 'Current event · preview' : 'Event locked',
    tone: (completed ? 'positive' : inconsistent ? 'warning' : canResolve ? 'blue' : 'neutral') as SemanticTone,
    identity: [state.activeFaction, id, state.chapterNumber, Boolean(node?.current), Boolean(node?.completed), completed, prerequisites].join(':')
  };
}
