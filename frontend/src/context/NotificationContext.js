import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, useTheme, Slide } from '@mui/material';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

function SlideTransition(props) {
    return <Slide {...props} direction="up" />;
}

export const NotificationProvider = ({ children }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [config, setConfig] = useState({
        open: false,
        message: '',
        severity: 'info', 
    });

    const showNotification = (message, severity = 'info') => {
        setConfig({ open: true, message, severity });
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setConfig(prev => ({ ...prev, open: false }));
    };
    const alertSx = {
        width: '100%',
        color: 'text.primary',
        borderRadius: 2,
        boxShadow: isDark
            ? `0 0 15px ${theme.palette[config.severity].main}40` 
            : '0 4px 12px rgba(0,0,0,0.1)', 
        border: isDark
            ? `1px solid ${theme.palette[config.severity].main}80`
            : `1px solid ${theme.palette[config.severity].light}`,
        bgcolor: isDark
            ? 'rgba(10, 15, 30, 0.95)' 
            : 'background.paper',
        '& .MuiAlert-icon': {
            color: theme.palette[config.severity].main
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar
                open={config.open}
                autoHideDuration={4000}
                onClose={handleClose}
                TransitionComponent={SlideTransition}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ bottom: { xs: 90, md: 24 } }} 
            >
                <Alert
                    onClose={handleClose}
                    severity={config.severity}
                    variant={isDark ? "outlined" : "standard"}
                    sx={alertSx}
                >
                    {config.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};
