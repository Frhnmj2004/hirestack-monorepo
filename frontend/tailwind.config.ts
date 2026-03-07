import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          midnight: "#0B0726",
          indigo: "#1A1147",
          royal: "#2E1F6B",
          violet: "#5A46DA",
          lavender: "#9B8CFF",
          white: "#FFFFFF",
          gray: "#E6E6F0",
          light: {
            bg: "#F7F8FC",
            surface: "#FFFFFF",
            textPrimary: "#1A1A2E",
            textSecondary: "#6B6B8D",
          },
        },
        /* Pastel palette additions */
        pastel: {
          violet: "#E8E4FF",    // soft violet tint
          rose: "#FFE4F0",      // soft rose tint
          sky: "#E0F4FF",       // soft sky tint
          emerald: "#D6F5EC",   // soft emerald tint
          amber: "#FFF4D6",     // soft amber tint
          lavender: "#F0EEFF",  // near-white lavender
          peach: "#FFE8E0",     // warm peach
          mint: "#D8F5EE",      // mint tint
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "serif"],
      },
      boxShadow: {
        glow: "0 0 24px 4px rgba(90, 70, 218, 0.35)",
        "glow-sm": "0 0 12px 2px rgba(90, 70, 218, 0.25)",
        "glow-lg": "0 0 40px 8px rgba(90, 70, 218, 0.45)",
        glass: "0 8px 32px rgba(90, 70, 218, 0.08), 0 2px 8px rgba(0,0,0,0.04)",
        "glass-hover": "0 12px 40px rgba(90, 70, 218, 0.15), 0 4px 12px rgba(0,0,0,0.06)",
        "card-violet": "0 4px 20px rgba(90, 70, 218, 0.15)",
        "card-rose": "0 4px 20px rgba(244, 114, 182, 0.15)",
        "card-sky": "0 4px 20px rgba(56, 189, 248, 0.15)",
        "card-emerald": "0 4px 20px rgba(52, 211, 153, 0.15)",
        "card-amber": "0 4px 20px rgba(251, 191, 36, 0.15)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "noise-texture": "url('/assets/noise.svg')",
        "gradient-brand": "linear-gradient(135deg, #5A46DA 0%, #7B6CFF 50%, #9B8CFF 100%)",
        "gradient-brand-soft": "linear-gradient(135deg, rgba(90,70,218,0.12) 0%, rgba(155,140,255,0.08) 100%)",
        "gradient-rose": "linear-gradient(135deg, rgba(251,113,133,0.15) 0%, rgba(244,114,182,0.08) 100%)",
        "gradient-sky": "linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(147,217,250,0.08) 100%)",
        "gradient-emerald": "linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(110,231,183,0.08) 100%)",
        "gradient-amber": "linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(253,224,71,0.08) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-in-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "pulse-glow": "pulseGlow 2s infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { transform: "translateY(-8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideInRight: {
          from: { transform: "translateX(16px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 12px 2px rgba(90,70,218,0.25)" },
          "50%": { boxShadow: "0 0 28px 6px rgba(90,70,218,0.55)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
