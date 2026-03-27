// src/App.tsx
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArtifactCard } from "./components/ArtifactCard";
import { ArtifactDetail } from "./components/ArtifactDetail";
import type { Artifact } from "./data/artifacts";
import { artifacts } from "./data/artifacts";

export default function App() {
  const [selected, setSelected] = useState<Artifact | null>(null);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-16 pb-8 mb-10 text-center header-decoration container mx-auto px-4 max-w-3xl"
      >
        <h1 className="font-serif text-4xl md:text-5xl uppercase text-museum-red tracking-wide mb-2">
          Digital Museum
        </h1>
        <p className="font-serif italic text-lg text-museum-text mt-2">
          "Artifacts in 3D & AR"
        </p>
      </motion.header>

      {/* Gallery */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12 relative"
        >
          <h2 className="font-serif text-2xl text-museum-text inline-block relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-0.5 after:bg-museum-gold">
            The Collection
          </h2>
          <p className="font-sans text-museum-text mt-6 max-w-2xl mx-auto leading-relaxed text-justify">
            Explore history through interactive 3D models. Tap any artifact to inspect it in detail, hear its story, or view it in augmented reality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {artifacts.map((artifact, i) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              onClick={setSelected}
              index={i}
            />
          ))}
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <ArtifactDetail
            key={selected.id}
            artifact={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}