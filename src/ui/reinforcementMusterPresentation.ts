import type { ChapterNode, FactionId, RecruitOption, UnitDefinition } from '../game/types';

export type ReinforcementMusterKind = 'fort' | 'stronghold' | 'faction_third' | 'faction_fourth' | 'faction_fifth';
export type ReinforcementMusterState = {
  activeFaction: FactionId;
  chapterNumber: number;
  chapterNodes: readonly ChapterNode[];
  units: readonly UnitDefinition[];
  recruitOptions: readonly RecruitOption[];
  fortMusterOptions: readonly RecruitOption[];
  strongholdMusterOptions: readonly RecruitOption[];
  factionFourthRecruitOptions: readonly RecruitOption[];
  factionFifthRecruitOptions: readonly RecruitOption[];
  recruitChoiceAvailable: boolean;
  recruitChosen: boolean;
  fourthRecruitChoiceAvailable: boolean;
  fourthRecruitChosen: boolean;
  sixthRecruitChosen: boolean;
  factionFifthRecruitChosen: boolean;
};

/** Presentation only. Flags and the original provider action remain authoritative. */
export function getReinforcementMusterView(kind: ReinforcementMusterKind, state: ReinforcementMusterState) {
  const { activeFaction: faction, chapterNumber, chapterNodes, units } = state;
  const human = kind === 'fort' || kind === 'stronghold';
  if (human ? faction !== 'human' : faction !== 'elf' && faction !== 'orc') return null;

  const chapter = kind === 'fort' || kind === 'faction_third' ? 2 : kind === 'faction_fourth' ? 3 : 4;
  const nodeId = human ? 'ch' + chapter + '_node_1' : faction + chapter + '_node_1';
  const options = (kind === 'fort' ? state.fortMusterOptions
    : kind === 'stronghold' ? state.strongholdMusterOptions
      : kind === 'faction_third' ? state.recruitOptions
        : kind === 'faction_fourth' ? state.factionFourthRecruitOptions
          : state.factionFifthRecruitOptions).filter(option => option.unit.faction === faction);
  const chosen = kind === 'fort' || kind === 'faction_fourth' ? state.fourthRecruitChosen
    : kind === 'stronghold' ? state.sixthRecruitChosen
      : kind === 'faction_third' ? state.recruitChosen : state.factionFifthRecruitChosen;
  const choiceAvailable = kind === 'fort' || kind === 'faction_fourth' ? state.fourthRecruitChoiceAvailable
    : kind === 'faction_third' ? state.recruitChoiceAvailable : true;
  const node = chapterNodes.find(candidate => candidate.id === nodeId);
  const recorded = Boolean(chosen || node?.completed);
  const optionUnitIds = new Set(options.map(option => option.unit.id));
  const rosterMatches = units.filter(unit => unit.faction === faction && optionUnitIds.has(unit.id));
  // Do not silently duplicate an existing reinforcement in an inconsistent/older save.
  // Multiple matches cannot establish which option was originally selected.
  const rosterConflict = !recorded && rosterMatches.length > 0;
  const canChoose = !recorded && !rosterConflict && chapterNumber === chapter &&
    Boolean(node?.current) && choiceAvailable && options.length > 0;
  const rosterUnit = recorded && rosterMatches.length === 1 ? rosterMatches[0]! : null;
  const title = kind === 'fort' ? 'Strength in Numbers'
    : kind === 'stronghold' ? 'Stronghold reinforcements'
      : kind === 'faction_third' ? faction === 'elf' ? 'Sanctuary muster' : 'Clan muster'
        : kind === 'faction_fourth' ? faction === 'elf' ? 'Moonlit Pass muster' : 'Stonejaw muster'
          : faction === 'elf' ? 'Ashen Grove muster' : 'Warhold muster';
  const continueLabel = kind === 'fort' ? 'Continue to Tools of War'
    : kind === 'stronghold' ? 'Advance toward the Broken Crown'
      : kind === 'faction_third' ? 'Continue Chapter 2'
        : kind === 'faction_fourth' ? faction === 'elf' ? 'Enter Moonlit Pass' : 'Begin the Stonejaw Trial'
          : faction === 'elf' ? 'Enter the Ashen Groves' : 'Fight on Two Fronts';

  return {
    kind, faction, chapter, nodeId, title, options, recorded, canChoose, rosterUnit, rosterConflict,
    continueLabel, showClassIllustration: !human,
    recordedDetail: rosterUnit
      ? 'One campaign reinforcement recorded. Its current class is shown below; review live stats and equipment in Army.'
      : rosterMatches.length > 1
        ? 'Recruitment is recorded, but several matching squads are in the roster. This report will not guess the original choice or grant another squad.'
        : 'Recruitment is recorded. The original squad could not be identified in the current roster; no replacement is granted here.',
    requirement: rosterConflict
      ? 'A matching reinforcement is already in the roster. Review campaign progress before attempting another claim.'
      : 'Reach this muster in Chapter ' + chapter + ' and complete the preceding expansion before recruiting.'
  };
}
