export default TDAnalytics;
export namespace TDMode {
    let NORMAL: string;
    let DEBUG: string;
    let DEBUG_ONLY: string;
}
export namespace TDAutoTrackEventType {
    let APP_START: number;
    let APP_END: number;
    let APP_CLICK:number;
    let APP_VIEW_SCREEN:number;
    let APP_CRASH: number;
    let APP_INSTALL: number;
}
export namespace TDTrackStatus {
    let PAUSE: string;
    let STOP: string;
    let SAVE_ONLY: string;
    let NORMAL: string;
}
export namespace TDThirdPartyType {
    let APPS_FLYER: number;
    let IRON_SOURCE: number;
    let ADJUST: number;
    let BRANCH: number;
    let TOP_ON: number;
    let TRACKING: number;
    let TRAD_PLUS: number;
}

type TDModeType = typeof TDMode.NORMAL | typeof TDMode.DEBUG | typeof TDMode.DEBUG_ONLY;
type TDThirdPartyMode = typeof TDThirdPartyType.APPS_FLYER | typeof TDThirdPartyType.ADJUST | typeof TDThirdPartyType.BRANCH | typeof TDThirdPartyType.IRON_SOURCE
    | typeof TDThirdPartyType.TOP_ON | typeof TDThirdPartyType.TRACKING

type TDAutoTrackEventMode = typeof TDAutoTrackEventType.APP_START | typeof TDAutoTrackEventType.APP_END
    | typeof TDAutoTrackEventType.APP_CLICK | typeof TDAutoTrackEventType.APP_VIEW_SCREEN
    | typeof TDAutoTrackEventType.APP_INSTALL | typeof TDAutoTrackEventType.APP_CRASH
type TDTrackStatusMode = typeof TDTrackStatus.NORMAL | typeof TDTrackStatus.STOP | typeof TDTrackStatus.SAVE_ONLY | typeof TDTrackStatus.PAUSE

interface TDConfig {
    appId: string;
    serverUrl: string;
    mode?: TDModeType,
    enableEncrypt?: boolean;
    secretKey?: {
        publicKey: string;
        version: number;
    };
    enableLog?: boolean;
    timeZone?: number;
}

interface TDEvent {
    eventName: string;
    properties?: object;
    time?: Date;
    timeZone?: number;
}

interface TDSpecialEvent {
    eventName: string;
    properties?: object;
    time?: Date;
    timeZone?: number;
    eventId?: string
}

interface TDThirdPartyPramas {
    types: TDThirdPartyMode;
    params?: object;
}

/**
 * @class
 */
