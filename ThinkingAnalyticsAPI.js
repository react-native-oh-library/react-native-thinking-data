import { NativeModules, Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const { RNThinkingAnalyticsModule } = NativeModules;

function isHarmonyOS() {
    return Platform.OS === 'harmony' || Platform.OS === 'openharmony' || Platform.OS === 'ohos';
}

function taSdkOsName() {
    var sdkos = Platform.OS;
    if (sdkos === 'ios') {
        sdkos = 'iOS';
    } else if (sdkos === 'android') {
        sdkos = 'Android';
    } else if (sdkos === 'harmony' || sdkos === 'openharmony' || sdkos === 'ohos') {
        sdkos = 'HarmonyOS';
    }
    return sdkos;
}

const TESDKVERSION = '3.2.2';

const AutoTrackEventType = {
    APP_START: 'appStart',
    APP_END: 'appEnd',
    APP_CRASH: 'appViewCrash',
    APP_INSTALL: 'appInstall'
}

const TAThirdPartyShareType = {
    TA_APPS_FLYER: 'AppsFlyer',
    TA_IRON_SOURCE: 'IronSource',
    TA_ADJUST: 'Adjust',
    TA_BRANCH: 'Branch',
    TA_TOP_ON: 'TopOn',
    TA_TRACKING: 'Tracking',
    TA_TRAD_PLUS: 'TradPlus'
}

const TATrackStatus = {
    PAUSE: 'pause',
    STOP: 'stop',
    SAVE_ONLY: 'saveOnly',
    NORMAL: 'normal'
}

var ThinkingAnalyticsAPI = function () { };

var teEnableShowLog = false;


ThinkingAnalyticsAPI.prototype.ta_UUIDv4 = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            // eslint-disable-next-line eqeqeq
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

ThinkingAnalyticsAPI.prototype.ta_utf8Encode = function (string) {
    string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var utftext = '';
    var start, end;
    var stringl = 0;
    var n;
    start = end = 0;
    stringl = string.length;
    for (n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;
        if (c1 < 128) {
            end++;
        } else if ((c1 > 127) && (c1 < 2048)) {
            enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
        } else {
            enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.substring(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }
    if (end > start) {
        utftext += string.substring(start, string.length);
    }
    return utftext;
};

ThinkingAnalyticsAPI.prototype.ta_base64Encode = function (data) {
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits;
    var i = 0, ac = 0, enc = '', tmpArr = [];

    if (!data) {
        return data;
    }

    data = this.ta_utf8Encode(data);
    do {
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);
        bits = o1 << 16 | o2 << 8 | o3;
        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;
        tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmpArr.join('');
    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
            break;
        case 2:
            enc = enc.slice(0, -1) + '=';
            break;
    }
    return enc;
};

ThinkingAnalyticsAPI.prototype.ta_formatDate = function (d) {
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    function padMilliseconds(n) {
        if (n < 10) {
            return '00' + n;
        } else if (n < 100) {
            return '0' + n;
        } else {
            return n;
        }
    }
    return d.getFullYear() + '-' +
        pad(d.getMonth() + 1) + '-' +
        pad(d.getDate()) + ' ' +
        pad(d.getHours()) + ':' +
        pad(d.getMinutes()) + ':' +
        pad(d.getSeconds()) + '.' +
        padMilliseconds(d.getMilliseconds());
};

ThinkingAnalyticsAPI.prototype.ta_formatTimeZone = function (d, i) {
    if (typeof i !== 'number') return d;
    var len = d.getTime();
    var offset = d.getTimezoneOffset() * 60000;
    var utcTime = len + offset;
    return new Date(utcTime + 3600000 * i);
};

ThinkingAnalyticsAPI.prototype.ta_hashCode = function (str) {
    if (typeof str !== 'string') {
        return 0;
    }
    var hash = 0;
    var char = null;
    if (str.length === 0) {
        return hash;
    }
    for (var i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
};

ThinkingAnalyticsAPI.prototype.ta_encodeURIComponent = function (val) {
    var result = '';
    try {
        result = encodeURIComponent(val);
    } catch (e) {
        result = val;
    }
    return result;
};

const taFlushDataQueue = [];
var taIsClearingForDataQueue = false;

ThinkingAnalyticsAPI.prototype.executeGetDataQueue = async function () {
    if (taIsClearingForDataQueue === true) {
        return;
    }
    taIsClearingForDataQueue = true;
    if (taFlushDataQueue.length > 0) {
        const eventParams = taFlushDataQueue.shift();
        try {
            await this._httpRequest_(eventParams);
            taIsClearingForDataQueue = false;
        } catch (error) {
            console.error(error);
            taIsClearingForDataQueue = false;
        }
        await this.executeGetDataQueue();
    } else {
        taIsClearingForDataQueue = false;
    }
}



ThinkingAnalyticsAPI.prototype._httpRequest_ = async function (eventData) {

    if (this['ThinkingAnalyticsSource']['trackStatus'] !== 'normal') return;
    var distinctId;
    var loginId;
    var deviceId;
    var superProperties;
    var dyldSuperProperties;

    try {
        // distinctId
        distinctId = this['ThinkingAnalyticsSource']['distinct_id'];
        if (distinctId === null || distinctId === undefined || typeof distinctId !== 'string' || distinctId === "") {
            distinctId = await AsyncStorage.getItem(this['ThinkingAnalyticsSource']['appid'] + '_distinct_id');
            this['ThinkingAnalyticsSource']['distinct_id'] = distinctId;
            if (distinctId === null || distinctId === undefined || typeof distinctId !== 'string' || distinctId === "") {
                distinctId = this.ta_UUIDv4()
                this['ThinkingAnalyticsSource']['distinct_id'] = distinctId;
                await AsyncStorage.setItem(this['ThinkingAnalyticsSource']['appid'] + '_distinct_id', distinctId);
            }
        }

        // loginId
        loginId = this['ThinkingAnalyticsSource']['login_id'];
        if (loginId === null || loginId === undefined || typeof loginId !== 'string' || loginId === "") {
            loginId = await AsyncStorage.getItem(this['ThinkingAnalyticsSource']['appid'] + '_login_id');
            this['ThinkingAnalyticsSource']['login_id'] = loginId;
        }
        if (loginId === null || loginId === undefined || typeof loginId !== 'string' || loginId === "") {
            loginId = "";
            this['ThinkingAnalyticsSource']['login_id'] = loginId;
        }

        // deviceId
        deviceId = this['ThinkingAnalyticsSource']['device_id'];
        if (deviceId === null || deviceId === undefined || typeof deviceId !== 'string' || deviceId === "") {
            deviceId = await AsyncStorage.getItem(this['ThinkingAnalyticsSource']['appid'] + '_device_id');
            this['ThinkingAnalyticsSource']['device_id'] = deviceId;
        }
        if (deviceId === null || deviceId === undefined || typeof deviceId !== 'string' || deviceId === "") {
            deviceId = this.ta_UUIDv4();
            await AsyncStorage.setItem(this['ThinkingAnalyticsSource']['appid'] + '_device_id', deviceId);
            this['ThinkingAnalyticsSource']['device_id'] = deviceId;
        }
    } catch (error) {
        // Error retrieving data
        console.error(error);
    }

    var preetylog;
    var appid = this['ThinkingAnalyticsSource']['appid'];
    var urlData;
    var time = new Date();
    var mydata = {
        '#type': eventData.type,
        '#time': this.ta_formatDate(this.ta_formatTimeZone(time, this['ThinkingAnalyticsSource']['zoneOffset']))
    };
    var data = {
        data: [mydata]
    };

    if (loginId !== null && loginId !== undefined && typeof loginId === 'string' && loginId !== "") {
        mydata['#account_id'] = loginId;
    }

    if (distinctId !== null && distinctId !== undefined && typeof distinctId === 'string') {
        mydata['#distinct_id'] = distinctId;
    }

    if (eventData.type === 'track' || eventData.type === 'track_update' || eventData.type === 'track_overwrite') {
        mydata['#event_name'] = eventData.event;
        if (eventData.type === 'track_update' || eventData.type === 'track_overwrite') {
            mydata['#event_id'] = eventData.extraId;
        } else if (eventData.isFirstEvent === true) {
            if (eventData.firstCheckId === null || eventData.firstCheckId === undefined || typeof eventData.firstCheckId !== 'string' || eventData.firstCheckId === "") {
                eventData.firstCheckId = deviceId;
            }
            mydata['#first_check_id'] = eventData.firstCheckId;
        }
        let zoneOffset = 0 - (time.getTimezoneOffset() / 60.0);
        if (this['ThinkingAnalyticsSource']['zoneOffset']) {
            zoneOffset = this['ThinkingAnalyticsSource']['zoneOffset'];
        }

        var sdkos = taSdkOsName();

        mydata['properties'] = {
            '#os': sdkos,
            '#lib_version': TESDKVERSION,
            '#lib': 'ReactNative',
            '#zone_offset': zoneOffset,
            '#device_id': deviceId
        }

        // superProperties
        superProperties = this['ThinkingAnalyticsSource']['super_properties'];
        if (superProperties !== null && superProperties !== undefined && typeof superProperties === 'object') {
            for (var prop in superProperties) {
                if (superProperties[prop] !== null && superProperties[prop] !== undefined) {
                    mydata['properties'][prop] = superProperties[prop];
                }
            }
        }

        // dynamicProperties
        if (this['ThinkingAnalyticsSource']['dynamicProperties'] !== null && this['ThinkingAnalyticsSource']['dynamicProperties'] !== undefined && typeof this['ThinkingAnalyticsSource']['dynamicProperties'] === 'function') {
            dyldSuperProperties = this['ThinkingAnalyticsSource']['dynamicProperties']();
            if (dyldSuperProperties !== null && dyldSuperProperties !== undefined && typeof dyldSuperProperties === 'object') {
                for (var prop in dyldSuperProperties) {
                    if (dyldSuperProperties[prop] !== void 0) {
                        mydata['properties'][prop] = dyldSuperProperties[prop];
                    }
                }
            }
        }

        // merge eventData.properties
        if (eventData.properties !== null && eventData.properties !== undefined && typeof eventData.properties === 'object') {
            for (var prop in eventData.properties) {
                if (eventData.properties[prop] !== void 0) {
                    mydata['properties'][prop] = eventData.properties[prop];
                }
            }
        }

        // duration
        var event_timers = this['ThinkingAnalyticsSource']['event_timers'];
        if (event_timers === null || event_timers === undefined || typeof event_timers !== "object") {
            event_timers = {};
        }

        if (event_timers.hasOwnProperty(eventData.event) === true) {
            var startTimestamp = event_timers[eventData.event];
            var durationMillisecond = new Date().getTime() - startTimestamp;
            var d = parseFloat((durationMillisecond / 1000).toFixed(3));
            if (d > 24 * 60 * 60) {
                d = 24 * 60 * 60;
            }
            mydata['properties']['#duration'] = d;
            delete event_timers[eventData.event];
            this['ThinkingAnalyticsSource']['event_timers'] = event_timers;
        }

        // check date type
        for (var prop in mydata['properties']) {
            if (mydata['properties'][prop] !== void 0 && mydata['properties'][prop] instanceof Date) {
                mydata['properties'][prop] = this.ta_formatDate(this.ta_formatTimeZone(mydata['properties'][prop], this['ThinkingAnalyticsSource']['zoneOffset']));
            } else if (mydata['properties'][prop] !== void 0 && mydata['properties'][prop] instanceof Array) {
                var that = this;
                mydata['properties'][prop].forEach(function (item) {
                    if (item !== void 0 && (typeof item === "object")) {
                        for (var prop1 in item) {
                            if (item[prop1] !== void 0 && item[prop1] instanceof Date) {
                                item[prop1] = that.ta_formatDate(that.ta_formatTimeZone(item[prop1], that['ThinkingAnalyticsSource']['zoneOffset']));
                            }
                        }
                    }
                });
            } else if (mydata['properties'][prop] !== void 0 && (typeof mydata['properties'][prop] === "object")) {
                for (var prop1 in mydata['properties'][prop]) {
                    if (mydata['properties'][prop][prop1] !== void 0 && mydata['properties'][prop][prop1] instanceof Date) {
                        mydata['properties'][prop][prop1] = this.ta_formatDate(this.ta_formatTimeZone(mydata['properties'][prop][prop1], this['ThinkingAnalyticsSource']['zoneOffset']));
                    }
                }
            }
        }

        // out property
        data['#app_id'] = appid;
        data['#flush_time'] = this.ta_formatTimeZone(new Date(), this['ThinkingAnalyticsSource']['zoneOffset']).getTime();
        mydata['#uuid'] = this.ta_UUIDv4();
        preetylog = JSON.stringify(data, null, '\t');
        data = JSON.stringify(data);

    } else {
        mydata['properties'] = {};
        if (eventData.properties !== null && eventData.properties !== undefined && typeof eventData.properties === "object") {
            for (var prop in eventData.properties) {
                if (eventData.properties[prop] !== void 0) {
                    mydata['properties'][prop] = eventData.properties[prop];
                }
            }
        }

        for (var prop in mydata['properties']) {
            if (mydata['properties'][prop] !== void 0 && mydata['properties'][prop] instanceof Date) {
                mydata['properties'][prop] = this.ta_formatDate(this.ta_formatTimeZone(mydata['properties'][prop], this['ThinkingAnalyticsSource']['zoneOffset']));
            }
        }

        data['#app_id'] = appid;
        data['#flush_time'] = this.ta_formatTimeZone(new Date(), this['ThinkingAnalyticsSource']['zoneOffset']).getTime();
        mydata['#uuid'] = this.ta_UUIDv4();
        preetylog = JSON.stringify(data, null, '\t');
        data = JSON.stringify(data);

    }

    var base64Data = this.ta_base64Encode(data);
    var crc = 'crc=' + this.ta_hashCode(base64Data);
    urlData = this['ThinkingAnalyticsSource']['serverURL'] + "/sync_js?" + 'data=' + this.ta_encodeURIComponent(base64Data) + '&ext=' + this.ta_encodeURIComponent(crc) + '&version=' + TESDKVERSION;

    return fetch(urlData).then(res => res.json()).then(res => {

        if (res['code'] === 0) {
            if (teEnableShowLog) {
                console.log(" [THINKING] flush success sendContent---->" + preetylog);
                console.log(" [THINKING] flush success responseData---->" + JSON.stringify(res));
            }
        } else {
            if (teEnableShowLog) {
                console.log(JSON.stringify(res));
            }
        }
    }).catch((error) => {
        if (teEnableShowLog) {
            console.error(error);
        }
    });
}

ThinkingAnalyticsAPI.prototype.httpRequest = function (eventData) {
    taFlushDataQueue.push(eventData);
    this.executeGetDataQueue();
}



/**
 * The SDK initializes configuration information
 * @param {*} config 
 */
ThinkingAnalyticsAPI.prototype.enableLog = function (enable) {
    teEnableShowLog = enable;
}

/**
 * The SDK initializes configuration information
 *
 * @param config config
 * @return SDK instance
 */
ThinkingAnalyticsAPI.prototype.init = function (config) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        teEnableShowLog = config['enableLog'];
        if (teEnableShowLog === true) {
            console.log("[THINKING] ThinkingAnalyticsAPI Initialize. appid: " + config['appid'] + ", serverUrl: " + config['serverUrl']);
        }
        this['ThinkingAnalyticsSource'] = {};
        this['ThinkingAnalyticsSource']['appid'] = config['appid'];
        this['ThinkingAnalyticsSource']['serverURL'] = config['serverUrl'];
        this['ThinkingAnalyticsSource']['zoneOffset'] = config['zoneOffset'];
        this['ThinkingAnalyticsSource']['trackStatus'] = 'normal';
        return;
    }

    this['ThinkingAnalyticsSource'] = {};
    this['ThinkingAnalyticsSource']['appid'] = config['appid'];
    this['ThinkingAnalyticsSource']['serverURL'] = config['serverUrl'];
    this['ThinkingAnalyticsSource']['zoneOffset'] = config['zoneOffset'];
    this['ThinkingAnalyticsSource']['trackStatus'] = 'normal';

    this.appId = config['appid'];
    if (isHarmonyOS()) {
        var harmonyConfig = {};
        for (var key in config) {
            harmonyConfig[key] = config[key];
        }
        if (harmonyConfig['appId'] === undefined || harmonyConfig['appId'] === null) {
            harmonyConfig['appId'] = config['appid'] !== undefined && config['appid'] !== null ? config['appid'] : config['appId'];
        }
        if (harmonyConfig['appid'] === undefined || harmonyConfig['appid'] === null) {
            harmonyConfig['appid'] = harmonyConfig['appId'];
        }
        NativeModules.RNThinkingAnalyticsModule.init(harmonyConfig, TESDKVERSION);
    } else {
        NativeModules.RNThinkingAnalyticsModule.init(config, TESDKVERSION);
    }
}

ThinkingAnalyticsAPI.prototype.formatPropertiesTimeZone = function (properties) {

    if (properties === null || properties === undefined || typeof properties !== 'object') {
        return properties;
    }

    // check date type
    for (var prop in properties) {
        if (properties[prop] !== void 0 && properties[prop] instanceof Date) {
            properties[prop] = this.ta_formatDate(this.ta_formatTimeZone(properties[prop], this['ThinkingAnalyticsSource']['zoneOffset']));
        } else if (properties[prop] !== void 0 && properties[prop] instanceof Array) {
            var that = this;
            properties[prop].forEach(function (item) {
                if (item !== void 0 && (typeof item === "object")) {
                    for (var prop1 in item) {
                        if (item[prop1] !== void 0 && item[prop1] instanceof Date) {
                            item[prop1] = that.ta_formatDate(that.ta_formatTimeZone(item[prop1], that['ThinkingAnalyticsSource']['zoneOffset']));
                        }
                    }
                }
            });
        } else if (properties[prop] !== void 0 && (typeof properties[prop] === "object")) {
            for (var prop1 in properties[prop]) {
                if (properties[prop][prop1] !== void 0 && properties[prop][prop1] instanceof Date) {
                    properties[prop][prop1] = this.ta_formatDate(this.ta_formatTimeZone(properties[prop][prop1], this['ThinkingAnalyticsSource']['zoneOffset']));
                }
            }
        }
    }
    return properties;
}
ThinkingAnalyticsAPI.prototype.getTimeStamp = function (time) {
    if (time !== undefined && time instanceof Date) return time.getTime();
    return 0;
}
/**
 * track a event
 *
 * @param eventName event name
 * @param properties event properties
 */
ThinkingAnalyticsAPI.prototype.track = function (eventName, properties, time, timeZone) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'track',
            event: eventName,
            properties: properties
        });
        return;
    }

    if (properties === null || properties === undefined) {
        properties = {};
    }

    if (this.dynamicProperties) {
        var dProperties = this.dynamicProperties()
        if (typeof dProperties === "object") {
            for (var key in dProperties) {
                properties[key] = dProperties[key];
            }
        }
    }

    var obj = {
        appId: this.appId,
        eventName: eventName,
        properties: this.formatPropertiesTimeZone(properties),
        time: this.getTimeStamp(time),
        timeZone: timeZone,
    };
    RNThinkingAnalyticsModule.track(obj);
}

