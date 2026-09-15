
import { Platform } from 'react-native';

import thinkingdata, { AutoTrackEventType, TAThirdPartyShareType, TATrackStatus } from "./ThinkingAnalyticsAPI";

function isHarmonyOS() {
    return Platform.OS === 'harmony' || Platform.OS === 'openharmony' || Platform.OS === 'ohos';
}

const TDMode = {
    NORMAL: 'normal',
    DEBUG: 'debug',
    DEBUG_ONLY: 'debugOnly'
}

const TDAutoTrackEventType = {
    APP_START: 1,
    APP_END: 1 << 1,
    APP_CLICK : 1 << 2,
    APP_VIEW_SCREEN : 1 << 3,
    APP_CRASH: 1 << 4,
    APP_INSTALL: 1 << 5
}
const TDTrackStatus = {
    PAUSE: 'pause',
    STOP: 'stop',
    SAVE_ONLY: 'saveOnly',
    NORMAL: 'normal'
}
const TDThirdPartyType = {
    APPS_FLYER: 1,
    IRON_SOURCE: 1 << 1,
    ADJUST: 1 << 2,
    BRANCH: 1 << 3,
    TOP_ON: 1 << 4,
    TRACKING: 1 << 5,
    TRAD_PLUS: 1 << 6
}

const TDEventType = {
    Track: "track",
    TrackFirst: "track_first",
    TrackUpdate: "track_update",
    TrackOverwrite: "track_overwrite",
    UserDel: "user_del",
    UserAdd: "user_add",
    UserSet: "user_set",
    UserSetOnce: "user_setOnce",
    UserUnset: "user_unset",
    UserAppend: "user_append",
    UserUniqAppend: "user_uniq_append",
};

/**
 * @class
 */
class TDAnalytics {
    static instances = {};
    /**
     * time calibration with timestamp
     * @param {long} time timestamp
     */
    static calibrateTime(time) {
        thinkingdata.calibrateTime(time);
    }

