// src/components/ArtifactCard.tsx
import { motion } from "framer-motion";
import type { Artifact } from "../data/artifacts";

interface ArtifactCardProps {
    artifact: Artifact;
    onClick: (artifact: Artifact) => void;
    index: number;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, onClick, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            onClick={() => onClick(artifact)}
            className="group cursor-pointer bg-white p-4 border border-gray-200 shadow-[5px_5px_0px_rgba(197,160,89,0.2)] hover:-translate-y-1 hover:border-museum-gold transition-all duration-300 flex flex-col h-full rounded-sm"
        >
            {/* Poster image */}
            <div className="relative h-64 bg-[#fafafa] overflow-hidden rounded-sm w-full">
                <img
                    src={artifact.posterUrl}
                    alt={artifact.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Info */}
            <div className="pt-4 flex flex-col items-center grow text-center">
                <h3 className="text-museum-red font-serif font-bold text-lg uppercase leading-snug">
                    {artifact.name}
                </h3>
                <p className="font-sans italic text-gray-500 text-sm mt-1">
                    {artifact.origin} • {artifact.era}
                </p>

                <div className="mt-auto pt-5">
                    <span className="inline-block border border-museum-gold text-museum-red px-4 py-1.5 text-sm font-serif transition-colors duration-300 group-hover:bg-museum-red group-hover:text-white rounded-sm">
                        Explore Details
                    </span>
                </div>
            </div>
        </motion.div>
    );
};