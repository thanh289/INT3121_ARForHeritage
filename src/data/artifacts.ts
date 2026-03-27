// src/data/artifacts.ts
export interface Artifact {
    id: string;
    name: string;
    description: string;
    modelUrl: string;
    posterUrl: string;
    era: string;
    origin: string;
}

// src/data/artifacts.ts
export const artifacts: Artifact[] = [
    {
        id: "astronaut",
        name: "Space Suit — Apollo Era",
        description: "A meticulously reconstructed Apollo-era space suit...",
        modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        posterUrl: "https://modelviewer.dev/assets/poster-astronaut.webp", // ✅ real hosted poster
        era: "1969–1972",
        origin: "USA",
    },
    {
        id: "helmet",
        name: "Antique Samurai Kabuto",
        description: "A ceremonial kabuto helmet from Edo-period Japan...",
        modelUrl: "https://modelviewer.dev/shared-assets/models/reflective-sphere.glb",
        posterUrl: "https://modelviewer.dev/assets/poster-sphere.webp",
        era: "Edo Period (~1700)",
        origin: "Japan",
    },
    {
        id: "horse",
        name: "Tang Dynasty Horse",
        description: "A glazed ceramic horse from the Tang Dynasty...",
        modelUrl: "https://modelviewer.dev/shared-assets/models/Horse.glb",
        posterUrl: "https://modelviewer.dev/assets/poster-horse.webp",
        era: "618–907 AD",
        origin: "China",
    },
    {
        id: "lantern",
        name: "Roman Oil Lantern",
        description: "A terracotta oil lantern from 1st century Rome...",
        modelUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb",
        posterUrl: "https://modelviewer.dev/assets/poster-toy-car.webp",
        era: "1st Century AD",
        origin: "Roman Empire",
    },
];