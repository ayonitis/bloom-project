/**
 * The single source of truth for how many Bloom Coins each earning event
 * pays out. Tune balance here — nothing else should hardcode a coin amount.
 *
 * Every reward here is deliberately tied to a durable, date-scoped or
 * unlock-once event (see services/coinService.ts and the unique
 * constraint on coin_transactions), not to raw completion count — that's
 * what makes none of these farmable by completing/undoing the same habit
 * repeatedly in one day.
 */
export const COIN_REWARDS = {
  /** The first habit completion of the calendar day (in the user's own
   *  timezone) — once per day, no matter how many habits exist or how many
   *  times any of them are toggled afterward. */
  dailyFirstCompletion: 5,
  /** Every scheduled habit completed on the same day — also once per day. */
  perfectDayBonus: 15,
} as const;
