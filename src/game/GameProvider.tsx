import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  holdTheRoadRewards,
  humanRecruitOptions,
  starterWagonItems,
  wagonStages
} from './data';
import {
  equipmentDefinitions,
  getEquipment,
  getRecruitPromotionByEquipment,
  recruitPromotions
} from './equipment';
import { analyzeFormation, formationCells, getFactionDoctrines } from './formation';
import { sideModes } from './sideModes';
import type {
  BattleResult,
  CampaignAvailability,
  ChapterNode,
  EquipmentDefinition,
  FactionId,
  FormationBonus,
  FormationDoctrine,
  PromotionDefinition,
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
import type {
  FactionGameState,
  GameSnapshot,
  SharedProgress
} from '../save/types';

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
  markedRaidersInvestigated: boolean;
  forgeUnlocked: boolean;
  firstPromotionComplete: boolean;
  equipmentInventory: string[];
  unitWeapons: Record<string, string | null>;
  equipmentDefinitions: EquipmentDefinition[];
  recruitPromotions: PromotionDefinition[];
  lastBattleResult: BattleResult | null;
  canUpgradeSettlement: boolean;
  sideModeDefinitions: SideModeDefinition[];
  expeditionTickets: number;
  expeditionRunsCompleted: number;
  formationTrialCompleted: boolean;
  rewardedAdClaims: RewardedAdClaimState;
  rewardedAdMessage: string | null;
  finishHoldTheRoad: () => void;
  completeMarkedRaiders: () => boolean;
  upgradeSettlement: () => boolean;
  chooseRecruit: (choiceId: string) => boolean;
  craftEquipment: (equipmentId: string) => boolean;
  promoteMira: (equipmentId: string) => boolean;
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

function canAfford(resources: ResourceWallet, cost: Partial<ResourceWallet>) {
  return Object.entries(cost).every(([key, amount]) => {
    const resourceKey = key as keyof ResourceWallet;
    return resources[resourceKey] >= (amount ?? 0);
  });
}

function payCost(resources: ResourceWallet, cost: Partial<ResourceWallet>): ResourceWallet {
  const next = { ...resources };
  for (const [key, amount] of Object.entries(cost)) {
    const resourceKey = key as keyof ResourceWallet;
    next[resourceKey] -= amount ?? 0;
  }
  return next;
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
  const initialFaction =
    initialSnapshot.factionStates[initialSnapshot.activeFaction] ??
    initialSnapshot.factionStates.human;

  if (!initialFaction) {
    throw new Error('Save has no playable faction state.');
  }

  const [resources, setResources] = useState<ResourceWallet>(() => cloneResources(initialFaction.resources));
  const [units, setUnits] = useState<UnitDefinition[]>(() => cloneUnits(initialFaction.units));
  const [formation, setFormation] = useState<Array<string | null>>(() => [...initialFaction.formation]);
  const [wagonItems, setWagonItems] = useState<WagonItemDefinition[]>(() => cloneWagon(initialFaction.wagonItems));
  const [wagonStageId, setWagonStageId] = useState(initialFaction.wagonStageId);
  const [chapterNodes, setChapterNodes] = useState<ChapterNode[]>(() => cloneNodes(initialFaction.chapterNodes));
  const [activeFaction] = useState<FactionId>(initialSnapshot.activeFaction);
  const [sharedProgress, setSharedProgress] = useState<SharedProgress>(() => ({
    completedCampaigns: [...initialSnapshot.shared.completedCampaigns],
    achievements: [...initialSnapshot.shared.achievements],
    lore: [...initialSnapshot.shared.lore],
    cosmetics: [...initialSnapshot.shared.cosmetics]
  }));
  const [formationDoctrineId, setFormationDoctrineId] = useState(initialFaction.formationDoctrineId);
  const [holdTheRoadWon, setHoldTheRoadWon] = useState(initialFaction.holdTheRoadWon);
  const [settlementUpgraded, setSettlementUpgraded] = useState(initialFaction.settlementUpgraded);
  const [recruitChoiceAvailable, setRecruitChoiceAvailable] = useState(initialFaction.recruitChoiceAvailable);
  const [recruitChosen, setRecruitChosen] = useState(initialFaction.recruitChosen);
  const [markedRaidersInvestigated, setMarkedRaidersInvestigated] = useState(initialFaction.markedRaidersInvestigated);
  const [forgeUnlocked, setForgeUnlocked] = useState(initialFaction.forgeUnlocked);
  const [firstPromotionComplete, setFirstPromotionComplete] = useState(initialFaction.firstPromotionComplete);
  const [equipmentInventory, setEquipmentInventory] = useState<string[]>(() => [...initialFaction.equipmentInventory]);
  const [unitWeapons, setUnitWeapons] = useState<Record<string, string | null>>(() => ({ ...initialFaction.unitWeapons }));
  const [lastBattleResult, setLastBattleResult] = useState<BattleResult | null>(
    initialFaction.lastBattleResult ? { ...initialFaction.lastBattleResult } : null
  );
  const [expeditionTickets, setExpeditionTickets] = useState(initialFaction.expeditionTickets);
  const [expeditionRunsCompleted, setExpeditionRunsCompleted] = useState(initialFaction.expeditionRunsCompleted);
  const [formationTrialCompleted, setFormationTrialCompleted] = useState(initialFaction.formationTrialCompleted);
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
  const completedCampaigns = sharedProgress.completedCampaigns;

  const campaignAvailability = useMemo<CampaignAvailability[]>(() => {
    const humanComplete = completedCampaigns.includes('human');
    const allComplete =
      completedCampaigns.includes('human') &&
      completedCampaigns.includes('elf') &&
      completedCampaigns.includes('orc');

    return [
      { id: 'human', unlocked: true, completed: humanComplete, unlockText: humanComplete ? 'Completed' : 'Available' },
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

  const currentFactionState = useMemo<FactionGameState>(
    () => ({
      faction: activeFaction,
      resources,
      units,
      formation,
      wagonItems,
      wagonStageId,
      chapterNodes,
      formationDoctrineId,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      markedRaidersInvestigated,
      forgeUnlocked,
      firstPromotionComplete,
      equipmentInventory,
      unitWeapons,
      lastBattleResult,
      expeditionTickets,
      expeditionRunsCompleted,
      formationTrialCompleted
    }),
    [
      activeFaction,
      resources,
      units,
      formation,
      wagonItems,
      wagonStageId,
      chapterNodes,
      formationDoctrineId,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      markedRaidersInvestigated,
      forgeUnlocked,
      firstPromotionComplete,
      equipmentInventory,
      unitWeapons,
      lastBattleResult,
      expeditionTickets,
      expeditionRunsCompleted,
      formationTrialCompleted
    ]
  );

  const snapshot = useMemo<GameSnapshot>(
    () => ({
      schemaVersion: 2,
      activeFaction,
      shared: sharedProgress,
      factionStates: {
        ...initialSnapshot.factionStates,
        [activeFaction]: currentFactionState
      }
    }),
    [activeFaction, currentFactionState, initialSnapshot.factionStates, sharedProgress]
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
    if (holdTheRoadWon) return;

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
        if (node.id === 'node_2') return { ...node, completed: true, current: false };
        if (node.id === 'node_3') return { ...node, current: true };
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

  const completeMarkedRaiders = () => {
    if (!holdTheRoadWon || markedRaidersInvestigated) return false;

    setMarkedRaidersInvestigated(true);
    setForgeUnlocked(true);
    setResources(previous => ({
      ...previous,
      wood: previous.wood + 5,
      iron: previous.iron + 2
    }));
    setSharedProgress(previous => ({
      ...previous,
      lore: previous.lore.includes('false_flag_forging')
        ? previous.lore
        : [...previous.lore, 'false_flag_forging']
    }));
    setChapterNodes(previous =>
      previous.map(node => {
        if (node.id === 'node_3') return { ...node, completed: true, current: false };
        if (node.id === 'node_4') return { ...node, current: true };
        return { ...node, current: false };
      })
    );
    return true;
  };

  const upgradeSettlement = () => {
    if (!canUpgradeSettlement) return false;

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
    if (!recruitChoiceAvailable || recruitChosen) return false;

    const choice = humanRecruitOptions.find(option => option.id === choiceId);
    if (!choice) return false;

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

  const craftEquipment = (equipmentId: string) => {
    if (!forgeUnlocked) return false;
    const equipment = getEquipment(equipmentId);
    if (!equipment || equipment.faction !== activeFaction) return false;
    if (!canAfford(resources, equipment.craftCost)) return false;

    setResources(previous => payCost(previous, equipment.craftCost));
    setEquipmentInventory(previous => [...previous, equipment.id]);
    return true;
  };

  const promoteMira = (equipmentId: string) => {
    if (firstPromotionComplete) return false;

    const promotion = getRecruitPromotionByEquipment(equipmentId);
    const equipment = getEquipment(equipmentId);
    const inventoryIndex = equipmentInventory.indexOf(equipmentId);
    const mira = units.find(unit => unit.id === 'hum_recruit');

    if (!promotion || !equipment || inventoryIndex < 0 || !mira || mira.className !== 'Recruit') {
      return false;
    }

    setEquipmentInventory(previous => {
      const next = [...previous];
      next.splice(inventoryIndex, 1);
      return next;
    });
    setUnitWeapons(previous => ({ ...previous, hum_recruit: equipmentId }));
    setUnits(previous =>
      previous.map(unit =>
        unit.id === 'hum_recruit'
          ? {
              ...unit,
              className: promotion.toClass,
              role: promotion.role,
              tier: 2,
              attack: unit.attack + promotion.attackBonus + equipment.attackBonus,
              armor: unit.armor + promotion.armorBonus + equipment.armorBonus,
              speed: unit.speed + promotion.speedBonus + equipment.speedBonus,
              promotionReady: false
            }
          : unit
      )
    );
    setFirstPromotionComplete(true);
    return true;
  };

  const moveFormationUnit = (unitId: string, targetSlot: number) => {
    if (!formationCells.includes(targetSlot)) return false;

    const sourceSlot = formation.indexOf(unitId);
    if (sourceSlot < 0) return false;

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
    if (!item) return false;

    const moved: WagonItemDefinition = { ...item, x, y };
    const others = wagonItems.filter(candidate => candidate.id !== itemId);
    if (!canPlaceItem(moved, others, currentWagonStage)) return false;

    setWagonItems(previous =>
      previous.map(candidate => (candidate.id === itemId ? moved : candidate))
    );
    return true;
  };

  const rotateWagonItem = (itemId: string) => {
    const item = wagonItems.find(candidate => candidate.id === itemId);
    if (!item || item.width === item.height) return false;

    const rotated: WagonItemDefinition = {
      ...item,
      rotation: item.rotation === 0 ? 90 : 0
    };
    const others = wagonItems.filter(candidate => candidate.id !== itemId);
    if (!canPlaceItem(rotated, others, currentWagonStage)) return false;

    setWagonItems(previous =>
      previous.map(candidate => (candidate.id === itemId ? rotated : candidate))
    );
    return true;
  };

  const resetWagon = () => {
    setWagonItems(cloneWagon(starterWagonItems));
  };

  const setFormationDoctrine = (doctrineId: string) => {
    if (!formationDoctrines.some(doctrine => doctrine.id === doctrineId)) return false;
    setFormationDoctrineId(doctrineId);
    return true;
  };

  const isSideModeUnlocked = (id: SideModeId) => {
    const mode = sideModes.find(candidate => candidate.id === id);
    if (!mode) return false;
    return (stageRank[currentWagonStage.id] ?? 0) >= sideModeUnlockRank[mode.unlockStage];
  };

  const consumeExpeditionTicket = () => {
    if (!isSideModeUnlocked('expeditions') || expeditionTickets <= 0) return false;
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
    if (!isSideModeUnlocked('formation_trials') || formationTrialCompleted) return false;

    const harlan = formation.indexOf('hum_militia');
    const mira = formation.indexOf('hum_recruit');
    const harlanFront = harlan >= 0 && harlan <= 2;
    const miraBehind = mira >= 3;
    const sameColumn = harlan >= 0 && mira >= 0 && harlan % 3 === mira % 3;

    if (!harlanFront || !miraBehind || !sameColumn) return false;

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
    if (!placement) return { status: 'unavailable', provider: 'none' };

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
    setSharedProgress(previous => ({
      ...previous,
      completedCampaigns: previous.completedCampaigns.includes(faction)
        ? previous.completedCampaigns
        : [...previous.completedCampaigns, faction]
    }));
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
      markedRaidersInvestigated,
      forgeUnlocked,
      firstPromotionComplete,
      equipmentInventory,
      unitWeapons,
      equipmentDefinitions,
      recruitPromotions,
      lastBattleResult,
      canUpgradeSettlement,
      sideModeDefinitions: sideModes,
      expeditionTickets,
      expeditionRunsCompleted,
      formationTrialCompleted,
      rewardedAdClaims,
      rewardedAdMessage,
      finishHoldTheRoad,
      completeMarkedRaiders,
      upgradeSettlement,
      chooseRecruit,
      craftEquipment,
      promoteMira,
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
      markedRaidersInvestigated,
      forgeUnlocked,
      firstPromotionComplete,
      equipmentInventory,
      unitWeapons,
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
