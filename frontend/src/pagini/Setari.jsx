import React, { useState } from 'react';
import { Box, Typography, Switch, FormControlLabel, Paper, Button, Grid, Slider, Divider, TextField, InputAdornment, useTheme, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { RiSettings4Line, RiShieldKeyholeLine, RiWifiLine, RiVolumeUpLine, RiEyeLine, RiCpuLine, RiDeleteBin2Line, RiRestartLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { useNotification } from '../context/NotificationContext';

const CyberSwitch = (props) => {
    const theme = useTheme();
    return (
        <Switch
            {...props}
            sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.main,
                    '&:hover': { backgroundColor: `${theme.palette.primary.main}1a` },
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: theme.palette.primary.main },
            }}
        />
    );
};

const SettingSection = ({ title, icon: Icon, children, color = '#00ff88' }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Paper component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: isDark ? 'rgba(10, 10, 20, 0.6)' : 'background.paper',
                backdropFilter: 'blur(15px)',
                borderRadius: '20px',
                border: `1px solid ${color}30`,
                boxShadow: `0 0 20px ${color}10`,
                position: 'relative',
                overflow: 'hidden'
            }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: color }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, borderBottom: `1px solid ${color}20`, pb: 1 }}>
                <Icon size={24} color={color} style={{ marginRight: 12 }} />
                <Typography variant="h6" sx={{ color: 'text.primary', fontFamily: '"Share Tech Mono", monospace', letterSpacing: 2 }}>
                    {title}
                </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                {children}
            </Box>
        </Paper>
    );
};

