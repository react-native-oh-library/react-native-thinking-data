import {
  TDAnalytics,
  TDConfig,
  TDMode,
  TDAutoTrackEventType
} from '@thinkingdata/analytics';
import {
  TDEventOptions,
  TDSpecialEventOptions,
  TDUserOptions,
  TDUnsetOptions,
  TDUserDeleteOptions
} from '@thinkingdata/analytics/src/main/ets/components/entity/TDOptions';
import { UITurboModule, UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { common } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';

const TAG: string = 'RNThinkingAnalytics';
const VIEW_PROPERTIES_LIMIT: number = 512;

type TARecord = Record<string, Object>;

type TDAutoTrackEventCallback = (command: string, params: Object, appId: string) => void;

interface TASecretKey {
  version?: number;
  publicKey?: string;
}

class TAInitOptions {
  appId?: string;
  appid?: string;
  serverUrl?: string;
  mode?: string;
  timeZone?: number;
  enableEncrypt?: boolean;
  secretKey?: TASecretKey;
  enableLog?: boolean;
}

class TAEventOptions {
  appId?: string;
  appid?: string;
  eventName?: string;
  properties?: TARecord;
  eventId?: string;
  time?: number;
  timeZone?: number;
}

class TATrackEventOptions extends TAEventOptions {
}

class TALoginOptions extends TAEventOptions {
  loginId?: string;
}

class TAAppIdOptions extends TAEventOptions {
}

class TAUserUnsetOptions extends TAEventOptions {
  property?: string;
}

class TAIdentifyOptions extends TAEventOptions {
  distinctId?: string;
}

class TAAutoTrackOptions extends TAEventOptions {
  autoTrackType?: Object;
  types?: Object;
}

class TACalibrateTimeOptions extends TAEventOptions {
  timeStampMillis?: number;
}

class TACalibrateTimeWithNtpOptions extends TAEventOptions {
  ntp_server?: string;
}

class TAThirdPartyOptions extends TAEventOptions {
  types?: number;
  params?: TARecord;
}

class TATrackStatusOptions extends TAEventOptions {
  status?: string;
}

class TASaveViewPropertiesOptions extends TAEventOptions {
  thinkingdataurl?: string;
  thinkingdataparams?: TARecord;
}

class TDViewProperties {
  elementContent: string = '';
  params: TARecord = {};
  isIgnore: boolean = false;

  constructor(elementContent: string, params: TARecord) {
    this.elementContent = elementContent;
    if (params['TDIgnoreViewClick'] !== undefined) {
      this.isIgnore = Boolean(params['TDIgnoreViewClick']);
    }
    this.params = omitRecordKey(params, 'TDIgnoreViewClick');
  }
}

function omitRecordKey(source: TARecord, key: string): TARecord {
  const result: TARecord = {};
  const keys = Object.keys(source);
  for (const k of keys) {
    if (k === key) {
      continue;
    }
    result[k] = source[k];
  }
  return result;
}

export class RNThinkingAnalyticsModule extends UITurboModule {
  public static readonly NAME: string = 'RNThinkingAnalyticsModule';
  private context: common.UIAbilityContext | undefined = undefined;

  private isEnableAutoTrack: boolean = false;
  private isEnablePageView: boolean = false;
  private isEnableViewClick: boolean = false;
  private previewPageViewList: TARecord[] = [];
  private lastScreenName: string = '';
  private currentScreenName: string = '';
  private currentTitle: string = '';
  private viewPropertiesMap: Map<number, TDViewProperties> = new Map<number, TDViewProperties>();

  constructor(ctx: UITurboModuleContext) {
    super(ctx);
    this.context = ctx?.uiAbilityContext;
  }

  __invalidate(): void {
    this.releaseModuleState();
  }

  private releaseModuleState(): void {
    this.viewPropertiesMap.clear();
    this.previewPageViewList = [];
    this.isEnableAutoTrack = false;
    this.isEnablePageView = false;
    this.isEnableViewClick = false;
    this.lastScreenName = '';
    this.currentScreenName = '';
    this.currentTitle = '';
    this.context = undefined;
  }

  private appIdOf(options: TAEventOptions): string | undefined {
    if (options === undefined || options === null) {
      return undefined;
    }
    const appId = options.appId;
    if (appId !== undefined && appId !== null) {
      return appId as string;
    }
    return options.appid as string | undefined;
  }

  private safeString(value: Object | undefined | null, fallback: string): string {
    if (value === undefined || value === null) {
      return fallback;
    }
    const str = value as string;
    return str;
  }

  private getTimeZoneId(timeZoneOffset: number): string {
    if (timeZoneOffset < -12 || timeZoneOffset > 14) {
      return '';
    }
    let hour = Math.trunc(timeZoneOffset);
    let minute = Math.round((timeZoneOffset - hour) * 60);
    if (minute >= 60) {
      hour += 1;
      minute -= 60;
    } else if (minute <= -60) {
      hour -= 1;
      minute += 60;
    }
    const sign = hour >= 0 ? '+' : '-';
    const absHour = Math.abs(hour).toString().padStart(2, '0');
    const absMinute = Math.abs(minute).toString().padStart(2, '0');
    return `GMT${sign}${absHour}:${absMinute}`;
  }

  private toDate(timeMillis: number | undefined): Date | undefined {
    if (timeMillis !== undefined && timeMillis !== null && timeMillis > 0) {
      return new Date(timeMillis);
    }
    return undefined;
  }

  private buildEventOptions(options: TAEventOptions): TDEventOptions {
    const result = new TDEventOptions();
    result.eventName = this.safeString(options.eventName, '');
    const properties = options.properties;
    if (properties !== undefined && properties !== null) {
      result.properties = properties;
    }
    const time = options.time as number | undefined;
    const timeZone = options.timeZone as number | undefined;
    const date = this.toDate(time);
    if (date !== undefined) {
      result.time = date;
    }
    if (timeZone !== undefined && timeZone !== null) {
      result.timeZone = timeZone;
    }
    return result;
  }

  private buildSpecialEventOptions(options: TAEventOptions): TDSpecialEventOptions {
    const result = new TDSpecialEventOptions();
    result.eventName = this.safeString(options.eventName, '');
    result.eventId = this.safeString(options.eventId, '');
    const properties = options.properties;
    if (properties !== undefined && properties !== null) {
      result.properties = properties;
    }
    const time = options.time as number | undefined;
    const timeZone = options.timeZone as number | undefined;
    const date = this.toDate(time);
    if (date !== undefined) {
      result.time = date;
    }
    if (timeZone !== undefined && timeZone !== null) {
      result.timeZone = timeZone;
    }
    return result;
  }

  init(options: TAInitOptions, libVersion: string): void {
    try {
      if (options === undefined || options === null) {
        hilog.error(0x0000, TAG, 'init failed: options is empty');
        return;
      }
      const appId = this.safeString(options.appId, this.safeString(options.appid, ''));
      const serverUrl = this.safeString(options.serverUrl, '');
      if (appId.length === 0 || serverUrl.length === 0) {
        hilog.error(0x0000, TAG, 'init failed: appId or serverUrl is empty');
        return;
      }
      const context = this.context;
      if (context === undefined) {
        hilog.error(0x0000, TAG, 'init failed: UIAbilityContext is unavailable');
        return;
      }
      const config = new TDConfig();
      config.appId = appId;
      config.serverUrl = serverUrl;
      const mode = options.mode;
      if (mode === 'debug') {
        config.mode = TDMode.DEBUG;
      } else if (mode === 'debugOnly') {
        config.mode = TDMode.DEBUG_ONLY;
      }
      const timeZone = options.timeZone;
      if (timeZone !== undefined && timeZone !== null) {
        config.defaultTimeZone = timeZone as number;
      }
      const enableEncrypt = options.enableEncrypt;
      const secretKey = options.secretKey;
      if (enableEncrypt === true && secretKey !== undefined && secretKey !== null) {
        const version = secretKey.version;
        const publicKey = secretKey.publicKey;
        if (version !== undefined && publicKey !== undefined && publicKey !== null) {
          config.enableEncrypt(version as number, publicKey as string);
        }
      }
      const enableLog = options.enableLog;
      if (enableLog !== undefined && enableLog !== null) {
        TDAnalytics.enableLog(enableLog as boolean);
      }
      if (libVersion !== undefined && libVersion !== null && libVersion.length > 0) {
        TDAnalytics.setCustomerLibInfo('ReactNative', libVersion);
      }
      TDAnalytics.initWithConfig(context, config);
    } catch (err) {
      hilog.error(0x0000, TAG, 'init exception: %{public}s', JSON.stringify(err));
    }
  }

  track(options: TAEventOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const eventOptions = this.buildEventOptions(options);
      TDAnalytics.track(eventOptions, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'track exception: %{public}s', JSON.stringify(err));
    }
  }

  trackUpdate(options: TAEventOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const eventOptions = this.buildSpecialEventOptions(options);
      TDAnalytics.trackUpdate(eventOptions, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'trackUpdate exception: %{public}s', JSON.stringify(err));
    }
  }

  trackOverwrite(options: TAEventOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const eventOptions = this.buildSpecialEventOptions(options);
      TDAnalytics.trackOverwrite(eventOptions, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'trackOverwrite exception: %{public}s', JSON.stringify(err));
    }
  }

  trackFirstEvent(options: TAEventOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const eventOptions = this.buildSpecialEventOptions(options);
      TDAnalytics.trackFirst(eventOptions, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'trackFirstEvent exception: %{public}s', JSON.stringify(err));
    }
  }

  timeEvent(options: TAEventOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const eventName = this.safeString(options.eventName, '');
      if (eventName.length === 0) {
        return;
      }
      TDAnalytics.timeEvent(eventName, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'timeEvent exception: %{public}s', JSON.stringify(err));
    }
  }

  login(options: TALoginOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const loginId = this.safeString(options.loginId, '');
      TDAnalytics.login(loginId, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'login exception: %{public}s', JSON.stringify(err));
    }
  }

  logout(options: TAAppIdOptions): void {
    try {
      const appId = this.appIdOf(options);
      TDAnalytics.logout(appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'logout exception: %{public}s', JSON.stringify(err));
    }
  }

  private userOptionsOf(properties: TARecord): TDUserOptions {
    const options = new TDUserOptions();
    options.properties = properties;
    return options;
  }

  userSet(options: TAEventOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const properties = options.properties;
      if (properties === undefined || properties === null) {
        return;
      }
      TDAnalytics.userSet(this.userOptionsOf(properties), appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'userSet exception: %{public}s', JSON.stringify(err));
    }
  }

  userUnset(options: TAUserUnsetOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const property = this.safeString(options.property, '');
      const unsetOptions = new TDUnsetOptions();
      unsetOptions.property = property;
      TDAnalytics.userUnset(unsetOptions, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'userUnset exception: %{public}s', JSON.stringify(err));
    }
  }

  userSetOnce(options: TAEventOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const properties = options.properties;
      if (properties === undefined || properties === null) {
        return;
      }
      TDAnalytics.userSetOnce(this.userOptionsOf(properties), appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'userSetOnce exception: %{public}s', JSON.stringify(err));
    }
  }

  userAdd(options: TAEventOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const properties = options.properties;
      if (properties === undefined || properties === null) {
        return;
      }
      TDAnalytics.userAdd(this.userOptionsOf(properties), appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'userAdd exception: %{public}s', JSON.stringify(err));
    }
  }

  userDel(options: TAAppIdOptions): void {
    try {
      const appId = this.appIdOf(options);
      const deleteOptions = new TDUserDeleteOptions();
      TDAnalytics.userDelete(deleteOptions, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'userDel exception: %{public}s', JSON.stringify(err));
    }
  }

  userAppend(options: TAEventOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const properties = options.properties;
      if (properties === undefined || properties === null) {
        return;
      }
      TDAnalytics.userAppend(this.userOptionsOf(properties), appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'userAppend exception: %{public}s', JSON.stringify(err));
    }
  }

  userUniqAppend(options: TAEventOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const properties = options.properties;
      if (properties === undefined || properties === null) {
        return;
      }
      TDAnalytics.userUniqAppend(this.userOptionsOf(properties), appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'userUniqAppend exception: %{public}s', JSON.stringify(err));
    }
  }

  setSuperProperties(options: TAEventOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const properties = options.properties;
      if (properties === undefined || properties === null) {
        return;
      }
      TDAnalytics.setSuperProperties(properties, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'setSuperProperties exception: %{public}s', JSON.stringify(err));
    }
  }

  unsetSuperProperty(options: TAUserUnsetOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const property = this.safeString(options.property, '');
      TDAnalytics.unsetSuperProperty(property, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'unsetSuperProperty exception: %{public}s', JSON.stringify(err));
    }
  }

  clearSuperProperties(options: TAAppIdOptions): void {
    try {
      const appId = this.appIdOf(options);
      TDAnalytics.clearSuperProperties(appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'clearSuperProperties exception: %{public}s', JSON.stringify(err));
    }
  }

  identify(options: TAIdentifyOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const appId = this.appIdOf(options);
      const distinctId = this.safeString(options.distinctId, '');
      TDAnalytics.setDistinctId(distinctId, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'identify exception: %{public}s', JSON.stringify(err));
    }
  }

  flush(options: TAAppIdOptions): void {
    try {
      const appId = this.appIdOf(options);
      TDAnalytics.flush(appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'flush exception: %{public}s', JSON.stringify(err));
    }
  }

  enableAutoTrack(options: TAAutoTrackOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const context = this.context;
      if (context === undefined) {
        hilog.error(0x0000, TAG, 'enableAutoTrack failed: UIAbilityContext is unavailable');
        return;
      }
      const appId = this.appIdOf(options);
      const types: number = this.autoTrackMaskOf(options.autoTrackType);
      const properties = options.properties;
      this.isEnableAutoTrack = true;
      if ((types & TDAutoTrackEventType.APP_VIEW_SCREEN) > 0) {
        this.isEnablePageView = true;
        for (const event of this.previewPageViewList) {
          TDAnalytics.track(this.viewOptionsOf('ta_app_view', event));
        }
        this.previewPageViewList = [];
      } else {
        this.isEnablePageView = false;
        this.previewPageViewList = [];
      }
      this.isEnableViewClick = (types & TDAutoTrackEventType.APP_CLICK) > 0;
      const noHandler: TDAutoTrackEventCallback | undefined = undefined;
      if (properties !== undefined && properties !== null) {
        TDAnalytics.enableAutoTrackProperties(context, types, properties, noHandler, appId);
      } else {
        TDAnalytics.enableAutoTrack(context, types, noHandler, appId);
      }
    } catch (err) {
      hilog.error(0x0000, TAG, 'enableAutoTrack exception: %{public}s', JSON.stringify(err));
    }
  }

  setAutoTrackProperties(options: TAAutoTrackOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const context = this.context;
      if (context === undefined) {
        return;
      }
      const properties = options.properties;
      if (properties === undefined || properties === null) {
        return;
      }
      const types: number = this.autoTrackMaskOf(options.types);
      if (types === 0) {
        return;
      }
      const appId = this.appIdOf(options);
      const noHandler: TDAutoTrackEventCallback | undefined = undefined;
      TDAnalytics.enableAutoTrackProperties(context, types, properties, noHandler, appId);
    } catch (err) {
      hilog.error(0x0000, TAG, 'setAutoTrackProperties exception: %{public}s', JSON.stringify(err));
    }
  }

  calibrateTime(options: TACalibrateTimeOptions): void {
    try {
      if (options === undefined || options === null) {
        return;
      }
      const timeStampMillis = options.timeStampMillis as number | undefined;
      if (timeStampMillis === undefined || timeStampMillis === null) {
        return;
      }
      TDAnalytics.calibrateTime(timeStampMillis as number);
    } catch (err) {
      hilog.error(0x0000, TAG, 'calibrateTime exception: %{public}s', JSON.stringify(err));
    }
  }

  calibrateTimeWithNtp(options: TACalibrateTimeWithNtpOptions): void {
    try {
      const ntpServer = options === undefined || options === null ? undefined : options.ntp_server;
      hilog.warn(0x0000, TAG,
        'calibrateTimeWithNtp(%{public}s) is not supported by @thinkingdata/analytics on HarmonyOS; ignored',
        typeof ntpServer === 'string' ? ntpServer : '');
    } catch (err) {
      hilog.error(0x0000, TAG, 'calibrateTimeWithNtp exception: %{public}s', JSON.stringify(err));
    }
  }

  enableThirdPartySharing(options: TAThirdPartyOptions): void {
    try {
      hilog.warn(0x0000, TAG,
        'enableThirdPartySharing is not supported by @thinkingdata/analytics on HarmonyOS; ignored');
    } catch (err) {
      hilog.error(0x0000, TAG, 'enableThirdPartySharing exception: %{public}s', JSON.stringify(err));
    }
  }

  setTrackStatus(options: TATrackStatusOptions): void {
    try {
      hilog.warn(0x0000, TAG, 'setTrackStatus is not supported by @thinkingdata/analytics on HarmonyOS; ignored');
    } catch (err) {
      hilog.error(0x0000, TAG, 'setTrackStatus exception: %{public}s', JSON.stringify(err));
    }
  }

  // ARK_ASYNC_METHOD_METADATA requires Promise returns; sync string/object
  // returns crash RNOH with "Failed to retrieve property from object".
  async getPresetProperties(options: TAAppIdOptions): Promise<TARecord | null> {
    try {
      const appId = this.appIdOf(options);
      return this.parsePropertyRecord(TDAnalytics.getPresetProperties(appId));
    } catch (err) {
      hilog.error(0x0000, TAG, 'getPresetProperties exception: %{public}s', JSON.stringify(err));
      return null;
    }
  }

  async getSuperProperties(options: TAAppIdOptions): Promise<TARecord | null> {
    try {
      const appId = this.appIdOf(options);
      return this.parsePropertyRecord(TDAnalytics.getSuperProperties(appId));
    } catch (err) {
      hilog.error(0x0000, TAG, 'getSuperProperties exception: %{public}s', JSON.stringify(err));
      return null;
    }
  }

  async getDistinctId(options: TAAppIdOptions): Promise<string | null> {
    try {
      const appId = this.appIdOf(options);
      const distinctId: string = TDAnalytics.getDistinctId(appId);
      if (distinctId === undefined || distinctId === null) {
        return null;
      }
      return distinctId;
    } catch (err) {
      hilog.error(0x0000, TAG, 'getDistinctId exception: %{public}s', JSON.stringify(err));
      return null;
    }
  }

  async getAccountId(options: TAAppIdOptions): Promise<string | null> {
    try {
      const appId = this.appIdOf(options);
      const accountId: string = TDAnalytics.getAccountId(appId);
      if (accountId === undefined || accountId === null) {
        return null;
      }
      return accountId;
    } catch (err) {
      hilog.error(0x0000, TAG, 'getAccountId exception: %{public}s', JSON.stringify(err));
      return null;
    }
  }

  async getDeviceId(options: TAAppIdOptions): Promise<string | null> {
    try {
      const appId = this.appIdOf(options);
      const deviceId: string = TDAnalytics.getDeviceId(appId);
      if (deviceId === undefined || deviceId === null) {
        return null;
      }
      return deviceId;
    } catch (err) {
      hilog.error(0x0000, TAG, 'getDeviceId exception: %{public}s', JSON.stringify(err));
      return null;
    }
  }

  trackViewScreen(params: TASaveViewPropertiesOptions): void {
    try {
      if (params === undefined || params === null) {
        return;
      }
      const tdUrl = this.safeString(params.thinkingdataurl, '');
      const thinkingDataParams = params.thinkingdataparams;
      let properties: TARecord = {};
      if (thinkingDataParams !== undefined && thinkingDataParams !== null) {
        for (const key of Object.keys(thinkingDataParams)) {
          properties[key] = thinkingDataParams[key];
        }
      }
      const isIgnoreValue = properties['TDIgnoreViewScreen'];
      if (isIgnoreValue !== undefined && Boolean(isIgnoreValue)) {
        return;
      }
      properties = omitRecordKey(properties, 'TDIgnoreViewScreen');
      if (properties['#title'] === undefined && tdUrl.length > 0) {
        properties['#title'] = tdUrl;
      }
      if (this.lastScreenName.length > 0) {
        properties['#referrer'] = this.lastScreenName;
      }
      if (properties['#screen_name'] === undefined && tdUrl.length > 0) {
        this.lastScreenName = tdUrl;
        properties['#screen_name'] = tdUrl;
      } else if (properties['#screen_name'] !== undefined) {
        this.lastScreenName = properties['#screen_name'] as string;
      }
      this.currentTitle = properties['#title'] !== undefined ? properties['#title'] as string : '';
      this.currentScreenName =
        properties['#screen_name'] !== undefined ? properties['#screen_name'] as string : '';
      if (this.isEnableAutoTrack) {
        if (this.isEnablePageView) {
          TDAnalytics.track(this.viewOptionsOf('ta_app_view', properties));
        }
      } else {
        if (this.previewPageViewList.length < 5) {
          this.previewPageViewList.push(properties);
        }
      }
    } catch (err) {
      hilog.error(0x0000, TAG, 'trackViewScreen exception: %{public}s', JSON.stringify(err));
    }
  }

  trackViewClick(viewId: number): void {
    try {
      if (!this.isEnableViewClick) {
        return;
      }
      const viewInfo = this.viewPropertiesMap.get(viewId);
      if (viewInfo === undefined || viewInfo.isIgnore) {
        return;
      }
      const params = this.copyRecord(viewInfo.params);
      params['#element_content'] = viewInfo.elementContent;
      params['#title'] = this.currentTitle;
      params['#screen_name'] = this.currentScreenName;
      TDAnalytics.track(this.viewOptionsOf('ta_app_click', params));
    } catch (err) {
      hilog.error(0x0000, TAG, 'trackViewClick exception: %{public}s', JSON.stringify(err));
    }
  }

  saveViewProperties(viewId: number, title: string, viewProperties: TARecord | null): void {
    try {
      this.putViewProperties(viewId, title, viewProperties);
    } catch (err) {
      hilog.error(0x0000, TAG, 'saveViewProperties exception: %{public}s', JSON.stringify(err));
    }
  }

  saveRootViewProperties(viewId: number, title: string, viewProperties: TARecord | null, _rootTag: number): void {
    try {
      this.putViewProperties(viewId, title, viewProperties);
    } catch (err) {
      hilog.error(0x0000, TAG, 'saveRootViewProperties exception: %{public}s', JSON.stringify(err));
    }
  }

  private autoTrackBitOfName(name: string): number {
    if (name === 'appStart') {
      return TDAutoTrackEventType.APP_START;
    }
    if (name === 'appEnd') {
      return TDAutoTrackEventType.APP_END;
    }
    if (name === 'appViewCrash') {
      return TDAutoTrackEventType.APP_CRASH;
    }
    if (name === 'appInstall') {
      return TDAutoTrackEventType.APP_INSTALL;
    }
    return 0;
  }

  private autoTrackMaskOf(value: Object | undefined | null): number {
    if (value === undefined || value === null) {
      return 0;
    }
    if (typeof value === 'number') {
      return value as number;
    }
    if (typeof value === 'string') {
      return this.autoTrackBitOfName(value as string);
    }
    if (value instanceof Array) {
      const items = value as Object[];
      let mask = 0;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (typeof item === 'number') {
          mask |= item as number;
        } else if (typeof item === 'string') {
          mask |= this.autoTrackBitOfName(item as string);
        }
      }
      return mask;
    }
    return 0;
  }

  private parsePropertyRecord(raw: Object | string | undefined | null): TARecord | null {
    if (raw === undefined || raw === null) {
      return null;
    }
    if (typeof raw === 'string') {
      const text = raw as string;
      if (text.length === 0) {
        return null;
      }
      const parsed: Object = JSON.parse(text);
      if (parsed === undefined || parsed === null || typeof parsed !== 'object') {
        return null;
      }
      return parsed as TARecord;
    }
    if (typeof raw === 'object') {
      return raw as TARecord;
    }
    return null;
  }

  private evictOldestViewProperty(): void {
    let oldestKey: number | undefined = undefined;
    this.viewPropertiesMap.forEach((_value: TDViewProperties, key: number) => {
      if (oldestKey === undefined) {
        oldestKey = key;
      }
    });
    if (oldestKey !== undefined) {
      this.viewPropertiesMap.delete(oldestKey);
    }
  }

  private putViewProperties(viewId: number, title: string, viewProperties: TARecord | null): void {
    if (!this.viewPropertiesMap.has(viewId) &&
      this.viewPropertiesMap.size >= VIEW_PROPERTIES_LIMIT) {
      this.evictOldestViewProperty();
    }
    this.viewPropertiesMap.set(viewId, new TDViewProperties(title, this.copyRecord(viewProperties)));
  }

  private copyRecord(source: TARecord | null): TARecord {
    const result: TARecord = {};
    if (source === undefined || source === null) {
      return result;
    }
    for (const key of Object.keys(source)) {
      result[key] = source[key];
    }
    return result;
  }

  private viewOptionsOf(eventName: string, properties: TARecord): TDEventOptions {
    const options = new TDEventOptions();
    options.eventName = eventName;
    options.properties = properties;
    return options;
  }
}
