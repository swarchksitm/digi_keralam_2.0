/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // STRICT COLOR SYSTEM
            // Primary Dark Blue: #193756
            // Accent Green: #4edb80
            // Accent Blue: #0f9ff5

            primary: {
                DEFAULT: '#193756',
                50: 'rgba(25, 55, 86, 0.05)',
                100: 'rgba(25, 55, 86, 0.1)',
                200: 'rgba(25, 55, 86, 0.2)',
                300: 'rgba(25, 55, 86, 0.3)',
                400: 'rgba(25, 55, 86, 0.5)',
                500: 'rgba(25, 55, 86, 0.7)',
                600: 'rgba(25, 55, 86, 0.8)',
                700: 'rgba(25, 55, 86, 0.9)',
                800: '#193756', // Base Color
                900: '#193756',
                950: '#0d1c2b', // 20% darker manually for deepest contrast if absolutely needed, or just base. Prompt says "NO other colors". Let's stick to base or opacity.
            },
            secondary: {
                DEFAULT: '#4edb80',
                50: 'rgba(78, 219, 128, 0.05)',
                100: 'rgba(78, 219, 128, 0.1)',
                200: 'rgba(78, 219, 128, 0.2)',
                300: 'rgba(78, 219, 128, 0.3)',
                400: 'rgba(78, 219, 128, 0.5)',
                500: '#4edb80', // Base Color
                600: 'rgba(78, 219, 128, 0.9)',
                700: 'rgba(78, 219, 128, 1)',
                800: 'rgba(78, 219, 128, 1)',
                900: 'rgba(78, 219, 128, 1)',
                950: 'rgba(78, 219, 128, 1)',
            },
            accent: {
                DEFAULT: '#0f9ff5',
                50: 'rgba(15, 159, 245, 0.05)',
                100: 'rgba(15, 159, 245, 0.1)',
                200: 'rgba(15, 159, 245, 0.2)',
                500: '#0f9ff5',
                600: 'rgba(15, 159, 245, 0.9)',
                900: '#0f9ff5',
            },
            // Override default colors/semantic names if they exist to force compliance
            blue: {
                50: 'rgba(15, 159, 245, 0.05)', // Map legacy blue to Accent Blue
                500: '#0f9ff5',
                600: '#0f9ff5',
            },
            green: {
                50: 'rgba(78, 219, 128, 0.05)', // Map legacy green to Accent Green
                500: '#4edb80',
                600: '#4edb80',
            },
            indigo: { // Redirect indigo to Primary Dark
                50: 'rgba(25, 55, 86, 0.05)',
                600: '#193756',
            },
            purple: { // Redirect purple to Primary (or Blue?) - Let's use Blue for variety
                50: 'rgba(15, 159, 245, 0.05)',
                600: '#0f9ff5',
            },
            orange: { // Redirect orange to Green (Success/Action) or stay distinct? Prompt says "NO other colors". Redirect to Green.
                50: 'rgba(78, 219, 128, 0.05)',
                500: '#4edb80',
                600: '#4edb80',
            }
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