/**
* The first event refers to the ID of a device or other dimension, which will only be recorded once.
* @param eventName 
* @param properties 
* @param eventId 
*/
ThinkingAnalyticsAPI.prototype.trackFirstEvent = function (eventName, properties, eventId, time, timeZone) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'track',
            event: eventName,
            properties: properties,
            firstCheckId: eventId,
            isFirstEvent: true,
        });
        return;
    }

    //Concatenates dynamic public properties
    if (properties === null || properties === undefined) {
        properties = {};
    }

    if (this.dynamicProperties) {
        var dProperties = this.dynamicProperties()
        for (var key in dProperties) {
            properties[key] = dProperties[key];
        }
    }
    var obj = {
        appId: this.appId,
        eventName: eventName,
        properties: this.formatPropertiesTimeZone(properties),
        eventId: eventId,
        time: this.getTimeStamp(time),
        timeZone: timeZone
    };
    RNThinkingAnalyticsModule.trackFirstEvent(obj);
}

/**
* You can implement the requirement to modify event data in a specific scenario through updatable events. Updatable events need to specify an ID that identifies the event and pass it in when the updatable event object is created.
* @param eventName 
* @param properties 
* @param eventId 
*/
ThinkingAnalyticsAPI.prototype.trackUpdate = function (eventName, properties, eventId, time, timeZone) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] queueing data, updateEventName: " + eventName + ", properties: " + JSON.stringify(properties) + ", eventId: " + eventId);
        }
        this.httpRequest({
            type: 'track_update',
            event: eventName,
            properties: properties,
            extraId: eventId
        });
        return;
    }

    if (properties === null || properties === undefined) {
        properties = {};
    }

    if (this.dynamicProperties) {
        var dProperties = this.dynamicProperties()
        for (var key in dProperties) {
            properties[key] = dProperties[key];
        }
    }
    var obj = {
        appId: this.appId,
        eventName: eventName,
        properties: this.formatPropertiesTimeZone(properties),
        eventId: eventId,
        time: this.getTimeStamp(time),
        timeZone: timeZone
    };
    RNThinkingAnalyticsModule.trackUpdate(obj);
}

