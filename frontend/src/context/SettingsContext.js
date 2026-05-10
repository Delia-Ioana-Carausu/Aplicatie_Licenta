import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem('robotAppSettings');
        return savedSettings ? JSON.parse(savedSettings) : {
            darkMode: true,
            animationsEnabled: true,
            soundEnabled: false,
            robotIP: '192.168.1.105',
            robotPort: '8000'
        };
    });

    useEffect(() => {
        localStorage.setItem('robotAppSettings', JSON.stringify(settings));
    }, [settings]);

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <SettingsContext.Provider value={{ settings, toggleSetting, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};
