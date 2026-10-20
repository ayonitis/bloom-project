import { getPlantGrowthStage, getPlantVisualTier } from "@/lib/progression/plantGrowth";
import { GROWTH_STAGE_LABELS } from "@/types/garden";
import type { PlantSpeciesId } from "@/types/habit";

interface SpeciesStyle {
  stemColor: string;
  foliageColor: string;
  accentColor: string;
}

const SPECIES_STYLES: Record<PlantSpeciesId, SpeciesStyle> = {
  oak: { stemColor: "#8A6448", foliageColor: "#2C9560", accentColor: "#2C9560" },
  sunflower: { stemColor: "#3BB273", foliageColor: "#3BB273", accentColor: "#F5A623" },
  lotus: { stemColor: "#3BB273", foliageColor: "#3BB273", accentColor: "#FF9E7D" },
  fern: { stemColor: "#2C9560", foliageColor: "#3BB273", accentColor: "#3BB273" },
  bonsai: { stemColor: "#8A6448", foliageColor: "#2C9560", accentColor: "#2C9560" },
  cactus: { stemColor: "#3BB273", foliageColor: "#3BB273", accentColor: "#FF9E7D" },
  clover: { stemColor: "#3BB273", foliageColor: "#3BB273", accentColor: "#FFFFFF" },
};

/** A soft contact shadow so every stage reads clearly against the grass,
 *  regardless of how busy the tile's background is. */
function GroundShadow() {
  return <ellipse cx="32" cy="59" rx="13" ry="3.5" fill="#1F2A1E" opacity="0.16" />;
}

/** "There is a plant growing here" needs to be legible even at the very
 *  start — a bare dot read as empty ground in testing. A tiny stem + one
 *  unfurling leaf + a soft glow reads unambiguously as a seedling. */
function SeedStage({ style }: { style: SpeciesStyle }) {
  return (
    <>
      <ellipse cx="32" cy="58" rx="14" ry="4" fill={style.foliageColor} opacity="0.22" />
      <circle cx="32" cy="52" r="9" fill={style.accentColor} opacity="0.16" />
      <rect x="30.5" y="48" width="3" height="10" rx="1.5" fill={style.stemColor} />
      <path d="M32 50c-5-1-7-4-6-8 5 0 7 4 6 8Z" fill={style.foliageColor} />
    </>
  );
}

function SproutStage({ style }: { style: SpeciesStyle }) {
  return (
    <>
      <GroundShadow />
      <rect x="30" y="40" width="4" height="18" rx="2" fill={style.stemColor} />
      <path d="M32 44c-8-2-12-8-10-14 8 1 12 8 10 14Z" fill={style.foliageColor} />
      <path d="M32 47c7-1 11-6 9-11-7 0-11 5-9 11Z" fill={style.foliageColor} opacity="0.85" />
    </>
  );
}

/** The mid-growth silhouette — deliberately not just a bigger Sprout or a
 *  smaller Full: a fuller stem with a compact, half-formed canopy/bud
 *  that visibly reads as "on its way", distinct at both a glance and in
 *  a side-by-side comparison. */
function BuddingStage({ species, style }: { species: PlantSpeciesId; style: SpeciesStyle }) {
  const isTallGrowth = species === "oak" || species === "bonsai" || species === "sunflower";
  return (
    <>
      <GroundShadow />
      <rect x="29.5" y="34" width="5" height="24" rx="2.5" fill={style.stemColor} />
      {isTallGrowth ? (
        <>
          <circle cx="32" cy="28" r="11" fill={style.foliageColor} />
          <circle cx="23" cy="33" r="6" fill={style.foliageColor} opacity="0.85" />
          <circle cx="41" cy="33" r="6.5" fill={style.foliageColor} opacity="0.85" />
        </>
      ) : (
        <>
          <path d="M32 34c-9-2-14-9-11-16 9 1 14 8 11 16Z" fill={style.foliageColor} />
          <path d="M32 36c8-1 12-7 10-13-8 0-12 6-10 13Z" fill={style.foliageColor} opacity="0.85" />
        </>
      )}
      <circle cx="32" cy="21" r="3" fill={style.accentColor} />
    </>
  );
}

