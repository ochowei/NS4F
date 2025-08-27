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
      'background/service-worker': './src/background/service-worker.js',
      'content/content-script': './src/content/content-script.js',
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
              }

              return JSON.stringify(manifest, null, 2);
            },
          },
          { from: 'src/icons', to: 'icons' },
        ],
      }),
    ],
    devtool: 'cheap-module-source-map',
    stats: 'minimal',
  };
};
