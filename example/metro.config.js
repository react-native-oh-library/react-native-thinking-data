/*
 * Copyright (c) 2025 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

const path = require('path');
const {mergeConfig, getDefaultConfig} = require('@react-native/metro-config');
const {
  createHarmonyMetroConfig,
} = require('@react-native-oh/react-native-harmony/metro.config');

const ohosPkg = path.resolve(
  __dirname,
  'node_modules/@react-native-ohos/react-native-thinking-data',
);

/**
 * @type {import("metro-config").ConfigT}
 */
const config = {
  resolver: {
    extraNodeModules: {
      'react-native-thinking-data': ohosPkg,
      '@react-native-ohos/react-native-thinking-data': ohosPkg,
      '@react-native-async-storage/async-storage': path.resolve(
        __dirname,
        'src/shims/async-storage.js',
      ),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  createHarmonyMetroConfig({
    reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',
  }),
  config,
);