/**
* Rewritable events will completely cover historical data with the latest data, which is equivalent to deleting the previous data and storing the latest data in effect. 
* @param eventName 
* @param properties 
* @param eventId 
*/
ThinkingAnalyticsAPI.prototype.trackOverwrite = function (eventName, properties, eventId, time, timeZone) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] queueing data, overwriteEventName: " + eventName + ", properties: " + JSON.stringify(properties) + ", eventId: " + eventId);
        }
        this.httpRequest({
            type: 'track_overwrite',
            event: eventName,
            properties: properties,
            extraId: eventId
        });
        return;
    }

    if (properties === null || properties === undefined) {
        properties = {};
    }

    if (this.dynamicProperties) {
        var dProperties = this.dynamicProperties()
        for (var key in dProperties) {
            properties[key] = dProperties[key];
        }
    }
    var obj = {
        appId: this.appId,
        eventName: eventName,
        properties: this.formatPropertiesTimeZone(properties),
        eventId: eventId,
        time: this.getTimeStamp(time),
        timeZone: timeZone
    };
    RNThinkingAnalyticsModule.trackOverwrite(obj);
}

/**
 * Record the event duration, call this method to start the timing, stop the timing when the target event is uploaded, and add the attribute #duration to the event properties, in seconds.
 *
 * @param eventName target event name
 */
