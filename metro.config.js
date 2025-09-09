const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver alias for web platform
config.resolver.alias = {
  ...config.resolver.alias,
};

// Add extraNodeModules for web platform mocks
config.resolver.extraNodeModules = {
  'react-native-pdf': path.resolve(__dirname, 'web/react-native-pdf-mock.js'),
  'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, 'web/codegenNativeCommands-mock.js'),
};

config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Platform-specific resolver
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add platform extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

// Configure platform-specific aliases
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Mock codegenNativeCommands for web platform
  if (platform === 'web' && moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands') {
    return {
      filePath: require.resolve('./web/codegenNativeCommands-mock.js'),
      type: 'sourceFile',
    };
  }
  
  if (platform === 'web' && (
    moduleName.startsWith('react-native-pdf') || 
    (context.originModulePath && context.originModulePath.includes('node_modules/react-native-pdf'))
  )) {
    return {
      filePath: require.resolve('./web/react-native-pdf-mock.js'),
      type: 'sourceFile',
    };
  }
  
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;