declare class TDAnalytics {
    static instances: {};
    /**
     * time calibration with timestamp
     * @param {number} time timestamp
     */
    static calibrateTime(time: number): void;
    /**
     * time calibration with ntp
     * @param {String} ntp_server  ntp server url
     */
    static calibrateTimeWithNtp(ntp_server: string): void;
    /**
     * Initialize the SDK. The track function is not available until this interface is invoked.
     * @param {String} appId app id,required
     * @param {String} serverUrl server url,required
     */
    static init(appId: string, serverUrl: string): void;
    /**
     * Initialize the SDK with config. The track function is not available until this interface is invoked.
     * @param {Object} config init config
     * 
     * @property {String} appId config.appid,required
     * @property {String} serverUrl config.serverUrl,required
     * @property {boolean} enableEncrypt config.enableEncrypt whether to enable encryption,optional
     * @property {Object} secretKey config.secretKey encrypt configuration information,optional
     * @property {boolean} enableLog config.enableLog whether to enable local logging,optional
     * @property {String} timeZone config.timeZone default time zone,optional
     */
    static init(appId: TDConfig): void;
    /**
     * Upload a single event, containing only preset properties and set public properties.
     * @param {Object} options event infomations
     *
     * @property {String} eventName options.eventName event name, required
     * @property {Object} properties  options.properties event properties, optional
     * @property {long} time  options.time event timeStamp, optional
     * @property {String} timeZone  options.timeZone event time zone, optional
     * @property {String} appId app id,optional
     */
    static track(options: TDEvent, appId?: string): void;
    /**
     * Sending First Event
     * @param {Object} options event infomations
     *
     * @property {String} eventName options.eventName event name, required
     * @property {Object} properties  options.properties event properties, optional
     * @property {String} eventId  options.eventId event ID, to mark the event, optional
     * @property {long} time  options.time event timeStamp, optional
     * @property {String} timeZone  options.timeZone event time zone, optional
     * @property {String} appId app id,optional
     */
    static trackFirst(options: TDSpecialEvent, appId?: string): void;
    /**
     * Sending Updatable Event
     * @param {Object} options event infomations
     *
     * @property {String} eventName options.eventName event name, required
     * @property {Object} properties  options.properties event properties, optional
     * @property {String} eventId  options.eventId event ID, to mark the event, optional
     * @property {long} time  options.time event timeStamp, optional
     * @property {String} timeZone  options.timeZone event time zone, optional
     * @property {String} appId app id,optional
     */
    static trackUpdate(options: TDSpecialEvent, appId?: string): void;
    /**
     * Sending Overwritable Event
     * @param {Object} options event infomations
     *
     * @property {String} eventName options.eventName event name, required
     * @property {Object} properties  options.properties event properties, optional
     * @property {String} eventId  options.eventId event ID, to mark the event, optional
     * @property {long} time  options.time event timeStamp, optional
     * @property {String} timeZone  options.timeZone event time zone, optional
     * @property {String} appId app id,optional
     */
    static trackOverwrite(options: TDSpecialEvent, appId?: string): void;
    /**
     * Record the event duration, call this method to start the timing, stop the timing when the target event is uploaded, and add the attribute #duration to the event properties, in seconds.
     * @param {String} eventName event name,required
     * @param {String} appId app id,optional
     */
    static timeEvent(eventName: string, appId?: string): void;
    /**
     * Enable the auto tracking function.
     * @param {TDAutoTrackEventType} autoTrackEventType Indicates the type of the automatic collection event to be enabled,required
     * @param {String} appId app id,optional
     */
    static enableAutoTrack(autoTrackEventType: TDAutoTrackEventMode, properties?: object, appId?: string): void;
    /**
     * Enable the auto tracking function with properties.
     * @param {Object} options autoTrack infomations
     * @property {TDAutoTrackEventType} autoTrackTypes options.autoTrackTypes, required
     * @property {Object} properties options.properties, required
     * @property {String} appId options.appId, optional
     */
    static enableAutoTrackWithProperties(options: {
        autoTrackTypes?: number;
        properties?: object;
        appId?: string;
    }): void;
    /**
     * Sets the user property, replacing the original value with the new value if the property already exists.
     * @param {Object} options user properties,required
     * @param {String} appId app id,optional
     */
    static userSet(properties: object, appId?: string): void;
    /**
     * Sets a single user attribute, ignoring the new attribute value if the attribute already exists.
     * @param {Object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userSetOnce(properties: object, appId?: string): void;
    /**
     * Reset user properties.
     * @param {String} property user property,required
     * @param {String} appId app id,optional
     */
    static userUnset(property: string, appId?: string): void;
    /**
     * Only one attribute is set when the user attributes of a numeric type are added.
     * @param {object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userAdd(properties: object, appId?: string): void;
    /**
     * Append a user attribute of the List type.
     * @param {Object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userAppend(properties: object, appId?: string): void;
    /**
     * The element appended to the library needs to be done to remove the processing, remove the support, and then import.
     * @param {Object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userUniqAppend(properties: object, appId?: string): void;
    /**
     * Delete the user attributes, but retain the uploaded event data. This operation is not reversible and should be performed with caution.
     * @param {String} appId app id,optional
     */
    static userDelete(appId?: string): void;
    /**
     * Set the public event attribute, which will be included in every event uploaded after that. The public event properties are saved without setting them each time.
     * @param {Object} properties super properties,required
     * @param {String} appId app id,optional
     */
    static setSuperProperties(properties: object, appId?: string): void;
    /**
     * Clears a public event attribute.
     * @param {String} property public event attribute key to clear,required
     * @param {String} appId app id,optional
     */
    static unsetSuperProperty(property: string, appId?: string): void;
    /**
     * Clear all public event attributes.
     * @param {String} appId app id,optional
     */
    static clearSuperProperties(appId?: string): void;
    /**
     * Gets the public event properties that have been set.
     * @param {String} appId app id,optional
     * @returns Public event properties that have been set
     */
    static getSuperProperties(appId?: string): Promise<object | null>;
    /**
     * Set dynamic public properties. Each event uploaded after that will contain a public event attribute.
     * @param {Object} dynamicProperties dynamic public properties,required
     * @param {String} appId app id,optional
     */
    static setDynamicSuperProperties(dynamicProperties: Function, appId?: string): void;
    /**
     * Gets prefabricated properties for all events.
     * @param {String} appId app id,optional
     * @returns preset properties
     */
    static getPresetProperties(appId?: string): Promise<object | null>;
    /**
     *  Set the account ID. Each setting overrides the previous value. Login events will not be uploaded.
     * @param {String} loginId account id,required
     * @param {String} appId app id,optional
     */
    static login(loginId: string, appId?: string): void;
    /**
     * Clearing the account ID will not upload user logout events.
     * @param {String} appId app id,optional
     */
    static logout(appId?: string): void;
    /**
     * Set the distinct ID to replace the default UUID distinct ID.
     * @param {String} distinctId distinct id,required
     * @param {String} appId app id,optional
     */
    static setDistinctId(distinctId: string, appId?: string): void;
    /**
     * Get a visitor ID: The #distinct_id value in the reported data.
     * @param {String} appId app id,optional
     * @returns distinct id
     */
    static getDistinctId(appId?: string): Promise<string | null>;

    static getAccountId(appId?: string): Promise<string | null>;
    /**
     * Obtain the device ID.
     * @param {String} appId app id,optional
     * @returns device id,optional
     */
    static getDeviceId(appId?: string): Promise<string | null>;
    /**
     * Empty the cache queue. When this function is called, the data in the current cache queue will attempt to be reported.
     * If the report succeeds, local cache data will be deleted.
     * @param {String} appId app id,optional
     */
    static flush(appId?: string): void;
    /**
     * The switch reporting status is suspended and restored.
     * @param {TDTrackStatus} status TDTrackStatus,required
     * @param {String} appId app id,optional
     */
    static setTrackStatus(status: TDTrackStatusMode, appId?: string): void;
    /**
     *  Enable three-party data synchronization.
     * @param {Object} options third infomations
     *
     * @property {TDThirdPartyType} types third types,required
     * @property {Object} params extras,optional
     * @property {String} appId app id,optional
     */
    static enableThirdPartySharing(options: TDThirdPartyPramas, appId?: string): void;

    /**
     * h5 event handler. 
     * @param {String} eventData event data,required
     */
    static h5ClickHandler(eventData: string): void;
}
