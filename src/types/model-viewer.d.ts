// src/model-viewer.d.ts
import type React from "react";

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    src?: string;
                    poster?: string;
                    alt?: string;
                    ar?: boolean | string;
                    "ar-modes"?: string;
                    "camera-controls"?: boolean | string;
                    "auto-rotate"?: boolean | string;
                    "shadow-intensity"?: string;
                    exposure?: string;
                    style?: React.CSSProperties;
                    class?: string;
                },
                HTMLElement
            >;
        }
    }
}