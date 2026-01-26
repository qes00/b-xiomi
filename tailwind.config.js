/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                denim: {
                    300: '#a6c2e0',
                    400: '#7fa6c8',
                    500: '#5b8ab5', // Base denim
                    600: '#3c6e96',
                    700: '#2a4f6e',
                    800: '#1e3850',
                    900: '#0f1c29',
                },
                gold: {
                    50: '#fbf9f3',
                    100: '#f5f0e1',
                    200: '#eadfb6',
                    300: '#dec686',
                    400: '#d3ad5b',
                    500: '#cd9f33', /* BASE: Dorado Metálico / Antique Gold */
                    600: '#b08128',
                    700: '#8d6323',
                    800: '#744f23',
                    900: '#634222',
                    950: '#39230f',
                },
                /* SECOND SUBTYPE: Sun Gold (Brighter, ceremonial yellow) */
                sun: {
                    400: '#ffe14c',
                    500: '#ffd700',
                    600: '#e6c200',
                },
                bone: '#f4f1ea'
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'fade-in-up': 'fadeInUp 0.5s ease-out',
                'slow-zoom': 'slowZoom 20s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slowZoom: {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.1)' },
                }
            }
        }
    },
    plugins: [],
}