function FullStage({ species, style }: { species: PlantSpeciesId; style: SpeciesStyle }) {
  switch (species) {
    case "oak":
      return (
        <>
          <rect x="29" y="36" width="6" height="24" rx="2" fill={style.stemColor} />
          <circle cx="32" cy="26" r="18" fill={style.foliageColor} />
          <circle cx="17" cy="34" r="11" fill={style.foliageColor} opacity="0.9" />
          <circle cx="47" cy="34" r="12" fill={style.foliageColor} opacity="0.9" />
        </>
      );
    case "sunflower":
      return (
        <>
          <path d="M32 60c0-16 0-24 0-32" stroke={style.stemColor} strokeWidth="4" strokeLinecap="round" fill="none" />
          <g transform="translate(32,22)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <ellipse key={angle} cx="0" cy="-13" rx="5" ry="9" fill={style.accentColor} transform={`rotate(${angle})`} />
            ))}
            <circle r="9" fill="#7A5230" />
          </g>
        </>
      );
    case "lotus":
      return (
        <>
          <ellipse cx="32" cy="54" rx="20" ry="6" fill={style.stemColor} opacity="0.3" />
          <g transform="translate(32,38)">
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <ellipse key={angle} cx="0" cy="-10" rx="6" ry="14" fill={style.accentColor} opacity="0.9" transform={`rotate(${angle})`} />
            ))}
            <circle r="5" fill="#FFF3D6" />
          </g>
        </>
      );
    case "fern":
      return (
        <>
          {[-1, 0, 1].map((i) => (
            <path
              key={i}
              d={`M32 58 C ${32 + i * 14} 40 ${32 + i * 18} 24 ${32 + i * 10} 12`}
              stroke={style.foliageColor}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity={i === 0 ? 1 : 0.8}
            />
          ))}
        </>
      );
    case "bonsai":
      return (
        <>
          <path d="M30 58c0-10 4-14 2-22" stroke={style.stemColor} strokeWidth="5" strokeLinecap="round" fill="none" />
          <ellipse cx="26" cy="30" rx="16" ry="9" fill={style.foliageColor} />
          <ellipse cx="40" cy="24" rx="12" ry="7" fill={style.foliageColor} opacity="0.9" />
        </>
      );
    case "cactus":
      return (
        <>
          <rect x="26" y="26" width="12" height="32" rx="6" fill={style.foliageColor} />
          <rect x="14" y="34" width="9" height="18" rx="4.5" fill={style.foliageColor} opacity="0.9" />
          <rect x="41" y="30" width="9" height="20" rx="4.5" fill={style.foliageColor} opacity="0.9" />
          <circle cx="32" cy="22" r="4" fill={style.accentColor} />
        </>
      );
    case "clover":
      return (
        <>
          <path d="M32 58c0-10 0-16 0-20" stroke={style.stemColor} strokeWidth="3" strokeLinecap="round" fill="none" />
          {[0, 120, 240].map((angle) => (
            <ellipse
              key={angle}
              cx="32"
              cy="30"
              rx="8"
              ry="10"
              fill={style.foliageColor}
              transform={`rotate(${angle} 32 30)`}
            />
          ))}
          <circle cx="32" cy="14" r="3.5" fill={style.accentColor} stroke="#E6D3AE" strokeWidth="0.5" />
        </>
      );
    default:
      return null;
  }
}

interface PlantVisualProps {
  species: PlantSpeciesId;
  growth: number;
  size?: number;
  className?: string;
}

export function PlantVisual({ species, growth, size = 64, className }: PlantVisualProps) {
  const stage = getPlantGrowthStage(growth);
  const tier = getPlantVisualTier(stage);
  const style = SPECIES_STYLES[species];
  const isFullyGrown = stage === "legendary";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={`Plant growth: ${GROWTH_STAGE_LABELS[stage]}, ${growth}%`}
    >
      {tier === "seed" && <SeedStage style={style} />}
      {tier === "sprout" && <SproutStage style={style} />}
      {tier === "budding" && <BuddingStage species={species} style={style} />}
      {tier === "full" && (
        <>
          <GroundShadow />
          <FullStage species={species} style={style} />
          {isFullyGrown && (
            <circle cx="32" cy="28" r="26" fill={style.accentColor} opacity="0.08" />
          )}
        </>
      )}
    </svg>
  );
}
