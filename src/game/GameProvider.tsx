import React, { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  chapterOneNodes,
  formationUnlockOrder,
  holdTheRoadRewards,
  humanRecruitOptions,
  starterResources,
  starterUnits,
  starterWagonItems,
  wagonStages
} from './data';
import type {
  BattleResult,
  ChapterNode,
  RecruitOption,
  ResourceWallet,
  UnitDefinition,
  WagonItemDefinition,
  WagonStage
} from './types';

type GameContextValue = {
  resources: ResourceWallet;
  units: UnitDefinition[];
  formation: Array<string | null>;
  wagonItems: WagonItemDefinition[];
  currentWagonStage: WagonStage;
  chapterNodes: ChapterNode[];
  holdTheRoadWon: boolean;
  settlementUpgraded: boolean;
  recruitChoiceAvailable: boolean;
  recruitChosen: boolean;
  lastBattleResult: BattleResult | null;
  unlockedFormationSlots: number[];
  canUpgradeSettlement: boolean;
  finishHoldTheRoad: () => void;
  upgradeSettlement: () => boolean;
  chooseRecruit: (choiceId: string) => boolean;
  moveFormationUnit: (unitId: string, targetSlot: number) => boolean;
  moveWagonItem: (itemId: string, x: number, y: number) => boolean;
  rotateWagonItem: (itemId: string) => boolean;
  resetWagon: () => void;
  recruitOptions: RecruitOption[];
};

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

export function GameProvider({ children }: PropsWithChildren) {
  const [resources, setResources] = useState<ResourceWallet>(() => cloneResources(starterResources));
  const [units, setUnits] = useState<UnitDefinition[]>(() => cloneUnits(starterUnits));
  const [formation, setFormation] = useState<Array<string | null>>([
    null,
    'hum_militia',
    null,
    null,
    'hum_recruit',
    null
  ]);
  const [wagonItems, setWagonItems] = useState<WagonItemDefinition[]>(() => cloneWagon(starterWagonItems));
  const [wagonStageId, setWagonStageId] = useState('camp');
  const [chapterNodes, setChapterNodes] = useState<ChapterNode[]>(() => cloneNodes(chapterOneNodes));
  const [holdTheRoadWon, setHoldTheRoadWon] = useState(false);
  const [settlementUpgraded, setSettlementUpgraded] = useState(false);
  const [recruitChoiceAvailable, setRecruitChoiceAvailable] = useState(false);
  const [recruitChosen, setRecruitChosen] = useState(false);
  const [lastBattleResult, setLastBattleResult] = useState<BattleResult | null>(null);

  const currentWagonStage = useMemo(
    () => wagonStages.find(stage => stage.id === wagonStageId) ?? wagonStages[0]!,
    [wagonStageId]
  );

  const unlockedFormationSlots = useMemo(
    () => formationUnlockOrder.slice(0, currentWagonStage.formationSlots),
    [currentWagonStage.formationSlots]
  );

  const canUpgradeSettlement =
    holdTheRoadWon &&
    !settlementUpgraded &&
    resources.wood >= 90 &&
    resources.stone >= 20;

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
      const emptyUnlockedSlot = formationUnlockOrder
        .slice(0, 3)
        .find(slot => next[slot] === null);

      if (emptyUnlockedSlot !== undefined) {
        next[emptyUnlockedSlot] = choice.unit.id;
      }
      return next;
    });
    setRecruitChosen(true);
    setRecruitChoiceAvailable(false);
    return true;
  };

  const moveFormationUnit = (unitId: string, targetSlot: number) => {
    if (!unlockedFormationSlots.includes(targetSlot)) {
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

  const value = useMemo<GameContextValue>(
    () => ({
      resources,
      units,
      formation,
      wagonItems,
      currentWagonStage,
      chapterNodes,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      lastBattleResult,
      unlockedFormationSlots,
      canUpgradeSettlement,
      finishHoldTheRoad,
      upgradeSettlement,
      chooseRecruit,
      moveFormationUnit,
      moveWagonItem,
      rotateWagonItem,
      resetWagon,
      recruitOptions: humanRecruitOptions
    }),
    [
      resources,
      units,
      formation,
      wagonItems,
      currentWagonStage,
      chapterNodes,
      holdTheRoadWon,
      settlementUpgraded,
      recruitChoiceAvailable,
      recruitChosen,
      lastBattleResult,
      unlockedFormationSlots,
      canUpgradeSettlement
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
