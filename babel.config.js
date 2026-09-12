module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        // Keep in 1-1 sync with "paths" in tsconfig.json
        alias: {
          '@app': './src/app',
          '@core': './src/core',
          '@shared': './src/shared',
          '@features': './src/features',
        },
      },
    ],
  ],
};
