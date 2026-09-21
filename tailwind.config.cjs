/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // App Router pages, layouts, route-colocated components (e.g. app/components/,
    // app/invest/components/, app/trade/components/, app/drive/components/)
    "./app/**/*.{js,ts,jsx,tsx}",
    // Reserved for any future top-level shared components
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        tesla: {
          red: "#E82127",
          dark: "#171A20",
          light: "#F4F4F4"
        }
      }
    }
  },
  plugins: []
};
