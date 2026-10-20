"use client";

import { memo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plant } from "@/components/garden/Plant";
import { Decoration } from "@/components/garden/Decoration";
import { TileHighlight } from "@/components/garden/TileHighlight";
import { PlacementBurst } from "@/components/garden/PlacementBurst";
import { SEASON_PALETTES } from "@/lib/gardenEngine";
import type { GardenPlant, GardenTileState, InventoryItem, PlacedDecoration, Season } from "@/types/garden";

interface GardenTileProps {
  tile: GardenTileState;
  plant?: GardenPlant;
  decoration?: PlacedDecoration;
  decorationItem?: InventoryItem;
  season: Season;
  isSelectedPlant: boolean;
  isMovingThisPlant: boolean;
  isSelectedDecoration: boolean;
  isMovingThisDecoration: boolean;
  isCelebrating: boolean;
  showPlacementBurst: boolean;
  /** True while some plant (not necessarily this tile's) is being repositioned. */
  movingActive: boolean;
  /** True while some decoration (not necessarily this tile's) is being repositioned. */
  movingDecorationActive: boolean;
  /** True while the player is choosing where to place a picked-up item. */
  placementActive: boolean;
  onSelectPlant: (plantId: string, anchor: HTMLElement) => void;
  onStartMovePlant: (plantId: string) => void;
  onSelectDecoration: (tileIndex: number, anchor: HTMLElement) => void;
  onStartMoveDecoration: (tileIndex: number) => void;
  onTileClick: (tileIndex: number) => void;
  onHoverTile: (tileIndex: number | null) => void;
}

function GardenTileComponent({
  tile,
  plant,
  decoration,
  decorationItem,
  season,
  isSelectedPlant,
  isMovingThisPlant,
  isSelectedDecoration,
  isMovingThisDecoration,
  isCelebrating,
  showPlacementBurst,
  movingActive,
  movingDecorationActive,
  placementActive,
  onSelectPlant,
  onStartMovePlant,
  onSelectDecoration,
  onStartMoveDecoration,
  onTileClick,
  onHoverTile,
}: GardenTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const palette = SEASON_PALETTES[season];
  const shade = palette.grass[tile.index % palette.grass.length];

  const isEmptyGround = tile.kind === "grass" || tile.kind === "empty";
  const canAcceptPlacement = placementActive && isEmptyGround && !plant && !decoration;
  const isMoveTarget = (movingActive || movingDecorationActive) && isEmptyGround && !plant && !decoration;
  const isValidTarget = canAcceptPlacement || isMoveTarget;
  const interactionLocked = movingActive || movingDecorationActive || placementActive;
  const isDimmed = interactionLocked && !isValidTarget && !isMovingThisPlant && !isMovingThisDecoration;

  const ground = (() => {
    switch (tile.kind) {
      case "water":
        return "linear-gradient(135deg, #7CC3FF, #5AA9FF)";
      case "path":
        return "#E6D3AE";
      case "stone":
        return "#C7C2B4";
      case "empty":
        return "#DDD0B4";
      default:
        return shade;
    }
  })();

  function handleTargetClick() {
    if (isValidTarget) onTileClick(tile.index);
  }

  return (
    <div
      className="relative aspect-square w-full transition-opacity duration-300"
      style={{ opacity: isDimmed ? 0.4 : 1 }}
      onMouseEnter={() => {
        setIsHovered(true);
        if (interactionLocked) onHoverTile(tile.index);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (interactionLocked) onHoverTile(null);
      }}
    >
      <div
        className="absolute inset-0 rounded-md transition-[filter] duration-200"
        style={{ background: ground, filter: isHovered && isEmptyGround && !interactionLocked ? "brightness(1.08)" : undefined }}
        aria-hidden
      />

      {tile.kind === "water" && (
        <motion.div
          className="absolute inset-0 rounded-md bg-white/25"
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}

      {!plant && !decoration && isValidTarget && (
        <button
          type="button"
          onClick={handleTargetClick}
          onFocus={() => onHoverTile(tile.index)}
          onBlur={() => onHoverTile(null)}
          aria-label={
            placementActive
              ? `Place item on tile row ${tile.y + 1}, column ${tile.x + 1}`
              : `Move to tile row ${tile.y + 1}, column ${tile.x + 1}`
          }
          className="focus-ring absolute inset-0 rounded-md"
          style={{ cursor: "grab" }}
        />
      )}

      {plant && (
        <Plant
          plant={plant}
          isSelected={isSelectedPlant}
          isMoving={isMovingThisPlant}
          isCelebrating={isCelebrating}
          interactionLocked={interactionLocked}
          onSelect={onSelectPlant}
          onStartMove={onStartMovePlant}
        />
      )}

      {decoration && decorationItem && (
        <Decoration
          decoration={decoration}
          item={decorationItem}
          tileIndex={tile.index}
          isSelected={isSelectedDecoration}
          isMoving={isMovingThisDecoration}
          interactionLocked={interactionLocked}
          onSelect={onSelectDecoration}
          onStartMove={onStartMoveDecoration}
        />
      )}

      <AnimatePresence>
        {isValidTarget && (isHovered ? <TileHighlight variant="glow" /> : <TileHighlight variant="valid" />)}
      </AnimatePresence>

      <AnimatePresence>{showPlacementBurst && <PlacementBurst />}</AnimatePresence>
    </div>
  );
}

export const GardenTile = memo(GardenTileComponent);
