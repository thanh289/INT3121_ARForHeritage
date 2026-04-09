import React from "react";

interface ModelViewerProps {
    src: string;
    alt: string;
}

export const ModelViewerComponent: React.FC<ModelViewerProps> = ({ src, alt }) => {
    return (
        <model-viewer
            src={src}
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