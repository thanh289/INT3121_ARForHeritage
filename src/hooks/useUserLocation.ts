// src/hooks/useUserLocation.ts

import { useCallback, useEffect, useRef, useState } from "react";

export interface UserLocation {
    lat: number;
    lng: number;
    accuracy: number;
}

function mapGeolocationError(error: GeolocationPositionError): string {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return "Location permission was denied.";
        case error.POSITION_UNAVAILABLE:
            return "Your location is currently unavailable.";
        case error.TIMEOUT:
            return "Location request timed out.";
        default:
            return "Unable to determine your location.";
    }
}

export function useUserLocation() {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [isWatching, setIsWatching] = useState(false);

    const watchIdRef = useRef<number | null>(null);

    const requestLocation = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setError("This browser does not support geolocation.");
            return;
        }

        setIsLocating(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
                setIsLocating(false);
            },
            (err) => {
                setError(mapGeolocationError(err));
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, []);

    const startWatching = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setError("This browser does not support geolocation.");
            return;
        }

        setError(null);
        setIsWatching(true);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (err) => {
                setError(mapGeolocationError(err));
                setIsWatching(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 3000,
            }
        );
    }, []);

    const stopWatching = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsWatching(false);
    }, []);

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    return {
        location,
        error,
        isLocating,
        isWatching,
        requestLocation,
        startWatching,
        stopWatching,
    };
}