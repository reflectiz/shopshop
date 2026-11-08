/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Semantic colour tokens backed by CSS custom properties, so one set of utility
      // classes renders in each industry's palette. FlavorShell sets the variables per
      // site; src/index.css holds the retail defaults for anything rendered outside it.
      //
      // The variables MUST hold space-separated RGB channel triplets ('79 70 229'), not hex
      // and not rgb(...), or <alpha-value> breaks and bg-brand/10 emits invalid CSS.
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          hover: 'rgb(var(--brand-hover) / <alpha-value>)',
          subtle: 'rgb(var(--brand-subtle) / <alpha-value>)',
        },
        action: {
          DEFAULT: 'rgb(var(--action) / <alpha-value>)',
          hover: 'rgb(var(--action-hover) / <alpha-value>)',
        },
        heroFrom: 'rgb(var(--hero-from) / <alpha-value>)',
        heroVia: 'rgb(var(--hero-via) / <alpha-value>)',
        heroTo: 'rgb(var(--hero-to) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
