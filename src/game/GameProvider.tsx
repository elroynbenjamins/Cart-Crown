import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  chapterOneNodes,
  holdTheRoadRewards,
  humanRecruitOptions,
  starterWagonItems,
  wagonStages
} from './data';
import { analyzeFormation, formationCells, getFactionDoctrines } from './formation';
import { sideModes } from './sideModes';
import type {
  BattleResult,
  CampaignAvailability,
  ChapterNode,
  FactionId,
  FormationBonus,
  FormationDoctrine,
  RecruitOption,
  ResourceWallet,
  SideModeDefinition,
  SideModeId,
  UnitDefinition,
  WagonItemDefinition,
  WagonStage
} from './types';
import {
  getRewardedAdPlacement,
  showRewardedAd
} from '../ads/rewardedAds';
import type {
  RewardedAdPlacementId,
  RewardedAdResult
} from '../ads/rewardedAds';
import type { GameSnapshot } from '../save/types';

type RewardedAdClaimState = Partial<Record<RewardedAdPlacementId, number>>;

type GameContextValue = {
  resources: ResourceWallet;
  units: UnitDefinition[];
  formation: Array<string | null>;
  wagonItems: WagonItemDefinition[];
  currentWagonStage: WagonStage;
  chapterNodes: ChapterNode[];
  activeFaction: FactionId;
  completedCampaigns: FactionId[];
  campaignAvailability: CampaignAvailability[];
  formationDoctrineId: string;
  formationDoctrines: FormationDoctrine[];
  formationBonuses: FormationBonus[];
  formationAnalysis: ReturnType<typeof analyzeFormation>;
  activeSquadCap: number;
  formationCells: number[];
  holdTheRoadWon: boolean;
  settlementUpgraded: boolean;
  recruitChoiceAvailable: boolean;
  recruitChosen: boolean;
  lastBattleResult: BattleResult | null;
  canUpgradeSettlement: boolean;
  sideModeDefinitions: SideModeDefinition[];
  expeditionTickets: number;
  expeditionRunsCompleted: number;
  formationTrialCompleted: boolean;
  rewardedAdClaims: RewardedAdClaimState;
  rewardedAdMessage: string | null;
  finishHoldTheRoad: () => void;
  upgradeSettlement: () => boolean;
  chooseRecruit: (choiceId: string) => boolean;
  moveFormationUnit: (unitId: string, targetSlot: number) => boolean;
  moveWagonItem: (itemId: string, x: number, y: number) => boolean;
  rotateWagonItem: (itemId: string) => boolean;
  resetWagon: () => void;
  setFormationDoctrine: (doctrineId: string) => boolean;
  isSideModeUnlocked: (id: SideModeId) => boolean;
  consumeExpeditionTicket: () => boolean;
  finishExpedition: () => void;
  completeFormationTrial: () => boolean;
  claimRewardedAd: (placementId: RewardedAdPlacementId) => Promise<RewardedAdResult>;
  completeCampaign: (faction: FactionId) => void;
  recruitOptions: RecruitOption[];
};

type GameProviderProps = PropsWithChildren<{
  initialSnapshot: GameSnapshot;
  onSnapshotChange: (snapshot: GameSnapshot) => Promise<void> | void;
}>;

const GameContext = createContext<GameContextValue | null>(null);

function cloneResources(resources: ResourceWallet): ResourceWallet {
  return { ...resources };
}

function cloneUnits(units: UnitDefinition[]): UnitDefinition[] {
  return units.map(unit => ({ ...unit }));
}

function cloneWagon(items: WagonItemDefinition[]): WagonItemDefinition[] {
  return items.map(item => ({ ...item }));
}

function cloneNodes(nodes: ChapterNode[]): ChapterNode[] {
  return nodes.map(node => ({ ...node }));
}

function itemDimensions(item: WagonItemDefinition) {
  return item.rotation === 90
    ? { width: item.height, height: item.width }
    : { width: item.width, height: item.height };
}

