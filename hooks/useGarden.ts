"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import {
  getGardenPlacementsAction,
  getInventoryAction,
  moveDecorationAction,
  placeDecorationAction,
  removeDecorationAction,
  rotateDecorationAction,
} from "@/app/actions/inventory";
import { getPlantPositionsAction, movePlantAction, resetPlantPositionAction } from "@/app/actions/garden";
import { IDLE_INTERACTION, gardenInteractionReducer } from "@/lib/gardenInteractionReducer";
import {
  GARDEN_GRID_COLUMNS,
  SEASON_SEQUENCE,
  WEATHER_SEQUENCE,
  buildGardenPlants,
  buildGardenTiles,
  getDecorationCategory,
} from "@/lib/gardenEngine";
import type {
  GardenPlant,
  GardenTileState,
  InventoryItem,
  PlacedDecoration,
  Season,
  Weather,
} from "@/types/garden";

export interface GardenLevelUpEvent {
  tileIndex: number;
  plantName: string;
  id: number;
}

/** Matches the `data-plant-id` attribute rendered on each Plant's clickable node. */
function findPlantNode(plantId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-plant-id="${plantId}"]`);
}

/** Matches the `data-decoration-tile` attribute rendered on each Decoration's clickable node. */
function findDecorationNode(tileIndex: number): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-decoration-tile="${tileIndex}"]`);
}

function tileIndexToXY(tileIndex: number): { x: number; y: number } {
  return { x: tileIndex % GARDEN_GRID_COLUMNS, y: Math.floor(tileIndex / GARDEN_GRID_COLUMNS) };
}

