// src/components/ArtifactCard.tsx
import { motion } from "framer-motion";
import { useRef, useCallback, useEffect } from "react";
import type { Artifact } from "../data/artifacts";

interface ArtifactCardProps {
    artifact: Artifact;
    onClick: (artifact: Artifact) => void;
    index: number;
}

interface ModelViewerElement extends HTMLElement {
    cameraOrbit: string;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, onClick, index }) => {
    const viewerRef = useRef<ModelViewerElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const currentThetaRef = useRef(0);
    const targetThetaRef = useRef(0);

    const animateRef = useRef<() => void>(() => { });

    useEffect(() => {
        animateRef.current = () => {
            if (!viewerRef.current) return;

            const diff = targetThetaRef.current - currentThetaRef.current;

            if (Math.abs(diff) < 0.01) {
                currentThetaRef.current = targetThetaRef.current;
                viewerRef.current.cameraOrbit = `${currentThetaRef.current}deg 60deg 105%`;
                rafRef.current = null;
                return;
            }

            currentThetaRef.current += diff * 0.08;
            viewerRef.current.cameraOrbit = `${currentThetaRef.current}deg 60deg 105%`;
            rafRef.current = requestAnimationFrame(() => animateRef.current());
        };
    });

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const normalized = (e.clientX - rect.left) / rect.width;
        targetThetaRef.current = (normalized - 0.5) * -360;

        if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(() => animateRef.current());
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        targetThetaRef.current = 0;
        if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(() => animateRef.current());
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            onClick={() => onClick(artifact)}
            className="group cursor-pointer bg-white p-4 border border-gray-200 shadow-[5px_5px_0px_rgba(197,160,89,0.2)] hover:-translate-y-1 hover:border-museum-gold transition-all duration-300 flex flex-col h-full rounded-sm"
        >
            <div
                className="relative h-64 bg-[#fafafa] overflow-hidden rounded-sm w-full"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing" />

                <model-viewer
                    ref={(el) => {
                        viewerRef.current = el as ModelViewerElement | null;
                    }}
                    src={artifact.modelUrl}
                    alt={artifact.name}
                    camera-orbit="0deg 90deg 105%"
                    style={{
                        width: "100%",
                        height: "100%",
                        background: "transparent",
                        "--poster-color": "transparent",
                    } as React.CSSProperties}
                />
            </div>

            <div className="pt-4 flex flex-col items-center grow text-center">
                <h3 className="text-museum-red font-serif font-bold text-lg uppercase leading-snug">
                    {artifact.name}
                </h3>
                <p className="font-sans italic text-gray-500 text-sm mt-1">
                    {artifact.category}
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