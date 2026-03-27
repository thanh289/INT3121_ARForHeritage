// src/components/ArtifactDetail.tsx
import { motion } from "framer-motion";
import { useEffect } from "react";
import type { Artifact } from "../data/artifacts";
import { ModelViewerComponent } from "./ModelViewer";
import { useSpeech } from "../hooks/useSpeech";

interface ArtifactDetailProps {
    artifact: Artifact;
    onClose: () => void;
}

export const ArtifactDetail: React.FC<ArtifactDetailProps> = ({ artifact, onClose }) => {
    const { status, play, pause, stop, isSupported } = useSpeech();

    useEffect(() => {
        return () => stop();
    }, [artifact.id, stop]);

    const handleSpeechToggle = () => {
        if (status === "playing") pause();
        else play(artifact.description);
    };

    return (
        <motion.div
            key="detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                key="detail-panel"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-sm bg-museum-bg border-2 border-museum-gold shadow-2xl flex flex-col md:flex-row"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-sm bg-white/80 hover:bg-museum-red border border-gray-200 hover:border-museum-red text-gray-600 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* 3D Viewer */}
                <div className="relative h-80 md:h-auto md:w-3/5 bg-[#fafafa] border-b md:border-b-0 md:border-r border-gray-200 p-4">
                    <div className="w-full h-full border border-museum-gold relative">
                        <ModelViewerComponent
                            src={artifact.modelUrl}
                            poster={artifact.posterUrl}
                            alt={artifact.name}
                        />
                    </div>
                </div>

                {/* Info Panel */}
                <div className="p-8 md:w-2/5 flex flex-col bg-white">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-museum-red leading-tight mb-1 whitespace-pre-line">
                            {artifact.name}
                        </h2>
                        <p className="font-sans italic text-museum-gold text-lg">
                            {artifact.category} • {artifact.era}
                        </p>
                    </div>

                    <div className="w-12 h-1 bg-museum-red my-5"></div>

                    <div className="font-sans text-museum-text text-base leading-relaxed text-justify overflow-y-auto pr-2 mb-6">
                        <p>{artifact.description}</p>
                    </div>

                    {/* TTS Controls */}
                    <div className="mt-auto border-t border-museum-gold/30 pt-5">
                        {!isSupported && (
                            <p className="text-xs text-red-500 mb-3 italic">
                                Text-to-speech is not supported in your browser.
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleSpeechToggle}
                                disabled={!isSupported}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-sm border border-museum-gold bg-transparent hover:bg-museum-red text-museum-text hover:text-white font-serif transition-colors disabled:opacity-50"
                            >
                                {status === "playing" ? (
                                    <>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                        Pause Audio
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        {status === "paused" ? "Resume Audio" : "Play Description"}
                                    </>
                                )}
                            </button>

                            {status !== "idle" && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={stop}
                                    className="px-4 py-2 rounded-sm border border-gray-300 hover:border-gray-500 text-gray-600 hover:text-gray-900 font-serif transition-colors"
                                >
                                    Stop
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};