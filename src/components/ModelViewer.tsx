import React from "react";

interface ModelViewerProps {
    src: string;
    poster: string;
    alt: string;
}

export const ModelViewerComponent: React.FC<ModelViewerProps> = ({ src, poster, alt }) => {
    return (
        <model-viewer
            src={src}
            poster={poster}
            alt={alt}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1.2"
            exposure="0.9"
            style={{ width: "100%", height: "100%", background: "transparent" }}
        />
    );
};