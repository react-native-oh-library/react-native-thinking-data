/*
 * Copyright (c) 2025 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import React from 'react';
import {SafeAreaView} from 'react-native';
import {NavigationContainer, Page} from './components/Navigation';
import {ThinkingDataDemo} from './thinkingdata/ThinkingDataDemo';
import {ThinkingDataTest} from './tests/ThinkingDataTest';

export function ThinkingDataExampleApp() {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <NavigationContainer>
        <Page name="ThinkingData Demo">
          <ThinkingDataDemo />
        </Page>
        <Page name="ThinkingData Tests">
          <ThinkingDataTest />
        </Page>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default ThinkingDataExampleApp;
