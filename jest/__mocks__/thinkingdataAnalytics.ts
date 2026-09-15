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

export enum TDMode {
  NORMAL = 0,
  DEBUG = 1,
  DEBUG_ONLY = 2,
}

export const TDAutoTrackEventType = {
  APP_START: 1,
  APP_END: 2,
  APP_CLICK: 4,
  APP_VIEW_SCREEN: 8,
  APP_CRASH: 16,
  APP_INSTALL: 32,
};

export class TDConfig {
  appId: string = '';
  serverUrl: string = '';
  mode: TDMode = TDMode.NORMAL;
  defaultTimeZone: number | undefined = undefined;
  enableEncrypt = jest.fn();
}

export const TDAnalytics = {
  initWithConfig: jest.fn(),
  enableLog: jest.fn(),
  setCustomerLibInfo: jest.fn(),
  track: jest.fn(),
  trackUpdate: jest.fn(),
  trackOverwrite: jest.fn(),
  trackFirst: jest.fn(),
  timeEvent: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  userSet: jest.fn(),
  userUnset: jest.fn(),
  userSetOnce: jest.fn(),
  userAdd: jest.fn(),
  userDelete: jest.fn(),
  userAppend: jest.fn(),
  userUniqAppend: jest.fn(),
  setSuperProperties: jest.fn(),
  unsetSuperProperty: jest.fn(),
  clearSuperProperties: jest.fn(),
  setDistinctId: jest.fn(),
  flush: jest.fn(),
  enableAutoTrack: jest.fn(),
  enableAutoTrackProperties: jest.fn(),
  calibrateTime: jest.fn(),
  getPresetProperties: jest.fn(() => '{"#os":"HarmonyOS"}'),
  getSuperProperties: jest.fn(() => '{"channel":"ta"}'),
  getDistinctId: jest.fn(() => 'distinct-1'),
  getAccountId: jest.fn(() => 'account-1'),
  getDeviceId: jest.fn(() => 'device-1'),
};
