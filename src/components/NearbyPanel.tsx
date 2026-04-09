// src/components/NearbyPanel.tsx

import { motion } from "framer-motion";
import type { Artifact } from "../data/artifacts";
import { formatDistance } from "../lib/location";
import type { UserLocation } from "../hooks/useUserLocation";

export interface ArtifactWithDistance extends Artifact {
    distanceM: number | null;
    isNearby: boolean;
}

interface NearbyPanelProps {
    location: UserLocation | null;
    error: string | null;
    isLocating: boolean;
    isWatching: boolean;
    requestLocation: () => void;
    startWatching: () => void;
    stopWatching: () => void;
    artifacts: ArtifactWithDistance[];
    onSelectArtifact: (artifact: Artifact) => void;
}

export const NearbyPanel: React.FC<NearbyPanelProps> = ({
    location,
    error,
    isLocating,
    isWatching,
    requestLocation,
    startWatching,
    stopWatching,
    artifacts,
    onSelectArtifact,
}) => {
    const nearbyArtifacts = artifacts.filter((a) => a.isNearby);
    const locatedArtifacts = artifacts.filter((a) => a.location);

    return (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-museum-gold/40 rounded-sm p-6 shadow-sm"
            >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="font-serif text-2xl text-museum-text">Nearby Experiences</h2>
                        <p className="text-sm text-museum-text/80 mt-2 leading-relaxed">
                            Use your current location to discover artifacts and stories near you.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={requestLocation}
                            className="px-4 py-2 rounded-sm border border-museum-gold bg-museum-red text-white font-serif hover:opacity-90 transition"
                        >
                            {isLocating ? "Locating..." : "Locate Me"}
                        </button>

                        {!isWatching ? (
                            <button
                                onClick={startWatching}
                                className="px-4 py-2 rounded-sm border border-museum-gold text-museum-text font-serif hover:bg-museum-bg transition"
                            >
                                Follow My Position
                            </button>
                        ) : (
                            <button
                                onClick={stopWatching}
                                className="px-4 py-2 rounded-sm border border-gray-300 text-gray-700 font-serif hover:bg-gray-50 transition"
                            >
                                Stop Following
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-600 italic">{error}</p>
                )}

                {location && (
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                        <div className="border border-museum-gold/30 rounded-sm p-3 bg-museum-bg">
                            <p className="text-xs uppercase tracking-wide text-museum-text/60">Latitude</p>
                            <p className="font-medium">{location.lat.toFixed(6)}</p>
                        </div>

                        <div className="border border-museum-gold/30 rounded-sm p-3 bg-museum-bg">
                            <p className="text-xs uppercase tracking-wide text-museum-text/60">Longitude</p>
                            <p className="font-medium">{location.lng.toFixed(6)}</p>
                        </div>

                        <div className="border border-museum-gold/30 rounded-sm p-3 bg-museum-bg">
                            <p className="text-xs uppercase tracking-wide text-museum-text/60">Accuracy</p>
                            <p className="font-medium">± {Math.round(location.accuracy)} m</p>
                        </div>
                    </div>
                )}
            </motion.div>

            <div className="mt-10">
                <h3 className="font-serif text-xl text-museum-text mb-4">Currently Near You</h3>

                {location ? (
                    nearbyArtifacts.length > 0 ? (
                        <div className="grid gap-4">
                            {nearbyArtifacts.map((artifact) => (
                                <button
                                    key={artifact.id}
                                    onClick={() => onSelectArtifact(artifact)}
                                    className="text-left bg-white border border-museum-gold/30 rounded-sm p-5 hover:border-museum-gold hover:-translate-y-0.5 transition"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h4 className="font-serif text-lg text-museum-red">{artifact.name}</h4>
                                            <p className="text-sm italic text-gray-500">{artifact.category}</p>
                                            {artifact.location && (
                                                <p className="text-sm text-museum-text mt-2">
                                                    {artifact.location.placeName}
                                                    {artifact.location.zone ? ` · ${artifact.location.zone}` : ""}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-start md:items-end gap-2">
                                            <span className="px-3 py-1 text-sm rounded-sm bg-museum-red text-white">
                                                {artifact.distanceM !== null ? formatDistance(artifact.distanceM) : "--"}
                                            </span>
                                            <span className="text-xs uppercase tracking-wide text-green-700">
                                                On-site content available
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-dashed border-gray-300 rounded-sm p-5 text-museum-text">
                            No artifact is inside its on-site radius yet. You can still browse all located points below.
                        </div>
                    )
                ) : (
                    <div className="bg-white border border-dashed border-gray-300 rounded-sm p-5 text-museum-text">
                        Tap “Locate Me” first to calculate nearby content.
                    </div>
                )}
            </div>

            <div className="mt-10">
                <h3 className="font-serif text-xl text-museum-text mb-4">All Located Artifacts</h3>

                <div className="grid gap-4">
                    {locatedArtifacts.map((artifact) => (
                        <button
                            key={artifact.id}
                            onClick={() => onSelectArtifact(artifact)}
                            className="text-left bg-white border border-gray-200 rounded-sm p-5 hover:border-museum-gold transition"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h4 className="font-serif text-lg text-museum-red">{artifact.name}</h4>
                                    <p className="text-sm italic text-gray-500">{artifact.category}</p>
                                    {artifact.location && (
                                        <p className="text-sm text-museum-text mt-2">
                                            {artifact.location.placeName}
                                            {artifact.location.zone ? ` · ${artifact.location.zone}` : ""}
                                        </p>
                                    )}
                                </div>

                                <div className="text-sm text-museum-text/80">
                                    {artifact.distanceM !== null ? formatDistance(artifact.distanceM) : "Distance unavailable"}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};