module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        // Giữ đồng bộ 1-1 với "paths" trong tsconfig.json
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