ThinkingAnalyticsAPI.prototype.timeEvent = function (eventName) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] timeEvent: " + eventName);
        }
        var event_timers = this['ThinkingAnalyticsSource']['event_timers'];
        if (event_timers === null || event_timers === undefined || typeof event_timers !== "object") {
            event_timers = {};
        }
        event_timers[eventName] = new Date().getTime();
        this['ThinkingAnalyticsSource']['event_timers'] = event_timers;
        return;
    }


    var obj = {
        appId: this.appId,
        eventName: eventName
    };
    RNThinkingAnalyticsModule.timeEvent(obj);
}

/**
 * Set the account ID. Each setting overrides the previous value. Login events will not be uploaded.
 *
 * @param loginId account ID
 */
ThinkingAnalyticsAPI.prototype.login = function (loginId) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] login: " + loginId);
        }
        this['ThinkingAnalyticsSource']['login_id'] = loginId;
        AsyncStorage.setItem(this['ThinkingAnalyticsSource']['appid'] + '_login_id', loginId);
        return;
    }

    var obj = {
        appId: this.appId,
        loginId: loginId
    };
    RNThinkingAnalyticsModule.login(obj);
}

/**
 * Clearing the account ID will not upload user logout events.
 */
ThinkingAnalyticsAPI.prototype.logout = function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] logout");
        }
        this['ThinkingAnalyticsSource']['login_id'] = null;
        AsyncStorage.setItem(this['ThinkingAnalyticsSource']['appid'] + '_login_id', "");
        return;
    }

    var obj = {
        appId: this.appId,
    };
    RNThinkingAnalyticsModule.logout(obj);
}

