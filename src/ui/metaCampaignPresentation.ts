import { metaCampaignSteps } from '../game/metaCampaign';
import type { FactionId } from '../game/types';
import type { SemanticTone } from './semanticColors';

export type MetaCampaignAction = 'council' | 'convergence' | 'chamber' | 'triumvirate' | 'finalBoss';
export type CampaignStageState = 'completed' | 'current' | 'upcoming' | 'locked';
export type CampaignStageRow = {
  id: string;
  title: string;
  description: string;
  kind: string;
  state: CampaignStageState;
};
export type MetaCampaignViewInput = {
  completedCampaigns: readonly FactionId[];
  metaCampaignUnlocked: boolean;
  metaCampaignComplete: boolean;
  metaCampaignStep: number;
};

const sealDefinitions = [
  { faction: 'human' as const, name: 'Oath Seal', people: 'Humans' },
  { faction: 'elf' as const, name: 'Root Seal', people: 'Elves' },
  { faction: 'orc' as const, name: 'Clan Seal', people: 'Orcs' }
];
const actions: readonly MetaCampaignAction[] = ['council', 'convergence', 'chamber', 'triumvirate', 'finalBoss'];
const actionLabels: Record<MetaCampaignAction, string> = {
  council: 'Assemble the Three Seals Council',
  convergence: 'Prepare Converging Roads',
  chamber: 'Restore the Seals to the Chamber',
  triumvirate: 'Prepare Ashen Triumvirate',
  finalBoss: 'Prepare the Unbound Beacon'
};
const kindLabels: Record<string, string> = {
  event: 'Council event', battle: 'Battle', elite: 'Elite battle', boss: 'Final boss'
};

// Presentation-only mirrors, verified against the current BattleScreen formula in CI.
// These are existing encounter-scoped contributions, not permanent army upgrades.
export const metaAlliancePreview = {
  attackMultiplier: 1.1,
  armorMultiplier: 1.08,
  encounters: ['three_seals_convergence', 'ashen_triumvirate', 'unbound_beacon']
} as const;

export const campaignStageStatus: Record<CampaignStageState, { label: string; tone: SemanticTone }> = {
  completed: { label: 'Completed', tone: 'positive' },
  current: { label: 'Current objective', tone: 'blue' },
  upcoming: { label: 'Upcoming', tone: 'neutral' },
  locked: { label: 'Locked', tone: 'neutral' }
};

/** Read-only UI projection. Never normalize a bad step into a playable first/final battle. */
export function getMetaCampaignView(input: MetaCampaignViewInput) {
  const seals = sealDefinitions.map(seal => ({ ...seal, recovered: input.completedCampaigns.includes(seal.faction) }));
  const recovered = seals.filter(seal => seal.recovered).length;
  const missingNames = seals.filter(seal => !seal.recovered).map(seal => seal.name);
  const unlocked = input.metaCampaignUnlocked && recovered === 3;
  const validStep = Number.isInteger(input.metaCampaignStep) && input.metaCampaignStep >= 0 && input.metaCampaignStep <= 5;
  const consistent = validStep && (input.metaCampaignComplete ? input.metaCampaignStep === 5 : input.metaCampaignStep < 5);
  const complete = unlocked && consistent && input.metaCampaignComplete;
  const playable = unlocked && consistent && !complete;
  const current = playable ? metaCampaignSteps.find(step => step.step === input.metaCampaignStep) ?? null : null;
  const action: MetaCampaignAction | null = playable ? actions[input.metaCampaignStep] ?? null : null;
  const completedCount = complete ? 5 : playable ? input.metaCampaignStep : 0;
  const title = complete ? 'Concord Restored' : !unlocked ? 'Three Seals locked' : !consistent ? 'Progress unavailable' : current?.name ?? 'Three Seals';
  const tone: SemanticTone = complete ? 'positive' : playable ? 'blue' : 'neutral';
  const summary = complete
    ? 'The Concord Beacon has been restored under all three Seals. This report does not replay completed battles or grant rewards again.'
    : !unlocked
      ? missingNames.length > 0
        ? 'Recover ' + missingNames.join(', ') + ' by completing the remaining faction campaigns.'
        : 'All Seals are recorded. Campaign access is not currently available; return to Campaign before continuing.'
      : !consistent
        ? 'The saved stage and completion state do not agree. No event or battle can be started from this report.'
        : current?.description ?? '';
  const rows: CampaignStageRow[] = metaCampaignSteps.filter(step => step.type !== 'complete').map(step => ({
    id: String(step.step), title: step.name, description: step.description, kind: kindLabels[step.type] ?? 'Event',
    state: !unlocked || !consistent ? 'locked' : complete || step.step < input.metaCampaignStep ? 'completed' : step.step === input.metaCampaignStep ? 'current' : 'upcoming'
  }));
  return {
    seals, recovered, unlocked, complete, playable, title, tone, summary, completedCount, rows, action,
    currentId: current ? String(current.step) : null,
    actionLabel: action ? actionLabels[action] : 'Return to Campaigns',
    isBattle: action === 'convergence' || action === 'triumvirate' || action === 'finalBoss'
  };
}
