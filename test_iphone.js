const { execSync } = require('child_process');
const fs = require('fs');

const cmd = `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless \
  --disable-gpu \
  --user-data-dir=/tmp/fresh_iphone_test \
  --window-size=390,844 \
  --user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" \
  --screenshot=screenshots_vercel/iphone_fresh_test.png \
  --dump-dom \
  "https://cine-tactico.vercel.app"`;

try {
  const dom = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  fs.writeFileSync('screenshots_vercel/iphone_dump.html', dom);
  console.log('DOM written, length:', dom.length);
} catch (e) {
  console.error('Exec error:', e.message);
}
