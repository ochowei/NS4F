const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
  const browser = env.browser;
  if (!browser) {
    throw new Error('Please specify a browser target with --env browser=<browser_name>');
  }
  const buildDir = path.resolve(__dirname, 'dist', browser);

  return {
    mode: 'development', // Use 'development' for better debugging, 'production' for release
    entry: {
      'background/service-worker': ['./node_modules/webextension-polyfill/dist/browser-polyfill.js', './src/background/service-worker.js'],
      'content/content-script': ['./node_modules/webextension-polyfill/dist/browser-polyfill.js', './src/content/content-script.js'],
      'options/options': ['./node_modules/webextension-polyfill/dist/browser-polyfill.js', './src/options/options.js'],
    },
    output: {
      path: buildDir,
      filename: '[name].js',
      clean: true, // Cleans the output directory before each build
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: 'manifest.json',
            to: 'manifest.json',
            transform(content) {
              const manifest = JSON.parse(content.toString());

              // Recursively remove 'src/' prefix from all string values in the manifest
              const transformPaths = (obj) => {
                for (const key in obj) {
                  if (typeof obj[key] === 'string') {
                    if (obj[key].startsWith('src/')) {
                      obj[key] = obj[key].substring(4);
                    }
                  } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    transformPaths(obj[key]);
                  }
                }
              };

              transformPaths(manifest);

              // Add any browser-specific transformations here in the future
              if (browser === 'firefox') {
                // Example: Firefox might require different keys or values
                manifest.background = {
                  "scripts": [
                    "background/service-worker.js"
                  ]
                };

                // 【新增此區塊】為 Firefox 新增固定的 Add-on ID
                manifest.browser_specific_settings = {
                  "gecko": {
                    "id": "ns4f@ochowei.com", // 您可以自訂這個 ID，但格式需類似 email
                    "strict_min_version": "109.0"
                  }
                };
              }

              return JSON.stringify(manifest, null, 2);
            },
          },
          { from: 'src/icons', to: 'icons' },
          { from: 'src/_locales', to: '_locales' },
          { from: 'src/options/options.html', to: 'options/options.html' },
        ],
      }),
    ],
    devtool: 'cheap-module-source-map',
    stats: 'minimal',
  };
};
