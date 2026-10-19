const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs', 'mjs');

// `markdown-it` (via react-native-markdown-display) requires Node's built-in
// `punycode` module, which does not exist in the React Native / Metro runtime.
// Alias it to the userland `punycode` package so it resolves in Expo Go.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  punycode: require.resolve('punycode/'),
};

module.exports = config;
