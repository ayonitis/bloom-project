"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Backpack, RotateCcw } from "lucide-react";
import { useGarden } from "@/hooks/useGarden";
import { GardenGrid } from "@/components/garden/GardenGrid";
import { GardenSpiritWalker } from "@/components/garden/GardenSpiritWalker";
import { AmbientEffects } from "@/components/garden/AmbientEffects";
import { WeatherWidget } from "@/components/garden/WeatherWidget";
import { SeasonSwitcher } from "@/components/garden/SeasonSwitcher";
import { GardenStats } from "@/components/garden/GardenStats";
import { PlantDetailsPanel } from "@/components/garden/PlantDetailsPanel";
import { DecorationDetailsPanel } from "@/components/garden/DecorationDetailsPanel";
import { InventoryDrawer } from "@/components/garden/InventoryDrawer";
import { DecorationPanel } from "@/components/garden/DecorationPanel";
import { ActionErrorToast } from "@/components/shared/ActionErrorToast";
import { SEASON_PALETTES } from "@/lib/gardenEngine";

export function GardenLayout() {
  const {
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
  } = useGarden();

  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const gardenRef = useRef<HTMLDivElement>(null);
  // The action bar renders outside `gardenRef` (it's fixed to the
  // viewport, not scoped to the grid), so the "click outside the garden"
  // handler below needs its own ref to recognize the bar's own buttons as
  // "inside" the interaction — otherwise pressing Cancel/Place fires the
  // outside-click handler first (on pointerdown, before the button's own
  // click), cancelling the mode and yanking the bar away before the click
  // ever registers.
  const actionBarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Arriving from Inventory's "Place in Garden" button (?place=<itemId>):
  // once the real inventory has loaded and actually contains that item,
  // drop straight into placement mode for it, then clean the URL so a
  // refresh/back-nav doesn't re-trigger it.
  useEffect(() => {
    const placeItemId = searchParams.get("place");
    if (!placeItemId) return;
    if (!inventory.some((item) => item.id === placeItemId)) return;
    beginPlacement(placeItemId);
    router.replace("/my-garden");
  }, [searchParams, inventory, beginPlacement, router]);

  const isMoveOrPlaceActive = Boolean(movingPlantId) || Boolean(placingItem) || movingDecorationTileIndex !== null;

  const cancelActiveMode = useCallback(() => {
    cancelMove();
    cancelPlacement();
  }, [cancelMove, cancelPlacement]);

  // Escape cancels Move Mode / placement mode; clicking outside the garden
  // (and outside the action bar) does too. Placing/cancelling itself is
  // otherwise the only thing that ends these modes — the cursor merely
  // leaving a plant, decoration, or tile never does.
  useEffect(() => {
    if (!isMoveOrPlaceActive) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") cancelActiveMode();
    }
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const insideGarden = gardenRef.current?.contains(target) ?? false;
      const insideActionBar = actionBarRef.current?.contains(target) ?? false;
      if (!insideGarden && !insideActionBar) {
        cancelActiveMode();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMoveOrPlaceActive, cancelActiveMode]);

  const handleTileClick = useCallback(
    (tileIndex: number) => {
      if (movingPlant) {
        movePlant(movingPlant.habitId, tileIndex);
        return;
      }
      if (movingDecorationTileIndex !== null) {
        moveDecoration(movingDecorationTileIndex, tileIndex);
        return;
      }
      if (placingItem) {
        placeDecoration(tileIndex);
      }
    },
    [movingPlant, movePlant, movingDecorationTileIndex, moveDecoration, placingItem, placeDecoration]
  );

  // Tracks which tile is currently hovered/focused so the action bar's
  // large "Place" button can confirm a destination explicitly, in
  // addition to tapping a tile directly. Kept local to this component
  // (not threaded through GardenGrid's props) so hovering never causes
  // the memoized grid — 70-odd tiles — to re-render; only this layout and
  // the action bar re-render when it changes.
  const [hoveredTileIndex, setHoveredTileIndex] = useState<number | null>(null);
  const handleHoverTile = useCallback((tileIndex: number | null) => {
    setHoveredTileIndex(tileIndex);
  }, []);

  const canPlaceOnHovered = useMemo(() => {
    if (!isMoveOrPlaceActive || hoveredTileIndex === null) return false;
    const tile = tiles[hoveredTileIndex];
    if (!tile) return false;
    const isOpenGround = tile.kind === "grass";
    const isOccupied = plantsByTile.has(hoveredTileIndex) || decorationsByTile.has(hoveredTileIndex);
    return isOpenGround && !isOccupied;
  }, [isMoveOrPlaceActive, hoveredTileIndex, tiles, plantsByTile, decorationsByTile]);

  const handlePlaceOnHovered = useCallback(() => {
    if (hoveredTileIndex !== null && canPlaceOnHovered) {
      handleTileClick(hoveredTileIndex);
    }
  }, [hoveredTileIndex, canPlaceOnHovered, handleTileClick]);

  const handleRemoveSelectedDecoration = useCallback(() => {
    if (selectedDecorationTileIndex !== null) removeDecoration(selectedDecorationTileIndex);
  }, [selectedDecorationTileIndex, removeDecoration]);

  const handleRotateSelectedDecoration = useCallback(() => {
    if (selectedDecorationTileIndex !== null) rotateDecoration(selectedDecorationTileIndex);
  }, [selectedDecorationTileIndex, rotateDecoration]);

  const handleStartMoveSelectedDecoration = useCallback(() => {
    if (selectedDecorationTileIndex !== null) startMovingDecoration(selectedDecorationTileIndex);
  }, [selectedDecorationTileIndex, startMovingDecoration]);

  const plantTileIndexes = useMemo(() => plants.map((plant) => plant.tileIndex), [plants]);
  const palette = SEASON_PALETTES[season];

  return (
    <div className="flex flex-col gap-4">
      <ActionErrorToast message={gardenError} onDismiss={dismissGardenError} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <GardenStats plants={plants} decorationCount={decorationsByTile.size} />
        <div className="flex items-center gap-2">
          <SeasonSwitcher season={season} onCycle={cycleSeason} />
          <WeatherWidget weather={weather} onCycle={cycleWeather} />
          <button
            type="button"
            onClick={() => setIsInventoryOpen(true)}
            className="focus-ring flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-sm font-medium text-bloom-text shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-white"
          >
            <Backpack className="h-4 w-4" strokeWidth={2} aria-hidden />
            Inventory
          </button>
          <button
            type="button"
            onClick={resetLayout}
            aria-label="Reset garden layout"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-bloom-text shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-white"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <motion.div
        ref={gardenRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2rem] border border-black/5 shadow-[0_30px_70px_-30px_rgba(38,54,58,0.28)]"
      >
        <div className="relative" style={{ background: palette.sky }}>
          <div className="p-4 sm:p-6">
            <GardenGrid
              tiles={tiles}
              plantsByTile={plantsByTile}
              decorationsByTile={decorationsByTile}
              inventory={inventory}
              season={season}
              selectedPlantId={selectedPlant?.id ?? null}
              movingPlantId={movingPlantId}
              selectedDecorationTileIndex={selectedDecorationTileIndex}
              movingDecorationTileIndex={movingDecorationTileIndex}
              placingItemId={placingItem?.id ?? null}
              celebratingTileIndex={levelUpEvent?.tileIndex ?? null}
              placementBurstTileIndex={placementBurstTileIndex}
              onSelectPlant={selectPlant}
              onStartMovePlant={startMovingPlant}
              onSelectDecoration={selectDecoration}
              onStartMoveDecoration={startMovingDecoration}
              onTileClick={handleTileClick}
              onHoverTile={handleHoverTile}
            />
          </div>

          <GardenSpiritWalker plantTileIndexes={plantTileIndexes} levelUpEvent={levelUpEvent} weather={weather} />
          <AmbientEffects season={season} weather={weather} />
        </div>
      </motion.div>

      <p className="text-center text-xs text-bloom-muted">
        Tap a plant or decoration for details · hold (or press Space) to move it · use Inventory to decorate
      </p>

      <PlantDetailsPanel plant={selectedPlant} anchor={selectedAnchor} onClose={closeDetails} />

      {selectedDecorationItem && selectedDecorationAnchor && (
        <DecorationDetailsPanel
          item={selectedDecorationItem}
          anchor={selectedDecorationAnchor}
          onClose={closeDecorationDetails}
          onMove={handleStartMoveSelectedDecoration}
          onRotate={handleRotateSelectedDecoration}
          onRemove={handleRemoveSelectedDecoration}
        />
      )}

      <InventoryDrawer
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        onSelectItem={beginPlacement}
      />

      <DecorationPanel
        ref={actionBarRef}
        placingItem={placingItem}
        movingPlantName={movingPlant?.name ?? null}
        movingDecorationName={movingDecorationItem?.name ?? null}
        canPlaceHere={canPlaceOnHovered}
        onPlaceHere={handlePlaceOnHovered}
        onCancel={cancelActiveMode}
        onResetPosition={movingPlant ? () => resetPlantPosition(movingPlant.habitId) : undefined}
      />
    </div>
  );
}
