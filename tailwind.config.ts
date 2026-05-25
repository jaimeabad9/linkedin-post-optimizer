import type { Config } from 'tailwindcss'

// Brand colors from Jaime Abad Brand Guidelines v1.0
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        'brand-dark':       '#1E2A3A', // Slate  — backgrounds, headings
        'brand-dark-alt':   '#2D3F52', // Slate Light — secondary dark areas
        'brand-teal':       '#3D7F8F', // Teal — accents, CTAs, highlights
        'brand-teal-light': '#D4E8EC', // Teal Light — subtle backgrounds
        'brand-stone':      '#F2EFE9', // Stone — warm light backgrounds
        'brand-charcoal':   '#4A5568', // Charcoal — body text, captions
        'brand-grey':       '#E8EDF2', // Light Grey — borders, dividers
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
