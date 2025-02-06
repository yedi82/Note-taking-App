import React, { createContext, useContext, useEffect, useState } from 'react';

const themes = [
    { name: 'Default', hex: '0d3e6a', primary: 'bg-[#0d3e6a]', secondary: 'bg-[#5B83A6]', text: 'text-[#3D9DF2]' },
    { name: 'Ocean', hex: '3b82f6', primary: 'bg-blue-600', secondary: 'bg-blue-400', text: 'text-blue-600' },
    { name: 'Forest', hex: '16a34a', primary: 'bg-green-600', secondary: 'bg-green-400', text: 'text-green-600' },
    { name: 'Sunset', hex: 'ea580c', primary: 'bg-orange-600', secondary: 'bg-orange-400', text: 'text-orange-600' },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    const [currentTheme, setCurrentTheme] = useState(() => {
        const saved = localStorage.getItem('currentTheme');
        return saved ? JSON.parse(saved) : themes[0];
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        localStorage.setItem('currentTheme', JSON.stringify(currentTheme));

        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [darkMode, currentTheme]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode, currentTheme, setCurrentTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};