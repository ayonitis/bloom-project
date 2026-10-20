"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/requireUserId";
import { toActionResult, type ActionResult } from "@/lib/errors";
import { plantService } from "@/services/plantService";

function revalidateGardenPaths() {
  revalidatePath("/my-garden");
}

/** habitId → tileIndex, for every plant the user has manually repositioned —
 *  the Garden merges this with its own deterministic default layout on load,
 *  same shape it already used for the (previously local-only) override map. */
export async function getPlantPositionsAction(): Promise<ActionResult<Record<string, number>>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return plantService.getPositionOverrides(userId);
  });
}

export async function movePlantAction(habitId: string, x: number, y: number): Promise<ActionResult<null>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    await plantService.movePlant(userId, habitId, x, y);
    revalidateGardenPaths();
    return null;
  });
}

export async function resetPlantPositionAction(habitId: string): Promise<ActionResult<null>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    await plantService.resetPlantPosition(userId, habitId);
    revalidateGardenPaths();
    return null;
  });
}