    /**
     * time calibration with ntp
     * @param {String} ntp_server  ntp server url
     */
    static calibrateTimeWithNtp(ntp_server) {
        thinkingdata.calibrateTimeWithNtp(ntp_server);
    }

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
    static init(config = {}) {
        if (typeof config === 'string') {
            config = {
                appId: arguments.length > 0 ? arguments[0] : undefined,
                serverUrl: arguments.length > 1 ? arguments[1] : undefined
            };
        }
        if (config['appid']) {
            config['appId'] = config['appid'];
        }
        if (!config['appid'] && config['appId']) {
            config['appid'] = config['appId'];
        }
        if (Object.keys(this.instances).length == 0) {
            thinkingdata.init(config);
            this.instances[config.appId] = thinkingdata;
        } else {
            var instance = thinkingdata.initInstance(config);
            this.instances[config.appId] = instance;
        }
    }

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
    static track(options = {},appId) {
        if (appId) {
            this.instances[appId].track(options['eventName'], options['properties'], options['time'], options['timeZone']);
        } else {
            thinkingdata.track(options['eventName'], options['properties'], options['time'], options['timeZone']);
        }
    }

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
    static trackFirst(options = {},appId) {
        if (appId) {
            this.instances[appId].trackFirstEvent(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        } else {
            thinkingdata.trackFirstEvent(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        }
    }

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
    static trackUpdate(options = {},appId) {
        if (appId) {
            this.instances[appId].trackUpdate(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        } else {
            thinkingdata.trackUpdate(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        }
    }

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
    static trackOverwrite(options = {},appId) {
        if (appId) {
            this.instances[appId].trackOverwrite(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        } else {
            thinkingdata.trackOverwrite(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        }
    }

    /**
     * Record the event duration, call this method to start the timing, stop the timing when the target event is uploaded, and add the attribute #duration to the event properties, in seconds.
     * @param {String} eventName event name,required
     * @param {String} appId app id,optional
     */
    static timeEvent(eventName, appId) {
        if (appId) {
            this.instances[appId].timeEvent(eventName);
        } else {
            thinkingdata.timeEvent(eventName);
        }
    }

    /**
     * Enable the auto tracking function.
     * @param {TDAutoTrackEventType} autoTrackEventType Indicates the type of the automatic collection event to be enabled,required
     * @param {String} appId app id,optional
     */
    static enableAutoTrack(autoTrackEventType, properties,appId) {
        if (appId) {
            this.instances[appId].enableAutoTrack(autoTrackEventType,properties);
        } else {
            thinkingdata.enableAutoTrack(autoTrackEventType,properties);
        }
    }

    /**
     * Enable the auto tracking function with properties
     * @param {Object} options  autoTrack infomations
     * 
     * @property {TDAutoTrackEventType}autoTrackTypes options.autoTrackEventType Indicates the type of the automatic collection event to be enabled,required
     * @property {Object} properties options.properties track event  properties,required
     * @property {String} appId options.appId app id,optional
     */
    static enableAutoTrackWithProperties(options = {}) {
        var appId = options['appId'];
        var autoTrackEventType = options['autoTrackTypes'];
        var properties = options['properties'];
        var autoTracks = [];
        if ((autoTrackEventType & TDAutoTrackEventType.APP_START) > 0) {
            autoTracks.push(AutoTrackEventType.APP_START);
        }
        if ((autoTrackEventType & TDAutoTrackEventType.APP_END) > 0) {
            autoTracks.push(AutoTrackEventType.APP_END);
        }
        if ((autoTrackEventType & TDAutoTrackEventType.APP_CRASH) > 0) {
            autoTracks.push(AutoTrackEventType.APP_CRASH);
        }
        if ((autoTrackEventType & TDAutoTrackEventType.APP_INSTALL) > 0) {
            autoTracks.push(AutoTrackEventType.APP_INSTALL);
        }
        if (appId) {
            this.instances[appId].setAutoTrackProperties(autoTracks, properties);
            this.instances[appId].enableAutoTrack(autoTracks);
        } else if (isHarmonyOS() && typeof thinkingdata.setAutoTrackProperties !== 'function') {
            thinkingdata.enableAutoTrack(autoTracks, properties);
        } else {
            thinkingdata.setAutoTrackProperties(autoTracks, properties);
            thinkingdata.enableAutoTrack(autoTracks);
        }
    }

    /**
     * Sets the user property, replacing the original value with the new value if the property already exists.
     * @param {Object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userSet(properties, appId) {
        if (appId) {
            this.instances[appId].userSet(properties);
        } else {
            thinkingdata.userSet(properties);
        }
    }

    /**
     * Sets a single user attribute, ignoring the new attribute value if the attribute already exists.
     * @param {Object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userSetOnce(properties, appId) {
        if (appId) {
            this.instances[appId].userSetOnce(properties);
        } else {
            thinkingdata.userSetOnce(properties);
        }
    }

    /**
     * Reset user properties.
     * @param {String} property user property,required
     * @param {String} appId app id,optional
     */
    static userUnset(property, appId) {
        if (appId) {
            this.instances[appId].userUnset(property);
        } else {
            thinkingdata.userUnset(property);
        }
    }

    /**
     * Only one attribute is set when the user attributes of a numeric type are added.
     * @param {object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userAdd(properties, appId) {
        if (appId) {
            this.instances[appId].userAdd(properties);
        } else {
            thinkingdata.userAdd(properties);
        }
    }

    /**
     * Append a user attribute of the List type.
     * @param {Object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userAppend(properties, appId) {
        if (appId) {
            this.instances[appId].userAppend(properties);
        } else {
            thinkingdata.userAppend(properties);
        }
    }

    /**
     * The element appended to the library needs to be done to remove the processing, remove the support, and then import.
     * @param {Object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userUniqAppend(properties, appId) {
        if (appId) {
            this.instances[appId].userUniqAppend(properties);
        } else {
            thinkingdata.userUniqAppend(properties);
        }
    }

    /**
     * Delete the user attributes, but retain the uploaded event data. This operation is not reversible and should be performed with caution.
     * @param {String} appId app id,optional
     */
    static userDelete(appId) {
        if (appId) {
            this.instances[appId].userDel();
        } else {
            thinkingdata.userDel();
        }
    }

    /**
     * Set the public event attribute, which will be included in every event uploaded after that. The public event properties are saved without setting them each time.
     * @param {Object} properties super properties,required
     * @param {String} appId app id,optional
     */
    static setSuperProperties(properties, appId) {
        if (appId) {
            this.instances[appId].setSuperProperties(properties);
        } else {
            thinkingdata.setSuperProperties(properties);
        }
    }

    /**
     * Clears a public event attribute.
     * @param {String} property public event attribute key to clear,required
     * @param {String} appId app id,optional
     */
    static unsetSuperProperty(property, appId) {
        if (appId) {
            this.instances[appId].unsetSuperProperty(property);
        } else {
            thinkingdata.unsetSuperProperty(property);
        }
    }

    /**
     * Clear all public event attributes.
     * @param {String} appId app id,optional
     */
    static clearSuperProperties(appId) {
        if (appId) {
            this.instances[appId].clearSuperProperties();
        } else {
            thinkingdata.clearSuperProperties();
        }
    }

    /**
     * Gets the public event properties that have been set.
     * @param {String} appId app id,optional
     * @returns Public event properties that have been set
     */
    static async getSuperProperties(appId) {
        if (appId) {
            return await this.instances[appId].getSuperProperties();
        } else {
            return await thinkingdata.getSuperProperties();
        }
    }

    /**
     * Set dynamic public properties. Each event uploaded after that will contain a public event attribute.
     * @param {Object} dynamicProperties dynamic public properties,required
     * @param {String} appId app id,optional
     */
    static setDynamicSuperProperties(dynamicProperties, appId) {
        if (appId) {
            this.instances[appId].setDynamicSuperProperties(dynamicProperties);
        } else {
            thinkingdata.setDynamicSuperProperties(dynamicProperties)
        }
    }

    /**
     * Gets prefabricated properties for all events.
     * @param {String} appId app id,optional
     * @returns preset properties
     */
    static async getPresetProperties(appId) {
        if (appId) {
            return await this.instances[appId].getPresetProperties();
        } else {
            return await thinkingdata.getPresetProperties();
        }
    }

    /**
     *  Set the account ID. Each setting overrides the previous value. Login events will not be uploaded.
     * @param {String} loginId account id,required
     * @param {String} appId app id,optional
     */
    static login(loginId, appId) {
        if (appId) {
            this.instances[appId].login(loginId);
        } else {
            thinkingdata.login(loginId);
        }
    }

    /**
     * Clearing the account ID will not upload user logout events.
     * @param {String} appId app id,optional
     */
    static logout(appId) {
        if (appId) {
            this.instances[appId].logout();
        } else {
            thinkingdata.logout();
        }
    }

    /**
     * Set the distinct ID to replace the default UUID distinct ID.
     * @param {String} distinctId distinct id,required
     * @param {String} appId app id,optional
     */
    static setDistinctId(distinctId, appId) {
        if (appId) {
            this.instances[appId].identify(distinctId);
        } else {
            thinkingdata.identify(distinctId);
        }
    }

    /**
     * Get a visitor ID: The #distinct_id value in the reported data.
     * @param {String} appId app id,optional
     * @returns distinct id
     */
    static async getDistinctId(appId) {
        if (appId) {
            return await this.instances[appId].getDistinctId();
        } else {
            return await thinkingdata.getDistinctId();
        }
    }

    static async getAccountId(appId){
        if (appId) {
            return await this.instances[appId].getAccountId();
        } else {
            return await thinkingdata.getAccountId();
        }
    }

    /**
     * Obtain the device ID.
     * @param {String} appId app id,optional
     * @returns device id,optional
     */
    static async getDeviceId(appId) {
        if (appId) {
            return await this.instances[appId].getDeviceId();
        } else {
            return await thinkingdata.getDeviceId();
        }
    }

    /**
     * Empty the cache queue. When this function is called, the data in the current cache queue will attempt to be reported.
     * If the report succeeds, local cache data will be deleted.
     * @param {String} appId app id,optional
     */
    static flush(appId) {
        if (appId) {
            this.instances[appId].flush();
        } else {
            thinkingdata.flush();
        }
    }

    /**
     * The switch reporting status is suspended and restored.
     * @param {TDTrackStatus} status TDTrackStatus,required
     * @param {String} appId app id,optional
     */
    static setTrackStatus(status, appId) {
        var s = TATrackStatus.NORMAL;
        if (status == TDTrackStatus.PAUSE) {
            s = TATrackStatus.PAUSE;
        } else if (status == TDTrackStatus.STOP) {
            s = TATrackStatus.STOP;
        } else if (status == TDTrackStatus.SAVE_ONLY) {
            s = TATrackStatus.SAVE_ONLY;
        }
        if (appId) {
            this.instances[appId].setTrackStatus(s);
        } else {
            thinkingdata.setTrackStatus(s);
        }
    }

    /**
     *  Enable three-party data synchronization.
     * @param {Object} options third infomations
     * 
     * @property {TDThirdPartyType} types third types,required
     * @property {Object} params extras,optional
     * @property {String} appId app id,optional
     */
    static enableThirdPartySharing(options = {},appId) {
        let types = options['types'];
        let params = options['params'];
        if (appId) {
            this.instances[appId].enableThirdPartySharing(types, params);
        } else {
            thinkingdata.enableThirdPartySharing(types, params);
        }
    }

    /**
     * h5 event handler. 
     * @param {String} eventData event data,required
     */
    static h5ClickHandler(eventData) {
        if (!eventData) return;
        const eventMap = JSON.parse(eventData);
        const dataArr = eventMap['data'];

        if (!Array.isArray(dataArr) || dataArr.length === 0) {
            return;
        }

        const dataInfo = dataArr[0];
        if (!dataInfo) {
            return;
        }

        let type = dataInfo['#type'];
        const eventName = dataInfo['#event_name'];
        const time = dataInfo['#time'];
        let properties = dataInfo['properties'];

        let extraID;
        if (type === TDEventType.Track) {
            extraID = dataInfo['#first_check_id'];
            if (extraID) {
                type = TDEventType.TrackFirst;
            }
        } else {
            extraID = dataInfo['#event_id'];
        }

        properties = this._cleanProperties(properties);
        this._h5track(eventName, extraID, properties, type, time);
    }

    static _h5track(eventName, extraID, properties, type, time) {
        if (this._isTrackEvent(type)) {
            const dateTime = new Date(time);
            let timeZone;
            if (properties['#zone_offset']) {
                const zoneOffset = properties['#zone_offset'];
                const diffHours = -dateTime.getTimezoneOffset() / 60 - zoneOffset;
                const hours = Math.floor(diffHours);
                const minutes = Math.floor((diffHours - hours) * 60);
                dateTime.setHours(dateTime.getHours() + hours);
                dateTime.setMinutes(dateTime.getMinutes() + minutes);
                timeZone = this._formatTimeZone(zoneOffset);
            }
            if (type === TDEventType.Track) {
                this.track({
                    eventName,
                    properties,
                    time: dateTime.getTime(),
                    timeZone
                });
                return;
            }
            const eventModel = {
                eventName,
                properties,
                eventId: extraID || "",
                time: dateTime.getTime(),
                timeZone
            };
            switch (type) {
                case TDEventType.TrackFirst:
                    this.trackFirst(eventModel);
                    break;
                case TDEventType.TrackUpdate:
                    this.trackUpdate(eventModel);
                    break;
                case TDEventType.TrackOverwrite:
                    this.trackOverwrite(eventModel);
                    break;
                default:
                    throw new Error(`Invalid event type: ${type}`);
            }
        } else {
            this._handleUserEvent(type, properties);
        }
    }

    static _handleUserEvent(type, properties) {
        switch (type) {
            case TDEventType.UserDel:
                this.userDelete();
                break;
            case TDEventType.UserAdd:
                this.userAdd(properties);
                break;
            case TDEventType.UserSet:
                this.userSet(properties);
                break;
            case TDEventType.UserSetOnce:
                this.userSetOnce(properties);
                break;
            case TDEventType.UserUnset:
                this.userUnset(Object.keys(properties)[0]);
                break;
            case TDEventType.UserAppend:
                this.userAppend(properties);
                break;
            case TDEventType.UserUniqAppend:
                this.userUniqAppend(properties);
                break;
        }
    }

    static _formatTimeZone(hours) {
        const sign = hours >= 0 ? '+' : '-';
        const hourAbs = Math.abs(hours);
        const minutes = Math.floor((hourAbs - Math.floor(hourAbs)) * 60);
        const hourPart = `${Math.floor(hourAbs).toString().padStart(2, '0')}`;
        const minutePart = `${minutes.toString().padStart(2, '0')}`;

        return `GMT${sign}${hourPart}:${minutePart}`;
    }

    static _isTrackEvent(eventType) {
        return [
            TDEventType.Track,
            TDEventType.TrackFirst,
            TDEventType.TrackUpdate,
            TDEventType.TrackOverwrite,
        ].includes(eventType);
    }

    static _cleanProperties(properties) {
        const keysToRemove = ['#account_id', '#distinct_id', '#device_id', '#lib', '#lib_version', '#screen_height', '#screen_width'];
        keysToRemove.forEach(key => delete properties[key]);
        return properties;
    }
}

export { TDAutoTrackEventType, TDTrackStatus, TDThirdPartyType, TDMode };
export default TDAnalytics