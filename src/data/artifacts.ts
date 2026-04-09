// src/data/artifacts.ts

export interface ArtifactLocation {
    lat: number;
    lng: number;
    placeName: string;
    zone?: string;
    radiusM?: number; // in this radius considered nearby
}

export interface Artifact {
    id: string;
    name: string;
    category: string;
    description: string;
    modelUrl: string;
    location?: ArtifactLocation;
}

export const artifacts: Artifact[] = [
    {
        id: "artifact-1",
        name: "Bronze Drum",
        category: "Ancient Artifact",
        description: "A ceremonial bronze drum used in ritual and communal life.",
        modelUrl: "/models/bronze-drum.glb",
        location: {
            lat: 21.0151,
            lng: 105.7465,
            placeName: "Main Exhibition Hall",
            zone: "Stop 01",
            radiusM: 60,
        },
    },
    {
        id: "artifact-2",
        name: "Stone Stele",
        category: "Temple Heritage",
        description: "A carved stele preserving inscriptions from a historical site.",
        modelUrl: "/models/stone-stele.glb",
        location: {
            lat: 21.0277,
            lng: 105.8365,
            placeName: "Courtyard Display",
            zone: "Stop 02",
            radiusM: 50,
        },
    },
];