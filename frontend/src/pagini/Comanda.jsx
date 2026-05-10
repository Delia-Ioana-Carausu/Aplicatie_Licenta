import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, LinearProgress, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { RiBatteryChargeLine, RiSpeedLine, RiWifiLine } from 'react-icons/ri';

const HudCorner = ({ position, color = '#00ff88' }) => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    return (
        <Box sx={{
            position: 'absolute',
            [isTop ? 'top' : 'bottom']: 30,
            [isLeft ? 'left' : 'right']: 30,
            width: 50,
            height: 50,
            borderTop: isTop ? `3px solid ${color}` : 'none',
            borderBottom: !isTop ? `3px solid ${color}` : 'none',
            borderLeft: isLeft ? `3px solid ${color}` : 'none',
            borderRight: !isLeft ? `3px solid ${color}` : 'none',
            zIndex: 20,
            opacity: 0.8,
            boxShadow: `0 0 15px ${color}`
        }} component={motion.div} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} />
    );
};

export default function Comanda() {
    const [sursaImagine, setSursaImagine] = useState(null);
    const [statistici, setStatistici] = useState({
        baterie: 85,
        viteza: 0,
        mancare: false
    });
    const [activ, setActiv] = useState(false);

    useEffect(() => {
        let watchdogTimer;
        const ws = new WebSocket('ws://localhost:8000/ws/client');

        ws.onopen = () => {
            console.log("WebSocket Connected");
        };

        ws.onmessage = (evt) => {
            setActiv(true);
            clearTimeout(watchdogTimer);
            watchdogTimer = setTimeout(() => {
                setActiv(false);
            }, 1000);

            const data = JSON.parse(evt.data);
            if (data.type === 'video') setSursaImagine(`data:image/jpeg;base64,${data.payload}`);
            if (data.type === 'telemetry') {
                setStatistici(prev => ({ ...prev, baterie: data.payload.battery, viteza: data.payload.velocity }));
            }
        };

        ws.onclose = () => {
            setActiv(false);
        };

        return () => {
            ws.close();
            clearTimeout(watchdogTimer);
        };
    }, []);

    return (
        <Box sx={{ width: '100%', height: '100vh', position: 'relative', bgcolor: 'black', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            { }
            <Box sx={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 2px, 3px 100%'
            }} />

            {/* LIVE FEED */}
            {sursaImagine && activ ? (
                <img src={sursaImagine} alt="Live Feed" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 0 }} />
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#00d4ff', zIndex: 2 }}>
                    <CircularProgress size={60} thickness={2} sx={{ color: activ ? '#00ff88' : 'red' }} />
                    <Typography sx={{ mt: 3, fontFamily: '"Share Tech Mono", monospace', letterSpacing: 3, animation: 'pulse 2s infinite', color: activ ? '#00ff88' : 'red' }}>
                        {activ ? 'CONEXIUNE STABILITA' : 'ASTEPTARE DATE ROBOT...'}
                    </Typography>
                </Box>
            )}

            {/* HUD LAYERS */}

            {/* CORNERS */}
            <HudCorner position="top-left" color={activ ? '#00ff88' : 'red'} />
            <HudCorner position="top-right" color={activ ? '#00ff88' : 'red'} />
            <HudCorner position="bottom-left" color={activ ? '#00ff88' : 'red'} />
            <HudCorner position="bottom-right" color={activ ? '#00ff88' : 'red'} />

            {/* TOP BAR - INFO */}
            <Box component={motion.div} initial={{ y: -100 }} animate={{ y: 0 }}
                sx={{ position: 'absolute', top: 40, left: 100, right: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>

                {/* BATTERY MODULE */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    bgcolor: 'rgba(0, 20, 10, 0.7)', backdropFilter: 'blur(10px)',
                    px: 3, py: 1.5, borderRadius: '4px', borderLeft: `4px solid ${statistici.baterie > 20 ? '#00ff88' : '#ff0055'}`
                }}>
                    <RiBatteryChargeLine color={statistici.baterie > 20 ? '#00ff88' : '#ff0055'} size={24} />
                    <Box>
                        <Typography sx={{ color: statistici.baterie > 20 ? '#00ff88' : '#ff0055', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.8rem' }}>BATERIE</Typography>
                        <Typography sx={{ color: 'white', fontFamily: '"Share Tech Mono", monospace', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {statistici.baterie}%
                        </Typography>
                    </Box>
                </Box>

                {/* CENTER TITLE */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontFamily: '"Orbitron", sans-serif', letterSpacing: 6, fontWeight: 900, textShadow: '0 0 20px #00d4ff' }}>
                        TRANSMISIE LIVE
                    </Typography>
                    <Box sx={{ width: 150, height: 2, bgcolor: '#00d4ff', mt: 1, boxShadow: '0 0 10px #00d4ff' }} />
                </Box>

                {/* SIGNAL MODULE - DYNAMIC */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    bgcolor: 'rgba(0, 10, 20, 0.7)', backdropFilter: 'blur(10px)',
                    px: 3, py: 1.5, borderRadius: '4px',
                    borderRight: `4px solid ${activ ? '#00d4ff' : '#555'}`,
                    transition: 'border-color 0.3s ease'
                }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ color: activ ? '#00d4ff' : '#777', fontFamily: '"Share Tech Mono", monospace', fontSize: '0.8rem' }}>CONEXIUNE</Typography>
                        <Typography sx={{ color: activ ? 'white' : '#999', fontFamily: '"Share Tech Mono", monospace', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {activ ? 'ACTIV' : 'INACTIV'}
                        </Typography>
                    </Box>
                    <RiWifiLine color={activ ? '#00d4ff' : '#555'} size={24} />
                </Box>
            </Box>



        </Box>
    );
}
