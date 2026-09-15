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
  resetNativeModules,
} from '../__mocks__/reactNative';
import TDAnalytics, {
  TDAutoTrackEventType,
  TDMode,
  TDThirdPartyType,
  TDTrackStatus,
} from '../../TDAnalytics.js';

const APP_ID = 'app-main';
const SECOND_APP_ID = 'app-second';

function nativeModule() {
  return NativeModules.RNThinkingAnalyticsModule as Record<string, jest.Mock>;
}

describe('index.js', () => {
  it('exports the native turbo module', () => {
    const indexModule = require('../../index.js');
    expect(indexModule.default).toBe(NativeModules.RNThinkingAnalyticsModule);
  });
});

describe('TDAnalytics facade', () => {
  beforeEach(() => {
    resetNativeModules();
    TDAnalytics.instances = {};
    jest.clearAllMocks();
    TDAnalytics.init({
      appId: APP_ID,
      serverUrl: 'https://receiver.example.com',
      mode: TDMode.NORMAL,
      enableLog: true,
    });
  });

  it('init maps appid alias and string overload', () => {
    TDAnalytics.instances = {};
    TDAnalytics.init({
      appid: 'legacy-id',
      serverUrl: 'https://receiver.example.com',
    });
    expect(nativeModule().init).toHaveBeenCalled();
    TDAnalytics.instances = {};
    TDAnalytics.init('str-id', 'https://receiver.example.com');
    expect(Object.keys(TDAnalytics.instances)).toContain('str-id');
  });

  it('initInstance path is used for a second appId', () => {
    TDAnalytics.init({
      appId: SECOND_APP_ID,
      serverUrl: 'https://receiver.example.com',
    });
    expect(TDAnalytics.instances[SECOND_APP_ID]).toBeDefined();
  });

  it('delegates event APIs to native and to a named instance', () => {
    const event = { eventName: 'buy', properties: { sku: 'a' }, time: new Date(), timeZone: 8 };
    TDAnalytics.track(event);
    TDAnalytics.track(event, APP_ID);
    TDAnalytics.trackFirst({ ...event, eventId: 'first' });
    TDAnalytics.trackFirst({ ...event, eventId: 'first' }, APP_ID);
    TDAnalytics.trackUpdate({ ...event, eventId: 'upd' });
    TDAnalytics.trackUpdate({ ...event, eventId: 'upd' }, APP_ID);
    TDAnalytics.trackOverwrite({ ...event, eventId: 'ow' });
    TDAnalytics.trackOverwrite({ ...event, eventId: 'ow' }, APP_ID);
    TDAnalytics.timeEvent('buy');
    TDAnalytics.timeEvent('buy', APP_ID);
    expect(nativeModule().track).toHaveBeenCalled();
    expect(nativeModule().trackFirstEvent).toHaveBeenCalled();
    expect(nativeModule().trackUpdate).toHaveBeenCalled();
    expect(nativeModule().trackOverwrite).toHaveBeenCalled();
    expect(nativeModule().timeEvent).toHaveBeenCalled();
  });

  it('delegates user and super property APIs', () => {
    const props = { name: 'ta' };
    TDAnalytics.userSet(props);
    TDAnalytics.userSet(props, APP_ID);
    TDAnalytics.userSetOnce(props);
    TDAnalytics.userSetOnce(props, APP_ID);
    TDAnalytics.userUnset('name');
    TDAnalytics.userUnset('name', APP_ID);
    TDAnalytics.userAdd({ score: 1 });
    TDAnalytics.userAdd({ score: 1 }, APP_ID);
    TDAnalytics.userAppend({ tags: ['a'] });
    TDAnalytics.userAppend({ tags: ['a'] }, APP_ID);
    TDAnalytics.userUniqAppend({ tags: ['a'] });
    TDAnalytics.userUniqAppend({ tags: ['a'] }, APP_ID);
    TDAnalytics.userDelete();
    TDAnalytics.userDelete(APP_ID);
    TDAnalytics.setSuperProperties(props);
    TDAnalytics.setSuperProperties(props, APP_ID);
    TDAnalytics.unsetSuperProperty('name');
    TDAnalytics.unsetSuperProperty('name', APP_ID);
    TDAnalytics.clearSuperProperties();
    TDAnalytics.clearSuperProperties(APP_ID);
    TDAnalytics.setDynamicSuperProperties(() => ({ dyn: 1 }));
    TDAnalytics.setDynamicSuperProperties(() => ({ dyn: 1 }), APP_ID);
    expect(nativeModule().userSet).toHaveBeenCalled();
    expect(nativeModule().userDel).toHaveBeenCalled();
    expect(nativeModule().setSuperProperties).toHaveBeenCalled();
  });

  it('delegates identity, flush, calibrate and third-party APIs', async () => {
    TDAnalytics.login('acc');
    TDAnalytics.login('acc', APP_ID);
    TDAnalytics.logout();
    TDAnalytics.logout(APP_ID);
    TDAnalytics.setDistinctId('did');
    TDAnalytics.setDistinctId('did', APP_ID);
    TDAnalytics.flush();
    TDAnalytics.flush(APP_ID);
    TDAnalytics.calibrateTime(123);
    TDAnalytics.calibrateTimeWithNtp('ntp.example.com');
    TDAnalytics.enableAutoTrack(TDAutoTrackEventType.APP_START, { k: 1 });
    TDAnalytics.enableAutoTrack(TDAutoTrackEventType.APP_END, { k: 1 }, APP_ID);
    await TDAnalytics.getDistinctId();
    await TDAnalytics.getDistinctId(APP_ID);
    await TDAnalytics.getAccountId();
    await TDAnalytics.getAccountId(APP_ID);
    await TDAnalytics.getDeviceId();
    await TDAnalytics.getDeviceId(APP_ID);
    await TDAnalytics.getSuperProperties();
    await TDAnalytics.getSuperProperties(APP_ID);
    await TDAnalytics.getPresetProperties();
    await TDAnalytics.getPresetProperties(APP_ID);
    expect(nativeModule().login).toHaveBeenCalled();
    expect(nativeModule().getDistinctId).toHaveBeenCalled();
  });

  it('maps track status values', () => {
    TDAnalytics.setTrackStatus(TDTrackStatus.PAUSE);
    TDAnalytics.setTrackStatus(TDTrackStatus.STOP);
    TDAnalytics.setTrackStatus(TDTrackStatus.SAVE_ONLY);
    TDAnalytics.setTrackStatus(TDTrackStatus.NORMAL);
    TDAnalytics.setTrackStatus(TDTrackStatus.PAUSE, APP_ID);
    expect(nativeModule().setTrackStatus).toHaveBeenCalledTimes(5);
  });

  it('enableThirdPartySharing forwards types', () => {
    TDAnalytics.enableThirdPartySharing({
      types: TDThirdPartyType.APPS_FLYER,
      params: { k: 1 },
    });
    TDAnalytics.enableThirdPartySharing({
      types: TDThirdPartyType.ADJUST,
      params: { k: 1 },
    }, APP_ID);
    expect(nativeModule().enableThirdPartySharing).toHaveBeenCalled();
  });

  it('enableAutoTrackWithProperties covers bitmask and instance path', () => {
    const types =
      TDAutoTrackEventType.APP_START |
      TDAutoTrackEventType.APP_END |
      TDAutoTrackEventType.APP_CRASH |
      TDAutoTrackEventType.APP_INSTALL;
    TDAnalytics.enableAutoTrackWithProperties({
      autoTrackTypes: types,
      properties: { from: 'js' },
    });
    TDAnalytics.enableAutoTrackWithProperties({
      autoTrackTypes: types,
      properties: { from: 'js' },
      appId: APP_ID,
    });
    expect(nativeModule().enableAutoTrack).toHaveBeenCalled();
    expect(nativeModule().setAutoTrackProperties).toHaveBeenCalled();
    const autoTrackPayload = nativeModule().setAutoTrackProperties.mock.calls[0][0];
    expect(autoTrackPayload.types).toEqual(['appStart', 'appEnd', 'appViewCrash', 'appInstall']);
    expect(autoTrackPayload.eventId).toBeUndefined();
  });

  it('h5ClickHandler ignores empty or invalid payloads', () => {
    TDAnalytics.h5ClickHandler('');
    TDAnalytics.h5ClickHandler(JSON.stringify({ data: [] }));
    TDAnalytics.h5ClickHandler(JSON.stringify({ data: [null] }));
    expect(nativeModule().track).not.toHaveBeenCalled();
  });

  it('h5ClickHandler tracks first/update/overwrite and user events', () => {
    const baseProps = {
      '#account_id': 'x',
      product: 'p',
      '#zone_offset': 8,
    };
    TDAnalytics.h5ClickHandler(JSON.stringify({
      data: [{
        '#type': 'track',
        '#event_name': 'click',
        '#time': '2024-01-01 00:00:00',
        properties: { ...baseProps },
      }],
    }));
    TDAnalytics.h5ClickHandler(JSON.stringify({
      data: [{
        '#type': 'track',
        '#event_name': 'first',
        '#time': '2024-01-01 00:00:00',
        '#first_check_id': 'fid',
        properties: { product: 'p' },
      }],
    }));
    TDAnalytics.h5ClickHandler(JSON.stringify({
      data: [{
        '#type': 'track_update',
        '#event_name': 'upd',
        '#event_id': 'eid',
        '#time': '2024-01-01 00:00:00',
        properties: { product: 'p' },
      }],
    }));
    TDAnalytics.h5ClickHandler(JSON.stringify({
      data: [{
        '#type': 'track_overwrite',
        '#event_name': 'ow',
        '#event_id': 'eid',
        '#time': '2024-01-01 00:00:00',
        properties: { product: 'p' },
      }],
    }));
    TDAnalytics.h5ClickHandler(JSON.stringify({
      data: [{ '#type': 'user_set', properties: { username: 'ta' } }],
    }));
    TDAnalytics.h5ClickHandler(JSON.stringify({
      data: [{ '#type': 'user_setOnce', properties: { username: 'ta' } }],
    }));
    TDAnalytics.h5ClickHandler(JSON.stringify({
      data: [{ '#type': 'user_add', properties: { n: 1 } }],
    }));
    TDAnalytics.h5ClickHandler(JSON.stringify({
      data: [{ '#type': 'user_append', properties: { tags: ['a'] } }],
    }));
    TDAnalytics.h5ClickHandler(JSON.stringify({
      data: [{ '#type': 'user_uniq_append', properties: { tags: ['a'] } }],
    }));
    TDAnalytics.h5ClickHandler(JSON.stringify({
      data: [{ '#type': 'user_unset', properties: { username: 0 } }],
    }));
    TDAnalytics.h5ClickHandler(JSON.stringify({
      data: [{ '#type': 'user_del', properties: {} }],
    }));
    expect(nativeModule().track).toHaveBeenCalled();
    expect(nativeModule().trackFirstEvent).toHaveBeenCalled();
    expect(nativeModule().userSet).toHaveBeenCalled();
    expect(nativeModule().userDel).toHaveBeenCalled();
  });

  it('h5ClickHandler throws on invalid track type after first-check rewrite', () => {
    expect(() => {
      TDAnalytics.h5ClickHandler(JSON.stringify({
        data: [{
          '#type': 'unknown_track',
          '#event_name': 'x',
          '#time': '2024-01-01 00:00:00',
          properties: {},
        }],
      }));
    }).not.toThrow();
  });

  it('exports mode and auto-track constants', () => {
    expect(TDMode.DEBUG).toBe('debug');
    expect(TDMode.DEBUG_ONLY).toBe('debugOnly');
    expect(TDAutoTrackEventType.APP_CLICK).toBe(4);
    expect(TDAutoTrackEventType.APP_VIEW_SCREEN).toBe(8);
    expect(TDThirdPartyType.TRAD_PLUS).toBe(64);
  });
});