/**
 * Sets the user property, replacing the original value with the new value if the property already exists.
 *
 * @param properties user property
 */
ThinkingAnalyticsAPI.prototype.userSet = function (properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_set',
            properties: properties,
        });
        return;
    }

    var obj = {
        appId: this.appId,
        properties: this.formatPropertiesTimeZone(properties)
    };
    RNThinkingAnalyticsModule.userSet(obj);
}

/**
 * Reset user properties.
 *
 * @param properties user properties
 */
ThinkingAnalyticsAPI.prototype.userUnset = function (property) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        var dic = {};
        if (property === null || property === undefined || typeof property !== 'string' || property === "") {
            dic = {};
        } else {
            dic[property] = 0;
        }
        this.httpRequest({
            type: 'user_unset',
            properties: dic,
        });
        return;
    }

    var obj = {
        appId: this.appId,
        property: this.formatPropertiesTimeZone(property)
    };
    RNThinkingAnalyticsModule.userUnset(obj);
}

/**
 *  Sets a single user attribute, ignoring the new attribute value if the attribute already exists.
 *
 * @param property user property
 */
ThinkingAnalyticsAPI.prototype.userSetOnce = function (properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_setOnce',
            properties: properties,
        });
        return;
    }

    var obj = {
        appId: this.appId,
        properties: this.formatPropertiesTimeZone(properties)
    };
    RNThinkingAnalyticsModule.userSetOnce(obj);
}

