"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/requireUserId";
import { toActionResult, type ActionResult } from "@/lib/errors";
import { inventoryService } from "@/services/inventoryService";
import type { GardenPlacementView, InventoryItemView } from "@/types/inventory";

function revalidateInventoryPaths() {
  revalidatePath("/inventory");
  revalidatePath("/my-garden");
}

export async function getInventoryAction(): Promise<ActionResult<InventoryItemView[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return inventoryService.listForUser(userId);
  });
}

export async function getGardenPlacementsAction(): Promise<ActionResult<GardenPlacementView[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return inventoryService.listGardenPlacements(userId);
  });
}

export async function placeDecorationAction(
  x: number,
  y: number,
  itemId: string
): Promise<ActionResult<GardenPlacementView>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const placement = await inventoryService.placeDecoration(userId, x, y, itemId);
    revalidateInventoryPaths();
    return placement;
  });
}

export async function removeDecorationAction(x: number, y: number): Promise<ActionResult<null>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    await inventoryService.removeDecoration(userId, x, y);
    revalidateInventoryPaths();
    return null;
  });
}

export async function moveDecorationAction(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): Promise<ActionResult<GardenPlacementView>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const placement = await inventoryService.moveDecoration(userId, fromX, fromY, toX, toY);
    revalidateInventoryPaths();
    return placement;
  });
}

export async function rotateDecorationAction(x: number, y: number): Promise<ActionResult<{ rotation: number }>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const rotation = await inventoryService.rotateDecoration(userId, x, y);
    revalidateInventoryPaths();
    return { rotation };
  });
}

export async function consumeSeedAction(itemId: string, habitId: string): Promise<ActionResult<{ xpAwarded: number }>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const result = await inventoryService.useSeed(userId, itemId, habitId);
    revalidatePath("/inventory");
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    revalidatePath("/my-garden");
    revalidatePath("/achievements");
    return result;
  });
}
