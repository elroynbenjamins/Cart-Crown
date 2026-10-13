import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  createNewSaveRecord,
  metadataFromSnapshot,
  normalizeSaveRecord
} from './schema';
import { createSerialTaskQueue } from '../game/mobileSession';
import type {
  GameSnapshot,
  SaveRecord,
  SaveSlotId,
  SaveSlotMetadata
} from './types';

const SAVE_KEY_PREFIX = '@cart-crown/save/';
const SAVE_BACKUP_KEY_PREFIX = '@cart-crown/save-backup/';
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

function backupKeyForSlot(slotId: SaveSlotId) {
  return SAVE_BACKUP_KEY_PREFIX + String(slotId);
}

function parseRecord(
  slotId: SaveSlotId,
  raw: string | null
): SaveRecord | null {
  if (!raw) return null;

  try {
    return normalizeSaveRecord(
      slotId,
      JSON.parse(raw)
    );
  } catch {
    return null;
  }
}

async function readRecord(slotId: SaveSlotId): Promise<SaveRecord | null> {
  const entries = await AsyncStorage.multiGet([
    keyForSlot(slotId),
    backupKeyForSlot(slotId)
  ]);
  const primaryRaw: string | null =
    entries[0]?.[1] ?? null;
  const backupRaw: string | null =
    entries[1]?.[1] ?? null;

  const primary = parseRecord(
    slotId,
    primaryRaw
  );
  if (primary) return primary;

  const backup = parseRecord(
    slotId,
    backupRaw
  );
  if (!backup) return null;

  // Recover the primary copy from the last valid backup. Awaiting the repair
  // keeps the slot durable before the save-select screen becomes interactive.
  await AsyncStorage.setItem(
    keyForSlot(slotId),
    JSON.stringify(backup)
  );
  return backup;
}

export function SaveProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<SaveSlotId | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SaveRecord | null>(null);
  const [records, setRecords] = useState<Record<SaveSlotId, SaveRecord | null>>({
    1: null,
    2: null
  });
  const writeQueueRef = useRef(createSerialTaskQueue());

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
    const serialized = JSON.stringify(record);
    await AsyncStorage.multiSet([
      [backupKeyForSlot(slotId), serialized],
      [keyForSlot(slotId), serialized]
    ]);
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
      const serialized = JSON.stringify(record);

      // Backup first, primary second. If Android kills the process between
      // writes, at least one complete valid copy remains recoverable.
      await AsyncStorage.setItem(
        backupKeyForSlot(slotId),
        serialized
      );
      await AsyncStorage.setItem(
        keyForSlot(slotId),
        serialized
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

    await writeQueueRef.current.enqueue(write);
  };

  const deleteSlot = async (slotId: SaveSlotId) => {
    await writeQueueRef.current.wait();
    await AsyncStorage.multiRemove([
      keyForSlot(slotId),
      backupKeyForSlot(slotId)
    ]);
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