/**
 * Adds the numeric type user attributes.
 *
 * @param property user property
 */
ThinkingAnalyticsAPI.prototype.userAdd = function (properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_add',
            properties: this.formatPropertiesTimeZone(properties)
        });
        return;
    }

    var obj = {
        appId: this.appId,
        properties: properties
    };
    RNThinkingAnalyticsModule.userAdd(obj);
}

/**
 * Delete the user attributes,This operation is not reversible and should be performed with caution.
 */
ThinkingAnalyticsAPI.prototype.userDel = function () {


    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_del'
        });
        return;
    }

    var obj = {
        appId: this.appId
    };
    RNThinkingAnalyticsModule.userDel(obj);
}

/**
 * Append a user attribute of the List type.
 *
 * @param properties user property
 */
ThinkingAnalyticsAPI.prototype.userAppend = function (properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_append',
            properties: properties,
        });
        return;
    }

    var obj = {
        appId: this.appId,
        properties: this.formatPropertiesTimeZone(properties)
    };
    RNThinkingAnalyticsModule.userAppend(obj);
}

/**
 *  The element appended to the library needs to be done to remove the processing,and then import.
 *
 * @param property user property
 */
ThinkingAnalyticsAPI.prototype.userUniqAppend = function (properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_uniq_append',
            properties: properties,
        });
        return;
    }

    var obj = {
        appId: this.appId,
        properties: this.formatPropertiesTimeZone(properties)
    };
    RNThinkingAnalyticsModule.userUniqAppend(obj);
}

/**
 * Set the public event attribute, which will be included in every event uploaded after that. The public event properties are saved without setting them each time.
 *
 * @param properties public event attribute
 */
ThinkingAnalyticsAPI.prototype.setSuperProperties = function (properties) {
    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (properties === null || properties === undefined || typeof properties !== 'object') {
            return;
        }
        this['ThinkingAnalyticsSource']['super_properties'] = properties;
        return;
    }

    var obj = {
        appId: this.appId,
        properties: this.formatPropertiesTimeZone(properties)
    };
    RNThinkingAnalyticsModule.setSuperProperties(obj);
}

/**
 * Clears a public event attribute.
 *
 * @param property Public event attribute key to clear
 */
