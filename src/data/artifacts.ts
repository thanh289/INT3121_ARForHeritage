// src/data/artifacts.ts
export interface Artifact {
    id: string;
    name: string;
    description: string;
    modelUrl: string;
    posterUrl: string;
    era: string;
    category: string;
}

// src/data/artifacts.ts
export const artifacts: Artifact[] = [
    {
        id: "astronaut",
        name: "Space Suit — Apollo Era",
        description: "A meticulously reconstructed Apollo-era space suit, worn by astronauts during lunar surface operations. The suit provided life support, pressure regulation, and thermal protection against the Moon's extreme temperatures — from 127°C in sunlight to -173°C in shadow. Each suit was custom-fitted and required over 21 layers of specialized materials.",
        modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        posterUrl: "https://modelviewer.dev/assets/poster-astronaut.webp",
        era: "1969–1972",
        category: "USA",
    },
    {
        id: "helmet",
        name: "Antique Samurai Kabuto",
        description: "A ceremonial kabuto helmet from Edo-period Japan, circa 1700. Crafted from lacquered iron plates (shikoro) laced with silk cord, this helmet belonged to a mid-ranking samurai. The distinctive maedate crest symbolized the warrior's clan allegiance. The iron was folded over 100 times by master armorer Myochin Muneyuki.",
        modelUrl: "https://modelviewer.dev/shared-assets/models/reflective-sphere.glb",
        posterUrl: "https://modelviewer.dev/assets/poster-sphere.webp",
        era: "Edo Period (~1700)",
        category: "Japan",
    },
    {
        id: "horse",
        name: "Tang Dynasty Horse",
        description: "A glazed ceramic horse from the Tang Dynasty (618–907 AD), representing the prized Ferghana horses imported from Central Asia via the Silk Road. Known as 'Heavenly Horses,' they were considered sacred and depicted in countless artworks. This tricolor sancai glaze — amber, green, and cream — was achieved through lead-flux firing techniques perfected by Tang artisans.",
        modelUrl: "https://modelviewer.dev/shared-assets/models/Horse.glb",
        posterUrl: "https://modelviewer.dev/assets/poster-horse.webp",
        era: "618–907 AD",
        category: "China",
    },
    {
        id: "lantern",
        name: "Roman Oil Lantern",
        description: "A terracotta oil lantern from 1st century Rome, used to illuminate homes, temples, and streets throughout the empire. Olive oil was the primary fuel, burning through a linen wick. This example bears a molded relief of the god Mercury — patron of travelers — making it a likely votive offering. Thousands of identical molds allowed mass production across Roman provinces.",
        modelUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb",
        posterUrl: "https://modelviewer.dev/assets/poster-toy-car.webp",
        era: "1st Century AD",
        category: "Roman Empire",
    },
];