function overlaps(a: WagonItemDefinition, b: WagonItemDefinition) {
  const ad = itemDimensions(a);
  const bd = itemDimensions(b);

  return !(
    a.x + ad.width <= b.x ||
    b.x + bd.width <= a.x ||
    a.y + ad.height <= b.y ||
    b.y + bd.height <= a.y
  );
}

function canPlaceItem(
  item: WagonItemDefinition,
  otherItems: WagonItemDefinition[],
  stage: WagonStage
) {
  const dimensions = itemDimensions(item);

  if (
    item.x < 0 ||
    item.y < 0 ||
    item.x + dimensions.width > stage.width ||
    item.y + dimensions.height > stage.height
  ) {
    return false;
  }

  return otherItems.every(other => !overlaps(item, other));
}

const stageRank: Record<string, number> = {
  camp: 0,
  settlement: 1,
  fort: 2,
  town: 3,
  stronghold: 4,
  capital: 5,
  grand: 6
};

const sideModeUnlockRank: Record<SideModeDefinition['unlockStage'], number> = {
  settlement: 1,
  fort: 2,
  stronghold: 4
};

export function GameProvider({
  children,
  initialSnapshot,
  onSnapshotChange
}: GameProviderProps) {
  const [resources, setResources] = useState<ResourceWallet>(() => cloneResources(initialSnapshot.resources));
  const [units, setUnits] = useState<UnitDefinition[]>(() => cloneUnits(initialSnapshot.units));
  const [formation, setFormation] = useState<Array<string | null>>(() => [...initialSnapshot.formation]);
  const [wagonItems, setWagonItems] = useState<WagonItemDefinition[]>(() => cloneWagon(initialSnapshot.wagonItems));
  const [wagonStageId, setWagonStageId] = useState(initialSnapshot.wagonStageId);
  const [chapterNodes, setChapterNodes] = useState<ChapterNode[]>(() => cloneNodes(initialSnapshot.chapterNodes));
  const [activeFaction] = useState<FactionId>(initialSnapshot.activeFaction);
  const [completedCampaigns, setCompletedCampaigns] = useState<FactionId[]>(() => [...initialSnapshot.completedCampaigns]);
  const [formationDoctrineId, setFormationDoctrineId] = useState(initialSnapshot.formationDoctrineId);
  const [holdTheRoadWon, setHoldTheRoadWon] = useState(initialSnapshot.holdTheRoadWon);
  const [settlementUpgraded, setSettlementUpgraded] = useState(initialSnapshot.settlementUpgraded);
  const [recruitChoiceAvailable, setRecruitChoiceAvailable] = useState(initialSnapshot.recruitChoiceAvailable);
  const [recruitChosen, setRecruitChosen] = useState(initialSnapshot.recruitChosen);
  const [lastBattleResult, setLastBattleResult] = useState<BattleResult | null>(
    initialSnapshot.lastBattleResult ? { ...initialSnapshot.lastBattleResult } : null
  );
  const [expeditionTickets, setExpeditionTickets] = useState(initialSnapshot.expeditionTickets);
  const [expeditionRunsCompleted, setExpeditionRunsCompleted] = useState(initialSnapshot.expeditionRunsCompleted);
  const [formationTrialCompleted, setFormationTrialCompleted] = useState(initialSnapshot.formationTrialCompleted);
  const [rewardedAdClaims, setRewardedAdClaims] = useState<RewardedAdClaimState>({});
  const [rewardedAdMessage, setRewardedAdMessage] = useState<string | null>(null);

  const currentWagonStage = useMemo(
    () => wagonStages.find(stage => stage.id === wagonStageId) ?? wagonStages[0]!,
    [wagonStageId]
  );

  const formationDoctrines = useMemo(
    () => getFactionDoctrines(activeFaction),
    [activeFaction]
  );

  const formationAnalysis = useMemo(
    () => analyzeFormation(formation, units, activeFaction, formationDoctrineId),
    [activeFaction, formation, formationDoctrineId, units]
  );

  const formationBonuses = formationAnalysis.bonuses;
  const activeSquadCap = currentWagonStage.formationSlots;

  const campaignAvailability = useMemo<CampaignAvailability[]>(() => {
    const humanComplete = completedCampaigns.includes('human');
    const allComplete =
      completedCampaigns.includes('human') &&
      completedCampaigns.includes('elf') &&
      completedCampaigns.includes('orc');

    return [
      {
        id: 'human',
        unlocked: true,
        completed: humanComplete,
        unlockText: humanComplete ? 'Completed' : 'Available'
      },
      {
        id: 'elf',
        unlocked: humanComplete,
        completed: completedCampaigns.includes('elf'),
        unlockText: humanComplete ? 'Unlocked after Human campaign' : 'Complete Human campaign'
      },
      {
        id: 'orc',
        unlocked: humanComplete,
        completed: completedCampaigns.includes('orc'),
        unlockText: humanComplete ? 'Unlocked after Human campaign' : 'Complete Human campaign'
      },
      {
        id: 'meta',
        unlocked: allComplete,
        completed: false,
        unlockText: allComplete ? 'Three Seals campaign unlocked' : 'Complete all three faction campaigns'
      }
    ];
  }, [completedCampaigns]);

  const canUpgradeSettlement =
    holdTheRoadWon &&
    !settlementUpgraded &&
    resources.wood >= 90 &&
    resources.stone >= 20;

  const snapshot = useMemo<GameSnapshot>(
    () => ({
      schemaVersion: 1,
      resources,
      units,
      formation,
      wagonItems,
      wagonStageId,
      chapterNodes,
      activeFaction,
      completedCampaigns,
      formationDoctrineId,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      lastBattleResult,
      expeditionTickets,
      expeditionRunsCompleted,
      formationTrialCompleted
    }),
    [
      resources,
      units,
      formation,
      wagonItems,
      wagonStageId,
      chapterNodes,
      activeFaction,
      completedCampaigns,
      formationDoctrineId,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      lastBattleResult,
      expeditionTickets,
      expeditionRunsCompleted,
      formationTrialCompleted
    ]
  );

  const saveCallbackRef = useRef(onSnapshotChange);

  useEffect(() => {
    saveCallbackRef.current = onSnapshotChange;
  }, [onSnapshotChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void saveCallbackRef.current(snapshot);
    }, 250);

    return () => {
      clearTimeout(timer);
      void saveCallbackRef.current(snapshot);
    };
  }, [snapshot]);

  const finishHoldTheRoad = () => {
    if (holdTheRoadWon) {
      return;
    }

    setHoldTheRoadWon(true);
    setResources(previous => ({
      ...previous,
      gold: previous.gold + (holdTheRoadRewards.gold ?? 0),
      wood: previous.wood + (holdTheRoadRewards.wood ?? 0),
      stone: previous.stone + (holdTheRoadRewards.stone ?? 0),
      iron: previous.iron + (holdTheRoadRewards.iron ?? 0),
      provisions: previous.provisions + (holdTheRoadRewards.provisions ?? 0)
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'node_2') {
          return { ...node, completed: true, current: false };
        }
        if (node.id === 'node_3') {
          return { ...node, current: true };
        }
        return { ...node, current: false };
      })
    );
    setLastBattleResult({
      id: 'hold_the_road_result',
      title: 'Road Secured',
      victory: true,
      summary: 'The raider patrol breaks. Refugees can finally reach the ruins of Greenkeep.',
      rewards: { ...holdTheRoadRewards },
      casualties: 0
    });
  };

  const upgradeSettlement = () => {
    if (!canUpgradeSettlement) {
      return false;
    }

    setResources(previous => ({
      ...previous,
      wood: previous.wood - 90,
      stone: previous.stone - 20
    }));
    setSettlementUpgraded(true);
    setRecruitChoiceAvailable(true);
    setWagonStageId('settlement');
    return true;
  };

  const chooseRecruit = (choiceId: string) => {
    if (!recruitChoiceAvailable || recruitChosen) {
      return false;
    }

    const choice = humanRecruitOptions.find(option => option.id === choiceId);
    if (!choice) {
      return false;
    }

    setUnits(previous => [...previous, { ...choice.unit }]);
    setFormation(previous => {
      const next = [...previous];
      const preferredSlots =
        choice.unit.role === 'ranged' || choice.unit.role === 'support'
          ? [6, 7, 8, 3, 4, 5, 0, 1, 2]
          : [3, 4, 5, 0, 1, 2, 6, 7, 8];
      const empty = preferredSlots.find(slot => next[slot] === null);

      if (empty !== undefined && next.filter(Boolean).length < activeSquadCap) {
        next[empty] = choice.unit.id;
      }
      return next;
    });
    setRecruitChosen(true);
    setRecruitChoiceAvailable(false);
    return true;
  };

  const moveFormationUnit = (unitId: string, targetSlot: number) => {
    if (!formationCells.includes(targetSlot)) {
      return false;
    }

    const sourceSlot = formation.indexOf(unitId);
    if (sourceSlot < 0) {
      return false;
    }

    setFormation(previous => {
      const next = [...previous];
      const targetUnit = next[targetSlot];
      next[targetSlot] = unitId;
      next[sourceSlot] = targetUnit ?? null;
      return next;
    });
    return true;
  };

  const moveWagonItem = (itemId: string, x: number, y: number) => {
    const item = wagonItems.find(candidate => candidate.id === itemId);
    if (!item) {
      return false;
    }

    const moved: WagonItemDefinition = { ...item, x, y };
    const others = wagonItems.filter(candidate => candidate.id !== itemId);
    if (!canPlaceItem(moved, others, currentWagonStage)) {
      return false;
    }

    setWagonItems(previous =>
      previous.map(candidate => (candidate.id === itemId ? moved : candidate))
    );
    return true;
  };

  const rotateWagonItem = (itemId: string) => {
    const item = wagonItems.find(candidate => candidate.id === itemId);
    if (!item || item.width === item.height) {
      return false;
    }

    const rotated: WagonItemDefinition = {
      ...item,
      rotation: item.rotation === 0 ? 90 : 0
    };
    const others = wagonItems.filter(candidate => candidate.id !== itemId);
    if (!canPlaceItem(rotated, others, currentWagonStage)) {
      return false;
    }

    setWagonItems(previous =>
      previous.map(candidate => (candidate.id === itemId ? rotated : candidate))
    );
    return true;
  };

  const resetWagon = () => {
    setWagonItems(cloneWagon(starterWagonItems));
  };

  const setFormationDoctrine = (doctrineId: string) => {
    if (!formationDoctrines.some(doctrine => doctrine.id === doctrineId)) {
      return false;
    }
    setFormationDoctrineId(doctrineId);
    return true;
  };

  const isSideModeUnlocked = (id: SideModeId) => {
    const mode = sideModes.find(candidate => candidate.id === id);
    if (!mode) return false;
    return (stageRank[currentWagonStage.id] ?? 0) >= sideModeUnlockRank[mode.unlockStage];
  };

  const consumeExpeditionTicket = () => {
    if (!isSideModeUnlocked('expeditions') || expeditionTickets <= 0) {
      return false;
    }
    setExpeditionTickets(previous => previous - 1);
    return true;
  };

  const finishExpedition = () => {
    setExpeditionRunsCompleted(previous => previous + 1);
    setResources(previous => ({
      ...previous,
      gold: previous.gold + 35,
      wood: previous.wood + 8,
      provisions: previous.provisions + 4
    }));
  };

  const completeFormationTrial = () => {
    if (!isSideModeUnlocked('formation_trials') || formationTrialCompleted) {
      return false;
    }

    const harlan = formation.indexOf('hum_militia');
    const mira = formation.indexOf('hum_recruit');
    const harlanFront = harlan >= 0 && harlan <= 2;
    const miraBehind = mira >= 3;
    const sameColumn = harlan >= 0 && mira >= 0 && harlan % 3 === mira % 3;

    if (!harlanFront || !miraBehind || !sameColumn) {
      return false;
    }

    setFormationTrialCompleted(true);
    setResources(previous => ({
      ...previous,
      gold: previous.gold + 25,
      iron: previous.iron + 4
    }));
    return true;
  };

  const claimRewardedAd = async (
    placementId: RewardedAdPlacementId
  ): Promise<RewardedAdResult> => {
    const placement = getRewardedAdPlacement(placementId);
    if (!placement) {
      return { status: 'unavailable', provider: 'none' };
    }

    const used = rewardedAdClaims[placementId] ?? 0;
    if (used >= placement.capPerSession) {
      setRewardedAdMessage('Reward limit reached for this session.');
      return { status: 'unavailable', provider: 'none' };
    }

    const result = await showRewardedAd(placementId);
    if (result.status !== 'rewarded') {
      setRewardedAdMessage('Rewarded ads are not configured in this build yet.');
      return result;
    }

    if (placementId === 'daily_supply') {
      setResources(previous => ({
        ...previous,
        wood: previous.wood + 15,
        provisions: previous.provisions + 15
      }));
    } else if (placementId === 'expedition_ticket') {
      setExpeditionTickets(previous => previous + 1);
    } else if (placementId === 'salvage_boost') {
      setResources(previous => ({
        ...previous,
        wood: previous.wood + 3,
        iron: previous.iron + 1
      }));
    }

    setRewardedAdClaims(previous => ({
      ...previous,
      [placementId]: (previous[placementId] ?? 0) + 1
    }));
    setRewardedAdMessage(placement.rewardSummary);
    return result;
  };

  const completeCampaign = (faction: FactionId) => {
    setCompletedCampaigns(previous =>
      previous.includes(faction) ? previous : [...previous, faction]
    );
  };

  const value = useMemo<GameContextValue>(
    () => ({
      resources,
      units,
      formation,
      wagonItems,
      currentWagonStage,
      chapterNodes,
      activeFaction,
      completedCampaigns,
      campaignAvailability,
      formationDoctrineId,
      formationDoctrines,
      formationBonuses,
      formationAnalysis,
      activeSquadCap,
      formationCells,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      lastBattleResult,
      canUpgradeSettlement,
      sideModeDefinitions: sideModes,
      expeditionTickets,
      expeditionRunsCompleted,
      formationTrialCompleted,
      rewardedAdClaims,
      rewardedAdMessage,
      finishHoldTheRoad,
      upgradeSettlement,
      chooseRecruit,
      moveFormationUnit,
      moveWagonItem,
      rotateWagonItem,
      resetWagon,
      setFormationDoctrine,
      isSideModeUnlocked,
      consumeExpeditionTicket,
      finishExpedition,
      completeFormationTrial,
      claimRewardedAd,
      completeCampaign,
      recruitOptions: humanRecruitOptions
    }),
    [
      resources,
      units,
      formation,
      wagonItems,
      currentWagonStage,
      chapterNodes,
      activeFaction,
      completedCampaigns,
      campaignAvailability,
      formationDoctrineId,
      formationDoctrines,
      formationBonuses,
      formationAnalysis,
      activeSquadCap,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      lastBattleResult,
      canUpgradeSettlement,
      expeditionTickets,
      expeditionRunsCompleted,
      formationTrialCompleted,
      rewardedAdClaims,
      rewardedAdMessage
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used inside GameProvider');
  }
  return context;
}