ThinkingAnalyticsAPI.prototype.unsetSuperProperty = function (property) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] unsetSuperProperty: " + property);
        }
        var properties = this['ThinkingAnalyticsSource']['super_properties'];
        if (properties === null || properties === undefined || typeof properties !== 'object') {
            return;
        }
        if (property === null || property === undefined || typeof property !== 'string') {
            return;
        }
        if (properties.hasOwnProperty(property) === true) {
            delete properties[property];
        }
        return;
    }

    var obj = {
        appId: this.appId,
        property: property
    };
    RNThinkingAnalyticsModule.unsetSuperProperty(obj);
}

/**
 *  Clear all public event attributes.
 */
ThinkingAnalyticsAPI.prototype.clearSuperProperties = function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] clearSuperProperties");
        }
        this['ThinkingAnalyticsSource']['super_properties'] = {};
        return;
    }

    var obj = {
        appId: this.appId
    };
    RNThinkingAnalyticsModule.clearSuperProperties(obj);
}

/**
 * Set the distinct ID to replace the default UUID distinct ID.
 *
 * @param distinctId distinct ID
 */
ThinkingAnalyticsAPI.prototype.identify = function (distinctId) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] identify: " + distinctId);
        }
        this['ThinkingAnalyticsSource']['distinct_id'] = distinctId;
        AsyncStorage.setItem(this['ThinkingAnalyticsSource']['appid'] + '_distinct_id', distinctId);
        return;
    }

    var obj = {
        appId: this.appId,
        distinctId: distinctId
    };
    RNThinkingAnalyticsModule.identify(obj);
}

/**
 * Empty the cache queue. When this api is called, the data in the current cache queue will attempt to be reported.
 * If the report succeeds, local cache data will be deleted.
 */
ThinkingAnalyticsAPI.prototype.flush = function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] flush ");
        }
        return;
    }

    var obj = {
        appId: this.appId
    };
    RNThinkingAnalyticsModule.flush(obj);
}

/**
 * enable auto-tracking
 * @param {*} autoList 
 */
ThinkingAnalyticsAPI.prototype.enableAutoTrack = function (autoList,properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            var autoListString = "";
            autoList.forEach(element => {
                if (element === AutoTrackEventType.APP_START) {
                    autoListString += " APP_START"
                } else if (element === AutoTrackEventType.APP_END) {
                    autoListString += " APP_END"
                } else if (element === AutoTrackEventType.APP_CRASH) {
                    autoListString += " APP_CRASH"
                } else if (element === AutoTrackEventType.APP_INSTALL) {
                    autoListString += " APP_INSTALL"
                }
            });

            console.log("[THINKING] enableAutoTrack: " + autoListString);
        }
        return;
    }

    var obj = {
        appId: this.appId,
        autoTrackType: autoList,
        properties:properties
    };
    RNThinkingAnalyticsModule.enableAutoTrack(obj);
    
}

/**
 * time calibration
 * @param {*} time 
 */
ThinkingAnalyticsAPI.prototype.calibrateTime = function (time) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] calibrateTime: " + time);
        }
        return;
    }

    var obj = {
        timeStampMillis: time
    }
    RNThinkingAnalyticsModule.calibrateTime(obj);
}

/**
 * time calibration use NTP
 * @param {*} ntp_server 
 */
ThinkingAnalyticsAPI.prototype.calibrateTimeWithNtp = function (ntp_server) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] calibrateTimeWithNtp: " + ntp_server);
        }
        return;
    }

    var obj = {
        ntp_server: ntp_server
    }
    RNThinkingAnalyticsModule.calibrateTimeWithNtp(obj);
}

/**
 * Three-party Data synchronization
 * @param {*} thirdList 
 */
ThinkingAnalyticsAPI.prototype.enableThirdPartySharing = function (types, params) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] enableThirdPartySharing");
        }
        return;
    }

    var obj = {
        appId: this.appId,
        types: types,
        params: params
    };
    // if (Object.prototype.toString.call(types) === '[object Array]') {
    //     obj.types = types;
    // } else if (Object.prototype.toString.call(types) === '[object String]') {
    //     obj.type = types;
    //     obj.params = params;
    // }
    RNThinkingAnalyticsModule.enableThirdPartySharing(obj);
}

/**
 * Switch reporting status 
 *
 * @param status TATrackStatus reporting status
 */
ThinkingAnalyticsAPI.prototype.setTrackStatus = function (status) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] setTrackStatus: " + status);
        }
        this['ThinkingAnalyticsSource']['trackStatus'] = status;
        return;
    }

    var obj = {
        appId: this.appId,
        status: status
    };
    RNThinkingAnalyticsModule.setTrackStatus(obj);
}

/**
 * Gets prefabricated properties for all events.
 */
