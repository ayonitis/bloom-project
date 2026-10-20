"use client";

import { memo } from "react";
import { GardenTile } from "@/components/garden/GardenTile";
import { GARDEN_GRID_COLUMNS } from "@/lib/gardenEngine";
import type { GardenPlant, GardenTileState, InventoryItem, PlacedDecoration, Season } from "@/types/garden";

interface GardenGridProps {
  tiles: GardenTileState[];
  plantsByTile: Map<number, GardenPlant>;
  decorationsByTile: Map<number, PlacedDecoration>;
  inventory: InventoryItem[];
  season: Season;
  selectedPlantId: string | null;
  movingPlantId: string | null;
  selectedDecorationTileIndex: number | null;
  movingDecorationTileIndex: number | null;
  placingItemId: string | null;
  celebratingTileIndex: number | null;
  placementBurstTileIndex: number | null;
  onSelectPlant: (plantId: string, anchor: HTMLElement) => void;
  onStartMovePlant: (plantId: string) => void;
  onSelectDecoration: (tileIndex: number, anchor: HTMLElement) => void;
  onStartMoveDecoration: (tileIndex: number) => void;
  onTileClick: (tileIndex: number) => void;
  onHoverTile: (tileIndex: number | null) => void;
}

function GardenGridComponent({
  tiles,
  plantsByTile,
  decorationsByTile,
  inventory,
  season,
  selectedPlantId,
  movingPlantId,
  selectedDecorationTileIndex,
  movingDecorationTileIndex,
  placingItemId,
  celebratingTileIndex,
  placementBurstTileIndex,
  onSelectPlant,
  onStartMovePlant,
  onSelectDecoration,
  onStartMoveDecoration,
  onTileClick,
  onHoverTile,
}: GardenGridProps) {
  return (
    <div
      role="grid"
      aria-label="Interactive garden"
      className="grid gap-1 sm:gap-1.5"
      style={{ gridTemplateColumns: `repeat(${GARDEN_GRID_COLUMNS}, minmax(0, 1fr))` }}
    >
      {tiles.map((tile) => {
        const plant = plantsByTile.get(tile.index);
        const decoration = decorationsByTile.get(tile.index);
        const decorationItem = decoration
          ? inventory.find((item) => item.id === decoration.itemId)
          : undefined;

        return (
          <div key={tile.index} role="gridcell">
            <GardenTile
              tile={tile}
              plant={plant}
              decoration={decoration}
              decorationItem={decorationItem}
              season={season}
              isSelectedPlant={plant?.id === selectedPlantId}
              isMovingThisPlant={plant?.id === movingPlantId}
              isSelectedDecoration={tile.index === selectedDecorationTileIndex}
              isMovingThisDecoration={tile.index === movingDecorationTileIndex}
              isCelebrating={tile.index === celebratingTileIndex}
              showPlacementBurst={tile.index === placementBurstTileIndex}
              movingActive={movingPlantId !== null}
              movingDecorationActive={movingDecorationTileIndex !== null}
              placementActive={placingItemId !== null}
              onSelectPlant={onSelectPlant}
              onStartMovePlant={onStartMovePlant}
              onSelectDecoration={onSelectDecoration}
              onStartMoveDecoration={onStartMoveDecoration}
              onTileClick={onTileClick}
              onHoverTile={onHoverTile}
            />
          </div>
        );
      })}
    </div>
  );
}

export const GardenGrid = memo(GardenGridComponent);
