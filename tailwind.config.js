/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 温和中性底色
        canvas: "#F6F5F1",
        surface: "#FFFFFF",
        ink: {
          900: "#1F2421",
          700: "#3D4742",
          500: "#6B746E",
          400: "#9AA39D",
        },
        // 主强调:平静的鼠尾草绿
        brand: {
          50: "#ECF6F1",
          100: "#D4ECE0",
          400: "#5FB897",
          500: "#3FA17C",
          600: "#2F8568",
        },
        // 状态色(不用刺眼纯红)
        status: {
          good: "#5FB897",
          warn: "#E8B04B",
          over: "#E08A6E",
        },
        macro: {
          carb: "#E8B04B",
          protein: "#6FA8C7",
          fat: "#C99BD1",
        },
      },
      borderRadius: {
        card: "22px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(31,36,33,0.04), 0 6px 20px rgba(31,36,33,0.06)",
        float: "0 8px 28px rgba(31,36,33,0.18)",
        sheet: "0 -8px 40px rgba(31,36,33,0.18)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "PingFang SC",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
