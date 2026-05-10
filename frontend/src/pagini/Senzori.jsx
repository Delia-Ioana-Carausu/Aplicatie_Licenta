import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { RiRadarLine, RiBatteryChargeLine, RiCpuLine, RiWifiLine, RiDatabase2Line, RiTimeLine, RiSpeedLine, RiCompass3Line } from 'react-icons/ri';

const SensorCard = ({ title, value, unit, color, icon: Icon, extraStyle = {} }) => (
    <Paper component={motion.div} whileHover={{ scale: 1.05, boxShadow: `0 0 25px ${color}60` }} sx={{
        p: 3,
        bgcolor: 'rgba(10, 10, 20, 0.6)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}40`,
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 180,
        boxShadow: `0 4px 30px rgba(0, 0, 0, 0.5)`,
        ...extraStyle
    }}>
        <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, transform: 'rotate(20deg)' }}>
            {Icon && <Icon size={100} color={color} />}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, width: '100%', justifyContent: 'center', borderBottom: `1px solid ${color}20`, pb: 1 }}>
            {Icon && <Icon size={20} color={color} style={{ opacity: 0.8 }} />}
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', letterSpacing: 2, fontWeight: 600 }}>
                {title}
            </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h3" sx={{ color: color, fontFamily: '"Share Tech Mono", monospace', fontWeight: 'bold', textShadow: `0 0 20px ${color}50`, lineHeight: 1 }}>
                {value}
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{unit}</Typography>
        </Box>
    </Paper>
);

export default function Senzori() {
    const [senzori, setSenzori] = useState({});
    const [startTime, setStartTime] = useState(null);
    const [uptimeFormatted, setUptimeFormatted] = useState("00:00:00");

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws/client');
        ws.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            if (data.type === 'telemetry') {
                const rawSensors = data.payload.sensors || {};

                if (data.payload.startTime && !startTime) {
                    setStartTime(data.payload.startTime);
                }

                const demoSensors = {
                    fata: rawSensors.fata ?? 0,
                    spate: rawSensors.spate ?? 0,
                    stanga: rawSensors.stanga ?? 0,
                    dreapta: rawSensors.dreapta ?? 0,
                    viteza: data.payload.velocity || 0
                };
                setSenzori(demoSensors);
            }
        };
        return () => ws.close();
    }, [startTime]);

    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            const now = Date.now() / 1000;
            const diff = Math.floor(now - startTime);

            if (diff > 0) {
                const h = Math.floor(diff / 3600).toString().padStart(2, '0');
                const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
                const s = (diff % 60).toString().padStart(2, '0');
                setUptimeFormatted(`${h}:${m}:${s}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <Container maxWidth="xl" sx={{ py: 4, height: '100vh', overflowY: 'auto' }}>
            <Typography variant="h3" sx={{ color: 'white', mb: 4, fontFamily: '"Orbitron", sans-serif', fontWeight: 900, textAlign: 'center', letterSpacing: 4, textShadow: '0 0 20px rgba(0,255,136,0.5)' }}>
                SISTEM TELEMETRIE
            </Typography>

            <Grid container spacing={3} sx={{ mb: 6 }}>
                { }
                <Grid item xs={12} md={3}>
                    <SensorCard title="BATERIE" value="12.4" unit="VOLȚI" color="#ffaa00" icon={RiBatteryChargeLine} />
                </Grid>
                <Grid item xs={12} md={3}>
                    <SensorCard title="VITEZĂ" value={senzori.viteza?.toFixed(1) || '0.0'} unit="M/S" color="#e1ff00" icon={RiSpeedLine} />
                </Grid>
                <Grid item xs={12} md={3}>
                    <SensorCard title="CPU" value="12" unit="%" color="#00ff88" icon={RiCpuLine} />
                </Grid>
                <Grid item xs={12} md={3}>
                    <SensorCard title="MEMORIE RAM" value="45" unit="%" color="#d600ff" icon={RiDatabase2Line} />
                </Grid>

                { }
                <Grid item xs={12} md={4}>
                    <SensorCard title="SEMNAL" value="-45" unit="dBm" color="#00d4ff" icon={RiWifiLine} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <SensorCard title="UPTIME" value={uptimeFormatted} unit="H:M:S" color="#ff0055" icon={RiTimeLine} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <SensorCard title="BUSOLĂ" value="NV" unit="315°" color="#ffffff" icon={RiCompass3Line} />
                </Grid>
            </Grid>

            { }
            <Box sx={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 3, mb: 4, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1, width: '100%', textAlign: 'center' }}>
                    MATRICE SENZORI PROXIMITATE
                </Typography>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(3, auto)',
                    gap: 4,
                    maxWidth: '800px',
                    width: '100%'
                }}>
                    { }
                    <Box sx={{ gridColumn: '2', gridRow: '1' }}>
                        <SensorCard title="FAȚĂ" value={senzori.fata?.toFixed(2)} unit="METRI" color="#ffffff" icon={RiRadarLine} />
                    </Box>

                    { }
                    <Box sx={{ gridColumn: '1', gridRow: '2' }}>
                        <SensorCard title="STÂNGA" value={senzori.stanga?.toFixed(2)} unit="METRI" color="#ffffff" icon={RiRadarLine} />
                    </Box>

                    { }
                    <Box sx={{ gridColumn: '2', gridRow: '2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{
                            width: 100, height: 100, borderRadius: '50%',
                            border: '2px solid #00ff88',
                            boxShadow: '0 0 30px rgba(0,255,136,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: 'rgba(0,255,136,0.1)'
                        }}>
                            <RiRadarLine size={40} color="#00ff88" />
                        </Box>
                    </Box>

                    { }
                    <Box sx={{ gridColumn: '3', gridRow: '2' }}>
                        <SensorCard title="DREAPTA" value={senzori.dreapta?.toFixed(2)} unit="METRI" color="#ffffff" icon={RiRadarLine} />
                    </Box>

                    { }
                    <Box sx={{ gridColumn: '2', gridRow: '3' }}>
                        <SensorCard title="SPATE" value={senzori.spate?.toFixed(2)} unit="METRI" color="#ffffff" icon={RiRadarLine} />
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}
