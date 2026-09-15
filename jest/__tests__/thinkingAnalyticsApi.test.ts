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
import {
  NativeModules,
  Platform,
  resetNativeModules,
} from '../__mocks__/reactNative';
import thinkingdata, {
  AutoTrackEventType,
  TAThirdPartyShareType,
  TATrackStatus,
} from '../../ThinkingAnalyticsAPI.js';

function nativeModule() {
  return NativeModules.RNThinkingAnalyticsModule as Record<string, jest.Mock>;
}

describe('ThinkingAnalyticsAPI native bridge', () => {
  beforeEach(() => {
    resetNativeModules();
    jest.clearAllMocks();
    thinkingdata.init({
      appid: 'app-1',
      appId: 'app-1',
      serverUrl: 'https://receiver.example.com',
      enableLog: true,
      zoneOffset: 8,
    });
  });

  it('init copies appId/appid on harmony', () => {
    expect(nativeModule().init).toHaveBeenCalled();
    const firstArg = nativeModule().init.mock.calls[0][0] as Record<string, string>;
    expect(firstArg.appId).toBe('app-1');
    expect(firstArg.appid).toBe('app-1');
  });

  it('init uses non-harmony path when Platform.OS is android', () => {
    Platform.OS = 'android';
    thinkingdata.init({
      appid: 'app-android',
      serverUrl: 'https://receiver.example.com',
    });
    expect(nativeModule().init).toHaveBeenCalled();
  });

  it('tracks events and merges dynamic properties', () => {
    thinkingdata.setDynamicSuperProperties(() => ({ dyn: 1 }));
    thinkingdata.track('buy', { sku: 'a', when: new Date(), nested: { t: new Date() }, arr: [{ t: new Date() }] }, new Date(), 8);
    thinkingdata.track('buy');
    thinkingdata.trackFirstEvent('first', { a: 1 }, 'eid', new Date(), 8);
    thinkingdata.trackFirstEvent('first');
    thinkingdata.trackUpdate('upd', { a: 1 }, 'eid', new Date(), 8);
    thinkingdata.trackUpdate('upd');
    thinkingdata.trackOverwrite('ow', { a: 1 }, 'eid', new Date(), 8);
    thinkingdata.trackOverwrite('ow');
    thinkingdata.timeEvent('buy');
    expect(nativeModule().track).toHaveBeenCalled();
    expect(nativeModule().trackFirstEvent).toHaveBeenCalled();
    expect(nativeModule().timeEvent).toHaveBeenCalled();
  });

  it('covers identity, user, super-property and query APIs', async () => {
    thinkingdata.login('acc');
    thinkingdata.logout();
    thinkingdata.identify('did');
    thinkingdata.userSet({ name: 'ta' });
    thinkingdata.userUnset('name');
    thinkingdata.userSetOnce({ name: 'ta' });
    thinkingdata.userAdd({ n: 1 });
    thinkingdata.userDel();
    thinkingdata.userAppend({ tags: ['a'] });
    thinkingdata.userUniqAppend({ tags: ['a'] });
    thinkingdata.setSuperProperties({ channel: 'ta' });
    thinkingdata.unsetSuperProperty('channel');
    thinkingdata.clearSuperProperties();
    thinkingdata.flush();
    thinkingdata.calibrateTime(1);
    thinkingdata.calibrateTimeWithNtp('ntp');
    thinkingdata.enableThirdPartySharing(1, { k: 1 });
    thinkingdata.setTrackStatus(TATrackStatus.PAUSE);
    thinkingdata.enableAutoTrack([AutoTrackEventType.APP_START], { k: 1 });
    thinkingdata.setAutoTrackProperties([AutoTrackEventType.APP_END], { k: 1 });
    await thinkingdata.getPresetProperties();
    await thinkingdata.getSuperProperties();
    await thinkingdata.getDistinctId();
    await thinkingdata.getAccountId();
    await thinkingdata.getDeviceId();
    const instance = thinkingdata.initInstance({
      appid: 'app-2',
      serverUrl: 'https://receiver.example.com',
    });
    expect(instance).toBeDefined();
    expect(TAThirdPartyShareType.TA_ADJUST).toBe('Adjust');
  });

  it('formatPropertiesTimeZone and helpers handle edge values', () => {
    expect(thinkingdata.formatPropertiesTimeZone(null)).toBeNull();
    expect(thinkingdata.formatPropertiesTimeZone('x')).toBe('x');
    const formatted = thinkingdata.formatPropertiesTimeZone({
      d: new Date(),
      arr: [{ d: new Date() }, 'plain'],
      obj: { d: new Date() },
      n: 1,
    });
    expect(formatted.n).toBe(1);
    expect(thinkingdata.getTimeStamp(new Date())).toBeGreaterThan(0);
    expect(thinkingdata.getTimeStamp(undefined)).toBe(0);
    expect(thinkingdata.ta_formatTimeZone(new Date(), 'x')).toBeInstanceOf(Date);
    expect(thinkingdata.ta_hashCode(1)).toBe(0);
    expect(thinkingdata.ta_hashCode('')).toBe(0);
    expect(thinkingdata.ta_hashCode('abc')).not.toBe(0);
    expect(thinkingdata.ta_base64Encode('')).toBe('');
    expect(thinkingdata.ta_base64Encode('a')).toContain('=');
    expect(thinkingdata.ta_base64Encode('ab')).toContain('=');
    expect(thinkingdata.ta_base64Encode('abc')).toBeDefined();
    expect(thinkingdata.ta_utf8Encode('中\r\n文')).toBeDefined();
    expect(thinkingdata.ta_encodeURIComponent('a b')).toBe('a%20b');
    expect(thinkingdata.ta_UUIDv4()).toMatch(/^[0-9a-f-]{36}$/);
    expect(thinkingdata.ta_formatDate(new Date(2024, 0, 2, 3, 4, 5, 6))).toContain('2024-01-02');
    expect(thinkingdata.ta_formatDate(new Date(2024, 0, 2, 3, 4, 5, 60))).toBeDefined();
    expect(thinkingdata.ta_formatDate(new Date(2024, 0, 2, 3, 4, 5, 600))).toBeDefined();
  });

  it('setAutoTrackProperties skips when native method is missing on harmony', () => {
    const module = nativeModule();
    delete module.setAutoTrackProperties;
    thinkingdata.setAutoTrackProperties(['appStart'], { k: 1 });
  });
});

