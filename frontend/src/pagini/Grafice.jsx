import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    RadialBarChart, RadialBar, Legend
} from 'recharts';
import { RiLineChartLine, RiCpuLine, RiWifiLine, RiBatteryChargeLine, RiSpeedLine, RiRadarLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { useTelemetry } from '../context/TelemetryContext';

const ChartCard = ({ title, color, icon: Icon, children }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Paper component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            sx={{
                p: 3,
                height: 400,
                bgcolor: isDark ? 'rgba(10, 10, 20, 0.6)' : 'background.paper',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                border: `1px solid ${color}${isDark ? '40' : '20'}`, 
                boxShadow: `0 0 20px ${color}${isDark ? '20' : '10'}`,
                display: 'flex',
                flexDirection: 'column'
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: `1px solid ${color}30`, pb: 1 }}>
                <Icon style={{ marginRight: 10, color: color }} size={24} />
                <Typography variant="h6" sx={{ color: 'text.primary', fontFamily: '"Share Tech Mono", monospace', letterSpacing: 1 }}>
                    {title}
                </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

const CustomTooltip = ({ active, payload, label, color }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    if (active && payload && payload.length) {
        return (
            <Box sx={{
                bgcolor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
                border: `1px solid ${color}`,
                p: 1.5,
                borderRadius: 2,
                boxShadow: theme.shadows[4]
            }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', mb: 1 }}>{label}</Typography>
                {payload.map((entry, index) => (
                    <Typography key={index} sx={{ color: entry.color, fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {entry.name}: {Number(entry.value).toFixed(1)}
                    </Typography>
                ))}
            </Box>
        );
    }
    return null;
};

export default function Grafice() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const axisColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    const { history } = useTelemetry();

    const [radarData, setRadarData] = useState([
        { subject: 'Viziune', A: 120, fullMark: 150 },
        { subject: 'Senzori', A: 98, fullMark: 150 },
        { subject: 'Motoare', A: 86, fullMark: 150 },
        { subject: 'AI Core', A: 99, fullMark: 150 },
        { subject: 'Comunicații', A: 85, fullMark: 150 },
        { subject: 'Energie', A: 65, fullMark: 150 },
    ]);

    const [energyData, setEnergyData] = useState([
        { name: 'Motoare', uv: 15, fill: '#ff4444' },
        { name: 'Sistem AI', uv: 20, fill: '#8884d8' },
        { name: 'Senzori', uv: 10, fill: '#8dd1e1' },
        { name: 'Radio', uv: 5, fill: '#82ca9d' },
    ]);

    useEffect(() => {
        if (history.length > 0) {
            const latest = history[history.length - 1];

            setRadarData(prev => prev.map(item => ({ ...item, A: Math.min(150, Math.max(50, item.A + (Math.random() - 0.5) * 5)) })));

            const currentSpeed = Math.abs(latest.viteza || 0);
            const motorLoad = 15 + Math.min(65, currentSpeed * 20);

            setEnergyData([
                { name: 'Motoare', uv: Math.floor(motorLoad), fill: '#ff4444' },
                { name: 'Sistem AI', uv: 25 + (Math.random() * 5), fill: '#8884d8' },
                { name: 'Senzori', uv: 10, fill: '#8dd1e1' },
                { name: 'Radio', uv: 5 + (Math.random() * 3), fill: '#82ca9d' },
            ]);
        }
    }, [history]);

    const dateGrafic = history;

    return (
        <Box sx={{ p: 4, height: '100%', overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pb: 10 }}>
                {/* Header */}
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h3" sx={{ color: 'text.primary', mb: 1, fontFamily: '"Orbitron", sans-serif', fontWeight: 900, textAlign: 'center', letterSpacing: 4, textShadow: isDark ? '0 0 20px rgba(0,255,136,0.5)' : 'none' }}>
                        ANALIZĂ TELEMETRIE
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', textAlign: 'center', mb: 0, letterSpacing: 2 }}>
                        VIZUALIZARE DATE ÎN TIMP REAL
                    </Typography>
                </Box>

                { }
                <Box sx={{ width: '100%' }}>
                    <ChartCard title="ISTORIC VITEZĂ (m/s)" color="#00d4ff" icon={RiSpeedLine}>
                        <AreaChart data={dateGrafic} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gViteza" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="time" hide />
                            <YAxis stroke={axisColor} fontSize={12} />
                            <Tooltip content={<CustomTooltip color="#00d4ff" />} />
                            <Area type="monotone" dataKey="viteza" name="Viteză" stroke="#00d4ff" strokeWidth={2} fill="url(#gViteza)" isAnimationActive={false} />
                        </AreaChart>
                    </ChartCard>
                </Box>

                { }
                <Box sx={{ width: '100%' }}>
                    <ChartCard title="STATISTICI BATERIE (V)" color="#ffaa00" icon={RiBatteryChargeLine}>
                        <AreaChart data={dateGrafic} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gBaterie" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#ffaa00" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[0, 100]} stroke={axisColor} fontSize={12} />
                            <Tooltip content={<CustomTooltip color="#ffaa00" />} />
                            <Area type="monotone" dataKey="baterie" name="Voltaj" stroke="#ffaa00" strokeWidth={2} fill="url(#gBaterie)" isAnimationActive={false} />
                        </AreaChart>
                    </ChartCard>
                </Box>

                { }
                <Box sx={{ width: '100%' }}>
                    <ChartCard title="DIAGNOSTIC SUBSISTEME (HOLOGRAPHIC)" color="#00ff88" icon={RiRadarLine}>
                        <RadarChart outerRadius="80%" data={radarData}>
                            <PolarGrid stroke={axisColor} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                            <Radar name="Status" dataKey="A" stroke="#00ff88" strokeWidth={3} fill="#00ff88" fillOpacity={0.4} isAnimationActive={false} />
                            <Tooltip content={<CustomTooltip color="#00ff88" />} />
                        </RadarChart>
                    </ChartCard>
                </Box>

                { }
                <Box sx={{ width: '100%' }}>
                    <ChartCard title="UTILIZARE RESURSE (%)" color="#d600ff" icon={RiCpuLine}>
                        <LineChart data={dateGrafic} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[0, 100]} stroke={axisColor} fontSize={12} />
                            <Tooltip content={<CustomTooltip color="#d600ff" />} />
                            <Line type="monotone" dataKey="cpu" name="CPU" stroke="#00ff88" strokeWidth={2} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="ram" name="RAM" stroke="#d600ff" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ChartCard>
                </Box>

                { }
                <Box sx={{ width: '100%' }}>
                    <ChartCard title="ESTIMARE CONSUM ENERGIE (%)" color="#ff4444" icon={RiBatteryChargeLine}>
                        <RadialBarChart innerRadius="10%" outerRadius="100%" data={energyData} startAngle={180} endAngle={0}>
                            <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="uv" isAnimationActive={false} />
                            <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, top: 20 }} textStyle={{ fill: theme.palette.text.primary }} />
                            <Tooltip content={<CustomTooltip color="#ff4444" />} />
                        </RadialBarChart>
                    </ChartCard>
                </Box>

                { }
                <Box sx={{ width: '100%' }}>
                    <ChartCard title="INTENSITATE SEMNAL (-dBm)" color="#ff0055" icon={RiWifiLine}>
                        <BarChart data={dateGrafic} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[0, 100]} stroke={axisColor} fontSize={12} />
                            <Tooltip content={<CustomTooltip color="#ff0055" />} />
                            <Bar dataKey="signal" name="Semnal" fill="#ff0055" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                    </ChartCard>
                </Box>
            </Box>
        </Box>
    );
}
