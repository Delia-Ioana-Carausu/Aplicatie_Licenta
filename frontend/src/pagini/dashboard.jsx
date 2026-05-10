import React, { useEffect, useState } from 'react';
import { Typography, Grid, Paper, Box, LinearProgress } from '@mui/material';
import CameraFeed from '../componente/camera';
import { motion } from 'framer-motion';

export default function PanouComanda() {
  const [sursaImagine, setSursaImagine] = useState(null);
  const [statistici, setStatistici] = useState({
    baterie: 85,
    mancare: true,
    miscare: 'Stationar',
    senzori: {},
    viteza: 0
  });

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/client');

    ws.onopen = () => {
      console.log('Conectat la WebSocket');
    };

    ws.onmessage = (eveniment) => {
      try {
        const date = JSON.parse(eveniment.data);
        if (date.type === 'video') {
          setSursaImagine(`data:image/jpeg;base64,${date.payload}`);
        } else if (date.type === 'telemetry') {
          setStatistici(prev => ({
            ...prev,
            baterie: date.payload.battery,
            mancare: date.payload.mancare,
            senzori: date.payload.sensors,
            viteza: date.payload.velocity
          }));
        }
      } catch (err) {
        console.error("Eroare parsare mesaj WS:", err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket deconectat');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      p: 3,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1f 100%)',
      color: '#fff'
    }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Typography variant="h3" gutterBottom sx={{ fontFamily: '"Rajdhani", sans-serif', fontWeight: 700, letterSpacing: 3, textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>
          CENTRUL DE <span style={{ color: '#00ff88' }}>COMANDĂ ROBOT</span>
        </Typography>
      </motion.div>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <Paper sx={{
              p: 3,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white'
            }}>
              <Typography variant="h5" sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>STATUS SISTEM</Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>NIVEL BATERIE</Typography>
                  <Typography sx={{ color: statistici.baterie > 20 ? '#00ff88' : '#ff4444' }}>{statistici.baterie}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={statistici.baterie}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: statistici.baterie > 20 ? '#00ff88' : '#ff4444' }
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>VITEZĂ DEPLASARE</Typography>
                <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
                  {statistici.viteza ? statistici.viteza.toFixed(2) : '0.00'} <span style={{ fontSize: '1rem' }}>m/s</span>
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>CONTAINER MÂNCARE</Typography>
                <Typography variant="h6" sx={{ color: statistici.mancare ? '#00d4ff' : '#ff4444' }}>
                  {statistici.mancare ? "ÎNCĂRCAT" : "GOL"}
                </Typography>
              </Box>

              <Typography sx={{ mt: 3, mb: 1, fontWeight: 'bold', color: '#00d4ff' }}>SENZORI PROXIMITATE</Typography>
              {statistici.senzori && Object.keys(statistici.senzori).length > 0 ? (
                Object.entries(statistici.senzori).map(([k, v]) => (
                  <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {k === 'fata' ? 'FAȚĂ' : k === 'spate' ? 'SPATE' : k === 'stanga' ? 'STÂNGA' : k === 'dreapta' ? 'DREAPTA' : k.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: v !== null && v < 2 ? '#ffb74d' : 'white' }}>
                      {v !== null ? `${v.toFixed(2)}m` : 'LIBER'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>Se scanează...</Typography>
              )}
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={8}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }}>
            <CameraFeed imageSrc={sursaImagine} />
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
