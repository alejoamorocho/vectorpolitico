/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // ─── Papel ───
        paper: {
          DEFAULT: '#f5efe2',
          raised: '#faf5e8',
          deep: '#ede4cc',
          cream: '#fdfaf1',
        },
        // ─── Tinta ───
        ink: {
          DEFAULT: '#1a1510',
          soft: '#332b22',
          mute: '#6b5f4e',
          faint: '#a69a85',
        },
        rule: {
          DEFAULT: '#d4cab0',
          soft: '#e6dcc5',
        },
        // ─── Cuadrantes gazette (pastel sobrio) ───
        q: {
          'auth-left': '#ebd9d9',
          'auth-left-ink': '#5c1818',
          'auth-right': '#d9dfe8',
          'auth-right-ink': '#1a2e4f',
          'lib-left': '#d9e3dc',
          'lib-left-ink': '#1d3a26',
          'lib-right': '#ebddb9',
          'lib-right-ink': '#4a3608',
        },
        // ─── Puntos de figura ───
        self: '#1e3556',
        evidenced: '#6b1f1f',
        // Alias canvas/line para que layouts viejos sigan funcionando
        canvas: {
          DEFAULT: '#f5efe2',
          raised: '#fdfaf1',
        },
        line: '#d4cab0',
        mute: '#6b5f4e',
      },
      fontFamily: {
        display: ['"Playfair Display"', '"EB Garamond"', 'Georgia', 'serif'],
        serif: ['"EB Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        '8xl': '1400px',
        prose: '65ch',
      },
      boxShadow: {
        soft: '0 1px 0 rgb(26 21 16 / 0.04), 0 2px 8px rgb(26 21 16 / 0.04)',
        raised: '0 1px 2px rgb(26 21 16 / 0.06), 0 8px 24px rgb(26 21 16 / 0.08)',
        float: '0 24px 80px rgb(26 21 16 / 0.14)',
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.012em',
        wider: '0.05em',
        widest: '0.22em',
      },
    },
  },
  plugins: [],
};
