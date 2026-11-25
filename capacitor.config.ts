import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.crosscutgame.app",
  appName: "Crosscut",
  webDir: "out",
  // İlk karede beyaz parlama olmasın: WebView ve pencere koyu zeminle açılır
  backgroundColor: "#0B0D12",
  ios: { backgroundColor: "#0B0D12" },
  server: {
    androidScheme: "https",
  },
};

export default config;
