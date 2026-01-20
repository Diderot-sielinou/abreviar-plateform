import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 * 
 * Theme: LaunchLayer-inspired warm color palette
 * Colors: Obsidian, Mahogany, Tangerine, Amber, Rust
 */

const config: Config = {
  darkMode: ["class","[data-theme='dark']"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // =================================
      // BRAND COLORS - LaunchLayer Style
      // =================================
      colors: {
        // Deep black - Background
        obsidian: {
          DEFAULT: "#0E0503",
          50: "#2A1E1A",
          100: "#241916",
          200: "#1E1412",
          300: "#180F0E",
          400: "#120A09",
          500: "#0E0503",
          600: "#0B0402",
          700: "#080302",
          800: "#050201",
          900: "#020101",
          950: "#010000",
        },
        // Rich brown - Secondary
        mahogany: {
          DEFAULT: "#7C3805",
          50: "#F5E6D9",
          100: "#EDCFB3",
          200: "#DBA26A",
          300: "#C87525",
          400: "#A55A10",
          500: "#7C3805",
          600: "#632D04",
          700: "#4A2203",
          800: "#311602",
          900: "#180B01",
          950: "#0C0500",
        },
        // Vibrant orange - Primary
        tangerine: {
          DEFAULT: "#D17303",
          50: "#FEF3E2",
          100: "#FDE7C5",
          200: "#FBCF8B",
          300: "#F9B751",
          400: "#F79F17",
          500: "#D17303",
          600: "#A75C02",
          700: "#7D4502",
          800: "#532E01",
          900: "#2A1701",
          950: "#150C00",
        },
        // Golden - Highlights
        amber: {
          DEFAULT: "#E19547",
          50: "#FDF8F3",
          100: "#FAEEE0",
          200: "#F5D4B5",
          300: "#EFBA8A",
          400: "#EAA060",
          500: "#E19547",
          600: "#D47A1F",
          700: "#A55F18",
          800: "#764412",
          900: "#47290B",
          950: "#301C07",
        },
        // Earthy red-brown - Gradients
        rust: {
          DEFAULT: "#9B4F06",
          50: "#F8E8D8",
          100: "#F2D1B1",
          200: "#E5A363",
          300: "#D17518",
          400: "#B66208",
          500: "#9B4F06",
          600: "#7C3F05",
          700: "#5D2F04",
          800: "#3E2003",
          900: "#1F1001",
          950: "#0F0801",
        },

        // Semantic Colors (CSS Variables)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      // =================================
      // TYPOGRAPHY
      // =================================
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "Consolas", "monospace"],
      },

      // =================================
      // BORDER RADIUS
      // =================================
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // =================================
      // ANIMATIONS
      // =================================
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(209, 115, 3, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(209, 115, 3, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },

      // =================================
      // BACKGROUND PATTERNS
      // =================================
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #D17303 0%, #9B4F06 50%, #7C3805 100%)",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
};

export default config;
