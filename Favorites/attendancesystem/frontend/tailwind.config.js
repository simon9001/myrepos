/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Primary (Notion purple) ───────────────────────────────
        primary: {
          DEFAULT: '#5645d4',
          pressed:  '#4534b3',
          deep:     '#3a2a99',
        },
        // ── Brand ────────────────────────────────────────────────
        brand: {
          navy:          '#0a1530',
          'navy-deep':   '#070f24',
          'navy-mid':    '#1a2a52',
          orange:        '#dd5b00',
          'orange-deep': '#793400',
          pink:          '#ff64c8',
          'pink-deep':   '#a02e6d',
          purple:        '#7b3ff2',
          'purple-300':  '#d6b6f6',
          'purple-800':  '#391c57',
          teal:          '#2a9d99',
          green:         '#1aae39',
          yellow:        '#f5d75e',
          brown:         '#523410',
        },
        // ── Card tints (pastel) ───────────────────────────────────
        card: {
          peach:        '#ffe8d4',
          rose:         '#fde0ec',
          mint:         '#d9f3e1',
          lavender:     '#e6e0f5',
          sky:          '#dcecfa',
          yellow:       '#fef7d6',
          'yellow-bold':'#f9e79f',
          cream:        '#f8f5e8',
          gray:         '#f0eeec',
        },
        // ── Surface ───────────────────────────────────────────────
        canvas:           '#ffffff',
        surface:          '#f6f5f4',
        'surface-soft':   '#fafaf9',
        hairline:         '#e5e3df',
        'hairline-soft':  '#ede9e4',
        'hairline-strong':'#c8c4be',
        // ── Ink ──────────────────────────────────────────────────
        ink: {
          DEFAULT: '#1a1a1a',
          deep:    '#000000',
        },
        charcoal: '#37352f',
        slate:    '#5d5b54',
        steel:    '#787671',
        stone:    '#a4a097',
        muted:    '#bbb8b1',
        // ── Semantic ─────────────────────────────────────────────
        success: '#1aae39',
        warning: '#dd5b00',
        danger:  '#e03131',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'Segoe UI', 'Helvetica', 'sans-serif'],
      },
      fontSize: {
        'hero':  ['80px', { lineHeight: '1.05', letterSpacing: '-2px', fontWeight: '600' }],
        'h1':    ['48px', { lineHeight: '1.15', letterSpacing: '-0.5px', fontWeight: '600' }],
        'h2':    ['36px', { lineHeight: '1.20', letterSpacing: '-0.5px', fontWeight: '600' }],
        'h3':    ['28px', { lineHeight: '1.25', fontWeight: '600' }],
        'h4':    ['22px', { lineHeight: '1.30', fontWeight: '600' }],
        'h5':    ['18px', { lineHeight: '1.40', fontWeight: '600' }],
        'subtitle': ['18px', { lineHeight: '1.50', fontWeight: '400' }],
      },
      borderRadius: {
        'xs':   '4px',
        'sm':   '6px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        'xxl':  '20px',
        'xxxl': '24px',
      },
      boxShadow: {
        'card':   'rgba(15,15,15,0.08) 0px 4px 12px 0px',
        'mockup': 'rgba(15,15,15,0.20) 0px 24px 48px -8px',
        'modal':  'rgba(15,15,15,0.16) 0px 16px 48px -8px',
        'hover':  'rgba(15,15,15,0.04) 0px 1px 2px 0px',
      },
    },
  },
  plugins: [],
};