export function useGarden() {
  const { habits } = useHabits();
  const activeHabits = useMemo(() => habits.filter((habit) => habit.active), [habits]);

  // Manual plant repositioning is now persisted to Postgres (see
  // movePlant/resetPlantPosition below), fetched once on load alongside
  // decorations and merged with the deterministic default layout the same
  // way it always has been — this state just starts from the server's
  // real overrides instead of empty.
  const [plantPositions, setPlantPositions] = useState<Record<string, number>>({});

  // Real inventory + real garden decoration placements, from Postgres —
  // the same source of truth the /inventory page reads and writes.
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [placedDecorations, setPlacedDecorations] = useState<PlacedDecoration[]>([]);
  const [gardenError, setGardenError] = useState<string | null>(null);

  const loadGardenData = useCallback(async () => {
    const [inventoryResult, placementsResult, plantPositionsResult] = await Promise.all([
      getInventoryAction(),
      getGardenPlacementsAction(),
      getPlantPositionsAction(),
    ]);

    if (inventoryResult.ok) {
      const decorations = inventoryResult.data
        .filter((item) => item.category === "decoration")
        .map(
          (item): InventoryItem => ({
            id: item.id,
            name: item.name,
            category: getDecorationCategory(item.icon),
            icon: item.icon,
            owned: item.quantity,
            placed: item.placed,
            available: item.available,
            placesAs:
              item.placesAsTileType === "path" ? "path" : item.placesAsTileType === "stone" ? "stone" : "decoration",
            description: item.description,
            rarity: item.rarity,
          })
        );
      setInventory(decorations);
    }

    if (placementsResult.ok) {
      setPlacedDecorations(
        placementsResult.data.map((placement) => ({
          tileIndex: placement.y * GARDEN_GRID_COLUMNS + placement.x,
          itemId: placement.itemId,
          rotation: (placement.rotation % 360) as PlacedDecoration["rotation"],
        }))
      );
    }

    if (plantPositionsResult.ok) {
      setPlantPositions(plantPositionsResult.data);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!cancelled) await loadGardenData();
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [loadGardenData]);

  const tiles: GardenTileState[] = useMemo(
    () => buildGardenTiles(activeHabits, plantPositions),
    [activeHabits, plantPositions]
  );
  const plants: GardenPlant[] = useMemo(() => buildGardenPlants(activeHabits, tiles), [activeHabits, tiles]);
  const plantsByTile = useMemo(() => {
    const map = new Map<number, GardenPlant>();
    for (const plant of plants) map.set(plant.tileIndex, plant);
    return map;
  }, [plants]);
  const decorationsByTile = useMemo(() => {
    const map = new Map<number, PlacedDecoration>();
    for (const decoration of placedDecorations) map.set(decoration.tileIndex, decoration);
    return map;
  }, [placedDecorations]);

  // ---- Single-mode interaction state (see gardenInteractionReducer) ----
  const [interaction, dispatch] = useReducer(gardenInteractionReducer, IDLE_INTERACTION);
  const [pendingReopenPlantId, setPendingReopenPlantId] = useState<string | null>(null);
  const [pendingReopenDecorationTile, setPendingReopenDecorationTile] = useState<number | null>(null);

  const selectedPlant = useMemo(
    () =>
      interaction.mode === "inspecting"
        ? plants.find((plant) => plant.id === interaction.plantId) ?? null
        : null,
    [interaction, plants]
  );
  const selectedAnchor = interaction.mode === "inspecting" ? interaction.anchor : null;
  const movingPlantId = interaction.mode === "moving" ? interaction.plantId : null;
  const placingItemId = interaction.mode === "placing" ? interaction.itemId : null;
  const selectedDecorationTileIndex = interaction.mode === "inspectingDecoration" ? interaction.tileIndex : null;
  const selectedDecorationAnchor = interaction.mode === "inspectingDecoration" ? interaction.anchor : null;
  const movingDecorationTileIndex = interaction.mode === "movingDecoration" ? interaction.tileIndex : null;

  const movingPlant = useMemo(
    () => (movingPlantId ? plants.find((plant) => plant.id === movingPlantId) ?? null : null),
    [plants, movingPlantId]
  );
  const placingItem = useMemo(
    () => (placingItemId ? inventory.find((item) => item.id === placingItemId) ?? null : null),
    [inventory, placingItemId]
  );
  const selectedDecoration = useMemo(
    () => (selectedDecorationTileIndex !== null ? decorationsByTile.get(selectedDecorationTileIndex) ?? null : null),
    [decorationsByTile, selectedDecorationTileIndex]
  );
  const selectedDecorationItem = useMemo(
    () => (selectedDecoration ? inventory.find((item) => item.id === selectedDecoration.itemId) ?? null : null),
    [inventory, selectedDecoration]
  );
  const movingDecorationItem = useMemo(() => {
    if (movingDecorationTileIndex === null) return null;
    const decoration = decorationsByTile.get(movingDecorationTileIndex);
    return decoration ? inventory.find((item) => item.id === decoration.itemId) ?? null : null;
  }, [decorationsByTile, inventory, movingDecorationTileIndex]);

  const selectPlant = useCallback((plantId: string, anchor: HTMLElement) => {
    setPendingReopenPlantId(null);
    setPendingReopenDecorationTile(null);
    dispatch({ type: "INSPECT", plantId, anchor });
  }, []);

  const closeDetails = useCallback(() => {
    dispatch({ type: "CLOSE" });
  }, []);

  const startMovingPlant = useCallback((plantId: string) => {
    setPendingReopenPlantId(null);
    setPendingReopenDecorationTile(null);
    dispatch({ type: "START_MOVE", plantId });
  }, []);

  const cancelMove = useCallback(() => {
    dispatch({ type: "CANCEL" });
  }, []);

  const beginPlacement = useCallback((itemId: string) => {
    setPendingReopenPlantId(null);
    setPendingReopenDecorationTile(null);
    dispatch({ type: "START_PLACEMENT", itemId });
  }, []);

  const cancelPlacement = useCallback(() => {
    dispatch({ type: "CANCEL" });
  }, []);

  const selectDecoration = useCallback((tileIndex: number, anchor: HTMLElement) => {
    setPendingReopenPlantId(null);
    setPendingReopenDecorationTile(null);
    dispatch({ type: "INSPECT_DECORATION", tileIndex, anchor });
  }, []);

  const closeDecorationDetails = useCallback(() => {
    dispatch({ type: "CLOSE" });
  }, []);

  const startMovingDecoration = useCallback((tileIndex: number) => {
    setPendingReopenPlantId(null);
    setPendingReopenDecorationTile(null);
    dispatch({ type: "START_MOVE_DECORATION", tileIndex });
  }, []);

  // A brief "just placed here" flag so the tile can play a one-shot
  // dust/sparkle burst when a plant or decoration lands on it.
  const [placementBurstTileIndex, setPlacementBurstTileIndex] = useState<number | null>(null);
  const burstTimeoutRef = useRef<number | undefined>(undefined);

  const triggerPlacementBurst = useCallback((tileIndex: number) => {
    window.clearTimeout(burstTimeoutRef.current);
    setPlacementBurstTileIndex(tileIndex);
    burstTimeoutRef.current = window.setTimeout(() => setPlacementBurstTileIndex(null), 700);
  }, []);

  useEffect(() => () => window.clearTimeout(burstTimeoutRef.current), []);

  // Plant repositioning stays local-only this phase (plants aren't
  // inventory — they're one-per-habit and always owned — so there's
  // nothing for Inventory to track here; persisting the *position* is a
  // separate, smaller piece of future work noted in the project report).
  const movePlant = useCallback(
    async (habitId: string, tileIndex: number) => {
      const plantId = `plant-${habitId}`;
      const { x, y } = tileIndexToXY(tileIndex);
      const previousTileIndex = plantPositions[habitId];

      // Optimistic: the move almost always succeeds, and waiting for the
      // round trip before the plant visually moves would make the "hold to
      // move → drop" gesture feel laggy. Rolled back below on failure.
      setPlantPositions((prev) => ({ ...prev, [habitId]: tileIndex }));
      dispatch({ type: "FINISH" });
      setPendingReopenPlantId(plantId);
      triggerPlacementBurst(tileIndex);

      const result = await movePlantAction(habitId, x, y);
      if (!result.ok) {
        setGardenError(result.error);
        setPlantPositions((prev) => {
          const next = { ...prev };
          if (previousTileIndex === undefined) delete next[habitId];
          else next[habitId] = previousTileIndex;
          return next;
        });
      }
    },
    [plantPositions, triggerPlacementBurst]
  );

  const resetPlantPosition = useCallback(
    async (habitId: string) => {
      const plantId = `plant-${habitId}`;
      const previousTileIndex = plantPositions[habitId];

      setPlantPositions((prev) => {
        if (!(habitId in prev)) return prev;
        const next = { ...prev };
        delete next[habitId];
        return next;
      });
      dispatch({ type: "FINISH" });
      setPendingReopenPlantId(plantId);

      const result = await resetPlantPositionAction(habitId);
      if (!result.ok) {
        setGardenError(result.error);
        if (previousTileIndex !== undefined) {
          setPlantPositions((prev) => ({ ...prev, [habitId]: previousTileIndex }));
        }
      }
    },
    [plantPositions]
  );

  const resetLayout = useCallback(async () => {
    const habitIdsToReset = Object.keys(plantPositions);
    setPendingReopenPlantId(null);
    setPendingReopenDecorationTile(null);
    dispatch({ type: "CANCEL" });
    setPlantPositions({});

    const results = await Promise.all(habitIdsToReset.map((habitId) => resetPlantPositionAction(habitId)));
    const firstError = results.find((result) => !result.ok);
    if (firstError && !firstError.ok) setGardenError(firstError.error);
  }, [plantPositions]);

  // Once a move/reset lands, the plant re-renders at its new tile with a
  // fresh DOM node. This effect waits for that node to exist, then reopens
  // Plant Details anchored to it — never both panels, never a stale ref.
  useEffect(() => {
    if (!pendingReopenPlantId) return;
    const node = findPlantNode(pendingReopenPlantId);
    if (node) {
      dispatch({ type: "INSPECT", plantId: pendingReopenPlantId, anchor: node });
      setPendingReopenPlantId(null);
    }
  }, [pendingReopenPlantId, plants]);

  // Same idea, for a decoration that just moved to a new tile.
  useEffect(() => {
    if (pendingReopenDecorationTile === null) return;
    const node = findDecorationNode(pendingReopenDecorationTile);
    if (node) {
      dispatch({ type: "INSPECT_DECORATION", tileIndex: pendingReopenDecorationTile, anchor: node });
      setPendingReopenDecorationTile(null);
    }
  }, [pendingReopenDecorationTile, placedDecorations]);

  const placeDecoration = useCallback(
    async (tileIndex: number) => {
      if (!placingItemId) return;
      const { x, y } = tileIndexToXY(tileIndex);
      dispatch({ type: "FINISH" });

      const result = await placeDecorationAction(x, y, placingItemId);
      if (!result.ok) {
        setGardenError(result.error);
        return;
      }

      setInventory((prev) =>
        prev.map((item) =>
          item.id === placingItemId
            ? { ...item, placed: item.placed + 1, available: Math.max(0, item.available - 1) }
            : item
        )
      );
      setPlacedDecorations((prev) => [
        ...prev.filter((d) => d.tileIndex !== tileIndex),
        { tileIndex, itemId: placingItemId, rotation: 0 },
      ]);
      triggerPlacementBurst(tileIndex);
    },
    [placingItemId, triggerPlacementBurst]
  );

  /** Moving an already-placed decoration to a different tile — never
   *  touches owned/placed/available counts (the item was already counted
   *  as placed before the move and still is after), only its position. */
  const moveDecoration = useCallback(
    async (fromTileIndex: number, toTileIndex: number) => {
      const from = tileIndexToXY(fromTileIndex);
      const to = tileIndexToXY(toTileIndex);
      dispatch({ type: "FINISH" });

      const result = await moveDecorationAction(from.x, from.y, to.x, to.y);
      if (!result.ok) {
        setGardenError(result.error);
        return;
      }

      setPlacedDecorations((prev) =>
        prev
          .filter((d) => d.tileIndex !== fromTileIndex)
          .concat({
            tileIndex: toTileIndex,
            itemId: result.data.itemId,
            rotation: (result.data.rotation % 360) as PlacedDecoration["rotation"],
          })
      );
      setPendingReopenDecorationTile(toTileIndex);
      triggerPlacementBurst(toTileIndex);
    },
    [triggerPlacementBurst]
  );

  const rotateDecoration = useCallback(async (tileIndex: number) => {
    const { x, y } = tileIndexToXY(tileIndex);
    const result = await rotateDecorationAction(x, y);
    if (!result.ok) {
      setGardenError(result.error);
      return;
    }
    setPlacedDecorations((prev) =>
      prev.map((d) =>
        d.tileIndex === tileIndex ? { ...d, rotation: (result.data.rotation % 360) as PlacedDecoration["rotation"] } : d
      )
    );
  }, []);

  const removeDecoration = useCallback(
    async (tileIndex: number) => {
      const target = placedDecorations.find((d) => d.tileIndex === tileIndex);
      if (!target) return;
      const { x, y } = tileIndexToXY(tileIndex);

      const result = await removeDecorationAction(x, y);
      if (!result.ok) {
        setGardenError(result.error);
        return;
      }

      setPlacedDecorations((prev) => prev.filter((d) => d.tileIndex !== tileIndex));
      setInventory((prev) =>
        prev.map((item) =>
          item.id === target.itemId
            ? { ...item, placed: Math.max(0, item.placed - 1), available: item.available + 1 }
            : item
        )
      );
      dispatch({ type: "CLOSE" });
    },
    [placedDecorations]
  );

  const dismissGardenError = useCallback(() => setGardenError(null), []);

  // Weather + season, mock cycling.
  const [weather, setWeather] = useState<Weather>("sunny");
  const [season, setSeason] = useState<Season>("spring");
  const cycleWeather = useCallback(() => {
    setWeather((prev) => WEATHER_SEQUENCE[(WEATHER_SEQUENCE.indexOf(prev) + 1) % WEATHER_SEQUENCE.length]);
  }, []);
  const cycleSeason = useCallback(() => {
    setSeason((prev) => SEASON_SEQUENCE[(SEASON_SEQUENCE.indexOf(prev) + 1) % SEASON_SEQUENCE.length]);
  }, []);

  // Level-up detection: whenever a plant's growth stage advances, emit an
  // event the Garden Spirit can react to (walk over + celebrate).
  const previousStages = useRef<Map<string, string>>(new Map());
  const [levelUpEvent, setLevelUpEvent] = useState<GardenLevelUpEvent | null>(null);
  const eventCounter = useRef(0);

  useEffect(() => {
    for (const plant of plants) {
      const previous = previousStages.current.get(plant.id);
      if (previous && previous !== plant.growthStage) {
        eventCounter.current += 1;
        setLevelUpEvent({ tileIndex: plant.tileIndex, plantName: plant.name, id: eventCounter.current });
      }
      previousStages.current.set(plant.id, plant.growthStage);
    }
  }, [plants]);

  return {
    tiles,
    plants,
    plantsByTile,
    decorationsByTile,
    inventory,
    selectedPlant,
    selectedAnchor,
    selectPlant,
    closeDetails,
    movingPlantId,
    movingPlant,
    startMovingPlant,
    cancelMove,
    movePlant,
    resetPlantPosition,
    resetLayout,
    placingItem,
    beginPlacement,
    cancelPlacement,
    placeDecoration,
    moveDecoration,
    rotateDecoration,
    removeDecoration,
    selectedDecorationTileIndex,
    selectedDecorationAnchor,
    selectedDecorationItem,
    selectDecoration,
    closeDecorationDetails,
    movingDecorationTileIndex,
    movingDecorationItem,
    startMovingDecoration,
    weather,
    season,
    cycleWeather,
    cycleSeason,
    levelUpEvent,
    placementBurstTileIndex,
    gardenError,
    dismissGardenError,
  };
}

export type UseGardenReturn = ReturnType<typeof useGarden>;
