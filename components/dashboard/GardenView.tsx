"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { GardenTile } from "@/components/dashboard/GardenTile";
import { GardenAnimation } from "@/components/dashboard/GardenAnimation";
import { GardenButterflies } from "@/components/dashboard/GardenButterflies";
import { FloatingParticles } from "@/components/dashboard/FloatingParticles";
import { GARDEN_COLUMNS, GARDEN_TILES } from "@/lib/mockData";

function GardenViewComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2rem] border border-black/5 shadow-[0_30px_70px_-30px_rgba(38,54,58,0.28)]"
    >
      <div
        className="relative"
        style={{
          background:
            "linear-gradient(180deg, #DCEFFF 0%, #EAF6FF 35%, #F3FBEF 100%)",
        }}
      >
        <div className="p-4 sm:p-6">
          <div
            className="grid gap-1 sm:gap-1.5"
            style={{ gridTemplateColumns: `repeat(${GARDEN_COLUMNS}, minmax(0, 1fr))` }}
          >
            {GARDEN_TILES.map((tile, index) => (
              <GardenTile key={tile.id} type={tile.type} delay={index} />
            ))}
          </div>
        </div>

        <GardenAnimation />
        <GardenButterflies />
        <FloatingParticles count={10} />
      </div>
    </motion.div>
  );
}

export const GardenView = memo(GardenViewComponent);
