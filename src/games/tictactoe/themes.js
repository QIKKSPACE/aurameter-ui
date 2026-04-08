/**
 * themes.js
 * Single dark theme derived from aurameter-ui dark theme.
 * Theme will be controlled by the parent app in the future.
 */

const DARK_THEME = {
    id: 'dark',
    name: 'Dark Theme',
    boardColor: '#013647',
    boardBorder: '#333333',
    cellBg: '#1e1e1e',
    cellBorder: '#333333',
    xColor: '#E94560',
    oColor: '#1CA69A',
    glowColor: 'rgba(151, 222, 255, 0.4)',
    xGlowColor: 'rgba(233, 69, 96, 0.5)',
    oGlowColor: 'rgba(28, 166, 154, 0.5)',
    bgGradient: ['#121212', '#121212', '#0a0a0a'],
    textColor: '#ffffff',
    textSecondary: '#cccccc',
    accentColor: '#97deff',
    buttonGradient: ['#1CA69A', '#138178'],
    cardBg: 'rgba(30, 30, 30, 0.85)',
    winLineColor: '#97deff',
};

export const getTheme = () => DARK_THEME;
export default DARK_THEME;
