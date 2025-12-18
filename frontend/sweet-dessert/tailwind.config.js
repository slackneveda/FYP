/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          light: "var(--primary-light)",
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
        // Custom dessert theme colors
        dessert: {
          chocolate: "#993809",
          vanilla: "#FFF8F0",
          caramel: "#D2691E",
          strawberry: "#FFB6C1",
          cream: "#FFFDD0",
          mint: "#98FB98",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {height: "0"},
          to: {height: "var(--radix-accordion-content-height)"},
        },
        "accordion-up": {
          from: {height: "var(--radix-accordion-content-height)"},
          to: {height: "0"},
        },
        "fade-in": {
          "0%": {opacity: "0"},
          "100%": {opacity: "1"},
        },
        "slide-up": {
          "0%": {transform: "translateY(10px)", opacity: "0"},
          "100%": {transform: "translateY(0)", opacity: "1"},
        },
        shimmer: {
          "0%": {"background-position": "-200% 0"},
          "100%": {"background-position": "200% 0"},
        },
        aurora: {
          "0%": {"background-position": "0% 50%"},
          "25%": {"background-position": "50% 100%"},
          "50%": {"background-position": "100% 50%"},
          "75%": {"background-position": "50% 0%"},
          "100%": {"background-position": "0% 50%"},
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-in-out",
        "slide-up": "slide-up 0.5s ease-out",
        shimmer: "shimmer 2s infinite",
        aurora: "aurora 8s ease-in-out infinite",
      },
      animationDelay: {
        100: "100ms",
        200: "200ms",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
