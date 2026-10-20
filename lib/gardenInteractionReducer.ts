import type { GardenInteractionState } from "@/types/garden";

export type GardenInteractionAction =
  | { type: "INSPECT"; plantId: string; anchor: HTMLElement }
  | { type: "CLOSE" }
  | { type: "START_MOVE"; plantId: string }
  | { type: "START_PLACEMENT"; itemId: string }
  | { type: "INSPECT_DECORATION"; tileIndex: number; anchor: HTMLElement }
  | { type: "START_MOVE_DECORATION"; tileIndex: number }
  | { type: "CANCEL" }
  | { type: "FINISH" };

export const IDLE_INTERACTION: GardenInteractionState = { mode: "idle" };

/**
 * Every transition returns a brand-new single-mode state — there's no path
 * that can produce two overlays being "on" at once. Starting a move or a
 * placement always replaces whatever was active before (including an open
 * details panel), and finishing either one always returns to idle; the
 * caller is responsible for deciding whether to re-open details afterward
 * (see the pending-reopen effect in useGarden), since that requires a DOM
 * lookup the reducer itself shouldn't know about. Decoration modes follow
 * the exact same rules as their plant equivalents.
 */
export function gardenInteractionReducer(
  _state: GardenInteractionState,
  action: GardenInteractionAction
): GardenInteractionState {
  switch (action.type) {
    case "INSPECT":
      return { mode: "inspecting", plantId: action.plantId, anchor: action.anchor };
    case "CLOSE":
    case "CANCEL":
    case "FINISH":
      return IDLE_INTERACTION;
    case "START_MOVE":
      return { mode: "moving", plantId: action.plantId };
    case "START_PLACEMENT":
      return { mode: "placing", itemId: action.itemId };
    case "INSPECT_DECORATION":
      return { mode: "inspectingDecoration", tileIndex: action.tileIndex, anchor: action.anchor };
    case "START_MOVE_DECORATION":
      return { mode: "movingDecoration", tileIndex: action.tileIndex };
    default:
      return _state;
  }
}
