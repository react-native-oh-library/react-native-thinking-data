/*
 * Copyright (c) 2025 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */


import type {RNPackageContext, RNPackage} from '@rnoh/react-native-openharmony/ts';
import { RNThinkingDataPackage } from '@react-native-ohos/react-native-thinking-data/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new RNThinkingDataPackage(ctx)
  ];
}
