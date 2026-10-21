/**
 * One source of truth for the Results CTA and the navigation it performs.
 * Keeping these together prevents the button from saying "Return to Kingdom"
 * after a late Human mission whose actual next screen is Campaign.
 */
export type ResultContinuation =
  | 'commanderChoice'
  | 'campaign'
  | 'warTable'
  | 'metaCampaign'
  | 'kingdom';

export function resultContinuation(
  resultId: string | null,
  encounterId: string,
  hasCommanderPath: boolean
): ResultContinuation {
  if (
    !hasCommanderPath &&
    [
      'mercenary_patrol_result',
      'elf_hollow_warden_result',
      'orc_blamecaller_result'
    ].includes(resultId ?? '')
  ) return 'commanderChoice';

  if ([
    'elf_return_through_roots_result',
    'orc_crownspire_warmaster_result'
  ].includes(resultId ?? '')) return 'campaign';

  if (encounterId.startsWith('human_ch')) return 'campaign';
  if (encounterId.startsWith('war_table_')) return 'warTable';

  if ([
    'three_seals_convergence_result',
    'ashen_triumvirate_result',
    'unbound_beacon_result'
  ].includes(resultId ?? '')) return 'metaCampaign';

  return 'kingdom';
}

export function resultContinuationLabel(route: ResultContinuation): string {
  switch (route) {
    case 'commanderChoice': return 'Choose Commander Path';
    case 'campaign': return 'Continue Campaign';
    case 'warTable': return 'Return to War Table';
    case 'metaCampaign': return 'Continue Three Seals';
    case 'kingdom': return 'Return to Kingdom';
  }
}