ThinkingAnalyticsAPI.prototype.getPresetProperties = async function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        var time = new Date();
        let zoneOffset = 0 - (time.getTimezoneOffset() / 60.0);
        if (this['ThinkingAnalyticsSource']['zoneOffset']) {
            zoneOffset = this['ThinkingAnalyticsSource']['zoneOffset'];
        }
        var sdkos = taSdkOsName();
        return {
            '#os': sdkos,
            '#lib_version': TESDKVERSION,
            '#lib': 'ReactNative',
            '#zone_offset': zoneOffset,
        };
    }

    var obj = {
        appId: this.appId
    };
    return await RNThinkingAnalyticsModule.getPresetProperties(obj);
}
/**
 * Gets the static public property
 */
ThinkingAnalyticsAPI.prototype.getSuperProperties = async function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {

        return this['ThinkingAnalyticsSource']['super_properties'];
    }

    var obj = {
        appId: this.appId
    };
    return await RNThinkingAnalyticsModule.getSuperProperties(obj);
}

/**
 * get distinct ID
 * @returns 
 */
ThinkingAnalyticsAPI.prototype.getDistinctId = async function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        var distinctId = this['ThinkingAnalyticsSource']['distinct_id'];
        if (distinctId === null || distinctId === undefined || typeof distinctId !== 'string' || distinctId === "") {
            distinctId = await AsyncStorage.getItem(this['ThinkingAnalyticsSource']['appid'] + '_distinct_id');
            this['ThinkingAnalyticsSource']['distinct_id'] = distinctId;
            if (distinctId === null || distinctId === undefined || typeof distinctId !== 'string' || distinctId === "") {
                distinctId = this.ta_UUIDv4()
                this['ThinkingAnalyticsSource']['distinct_id'] = distinctId;
                await AsyncStorage.setItem(this['ThinkingAnalyticsSource']['appid'] + '_distinct_id', distinctId);
            }
        }
        return distinctId;
    }

    var obj = {
        appId: this.appId
    };
    return await RNThinkingAnalyticsModule.getDistinctId(obj);
}

ThinkingAnalyticsAPI.prototype.getAccountId = async function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        return "";
    }

    var obj = {
        appId: this.appId,
        appid: this.appId
    };
    return await RNThinkingAnalyticsModule.getAccountId(obj);
}

/**
 * get device ID
 * @returns 
 */
ThinkingAnalyticsAPI.prototype.getDeviceId = async function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        var deviceId = this['ThinkingAnalyticsSource']['device_id'];
        if (deviceId === null || deviceId === undefined || typeof deviceId !== 'string' || deviceId === "") {
            deviceId = await AsyncStorage.getItem(this['ThinkingAnalyticsSource']['appid'] + '_device_id');
            this['ThinkingAnalyticsSource']['device_id'] = deviceId;
        }
        if (deviceId === null || deviceId === undefined || typeof deviceId !== 'string' || deviceId === "") {
            deviceId = this.ta_UUIDv4();
            await AsyncStorage.setItem(this['ThinkingAnalyticsSource']['appid'] + '_device_id', deviceId);
            this['ThinkingAnalyticsSource']['device_id'] = deviceId;
        }
        return deviceId;
    }

    var obj = {
        appId: this.appId,
        appid: this.appId
    };
    return await RNThinkingAnalyticsModule.getDeviceId(obj);
}

/**
 * Set the auto-tracking event of public properties
 */
ThinkingAnalyticsAPI.prototype.setAutoTrackProperties = function (types, properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] setAutoTrackProperties: " + JSON.stringify(properties));
        }
        return;
    }

    if (isHarmonyOS() && typeof RNThinkingAnalyticsModule.setAutoTrackProperties !== 'function') {
        if (teEnableShowLog) {
            console.log("[THINKING] setAutoTrackProperties not supported on harmony native module");
        }
        return;
    }

    var obj = {
        appId: this.appId,
        appid: this.appId,
        types: types,
        properties: properties
    };
    RNThinkingAnalyticsModule.setAutoTrackProperties(obj);
}

/**
 *  Set dynamic public properties. Each event uploaded after that will contain a public event attribute.
 *
 * @param dynamicProperties Dynamic public attribute interface
 */
ThinkingAnalyticsAPI.prototype.setDynamicSuperProperties = function (dynamicProperties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (typeof dynamicProperties === 'function') {
            this.dynamicProperties = dynamicProperties;
            this['ThinkingAnalyticsSource']['dynamicProperties'] = dynamicProperties;
        }
        return;
    }

    if (typeof dynamicProperties === 'function') {
        this.dynamicProperties = dynamicProperties;
    }
}

/**
 * multi instance
 * @param {*} config 
 * @returns 
 */
ThinkingAnalyticsAPI.prototype.initInstance = function (config) {
    var instance = new ThinkingAnalyticsAPI();
    instance.init(config);
    return instance;
}

var thinkingdata = new ThinkingAnalyticsAPI();

export { AutoTrackEventType, TAThirdPartyShareType, TATrackStatus };

export default thinkingdata;