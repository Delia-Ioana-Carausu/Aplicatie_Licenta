import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const varianteContainer = {
    ascuns: { opacity: 0, y: 50 },
    vizibil: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15, staggerChildren: 0.1 }
    },
    iesire: { opacity: 0, y: -50 }
};

const varianteElement = {
    ascuns: { opacity: 0, x: -20 },
    vizibil: { opacity: 1, x: 0 }
};

export default function Autentificare() {
    const [esteInregistrare, setEsteInregistrare] = useState(false);
    const [numeUtilizator, setNumeUtilizator] = useState('');
    const [parola, setParola] = useState('');
    const navigare = useNavigate();
    const { showNotification } = useNotification();

    const gestioneazaTrimitere = async (e) => {
        e.preventDefault();

        try {
            if (esteInregistrare) {
                await axios.post('http://localhost:8000/register', {
                    nume_utilizator: numeUtilizator,
                    parola: parola
                });
                setEsteInregistrare(false);
                showNotification("Cont creat cu succes! Te poți conecta.", "success");
            } else {
                const dateFormular = new FormData();
                dateFormular.append('username', numeUtilizator);
                dateFormular.append('password', parola);
                const raspuns = await axios.post('http://localhost:8000/token', dateFormular);
                localStorage.setItem('token', raspuns.data.access_token);
                showNotification("Conectare reușită! Bine ai venit.", "success");
                navigare('/');
            }
        } catch (err) {
            console.error(err);
            const mesajEroare = err.response?.data?.detail || "Eroare la conectare. Verifică datele.";
            showNotification(mesajEroare === "Incorrect username or password" ? "Nume utilizator sau parolă incorectă" : mesajEroare, "error");
        }
    };

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            { }
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,255,136,0.1) 0%, rgba(0,0,0,0) 70%)',
                    zIndex: 0
                }}
            />

            <motion.div
                variants={varianteContainer}
                initial="ascuns"
                animate="vizibil"
                exit="iesire"
                style={{ zIndex: 1 }}
            >
                <Paper elevation={24} sx={{
                    p: 4,
                    width: 400,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }}>
                    <Box component="form" onSubmit={gestioneazaTrimitere} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        <motion.div variants={varianteElement}>
                            <Typography variant="h4" sx={{
                                fontWeight: 700,
                                color: '#fff',
                                textAlign: 'center',
                                fontFamily: '"Rajdhani", sans-serif',
                                letterSpacing: 2
                            }}>
                                {esteInregistrare ? 'ÎNREGISTRARE' : 'AUTENTIFICARE'}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                                Centru Comandă Robot
                            </Typography>
                        </motion.div>



                        <motion.div variants={varianteElement}>
                            <TextField
                                label="Utilizator"
                                variant="outlined"
                                fullWidth
                                value={numeUtilizator}
                                onChange={(e) => setNumeUtilizator(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                        '&:hover fieldset': { borderColor: 'white' },
                                        '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                                    },
                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#00ff88' }
                                }}
                            />
                        </motion.div>

                        <motion.div variants={varianteElement}>
                            <TextField
                                label="Parolă"
                                type="password"
                                variant="outlined"
                                fullWidth
                                value={parola}
                                onChange={(e) => setParola(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                        '&:hover fieldset': { borderColor: 'white' },
                                        '&.Mui-focused fieldset': { borderColor: '#00ff88' },
                                    },
                                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#00ff88' }
                                }}
                            />
                        </motion.div>

                        <motion.div variants={varianteElement} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{
                                    background: 'linear-gradient(90deg, #00ff88 0%, #00d4ff 100%)',
                                    color: '#000',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem'
                                }}
                            >
                                {esteInregistrare ? 'Creează Cont' : 'Conectare Sistem'}
                            </Button>
                        </motion.div>

                        <motion.div variants={varianteElement}>
                            <Button
                                fullWidth
                                sx={{ color: 'rgba(255,255,255,0.6)' }}
                                onClick={() => setEsteInregistrare(!esteInregistrare)}
                            >
                                {esteInregistrare ? 'Ai deja cont? Conectează-te' : 'Operator nou? Înregistrare'}
                            </Button>
                        </motion.div>

                    </Box>
                </Paper>
            </motion.div>
        </Box>
    );
}
