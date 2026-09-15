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
import { TDAnalytics, TDAutoTrackEventType, TDMode } from '@thinkingdata/analytics';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { RNThinkingAnalyticsModule } from '../../harmony/thinking_analytics/src/main/ets/RNThinkingAnalyticsModule.ets';
import type { UITurboModuleContext } from '../__mocks__/rnohOpenHarmony';

type AnalyticsModule = RNThinkingAnalyticsModule & {
  getTimeZoneId: (offset: number) => string;
  appIdOf: (options: Record<string, Object> | null | undefined) => string | undefined;
  safeString: (value: Object | undefined | null, fallback: string) => string;
  toDate: (timeMillis: number | undefined) => Date | undefined;
  buildEventOptions: (options: Record<string, Object>) => Object;
  buildSpecialEventOptions: (options: Record<string, Object>) => Object;
  __invalidate: () => void;
};

function createModule(withContext: boolean): AnalyticsModule {
  const ctx: UITurboModuleContext = withContext
    ? { uiAbilityContext: { tempDir: '/tmp' } }
    : {};
  return new RNThinkingAnalyticsModule(ctx) as AnalyticsModule;
}

describe('RNThinkingAnalyticsModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('init returns when options or credentials are missing', () => {
    const module = createModule(true);
    module.init(undefined as unknown as Record<string, Object>, '3.2.2');
    module.init({ appId: '', serverUrl: '' }, '3.2.2');
    expect(TDAnalytics.initWithConfig).not.toHaveBeenCalled();
    expect(hilog.error).toHaveBeenCalled();
  });

  it('init logs when UIAbilityContext is missing', () => {
    const module = createModule(false);
    module.init({ appId: 'a', serverUrl: 'https://x' }, '3.2.2');
    expect(hilog.error).toHaveBeenCalled();
  });

  it('init maps debug modes, timezone, encrypt and lib info', () => {
    const module = createModule(true);
    module.init({
      appid: 'app-1',
      serverUrl: 'https://x',
      mode: 'debug',
      timeZone: 8,
      enableEncrypt: true,
      secretKey: { version: 1, publicKey: 'pk' },
      enableLog: true,
    }, '3.2.2');
    expect(TDAnalytics.enableLog).toHaveBeenCalledWith(true);
    expect(TDAnalytics.setCustomerLibInfo).toHaveBeenCalledWith('ReactNative', '3.2.2');
    expect(TDAnalytics.initWithConfig).toHaveBeenCalled();

    module.init({
      appId: 'app-1',
      serverUrl: 'https://x',
      mode: 'debugOnly',
    }, '');
    const lastConfig = (TDAnalytics.initWithConfig as jest.Mock).mock.calls[1][1];
    expect(lastConfig.mode).toBe(TDMode.DEBUG_ONLY);
  });

  it('init swallows exceptions', () => {
    (TDAnalytics.initWithConfig as jest.Mock).mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const module = createModule(true);
    module.init({ appId: 'a', serverUrl: 'https://x' }, '3.2.2');
    expect(hilog.error).toHaveBeenCalled();
  });

  it('track family methods build options and honor appId', () => {
    const module = createModule(true);
    const event = {
      appId: 'a',
      eventName: 'buy',
      properties: { sku: 'p' },
      eventId: 'eid',
      time: Date.now(),
      timeZone: 8,
    };
    module.track(event);
    module.track(undefined as unknown as Record<string, Object>);
    module.trackUpdate(event);
    module.trackOverwrite(event);
    module.trackFirstEvent(event);
    module.timeEvent({ eventName: 'buy', appId: 'a' });
    module.timeEvent({ eventName: '' });
    expect(TDAnalytics.track).toHaveBeenCalled();
    expect(TDAnalytics.trackUpdate).toHaveBeenCalled();
    expect(TDAnalytics.trackOverwrite).toHaveBeenCalled();
    expect(TDAnalytics.trackFirst).toHaveBeenCalled();
    expect(TDAnalytics.timeEvent).toHaveBeenCalled();
  });

  it('login logout identify flush and user APIs', () => {
    const module = createModule(true);
    module.login({ loginId: 'acc', appId: 'a' });
    module.logout({ appId: 'a' });
    module.identify({ distinctId: 'd', appid: 'a' });
    module.flush({ appId: 'a' });
    module.userSet({ properties: { name: 'ta' }, appId: 'a' });
    module.userSet({ appId: 'a' });
    module.userSetOnce({ properties: { name: 'ta' }, appId: 'a' });
    module.userAdd({ properties: { n: 1 }, appId: 'a' });
    module.userAppend({ properties: { tags: ['a'] }, appId: 'a' });
    module.userUniqAppend({ properties: { tags: ['a'] }, appId: 'a' });
    module.userUnset({ property: 'name', appId: 'a' });
    module.userDel({ appId: 'a' });
    module.setSuperProperties({ properties: { c: 1 }, appId: 'a' });
    module.unsetSuperProperty({ property: 'c', appId: 'a' });
    module.clearSuperProperties({ appId: 'a' });
    expect(TDAnalytics.login).toHaveBeenCalled();
    expect(TDAnalytics.userSet).toHaveBeenCalled();
    expect(TDAnalytics.userDelete).toHaveBeenCalled();
  });

  it('enableAutoTrack handles preview page views and click flag', () => {
    const module = createModule(false);
    module.enableAutoTrack({ autoTrackType: 8 });
    expect(hilog.error).toHaveBeenCalled();

    const ready = createModule(true);
    ready.trackViewScreen({ thinkingdataurl: 'Home' });
    ready.enableAutoTrack({
      autoTrackType: TDAutoTrackEventType.APP_VIEW_SCREEN | TDAutoTrackEventType.APP_CLICK,
      properties: { k: 1 },
      appId: 'a',
    });
    expect(TDAnalytics.enableAutoTrackProperties).toHaveBeenCalled();
    ready.enableAutoTrack({ autoTrackType: TDAutoTrackEventType.APP_START });
    expect(TDAnalytics.enableAutoTrack).toHaveBeenCalled();

    (TDAnalytics.enableAutoTrack as jest.Mock).mockClear();
    ready.enableAutoTrack({
      autoTrackType: ['appStart', 'appInstall'],
      appId: 'a',
    });
    expect(TDAnalytics.enableAutoTrack).toHaveBeenCalledWith(
      expect.anything(),
      TDAutoTrackEventType.APP_START | TDAutoTrackEventType.APP_INSTALL,
      undefined,
      'a',
    );
  });

  it('setAutoTrackProperties reads JS types, not eventId', () => {
    const module = createModule(false);
    module.setAutoTrackProperties({
      types: ['appStart'],
      properties: { k: 1 },
    });
    expect(TDAnalytics.enableAutoTrackProperties).not.toHaveBeenCalled();

    const ready = createModule(true);
    ready.setAutoTrackProperties({
      eventId: '8',
      properties: { k: 1 },
      appId: 'a',
    });
    expect(TDAnalytics.enableAutoTrackProperties).not.toHaveBeenCalled();

    ready.setAutoTrackProperties({ appId: 'a' });
    ready.setAutoTrackProperties({
      types: ['appStart', 'appEnd', 'appViewCrash', 'appInstall'],
      properties: { k: 1 },
      appId: 'a',
    });
    expect(TDAnalytics.enableAutoTrackProperties).toHaveBeenCalledWith(
      expect.anything(),
      TDAutoTrackEventType.APP_START |
        TDAutoTrackEventType.APP_END |
        TDAutoTrackEventType.APP_CRASH |
        TDAutoTrackEventType.APP_INSTALL,
      { k: 1 },
      undefined,
      'a',
    );

    ready.setAutoTrackProperties({
      types: TDAutoTrackEventType.APP_INSTALL,
      properties: { k: 2 },
      appId: 'a',
    });
    expect(TDAnalytics.enableAutoTrackProperties).toHaveBeenLastCalledWith(
      expect.anything(),
      TDAutoTrackEventType.APP_INSTALL,
      { k: 2 },
      undefined,
      'a',
    );

    (TDAnalytics.enableAutoTrack as jest.Mock).mockClear();
    ready.enableAutoTrack({ autoTrackType: 'appStart', appId: 'a' });
    expect(TDAnalytics.enableAutoTrack).toHaveBeenCalledWith(
      expect.anything(),
      TDAutoTrackEventType.APP_START,
      undefined,
      'a',
    );
    ready.enableAutoTrack({
      autoTrackType: [TDAutoTrackEventType.APP_END, 'unknown', 0],
      appId: 'a',
    });
  });

  it('calibrate and unsupported APIs', () => {
    const module = createModule(true);
    module.calibrateTime({ timeStampMillis: 1000 });
    module.calibrateTime({});
    module.calibrateTimeWithNtp({ ntp_server: 'ntp' });
    module.calibrateTimeWithNtp(undefined as unknown as Record<string, Object>);
    module.enableThirdPartySharing({ types: 1 });
    module.setTrackStatus({ status: 'pause' });
    expect(TDAnalytics.calibrateTime).toHaveBeenCalled();
    expect(hilog.warn).toHaveBeenCalled();
  });

  it('query APIs return objects matching Android/iOS, or null', async () => {
    const module = createModule(true);
    expect(await module.getPresetProperties({ appId: 'a' })).toEqual({ '#os': 'HarmonyOS' });
    expect(await module.getSuperProperties({ appId: 'a' })).toEqual({ channel: 'ta' });
    (TDAnalytics.getPresetProperties as jest.Mock).mockReturnValueOnce({
      '#os': 'HarmonyOS',
      '#zone_offset': 8,
    });
    expect((await module.getPresetProperties({ appId: 'a' }))!['#zone_offset']).toBe(8);
    (TDAnalytics.getPresetProperties as jest.Mock).mockReturnValueOnce('');
    expect(await module.getPresetProperties({ appId: 'a' })).toBeNull();
    (TDAnalytics.getPresetProperties as jest.Mock).mockReturnValueOnce('{');
    expect(await module.getPresetProperties({ appId: 'a' })).toBeNull();
    (TDAnalytics.getPresetProperties as jest.Mock).mockReturnValueOnce('1');
    expect(await module.getPresetProperties({ appId: 'a' })).toBeNull();
    (TDAnalytics.getSuperProperties as jest.Mock).mockReturnValueOnce(null);
    expect(await module.getSuperProperties({ appId: 'a' })).toBeNull();
    expect(await module.getDistinctId({ appId: 'a' })).toBe('distinct-1');
    expect(await module.getAccountId({ appId: 'a' })).toBe('account-1');
    expect(await module.getDeviceId({ appId: 'a' })).toBe('device-1');
    (TDAnalytics.getDistinctId as jest.Mock).mockReturnValueOnce(null);
    expect(await module.getDistinctId({ appId: 'a' })).toBeNull();
    (TDAnalytics.getAccountId as jest.Mock).mockImplementationOnce(() => {
      throw new Error('fail');
    });
    expect(await module.getAccountId({ appId: 'a' })).toBeNull();
  });

  it('trackViewScreen and trackViewClick cover ignore, referrer and click', () => {
    const module = createModule(true);
    module.trackViewScreen(undefined as unknown as Record<string, Object>);
    module.trackViewScreen({
      thinkingdataurl: 'Home',
      thinkingdataparams: { TDIgnoreViewScreen: true },
    });
    module.trackViewScreen({
      thinkingdataurl: 'Home',
      thinkingdataparams: { '#title': 'T', '#screen_name': 'Home' },
    });
    module.enableAutoTrack({
      autoTrackType: TDAutoTrackEventType.APP_VIEW_SCREEN | TDAutoTrackEventType.APP_CLICK,
    });
    module.trackViewScreen({ thinkingdataurl: 'Detail' });
    module.saveViewProperties(1, 'btn', { TDIgnoreViewClick: true, extra: 1 });
    module.trackViewClick(1);
    module.saveViewProperties(2, 'ok', { extra: 2 });
    module.trackViewClick(2);
    const firstClickProps = (TDAnalytics.track as jest.Mock).mock.calls[
      (TDAnalytics.track as jest.Mock).mock.calls.length - 1
    ][0].properties;
    expect(firstClickProps['#element_content']).toBe('ok');
    module.trackViewClick(2);
    module.trackViewClick(99);
    module.saveRootViewProperties(3, 'root', null, 10);
    for (let viewId = 100; viewId < 620; viewId++) {
      module.saveViewProperties(viewId, 'x', { extra: viewId });
    }
    expect(TDAnalytics.track).toHaveBeenCalled();
  });

  it('__invalidate clears view cache and auto-track flags', () => {
    const module = createModule(true);
    module.enableAutoTrack({
      autoTrackType: TDAutoTrackEventType.APP_CLICK,
    });
    module.saveViewProperties(2, 'ok', { extra: 2 });
    module.__invalidate();
    (TDAnalytics.track as jest.Mock).mockClear();
    module.trackViewClick(2);
    expect(TDAnalytics.track).not.toHaveBeenCalled();
    module.trackViewScreen({ thinkingdataurl: 'Home' });
    expect(TDAnalytics.track).not.toHaveBeenCalled();
  });

  it('__invalidate clears view cache and auto-track flags', () => {
    const module = createModule(true);
    module.enableAutoTrack({
      autoTrackType: TDAutoTrackEventType.APP_CLICK,
    });
    module.saveViewProperties(2, 'ok', { extra: 2 });
    module.__invalidate();
    (TDAnalytics.track as jest.Mock).mockClear();
    module.trackViewClick(2);
    expect(TDAnalytics.track).not.toHaveBeenCalled();
    module.trackViewScreen({ thinkingdataurl: 'Home' });
    expect(TDAnalytics.track).not.toHaveBeenCalled();
  });

  it('helpers cover timezone and date conversion branches', () => {
    const module = createModule(true);
    expect(module.getTimeZoneId(20)).toBe('');
    expect(module.getTimeZoneId(8)).toBe('GMT+08:00');
    expect(module.getTimeZoneId(-5.5)).toContain('GMT-');
    expect(module.getTimeZoneId(1.99).length).toBeGreaterThan(0);
    expect(module.getTimeZoneId(-1.99).length).toBeGreaterThan(0);
    expect(module.safeString(undefined, 'fb')).toBe('fb');
    expect(module.safeString('v', 'fb')).toBe('v');
    expect(module.appIdOf(undefined)).toBeUndefined();
    expect(module.appIdOf({ appid: 'x' })).toBe('x');
    expect(module.toDate(undefined)).toBeUndefined();
    expect(module.toDate(0)).toBeUndefined();
    expect(module.toDate(1000)).toBeInstanceOf(Date);
    module.buildEventOptions({ eventName: 'e', properties: { a: 1 }, time: 1000, timeZone: 8 });
    module.buildSpecialEventOptions({ eventName: 'e', eventId: 'id', time: 1000, timeZone: 8 });
  });

  it('swallows exceptions on public methods', () => {
    const module = createModule(true);
    const throwing = () => {
      throw new Error('x');
    };
    (TDAnalytics.track as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.trackUpdate as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.trackOverwrite as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.trackFirst as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.timeEvent as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.login as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.logout as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.setDistinctId as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.flush as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.userSet as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.userUnset as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.userSetOnce as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.userAdd as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.userDelete as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.userAppend as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.userUniqAppend as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.setSuperProperties as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.unsetSuperProperty as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.clearSuperProperties as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.enableAutoTrack as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.enableAutoTrackProperties as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.calibrateTime as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.getPresetProperties as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.getSuperProperties as jest.Mock).mockImplementation(throwing);
    (TDAnalytics.getDeviceId as jest.Mock).mockImplementation(throwing);
    const event = { eventName: 'e', properties: { a: 1 }, loginId: 'a', distinctId: 'd', property: 'p' };
    module.track(event);
    module.trackUpdate(event);
    module.trackOverwrite(event);
    module.trackFirstEvent(event);
    module.timeEvent(event);
    module.login(event);
    module.logout(event);
    module.identify(event);
    module.flush(event);
    module.userSet(event);
    module.userUnset(event);
    module.userSetOnce(event);
    module.userAdd(event);
    module.userDel(event);
    module.userAppend(event);
    module.userUniqAppend(event);
    module.setSuperProperties(event);
    module.unsetSuperProperty(event);
    module.clearSuperProperties(event);
    module.enableAutoTrack({ autoTrackType: 1 });
    module.setAutoTrackProperties({ types: ['appStart'], properties: { a: 1 } });
    module.calibrateTime({ timeStampMillis: 1 });
    module.getPresetProperties(event);
    module.getSuperProperties(event);
    module.getDeviceId(event);
    expect(hilog.error).toHaveBeenCalled();
  });
});
