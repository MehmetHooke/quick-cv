/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind class'larını tarayacağı yollar:
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00B4D8",
        dark: "#0F172A",
        light: "#F8FAFC",
      },
    },
  },
  plugins: [],
};
