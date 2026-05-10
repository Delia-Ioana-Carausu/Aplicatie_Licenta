import React from 'react';
import { Box, Tooltip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiDashboardLine, RiSensorLine, RiSettings4Line, RiLogoutBoxLine, RiLineChartLine } from 'react-icons/ri';

const SidebarItem = ({ icon: Icon, label, path, activ, onClick }) => {
    const theme = useTheme();
    return (
        <Tooltip title={label} placement="right" arrow>
            <Box
                onClick={onClick}
                component={motion.div}
                whileHover={{ scale: 1.1, backgroundColor: `${theme.palette.primary.main}1a` }} // 10% opacity
                whileTap={{ scale: 0.95 }}
                sx={{
                    p: 1.5,
                    mb: 2,
                    borderRadius: '12px',
                    color: activ ? theme.palette.primary.main : theme.palette.text.secondary,
                    cursor: 'pointer',
                    borderLeft: activ ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}
            >
                <Icon size={28} />
            </Box>
        </Tooltip>
    );
};

export default function LayoutNou({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Box sx={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            bgcolor: 'background.default',
            color: 'text.primary'
        }}>
            { }
            <Box component={motion.div}
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                sx={{
                    width: '80px',
                    height: '100%',
                    flexShrink: 0,
                    background: theme.palette.mode === 'dark' ? 'rgba(20, 20, 35, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(15px)',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 4,
                    zIndex: 100
                }}>
                { }
                <Box sx={{ mb: 6, p: 1, borderRadius: '50%', border: `1px solid ${theme.palette.primary.main}`, boxShadow: `0 0 10px ${theme.palette.primary.main}4d` }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
                        <Box sx={{ width: 20, height: 20, bgcolor: theme.palette.primary.main, borderRadius: '50%' }} />
                    </motion.div>
                </Box>

                { }
                <Box sx={{ flexGrow: 1 }}>
                    <SidebarItem
                        icon={RiDashboardLine}
                        label="Comandă"
                        path="/"
                        activ={location.pathname === '/'}
                        onClick={() => navigate('/')}
                    />
                    <SidebarItem
                        icon={RiSensorLine}
                        label="Senzori"
                        path="/senzori"
                        activ={location.pathname === '/senzori'}
                        onClick={() => navigate('/senzori')}
                    />
                    <SidebarItem
                        icon={RiLineChartLine}
                        label="Grafice"
                        path="/grafice"
                        activ={location.pathname === '/grafice'}
                        onClick={() => navigate('/grafice')}
                    />
                    <SidebarItem
                        icon={RiSettings4Line}
                        label="Setări"
                        path="/setari"
                        activ={location.pathname === '/setari'}
                        onClick={() => navigate('/setari')}
                    />
                </Box>

                { }
                <SidebarItem
                    icon={RiLogoutBoxLine}
                    label="Deconectare"
                    path="/logout"
                    activ={false}
                    onClick={handleLogout}
                />
            </Box>

            { }
            <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
                { }
                <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: theme.palette.mode === 'dark'
                        ? 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.03) 0%, rgba(0,0,0,0) 70%)'
                        : 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.03) 0%, rgba(0,0,0,0) 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
