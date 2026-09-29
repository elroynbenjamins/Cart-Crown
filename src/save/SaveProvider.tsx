import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  createNewSaveRecord,
  metadataFromSnapshot,
  normalizeSaveRecord
} from './schema';
import type {
  GameSnapshot,
  SaveRecord,
  SaveSlotId,
  SaveSlotMetadata
} from './types';

const SAVE_KEY_PREFIX = '@cart-crown/save/';
const slotIds: SaveSlotId[] = [1, 2];

type SaveSystemContextValue = {
  ready: boolean;
  selectedSlotId: SaveSlotId | null;
  selectedRecord: SaveRecord | null;
  slots: Array<SaveSlotMetadata | null>;
  selectSlot: (slotId: SaveSlotId) => Promise<void>;
  createSlot: (slotId: SaveSlotId) => Promise<void>;
  writeSnapshot: (snapshot: GameSnapshot) => Promise<void>;
  deleteSlot: (slotId: SaveSlotId) => Promise<void>;
  leaveToSaveSelect: () => void;
};

const SaveSystemContext = createContext<SaveSystemContextValue | null>(null);

function keyForSlot(slotId: SaveSlotId) {
  return SAVE_KEY_PREFIX + String(slotId);
}

async function readRecord(slotId: SaveSlotId): Promise<SaveRecord | null> {
  const raw = await AsyncStorage.getItem(keyForSlot(slotId));
  if (!raw) return null;

  try {
    return normalizeSaveRecord(slotId, JSON.parse(raw));
  } catch {
    return null;
  }
}

export function SaveProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<SaveSlotId | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SaveRecord | null>(null);
  const [records, setRecords] = useState<Record<SaveSlotId, SaveRecord | null>>({
    1: null,
    2: null
  });
  const writeChainRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;

    void Promise.all(slotIds.map(readRecord)).then(values => {
      if (cancelled) return;

      setRecords({
        1: values[0] ?? null,
        2: values[1] ?? null
      });
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectSlot = async (slotId: SaveSlotId) => {
    const record = records[slotId] ?? (await readRecord(slotId));
    if (!record) return;

    setRecords(previous => ({ ...previous, [slotId]: record }));
    setSelectedSlotId(slotId);
    setSelectedRecord(record);
  };

  const createSlot = async (slotId: SaveSlotId) => {
    const record = createNewSaveRecord(slotId);
    await AsyncStorage.setItem(keyForSlot(slotId), JSON.stringify(record));
    setRecords(previous => ({ ...previous, [slotId]: record }));
    setSelectedSlotId(slotId);
    setSelectedRecord(record);
  };

  const writeSnapshot = async (snapshot: GameSnapshot) => {
    if (!selectedSlotId) return;

    const slotId = selectedSlotId;
    const existing =
      records[slotId]?.metadata ??
      selectedRecord?.metadata;
    const record: SaveRecord = {
      snapshot,
      metadata: metadataFromSnapshot(
        slotId,
        snapshot,
        existing
      )
    };

    const write = async () => {
      await AsyncStorage.setItem(
        keyForSlot(slotId),
        JSON.stringify(record)
      );
      setRecords(previous => ({
        ...previous,
        [slotId]: record
      }));
      setSelectedRecord(previous =>
        selectedSlotId === slotId
          ? record
          : previous
      );
    };

    writeChainRef.current =
      writeChainRef.current.then(write, write);
    await writeChainRef.current;
  };

  const deleteSlot = async (slotId: SaveSlotId) => {
    await writeChainRef.current;
    await AsyncStorage.removeItem(keyForSlot(slotId));
    setRecords(previous => ({ ...previous, [slotId]: null }));

    if (selectedSlotId === slotId) {
      setSelectedSlotId(null);
      setSelectedRecord(null);
    }
  };

  const leaveToSaveSelect = () => {
    setSelectedSlotId(null);
    setSelectedRecord(null);
  };

  const slots = useMemo(
    () => slotIds.map(slotId => records[slotId]?.metadata ?? null),
    [records]
  );

  const value = useMemo<SaveSystemContextValue>(
    () => ({
      ready,
      selectedSlotId,
      selectedRecord,
      slots,
      selectSlot,
      createSlot,
      writeSnapshot,
      deleteSlot,
      leaveToSaveSelect
    }),
    [ready, selectedSlotId, selectedRecord, slots]
  );

  return <SaveSystemContext.Provider value={value}>{children}</SaveSystemContext.Provider>;
}

export function useSaveSystem() {
  const context = useContext(SaveSystemContext);
  if (!context) {
    throw new Error('useSaveSystem must be used inside SaveProvider');
  }
  return context;
}
