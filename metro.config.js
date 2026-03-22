const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Three.js uses bare module resolution; ensure .cjs files are handled
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];
config.resolver.unstable_enablePackageExports = false;

module.exports = config;