describe('ThinkingAnalyticsAPI js fallback without native module', () => {
  let api: typeof thinkingdata;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios' },
      NativeModules: { RNThinkingAnalyticsModule: null },
    }));
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ code: 0 }),
      }),
    ) as unknown as typeof fetch;
    api = require('../../ThinkingAnalyticsAPI.js').default;
    api.enableLog(true);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    api.init({
      appid: 'js-app',
      serverUrl: 'https://receiver.example.com',
      enableLog: true,
      zoneOffset: 8,
    });
  });

  it('queues track and user events through httpRequest', async () => {
    api.setSuperProperties({ channel: 'js' });
    api.setDynamicSuperProperties(() => ({ dyn: 1 }));
    api.timeEvent('buy');
    api.track('buy', {
      sku: 'a',
      when: new Date(),
      nested: { t: new Date() },
      arr: [{ t: new Date() }],
    });
    api.trackFirstEvent('first', { a: 1 }, 'fid');
    api.trackUpdate('upd', { a: 1 }, 'eid');
    api.trackOverwrite('ow', { a: 1 }, 'eid');
    api.login('acc');
    api.logout();
    api.identify('did');
    api.userSet({ name: 'ta' });
    api.userUnset('name');
    api.userUnset('');
    api.userSetOnce({ name: 'ta' });
    api.userAdd({ n: 1 });
    api.userDel();
    api.userAppend({ tags: ['a'] });
    api.userUniqAppend({ tags: ['a'] });
    api.unsetSuperProperty('channel');
    api.unsetSuperProperty(null);
    api.clearSuperProperties();
    api.setSuperProperties(null);
    api.flush();
    api.calibrateTime(1);
    api.calibrateTimeWithNtp('ntp');
    api.enableThirdPartySharing(1, {});
    api.setTrackStatus('pause');
    api.enableAutoTrack(
      ['appStart', 'appEnd', 'appViewCrash', 'appInstall', 'other'],
      {},
    );
    api.setAutoTrackProperties(['appStart'], {});
    const preset = await api.getPresetProperties();
    expect(preset['#lib']).toBe('ReactNative');
    await api.getSuperProperties();
    await api.getDistinctId();
    await api.getAccountId();
    await api.getDeviceId();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(global.fetch).toHaveBeenCalled();
  });

  it('maps os name for android and harmony fallback preset properties', async () => {
    jest.resetModules();
    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
      NativeModules: { RNThinkingAnalyticsModule: null },
    }));
    const androidApi = require('../../ThinkingAnalyticsAPI.js').default;
    androidApi.init({ appid: 'a', serverUrl: 'https://x' });
    const preset = await androidApi.getPresetProperties();
    expect(preset['#os']).toBe('Android');

    jest.resetModules();
    jest.doMock('react-native', () => ({
      Platform: { OS: 'harmony' },
      NativeModules: { RNThinkingAnalyticsModule: null },
    }));
    const harmonyApi = require('../../ThinkingAnalyticsAPI.js').default;
    harmonyApi.init({ appid: 'a', serverUrl: 'https://x', zoneOffset: 8 });
    const harmonyPreset = await harmonyApi.getPresetProperties();
    expect(harmonyPreset['#os']).toBe('HarmonyOS');
  });
});
