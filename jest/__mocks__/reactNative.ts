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

export type NativeAnalyticsModule = Record<string, jest.Mock>;

export function createNativeAnalyticsModule(): NativeAnalyticsModule {
  return {
    init: jest.fn(),
    track: jest.fn(),
    trackUpdate: jest.fn(),
    trackOverwrite: jest.fn(),
    trackFirstEvent: jest.fn(),
    timeEvent: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    userSet: jest.fn(),
    userUnset: jest.fn(),
    userSetOnce: jest.fn(),
    userAdd: jest.fn(),
    userDel: jest.fn(),
    userAppend: jest.fn(),
    userUniqAppend: jest.fn(),
    setSuperProperties: jest.fn(),
    unsetSuperProperty: jest.fn(),
    clearSuperProperties: jest.fn(),
    identify: jest.fn(),
    flush: jest.fn(),
    enableAutoTrack: jest.fn(),
    setAutoTrackProperties: jest.fn(),
    calibrateTime: jest.fn(),
    calibrateTimeWithNtp: jest.fn(),
    enableThirdPartySharing: jest.fn(),
    setTrackStatus: jest.fn(),
    getPresetProperties: jest.fn(async () => ({ '#os': 'HarmonyOS' })),
    getSuperProperties: jest.fn(async () => ({ channel: 'ta' })),
    getDistinctId: jest.fn(async () => 'distinct-1'),
    getAccountId: jest.fn(async () => 'account-1'),
    getDeviceId: jest.fn(async () => 'device-1'),
    trackViewScreen: jest.fn(),
    trackViewClick: jest.fn(),
    saveViewProperties: jest.fn(),
    saveRootViewProperties: jest.fn(),
  };
}

export const Platform = {
  OS: 'harmony',
};

export const NativeModules: { RNThinkingAnalyticsModule: NativeAnalyticsModule | null } = {
  RNThinkingAnalyticsModule: createNativeAnalyticsModule(),
};

export function resetNativeModules(): NativeAnalyticsModule {
  const current = NativeModules.RNThinkingAnalyticsModule as NativeAnalyticsModule;
  const fresh = createNativeAnalyticsModule();
  Object.keys(fresh).forEach((key) => {
    current[key] = fresh[key];
  });
  Platform.OS = 'harmony';
  return current;
}
