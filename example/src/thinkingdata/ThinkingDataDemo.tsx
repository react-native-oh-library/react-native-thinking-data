/*
 * Copyright (c) 2025 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import * as React from 'react';
import {useRef, useState} from 'react';
import {
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const EVIDENCE_BODY_HEIGHT = Math.min(220, Math.round(Dimensions.get('window').height * 0.28));
import TDAnalytics, {
  TDAutoTrackEventType,
  TDMode,
  TDThirdPartyType,
  TDTrackStatus,
} from 'react-native-thinking-data';
import {TD_APP_ID, TD_LOG_TAG, TD_SERVER_URL} from './config';

type EvidenceEntry = {
  time: string;
  name: string;
  ok: boolean;
  detail: string;
};

function formatResult(value: unknown): string {
  if (value === undefined) {
    return '(void, no throw)';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function logLine(message: string): string {
  const line = `[${TD_LOG_TAG}] ${new Date().toISOString()} ${message}`;
  console.log(line);
  return line;
}

export function ThinkingDataDemo() {
  const [latest, setLatest] = useState<EvidenceEntry | null>(null);
  const [history, setHistory] = useState<EvidenceEntry[]>([]);
  const historyRef = useRef<ScrollView>(null);

  const pushEvidence = (name: string, ok: boolean, detail: string) => {
    const entry: EvidenceEntry = {
      time: new Date().toISOString(),
      name,
      ok,
      detail,
    };
    logLine(`${name} ${ok ? 'OK' : 'FAIL'} ${detail}`);
    setLatest(entry);
    setHistory(prev => [entry, ...prev].slice(0, 50));
  };

  const run = async (name: string, fn: () => Promise<unknown> | unknown) => {
    try {
      const result = await fn();
      pushEvidence(name, true, formatResult(result));
    } catch (error) {
      pushEvidence(name, false, String(error));
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.evidencePanel}>
        <Text style={styles.title}>ThinkingData 手动验证</Text>
        <Text style={styles.hint}>
          取证 tag：{TD_LOG_TAG} / RNThinkingAnalytics。上方结果区固定高度可滚动，下方按钮始终可点。
        </Text>
        <Text style={styles.sectionLabel}>
          结果区（固定高度，可滚动；下方按钮始终可点）
        </Text>
        <ScrollView
          ref={historyRef}
          style={styles.evidenceScroll}
          contentContainerStyle={styles.evidenceScrollContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator>
          {latest == null ? (
            <Text style={styles.placeholder}>
              尚未点击。请先同意隐私政策，再点下方按钮。
            </Text>
          ) : (
            <View style={[styles.latestCard, latest.ok ? styles.okBorder : styles.failBorder]}>
              <Text style={latest.ok ? styles.okTitle : styles.failTitle}>
                {latest.ok ? 'OK' : 'FAIL'} · {latest.name}
              </Text>
              <Text style={styles.time}>{latest.time}</Text>
              <Text style={styles.detail} selectable>
                {latest.detail}
              </Text>
            </View>
          )}
          {history.length > 1 ? (
            <>
              <Text style={styles.sectionLabel}>历史（新→旧，最多 50 条）</Text>
              {history.slice(1).map((item, index) => (
                <Text
                  key={`${item.time}-${item.name}-${index}`}
                  style={item.ok ? styles.historyOk : styles.historyFail}
                  selectable>
                  {item.ok ? 'OK' : 'FAIL'} {item.name} @ {item.time}
                  {'\n'}
                  {item.detail}
                  {'\n'}
                </Text>
              ))}
            </>
          ) : null}
        </ScrollView>
      </View>

      <ScrollView style={styles.actions} contentContainerStyle={styles.actionsContent}>
        <Text style={styles.sectionLabel}>操作</Text>
        <View style={styles.button}>
          <Button title="init(config)" onPress={() => run('init(config)', () => {
            TDAnalytics.init({
              appId: TD_APP_ID,
              serverUrl: TD_SERVER_URL,
              mode: TDMode.NORMAL,
              enableLog: true,
            });
            return {appId: TD_APP_ID, serverUrl: TD_SERVER_URL, mode: TDMode.NORMAL};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="init(appId, serverUrl)" onPress={() => run('init(string,string)', () => {
            TDAnalytics.init(TD_APP_ID, TD_SERVER_URL);
            return {appId: TD_APP_ID, serverUrl: TD_SERVER_URL};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="login" onPress={() => run('login', () => {
            TDAnalytics.login('account-demo');
            return {loginId: 'account-demo'};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="setDistinctId" onPress={() => run('setDistinctId', () => {
            TDAnalytics.setDistinctId('distinct-demo');
            return {distinctId: 'distinct-demo'};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="logout" onPress={() => run('logout', () => {
            TDAnalytics.logout();
            return '(logout called)';
          })} />
        </View>
        <View style={styles.button}>
          <Button title="setSuperProperties" onPress={() => run('setSuperProperties', () => {
            const props = {channel: 'harmony', demo: true};
            TDAnalytics.setSuperProperties(props);
            return props;
          })} />
        </View>
        <View style={styles.button}>
          <Button title="getSuperProperties" onPress={() => run('getSuperProperties', () => TDAnalytics.getSuperProperties())} />
        </View>
        <View style={styles.button}>
          <Button title="unsetSuperProperty" onPress={() => run('unsetSuperProperty', () => {
            TDAnalytics.unsetSuperProperty('demo');
            return {unset: 'demo'};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="clearSuperProperties" onPress={() => run('clearSuperProperties', () => {
            TDAnalytics.clearSuperProperties();
            return '(cleared)';
          })} />
        </View>
        <View style={styles.button}>
          <Button title="track" onPress={() => run('track', () => {
            const event = {eventName: 'product_buy', properties: {product_name: 'demo'}};
            TDAnalytics.track(event);
            return event;
          })} />
        </View>
        <View style={styles.button}>
          <Button title="track(time/timeZone)" onPress={() => run('track(time/timeZone)', () => {
            const event = {
              eventName: 'product_buy_timed',
              properties: {product_name: 'demo'},
              time: new Date(),
              timeZone: 8,
            };
            TDAnalytics.track(event);
            return event;
          })} />
        </View>
        <View style={styles.button}>
          <Button title="trackFirst" onPress={() => run('trackFirst', () => {
            const event = {eventName: 'first_open', eventId: 'first-demo'};
            TDAnalytics.trackFirst(event);
            return event;
          })} />
        </View>
        <View style={styles.button}>
          <Button title="trackUpdate" onPress={() => run('trackUpdate', () => {
            const event = {eventName: 'order_update', eventId: 'event-demo', properties: {status: 'paid'}};
            TDAnalytics.trackUpdate(event);
            return event;
          })} />
        </View>
        <View style={styles.button}>
          <Button title="trackOverwrite" onPress={() => run('trackOverwrite', () => {
            const event = {eventName: 'order_overwrite', eventId: 'event-demo', properties: {status: 'done'}};
            TDAnalytics.trackOverwrite(event);
            return event;
          })} />
        </View>
        <View style={styles.button}>
          <Button title="timeEvent" onPress={() => run('timeEvent', () => {
            TDAnalytics.timeEvent('product_buy');
            return {eventName: 'product_buy'};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="userSet / userSetOnce / userAdd" onPress={() => run('userSet*', () => {
            TDAnalytics.userSet({username: 'TE'});
            TDAnalytics.userSetOnce({first_open: true});
            TDAnalytics.userAdd({score: 1});
            return {userSet: {username: 'TE'}, userSetOnce: {first_open: true}, userAdd: {score: 1}};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="userAppend / userUniqAppend / userUnset / userDelete" onPress={() => run('userList*', () => {
            TDAnalytics.userAppend({tags: ['a']});
            TDAnalytics.userUniqAppend({tags: ['a']});
            TDAnalytics.userUnset('score');
            TDAnalytics.userDelete();
            return {userAppend: {tags: ['a']}, userUniqAppend: {tags: ['a']}, userUnset: 'score', userDelete: true};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="enableAutoTrack" onPress={() => run('enableAutoTrack', () => {
            const types = TDAutoTrackEventType.APP_START | TDAutoTrackEventType.APP_END;
            TDAnalytics.enableAutoTrack(types);
            return {types};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="enableAutoTrack(types, props)" onPress={() => run('enableAutoTrack(types,props)', () => {
            const types = TDAutoTrackEventType.APP_START | TDAutoTrackEventType.APP_INSTALL;
            const properties = {from: 'example-3arg'};
            TDAnalytics.enableAutoTrack(types, properties);
            return {types, properties};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="enableAutoTrack(string[])" onPress={() => run('enableAutoTrack(string[])', () => {
            const types = ['appStart', 'appEnd'];
            TDAnalytics.enableAutoTrack(types as unknown as number);
            return {types};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="enableAutoTrackWithProperties" onPress={() => run('enableAutoTrackWithProperties', () => {
            const options = {
              autoTrackTypes: TDAutoTrackEventType.APP_START | TDAutoTrackEventType.APP_END,
              properties: {from: 'example'},
            };
            TDAnalytics.enableAutoTrackWithProperties(options);
            return options;
          })} />
        </View>
        <View style={styles.button}>
          <Button title="getDistinctId / getAccountId / getDeviceId" onPress={() => run('getIds', async () => {
            TDAnalytics.login('account-demo');
            TDAnalytics.setDistinctId('distinct-demo');
            const distinctId = await TDAnalytics.getDistinctId();
            const accountId = await TDAnalytics.getAccountId();
            const deviceId = await TDAnalytics.getDeviceId();
            return {distinctId, accountId, deviceId};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="getPresetProperties" onPress={() => run('getPresetProperties', () => TDAnalytics.getPresetProperties())} />
        </View>
        <View style={styles.button}>
          <Button title="setDynamicSuperProperties" onPress={() => run('setDynamicSuperProperties', () => {
            TDAnalytics.setDynamicSuperProperties(() => ({ts: Date.now()}));
            return '(dynamic fn registered)';
          })} />
        </View>
        <View style={styles.button}>
          <Button title="flush" onPress={() => run('flush', () => {
            TDAnalytics.flush();
            return '(flush called)';
          })} />
        </View>
        <View style={styles.button}>
          <Button title="calibrateTime" onPress={() => run('calibrateTime', () => {
            const time = Date.now();
            TDAnalytics.calibrateTime(time);
            return {time};
          })} />
        </View>
        <View style={styles.button}>
          <Button title="no-op APIs (NTP / status / thirdParty)" onPress={() => run('no-op', () => {
            TDAnalytics.calibrateTimeWithNtp('ntp.aliyun.com');
            TDAnalytics.setTrackStatus(TDTrackStatus.PAUSE);
            TDAnalytics.enableThirdPartySharing({types: TDThirdPartyType.APPS_FLYER});
            return {
              note: 'HarmonyOS ignores these; expect hilog warn only',
              ntp: 'ntp.aliyun.com',
              status: TDTrackStatus.PAUSE,
              thirdParty: TDThirdPartyType.APPS_FLYER,
            };
          })} />
        </View>
        <View style={styles.button}>
          <Button title="h5ClickHandler" onPress={() => run('h5ClickHandler', () => {
            const eventData = '{"#event_name":"ta_page_show"}';
            TDAnalytics.h5ClickHandler(eventData);
            return {eventData};
          })} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'white',
  },
  evidencePanel: {
    flexGrow: 0,
    flexShrink: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#f7f7f7',
  },
  evidenceScroll: {
    height: EVIDENCE_BODY_HEIGHT,
  },
  evidenceScrollContent: {
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
  },
  hint: {
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  sectionLabel: {
    fontWeight: '600',
    color: 'black',
    marginBottom: 6,
    marginTop: 4,
  },
  placeholder: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  latestCard: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  okBorder: {
    borderColor: '#0a7a28',
  },
  failBorder: {
    borderColor: '#b00020',
  },
  okTitle: {
    color: '#0a7a28',
    fontWeight: '700',
    fontSize: 15,
  },
  failTitle: {
    color: '#b00020',
    fontWeight: '700',
    fontSize: 15,
  },
  time: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 6,
  },
  detail: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  historyOk: {
    color: '#0a7a28',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  historyFail: {
    color: '#b00020',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  actions: {
    flex: 1,
  },
  actionsContent: {
    padding: 16,
    paddingBottom: 32,
  },
  button: {
    marginBottom: 8,
  },
});
