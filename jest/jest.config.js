/**
 * MIT License
 *
 * Copyright (C) 2026 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
module.exports = {
  rootDir: '..',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest/jest.setup.js'],
  testMatch: ['<rootDir>/jest/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'ets', 'js', 'json'],
  transform: {
    '^.+\\.ets$': '<rootDir>/jest/ets-transformer.js',
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/jest/tsconfig.test.json',
      },
    ],
    '^.+\\.js$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
        ],
      },
    ],
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/jest/__mocks__/reactNative.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/jest/__mocks__/asyncStorage.ts',
    '^@thinkingdata/analytics$': '<rootDir>/jest/__mocks__/thinkingdataAnalytics.ts',
    '^@thinkingdata/analytics/src/main/ets/components/entity/TDOptions$':
      '<rootDir>/jest/__mocks__/tdOptions.ts',
    '^@rnoh/react-native-openharmony/ts$': '<rootDir>/jest/__mocks__/rnohOpenHarmony.ts',
    '^@kit\\.AbilityKit$': '<rootDir>/jest/__mocks__/kitAbilityKit.ts',
    '^@kit\\.PerformanceAnalysisKit$': '<rootDir>/jest/__mocks__/kitPerformanceAnalysisKit.ts',
    '^@kit\\.(.+)$': '<rootDir>/jest/__mocks__/ohosGeneric.ts',
    '^@ohos\\.(.+)$': '<rootDir>/jest/__mocks__/ohosGeneric.ts',
    '^\\.\\./\\.\\./package\\.json$': '<rootDir>/jest/__mocks__/hostAppPackage.json',
  },
  globals: {
    __DEV__: true,
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native|react)',
  ],
  collectCoverageFrom: [
    'TDAnalytics.js',
    'ThinkingAnalyticsAPI.js',
    'index.js',
    'ThinkingDataRNHook.js',
    'harmony/thinking_analytics/src/main/ets/**/*.ets',
    '!harmony/thinking_analytics/index.ets',
    '!harmony/thinking_analytics/ts.ets',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'json-summary', 'text-summary'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
  forceExit: true,
};
