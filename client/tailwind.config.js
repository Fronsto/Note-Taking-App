const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                gray: {
                    900: '#1a1919',
                    800: '#212121',
                    700: '#323232',
                    600: '#4f545c',
                    400: '#989898',
                    // 400: '#d4d7dc',
                    300: '#e3e5e8',
                    200: '#E8E8E8',
                    100: '#F4F4F2',
                },
                blue: {
                    800: '#0F4C75',
                    700: '#0D7377',
                    400: '#3282B8',
                    300: '#14FFEC',
                    100: '#BBE1FA',
                },
            },
            spacing: {
                88: '22rem',
            },
        },
    },
    plugins: [],
};
