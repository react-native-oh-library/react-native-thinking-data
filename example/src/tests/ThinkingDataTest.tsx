/*
 * Copyright (c) 2025 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import * as React from 'react';
import {useState} from 'react';
import {Button, ScrollView, StyleSheet, Text, View} from 'react-native';
import TDAnalytics, {
  TDAutoTrackEventType,
  TDMode,
  TDThirdPartyType,
  TDTrackStatus,
} from 'react-native-thinking-data';
import {TD_APP_ID, TD_LOG_TAG, TD_SERVER_URL} from '../thinkingdata/config';

type CaseResult = {
  name: string;
  pass: boolean;
  elapsedMs: number;
  time: string;
  evidence: string;
};

function assertTrue(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function evidenceOf(value: unknown): string {
  if (value === undefined) {
    return '(no return value; completed without throw)';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

type CaseFn = () => Promise<unknown> | unknown;

async function runCase(name: string, fn: CaseFn): Promise<CaseResult> {
  const time = new Date().toISOString();
  const started = Date.now();
  try {
    const value = await fn();
    const evidence = evidenceOf(value);
    const elapsedMs = Date.now() - started;
    console.log(`[${TD_LOG_TAG}] PASS ${name} (${elapsedMs}ms) ${evidence}`);
    return {name, pass: true, elapsedMs, time, evidence};
  } catch (error) {
    const elapsedMs = Date.now() - started;
    const evidence = String(error);
    console.log(`[${TD_LOG_TAG}] FAIL ${name} (${elapsedMs}ms) ${evidence}`);
    return {name, pass: false, elapsedMs, time, evidence};
  }
}

export function ThinkingDataTest() {
  const [results, setResults] = useState<CaseResult[]>([]);
  const [running, setRunning] = useState(false);
  const [transcript, setTranscript] = useState('');

  const runAll = async () => {
    setRunning(true);
    setResults([]);
    setTranscript('');
    const next: CaseResult[] = [];
    const lines: string[] = [
      `[${TD_LOG_TAG}] suite start ${new Date().toISOString()}`,
      `config appId=${TD_APP_ID} serverUrl=${TD_SERVER_URL}`,
    ];

    const cases: Array<[string, CaseFn]> = [
      ['constants', () => {
        assertTrue(TDMode.NORMAL === 'normal', 'TDMode.NORMAL');
        assertTrue(TDAutoTrackEventType.APP_START === 1, 'APP_START');
        assertTrue(TDTrackStatus.PAUSE === 'pause', 'TDTrackStatus.PAUSE');
        assertTrue(TDThirdPartyType.APPS_FLYER === 1, 'APPS_FLYER');
        return {
          TDMode_NORMAL: TDMode.NORMAL,
          APP_START: TDAutoTrackEventType.APP_START,
          TDTrackStatus_PAUSE: TDTrackStatus.PAUSE,
          APPS_FLYER: TDThirdPartyType.APPS_FLYER,
        };
      }],
      ['init empty does not throw', () => {
        TDAnalytics.init({appId: '', serverUrl: ''});
        return {note: 'empty credentials should not throw to JS'};
      }],
      ['init(config)', () => {
        const config = {
          appId: TD_APP_ID,
          serverUrl: TD_SERVER_URL,
          mode: TDMode.NORMAL,
          enableLog: true,
        };
        TDAnalytics.init(config);
        return config;
      }],
      ['init(string, string)', () => {
        TDAnalytics.init(TD_APP_ID, TD_SERVER_URL);
        return {appId: TD_APP_ID, serverUrl: TD_SERVER_URL};
      }],
      ['login / setDistinctId / logout', () => {
        TDAnalytics.login('account-auto');
        TDAnalytics.setDistinctId('distinct-auto');
        TDAnalytics.logout();
        return {
          loginId: 'account-auto',
          distinctId: 'distinct-auto',
          logout: true,
        };
      }],
      ['getDistinctId', async () => {
        TDAnalytics.setDistinctId('distinct-auto');
        const value = await TDAnalytics.getDistinctId();
        assertTrue(typeof value === 'string' && value.length > 0, `unexpected ${String(value)}`);
        return {setDistinctId: 'distinct-auto', getDistinctId: value};
      }],
      ['getAccountId', async () => {
        TDAnalytics.login('account-auto');
        const value = await TDAnalytics.getAccountId();
        assertTrue(value === null || typeof value === 'string', `unexpected ${String(value)}`);
        return {loginId: 'account-auto', getAccountId: value};
      }],
      ['getDeviceId', async () => {
        const value = await TDAnalytics.getDeviceId();
        assertTrue(typeof value === 'string' && value.length > 0, `unexpected ${String(value)}`);
        return {getDeviceId: value};
      }],
      ['super properties', async () => {
        TDAnalytics.setSuperProperties({channel: 'harmony'});
        const props = await TDAnalytics.getSuperProperties();
        assertTrue(props !== null && typeof props === 'object', 'getSuperProperties');
        TDAnalytics.unsetSuperProperty('channel');
        TDAnalytics.clearSuperProperties();
        return {afterSet: props, unset: 'channel', cleared: true};
      }],
      ['track family', () => {
        const events = {
          track: {eventName: 'auto_track', properties: {from: 'test'}},
          trackTimed: {
            eventName: 'auto_track_timed',
            properties: {from: 'test'},
            time: new Date().toISOString(),
            timeZone: 8,
          },
          trackFirst: {eventName: 'auto_first', eventId: 'auto-first'},
          trackUpdate: {eventName: 'auto_update', eventId: 'auto-id'},
          trackOverwrite: {eventName: 'auto_overwrite', eventId: 'auto-id'},
          timeEvent: 'auto_track',
        };
        TDAnalytics.track(events.track);
        TDAnalytics.track({
          eventName: 'auto_track_timed',
          properties: {from: 'test'},
          time: new Date(),
          timeZone: 8,
        });
        TDAnalytics.trackFirst(events.trackFirst);
        TDAnalytics.trackUpdate(events.trackUpdate);
        TDAnalytics.trackOverwrite(events.trackOverwrite);
        TDAnalytics.timeEvent(events.timeEvent);
        return events;
      }],
      ['enableAutoTrack overloads', () => {
        const threeArg = {
          types: TDAutoTrackEventType.APP_START | TDAutoTrackEventType.APP_INSTALL,
          properties: {from: 'auto-3arg'},
        };
        const stringTypes = ['appStart', 'appEnd'];
        TDAnalytics.enableAutoTrack(threeArg.types, threeArg.properties);
        TDAnalytics.enableAutoTrack(stringTypes as unknown as number);
        return {threeArg, stringTypes};
      }],
      ['user family', () => {
        const payload = {
          userSet: {username: 'auto'},
          userSetOnce: {first: true},
          userAdd: {score: 1},
          userAppend: {tags: ['a']},
          userUniqAppend: {tags: ['a']},
          userUnset: 'score',
          userDelete: true,
        };
        TDAnalytics.userSet(payload.userSet);
        TDAnalytics.userSetOnce(payload.userSetOnce);
        TDAnalytics.userAdd(payload.userAdd);
        TDAnalytics.userAppend(payload.userAppend);
        TDAnalytics.userUniqAppend(payload.userUniqAppend);
        TDAnalytics.userUnset(payload.userUnset);
        TDAnalytics.userDelete();
        return payload;
      }],
      ['enableAutoTrack', () => {
        const types = TDAutoTrackEventType.APP_START | TDAutoTrackEventType.APP_END;
        TDAnalytics.enableAutoTrack(types);
        return {types};
      }],
      ['enableAutoTrackWithProperties', () => {
        const options = {
          autoTrackTypes: TDAutoTrackEventType.APP_START,
          properties: {from: 'auto'},
        };
        TDAnalytics.enableAutoTrackWithProperties(options);
        return options;
      }],
      ['setDynamicSuperProperties', () => {
        TDAnalytics.setDynamicSuperProperties(() => ({auto: true}));
        return {registered: true, sample: {auto: true}};
      }],
      ['getPresetProperties', async () => {
        const value = await TDAnalytics.getPresetProperties();
        assertTrue(value !== null && typeof value === 'object', 'getPresetProperties');
        return value;
      }],
      ['flush / calibrateTime', () => {
        const time = Date.now();
        TDAnalytics.flush();
        TDAnalytics.calibrateTime(time);
        return {flush: true, calibrateTime: time};
      }],
      ['no-op APIs do not throw', () => {
        TDAnalytics.calibrateTimeWithNtp('ntp.aliyun.com');
        TDAnalytics.setTrackStatus(TDTrackStatus.NORMAL);
        TDAnalytics.setTrackStatus(TDTrackStatus.STOP);
        TDAnalytics.enableThirdPartySharing({types: TDThirdPartyType.ADJUST});
        TDAnalytics.h5ClickHandler('{"#event_name":"ta_page_show"}');
        return {
          note: 'HarmonyOS ignores NTP/status/thirdParty; hilog warn expected',
          ntp: 'ntp.aliyun.com',
          statuses: [TDTrackStatus.NORMAL, TDTrackStatus.STOP],
          thirdParty: TDThirdPartyType.ADJUST,
          h5: '{"#event_name":"ta_page_show"}',
        };
      }],
    ];

    for (const [name, fn] of cases) {
      const result = await runCase(name, fn);
      next.push(result);
      lines.push(
        `${result.pass ? 'PASS' : 'FAIL'} ${result.name} (${result.elapsedMs}ms) @ ${result.time}`,
        result.evidence,
        '---',
      );
      setResults([...next]);
      setTranscript(lines.join('\n'));
    }

    const passCount = next.filter(item => item.pass).length;
    lines.push(`[${TD_LOG_TAG}] suite done ${passCount}/${next.length} PASS`);
    setTranscript(lines.join('\n'));
    setRunning(false);
  };

  const passCount = results.filter(item => item.pass).length;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>ThinkingData 自动串行用例</Text>
        <Text style={styles.hint}>
          每条用例会记录入参/返回值证据，并同步打到 hilog（tag {TD_LOG_TAG}）。查询 API 应返回
          string/object；no-op 仅 hilog warn。
        </Text>
        <View style={styles.button}>
          <Button title={running ? 'Running...' : 'Run All'} onPress={runAll} disabled={running} />
        </View>
        <Text style={styles.summary}>
          {results.length === 0 ? '未执行' : `${passCount}/${results.length} PASS`}
        </Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {results.map(item => (
          <View
            key={`${item.name}-${item.time}`}
            style={[styles.card, item.pass ? styles.okBorder : styles.failBorder]}>
            <Text style={item.pass ? styles.pass : styles.fail}>
              {item.pass ? 'PASS' : 'FAIL'} {item.name}
            </Text>
            <Text style={styles.meta}>
              {item.elapsedMs}ms · {item.time}
            </Text>
            <Text style={styles.evidence} selectable>
              {item.evidence}
            </Text>
          </View>
        ))}

        {transcript.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>完整取证文本（可复制）</Text>
            <Text style={styles.transcript} selectable>
              {transcript}
            </Text>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    backgroundColor: '#f7f7f7',
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
  button: {
    marginBottom: 8,
  },
  summary: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  okBorder: {
    borderColor: '#0a7a28',
  },
  failBorder: {
    borderColor: '#b00020',
  },
  pass: {
    color: '#0a7a28',
    fontWeight: '700',
  },
  fail: {
    color: '#b00020',
    fontWeight: '700',
  },
  meta: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 6,
  },
  evidence: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  sectionLabel: {
    fontWeight: '600',
    color: 'black',
    marginTop: 8,
    marginBottom: 6,
  },
  transcript: {
    color: '#222',
    fontSize: 11,
    fontFamily: 'monospace',
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 6,
  },
});
