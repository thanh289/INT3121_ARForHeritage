// src/hooks/useSpeech.ts

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechStatus = "idle" | "playing" | "paused";

interface UseSpeechReturn {
    status: SpeechStatus;
    play: (text: string) => void;
    pause: () => void;
    stop: () => void;
    isSupported: boolean;
}

export function useSpeech(): UseSpeechReturn {
    const [status, setStatus] = useState<SpeechStatus>("idle");
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isSupported) window.speechSynthesis.cancel();
        };
    }, [isSupported]);

    const play = useCallback(
        (text: string) => {
            if (!isSupported) return;

            // If paused, resume instead of replaying
            if (status === "paused") {
                window.speechSynthesis.resume();
                setStatus("playing");
                return;
            }

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1.05;
            utterance.volume = 1;

            // Pick a natural-sounding voice if available
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(
                (v) =>
                    v.lang.startsWith("en") &&
                    (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium"))
            );
            if (preferred) utterance.voice = preferred;

            utterance.onstart = () => setStatus("playing");
            utterance.onpause = () => setStatus("paused");
            utterance.onresume = () => setStatus("playing");
            utterance.onend = () => setStatus("idle");
            utterance.onerror = () => setStatus("idle");

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        },
        [isSupported, status]
    );

    const pause = useCallback(() => {
        if (!isSupported || status !== "playing") return;
        window.speechSynthesis.pause();
        setStatus("paused");
    }, [isSupported, status]);

    const stop = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.cancel();
        setStatus("idle");
    }, [isSupported]);

    return { status, play, pause, stop, isSupported };
}