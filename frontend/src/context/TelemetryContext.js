import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const TelemetryContext = createContext();

export const useTelemetry = () => useContext(TelemetryContext);

export const TelemetryProvider = ({ children }) => {
    const [history, setHistory] = useState([]);
    const [latestTelemetry, setLatestTelemetry] = useState({
        sensors: {},
        battery: 85,
        velocity: 0,
        mancare: true,
        timestamp: 0
    });
    const [latestVideo, setLatestVideo] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const startTimeSet = useRef(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    const MAX_HISTORY_POINTS = 100;

    useEffect(() => {
        let ws;
        let reconnectTimeout;

        const connect = () => {
            ws = new WebSocket('ws://localhost:8000/ws/client');

            ws.onopen = () => {
                console.log("Telemetry WS Connected");
                setConnectionStatus('connected');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'telemetry') {
                        if (data.payload.startTime && !startTimeSet.current) {
                            setStartTime(data.payload.startTime);
                            startTimeSet.current = true;
                        }
                        const now = new Date();
                        const timeLabel = `${now.toLocaleTimeString('ro-RO', { hour12: false })}.${now.getMilliseconds().toString().padStart(3, '0')}`;
                        setHistory(prev => {
                            const lastCpu = prev.length > 0 ? prev[prev.length - 1].cpu : 12;
                            const lastRam = prev.length > 0 ? prev[prev.length - 1].ram : 45;
                            const lastSignal = prev.length > 0 ? prev[prev.length - 1].signal : -45;

                            const fakeCpu = Math.max(5, Math.min(100, lastCpu + (Math.random() - 0.5) * 5));
                            const fakeRam = Math.max(20, Math.min(80, lastRam + (Math.random() - 0.5) * 2));
                            const fakeSignal = Math.max(-90, Math.min(-30, lastSignal + (Math.random() - 0.5) * 3));

                            const newEntry = {
                                time: timeLabel,
                                baterie: data.payload.battery || 85,
                                viteza: data.payload.velocity || 0,
                                cpu: fakeCpu,
                                ram: fakeRam,
                                signal: Math.abs(fakeSignal),
                                rawTimestamp: data.payload.timestamp
                            };

                            const newHistory = [...prev, newEntry];
                            if (newHistory.length > MAX_HISTORY_POINTS) {
                                newHistory.shift(); 
                            }
                            return newHistory;
                        });

                        setLatestTelemetry({
                            sensors: data.payload.sensors || {},
                            battery: data.payload.battery || 85,
                            velocity: data.payload.velocity || 0,
                            mancare: data.payload.mancare,
                            timestamp: data.payload.timestamp
                        });

                    } else if (data.type === 'video') {
                        setLatestVideo(`data:image/jpeg;base64,${data.payload}`);
                    }
                } catch (err) {
                    console.error("Ws Parse Error", err);
                }
            };

            ws.onclose = () => {
                setConnectionStatus('disconnected');
                reconnectTimeout = setTimeout(connect, 2000);
            };
        }

        connect();

        return () => {
            clearTimeout(reconnectTimeout);
            if (ws) ws.close();
        };
    }, []);

    const value = {
        history,
        latestTelemetry,
        latestVideo,
        startTime,
        connectionStatus
    };

    return (
        <TelemetryContext.Provider value={value}>
            {children}
        </TelemetryContext.Provider>
    );
};
