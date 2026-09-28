import type { FactionId } from './types';

export type MetaCampaignStep = 0 | 1 | 2 | 3 | 4 | 5;

export const metaCampaignSteps = [
  {
    step: 0 as MetaCampaignStep,
    name: 'Three Seals Council',
    type: 'event',
    description: 'Bring the Human Oath Seal, Elven Root Seal and Orc Clan Seal together without placing any one faction above the others.'
  },
  {
    step: 1 as MetaCampaignStep,
    name: 'Converging Roads',
    type: 'battle',
    description: 'The lead army opens the Crownspire approach while the other two completed factions fight as allied NPC armies.'
  },
  {
    step: 2 as MetaCampaignStep,
    name: 'Concord Chamber',
    type: 'event',
    description: 'Return all three Seals to the chamber they were designed to safeguard.'
  },
  {
    step: 3 as MetaCampaignStep,
    name: 'Ashen Triumvirate',
    type: 'elite',
    description: 'Three senior Ashen commanders try to break the alliance before the Beacon can be stabilized.'
  },
  {
    step: 4 as MetaCampaignStep,
    name: 'The Unbound Beacon',
    type: 'boss',
    description: 'Defeat the final Ashen Regent and restore the Beacon under the original three-part Concord.'
  },
  {
    step: 5 as MetaCampaignStep,
    name: 'Concord Restored',
    type: 'complete',
    description: 'The three Seals are restored and no single faction controls the Beacon.'
  }
] as const;

export function getMetaCampaignStep(step: number) {
  return metaCampaignSteps.find(entry => entry.step === step) ?? metaCampaignSteps[0];
}

export function getAllianceNames(leadFaction: FactionId) {
  const names: Record<FactionId, string> = {
    human: 'Human',
    elf: 'Elf',
    orc: 'Orc'
  };

  return (['human', 'elf', 'orc'] as FactionId[])
    .filter(faction => faction !== leadFaction)
    .map(faction => names[faction]);
}