export default function Setari() {
    const { settings, toggleSetting, updateSetting } = useSettings();
    const { showNotification } = useNotification();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [openPassword, setOpenPassword] = useState(false);
    const [passData, setPassData] = useState({ old: '', new: '' });

    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

    const handlePing = () => {
        showNotification(`Se testează conexiunea la ${settings.robotIP}:${settings.robotPort}...`, 'info');
    };

    const handleRestart = () => {
        setConfirmDialog({
            open: true,
            title: 'Confirmare Restart',
            message: 'Ești sigur că vrei să restartezi robotul? Sistemul va deveni indisponibil pentru câteva secunde.',
            onConfirm: () => {
                showNotification('Comanda RESTART trimisă!', 'warning');
                setConfirmDialog({ ...confirmDialog, open: false });
            }
        });
    };

    const handleFormat = () => {
        setConfirmDialog({
            open: true,
            title: 'Confirmare Formatare',
            message: 'ATENȚIE! Această acțiune va șterge TOATE datele robotului. Această acțiune este ireversibilă. Ești sigur?',
            onConfirm: () => {
                showNotification('Comanda FORMATARE inițiată...', 'error');
                setConfirmDialog({ ...confirmDialog, open: false });
            }
        });
    };

    const handleChangePassword = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    parola_veche: passData.old,
                    parola_noua: passData.new
                })
            });

            const data = await res.json();

            if (res.ok) {
                showNotification('Succes: ' + data.mesaj, 'success');
                setOpenPassword(false);
                setPassData({ old: '', new: '' });
            } else {
                showNotification('Eroare: ' + data.detail, 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Eroare de conexiune la server.', 'error');
        }
    };

    return (
        <Box sx={{ p: 4, height: '100%', overflowY: 'auto' }}>
            <Box sx={{ maxWidth: 1600, mx: 'auto', pb: 10 }}>
                <Typography variant="h3" sx={{ color: 'text.primary', mb: 1, fontFamily: '"Orbitron", sans-serif', fontWeight: 900, textAlign: 'center', letterSpacing: 4, textShadow: `0 0 20px ${theme.palette.primary.main}80` }}>
                    PANOU CONTROL
                </Typography>
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', mb: 8, letterSpacing: 2 }}>
                    CONFIGURARE SISTEM & PREFERINȚE
                </Typography>

                <Grid container spacing={4} alignItems="stretch" justifyContent="center">
                    { }
                    <Grid item xs={12} md={6}>
                        <SettingSection title="INTERFAȚĂ & FEEDBACK" icon={RiEyeLine} color="#00ff88">
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ color: 'text.secondary' }}>Mod Noapte ({isDark ? 'Cyberpunk' : 'Clean Tech'})</Typography>
                                    <CyberSwitch
                                        checked={settings.darkMode}
                                        onChange={() => toggleSetting('darkMode')}
                                    />
                                </Box>
                                <Divider sx={{ bgcolor: theme.palette.divider }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ color: 'text.secondary' }}>Animații HUD Avansate</Typography>
                                    <CyberSwitch
                                        checked={settings.animationsEnabled}
                                        onChange={() => toggleSetting('animationsEnabled')}
                                    />
                                </Box>
                            </Box>
                        </SettingSection>
                    </Grid>

                    { }
                    <Grid item xs={12} md={6}>
                        <SettingSection title="SECURITATE" icon={RiShieldKeyholeLine} color="#d600ff">
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', justifyContent: 'center' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ color: 'text.secondary' }}>Criptare Protocol (SSL)</Typography>
                                    <CyberSwitch disabled />
                                </Box>
                                <Divider sx={{ bgcolor: theme.palette.divider }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ color: 'text.secondary' }}>Autentificare 2FA</Typography>
                                    <CyberSwitch />
                                </Box>
                                <Divider sx={{ bgcolor: theme.palette.divider }} />
                                <Button variant="text" onClick={() => setOpenPassword(true)} sx={{ color: '#d600ff', justifyContent: 'flex-start', px: 0, '&:hover': { bgcolor: 'rgba(214, 0, 255, 0.1)' } }}>
                                    SCHIMBĂ PAROLA ADMINISTRATOR
                                </Button>
                            </Box>
                        </SettingSection>
                    </Grid>

                    { }
                    <Grid item xs={12} md={6}>
                        <SettingSection title="CONEXIUNE ROBOT" icon={RiWifiLine} color="#00d4ff">
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="IP Robot" variant="filled" fullWidth
                                        value={settings.robotIP || ''}
                                        onChange={(e) => updateSetting('robotIP', e.target.value)}
                                        sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, input: { color: 'text.primary' }, label: { color: '#00d4ff' } }}
                                    />
                                    <TextField
                                        label="Port" variant="filled" sx={{ width: 120, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, input: { color: 'text.primary' }, label: { color: '#00d4ff' } }}
                                        value={settings.robotPort || ''}
                                        onChange={(e) => updateSetting('robotPort', e.target.value)}
                                    />
                                </Box>
                                <Button variant="outlined" fullWidth onClick={handlePing} sx={{
                                    borderColor: '#00d4ff', color: '#00d4ff', py: 2,
                                    '&:hover': { bgcolor: 'rgba(0, 212, 255, 0.1)', borderColor: '#00d4ff', boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)' }
                                }}>
                                    TESTARE CONEXIUNE PING
                                </Button>
                            </Box>
                        </SettingSection>
                    </Grid>

                    { }
                    <Grid item xs={12} md={6}>
                        <SettingSection title="ZONA PERICULOASĂ" icon={RiSettings4Line} color="#ff0055">
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'error.main', mb: 3 }}>
                                    Aceste acțiuni sunt ireversibile și pot afecta funcționarea robotului. Procedați cu atenție.
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Button fullWidth variant="outlined" color="error" startIcon={<RiRestartLine />} onClick={handleRestart}
                                            sx={{ py: 2, borderColor: '#ff0055', color: '#ff0055', '&:hover': { bgcolor: 'rgba(255,0,85,0.1)' } }}>
                                            RESTART
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Button fullWidth variant="contained" color="error" startIcon={<RiDeleteBin2Line />} onClick={handleFormat}
                                            sx={{ py: 2, bgcolor: '#ff0055', '&:hover': { bgcolor: '#cc0044', boxShadow: '0 0 20px #ff0055' } }}>
                                            FORMAT
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </SettingSection>
                    </Grid>
                </Grid>

                { }
                <Dialog open={openPassword} onClose={() => setOpenPassword(false)} PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 2 } }}>
                    <DialogTitle sx={{ color: 'text.primary' }}>Schimbă Parola</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus margin="dense" label="Parola Veche" type="password" fullWidth variant="outlined"
                            value={passData.old} onChange={(e) => setPassData({ ...passData, old: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense" label="Parola Nouă" type="password" fullWidth variant="outlined"
                            value={passData.new} onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenPassword(false)} sx={{ color: 'text.secondary' }}>Anulează</Button>
                        <Button onClick={handleChangePassword} variant="contained" color="primary">
                            Salvează
                        </Button>
                    </DialogActions>
                </Dialog>

                { }
                <Dialog
                    open={confirmDialog.open}
                    onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                    PaperProps={{
                        sx: {
                            bgcolor: isDark ? 'rgba(20, 10, 20, 0.95)' : 'background.paper',
                            borderRadius: 2,
                            border: '1px solid #ff0055',
                            boxShadow: '0 0 30px rgba(255, 0, 85, 0.2)'
                        }
                    }}
                >
                    <DialogTitle sx={{ color: '#ff0055', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RiSettings4Line /> {confirmDialog.title}
                    </DialogTitle>
                    <DialogContent>
                        <Typography sx={{ color: 'text.primary' }}>
                            {confirmDialog.message}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} sx={{ color: 'text.secondary' }}>
                            NU, ANULEAZĂ
                        </Button>
                        <Button onClick={confirmDialog.onConfirm} variant="contained" color="error" sx={{ bgcolor: '#ff0055', '&:hover': { bgcolor: '#d40045' } }}>
                            DA, CONTINUĂ
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}
