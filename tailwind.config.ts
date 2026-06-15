import type { Config } from "tailwindcss";

// Design tokens lifted directly from the existing landing page (index.html / landing.html)
// so the app and the marketing site share one visual language.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#04070a",
        bg2: "#070d12",
        panel: "#0a1218",
        green: "#00ff6a",
        cyan: "#00e5ff",
        red: "#ff2d55",
        amber: "#ffb000",
        txt: "#c8d6cf",
        dim: "#5c6f66",
        line: "#0f2018",
        linebright: "#1a3d2b",
      },
      fontFamily: {
        grot: ['"Space Grotesk"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(0,255,106,.18)",
        "glow-sm": "0 0 12px rgba(0,255,106,.25)",
      },
      keyframes: {
        blink: { "50%": { opacity: "0" } },
        scan: { "0%": { top: "-30%" }, "100%": { top: "110%" } },
        flicker: {
          "0%,100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "94%": { opacity: "0.6" },
          "96%": { opacity: "1" },
        },
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        scan: "scan 3s linear infinite",
        flicker: "flicker 4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
