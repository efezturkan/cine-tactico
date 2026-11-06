#!/usr/bin/env bash
# Tek komutla iOS simülatörü güncelle: web build -> cap sync -> Xcode derleme -> kur -> aç.
# Kullanım: npm run ios:sim            (açık simülatörü kullanır, yoksa iPhone 17'yi açar)
#           SIM_NAME="iPhone 17 Pro" npm run ios:sim
set -euo pipefail

cd "$(dirname "$0")/.."
BUNDLE_ID="com.cinetactico.game"
SIM_NAME="${SIM_NAME:-iPhone 17}"
DERIVED="ios/App/build/sim"

# next dev, next build ile aynı .next klasörünü kullanır; çakışmasın diye uyar.
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "⚠️  'next dev' çalışıyor. Build .next klasörünü bozar; önce durdur (pkill -f 'next dev')." >&2
  exit 1
fi

echo "1/5 Web build (static export)…"
npm run build >/dev/null

echo "2/5 Capacitor sync…"
npx cap sync ios >/dev/null

# Açık simülatör varsa onu, yoksa SIM_NAME'i aç.
UDID="$(xcrun simctl list devices booted | grep -Eo '[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}' | head -1 || true)"
if [ -z "$UDID" ]; then
  UDID="$(xcrun simctl list devices available | grep "$SIM_NAME (" | grep -Eo '[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}' | head -1 || true)"
  [ -n "$UDID" ] || { echo "Simülatör bulunamadı: $SIM_NAME" >&2; exit 1; }
  echo "   Simülatör açılıyor ($SIM_NAME)…"
  xcrun simctl boot "$UDID"
fi
# Eski Xcode sürümlerinde Simulator.app ayrı bir pencere açar. Xcode 27'de ayrı uygulama yoktur:
# cihaz arka planda çalışır ve Claude'un simülatör panelinden izlenir. Pencere açılamaması hata değildir.
SIM_APP="$(xcode-select -p)/Applications/Simulator.app"
if [ -d "$SIM_APP" ]; then
  open "$SIM_APP"
else
  echo "   Cihaz arka planda açık (ayrı Simulator penceresi yok; Claude simülatör panelinden izle)."
fi

echo "3/5 Xcode derleme (Debug, simülatör)…"
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
  -destination "id=$UDID" -derivedDataPath "$DERIVED" -quiet build

APP_PATH="$(find "$DERIVED/Build/Products" -maxdepth 2 -name 'App.app' -path '*iphonesimulator*' | head -1)"
[ -n "$APP_PATH" ] || { echo "App.app bulunamadı" >&2; exit 1; }

echo "4/5 Kurulum…"
xcrun simctl terminate "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl install "$UDID" "$APP_PATH"

echo "5/5 Açılıyor…"
xcrun simctl launch "$UDID" "$BUNDLE_ID"
echo "✅ Simülatör güncel: $(git rev-parse --short HEAD)"
