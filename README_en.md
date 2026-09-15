> Document Template: v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-thinking-data</code> </h1>
</p>

This project is based on [react-native-thinking-data@3.2.1](https://github.com/ThinkingDataAnalytics/react-native-sdk).

The new package name is: `@react-native-ohos/react-native-thinking-data`, the version correspondence details are as follows:

| Name | Version(Npm Address) | Release Information | Supported RN Version | Supported Autolink | Compile API Version | Community Baseline Version | Source code address |
| --------------| -------------- | ------------------------------ | ------------- | ------------- |------------------------ | ------------ | ------------- |
| @react-native-ohos/react-native-thinking-data | [~ 3.2.2](https://www.npmjs.com/package/@react-native-ohos/react-native-thinking-data) | [Gitcode Releases](https://gitcode.com/CPF-RN/rntpc_react-native-thinking-data/releases) | 0.84.* | Yes | API12+ | 3.2.1 | [br_rnoh0.84](https://gitcode.com/CPF-RN/rntpc_react-native-thinking-data/tree/br_rnoh0.84) |

## Introduction

`react-native-thinking-data` is the HarmonyOS port of the ThinkingData (TE) React Native analytics SDK. JavaScript keeps the original `TDAnalytics` API. On HarmonyOS, RNOH 0.84 **UITurboModule** (`RNThinkingAnalyticsModule`) bridges to `@thinkingdata/analytics` for event tracking, user identity, super properties, and auto-tracking.

## Installation

Go to the project directory and execute the following instruction:

**npm**

```bash
npm install @react-native-ohos/react-native-thinking-data
```

**yarn**

```bash
yarn add @react-native-ohos/react-native-thinking-data
```

## Link

| | Supported Autolink | Supported RN Version |
| --- | --- | --- |
| ~ 3.2.2 | Yes | 0.84 |

Projects using AutoLink need to be configured according to this document, AutoLink framework guide: https://gitcode.com/CPF-RN/ohos_react_native/blob/main/docs/en/02-development/02-development-guide/autolinking.md

If the version you are using supports Autolink and the project has integrated Autolink, you can skip the ManualLink configuration.
<details>
  <summary>ManualLink: This step provides guidance for manually configuring native dependencies.</summary>

Open the `harmony` directory of the HarmonyOS project in DevEco Studio.

### 1. Overrides RN SDK

To ensure the project relies on the same version of the RN SDK, you need to add an `overrides` field in the project's root `oh-package.json5` file, specifying the RN SDK version to be used. The replacement version can be a specific version number, a semver range, or a locally available HAR package or source directory.

For more information about the purpose of this field, please refer to the [official documentation](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#en-us_topic_0000001792256137_overrides).

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "~0.84.3"
  }
}
```

### 2. Introducing Native Code

Currently, two methods are available:

- Use the HAR file.
- Directly link to the source code.

Method 1 (recommended): Use the HAR file.

> [!TIP] The HAR file is stored in the `harmony` directory in the installation path of the third-party library.

Open `entry/oh-package.json5` file and add the following dependencies:

```json
"dependencies": {
    "@react-native-ohos/react-native-thinking-data": "file:../../node_modules/@react-native-ohos/react-native-thinking-data/harmony/thinking_analytics.har"
  }
```

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Method 2: Directly link to the source code.

> [!TIP] To link the source code directly, see [Linking Source Code](https://gitcode.com/CPF-RN/usage-docs/blob/master/en/link-source-code.md)

### 3. Configure CMakeLists and import RNThinkingDataPackage

Open `entry/src/main/cpp/CMakeLists.txt` and add:

```diff
project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp")
set(LOG_VERBOSITY_LEVEL 1)
set(CMAKE_ASM_FLAGS "-Wno-error=unused-command-line-argument -Qunused-arguments")
set(CMAKE_CXX_FLAGS "-fstack-protector-strong -Wl,-z,relro,-z,now,-z,noexecstack -s -fPIE -pie")
set(WITH_HITRACE_SYSTRACE 1)
add_compile_definitions(WITH_HITRACE_SYSTRACE)

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: manual_package_linking_1
add_subdirectory("../../../../sample_package/src/main/cpp" ./sample-package)
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-thinking-data/src/main/cpp" ./thinking_data)
# RNOH_END: manual_package_linking_1

file(GLOB GENERATED_CPP_FILES "./generated/*.cpp")

add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)
target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: manual_package_linking_2
target_link_libraries(rnoh_app PUBLIC rnoh_sample_package)
+ target_link_libraries(rnoh_app PUBLIC rnoh_thinking_data)
# RNOH_END: manual_package_linking_2
```

Open `entry/src/main/cpp/PackageProvider.cpp` and add:

```diff
#include "RNOH/PackageProvider.h"
#include "SamplePackage.h"
+ #include "RNThinkingDataPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
      std::make_shared<SamplePackage>(ctx),
+     std::make_shared<RNThinkingDataPackage>(ctx)
    };
}
```

### 4. Import RNThinkingDataPackage on the ArkTS side

Open `entry/src/main/ets/RNPackagesFactory.ts` and add:

```typescript
import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
import { RNThinkingDataPackage } from '@react-native-ohos/react-native-thinking-data';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new RNThinkingDataPackage(ctx),
  ];
}
```

</details>

### Running

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Then build and run the app.

## Constraints

### Compatibility

This document is verified based on the following versions:

1. RNOH: 0.84.3; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM: 6.0.0.120 SP7;

### Dependencies

This library declares `@react-native-async-storage/async-storage` as a **peerDependency** (same as upstream; used for local cache). Install it in the host app:

```bash
npm install @react-native-async-storage/async-storage
```

Install this library:

```bash
npm install @react-native-ohos/react-native-thinking-data
```

Keep importing the original package name `react-native-thinking-data` in app code (`harmony.alias` / Metro mapping).

### Permissions

The HAR module already declares network permissions. They are merged into the host app at integration time. If the host uses a permission allowlist, keep the following in `entry/src/main/module.json5`:

```json
"requestPermissions": [
  {
    "name": "ohos.permission.INTERNET"
  },
  {
    "name": "ohos.permission.GET_NETWORK_INFO"
  }
]
```

### Build configuration

The HarmonyOS implementation depends on the `@thinkingdata/analytics` bytecode HAR. The host app must set `useNormalizedOHMUrl` to `true` in the project-level `harmony/build-profile.json5`. Otherwise the build fails with `00306046` (Bytecode HARs not supported when useNormalizedOHMUrl is not true).

```json
{
  "app": {
    "products": [
      {
        "name": "default",
        "compatibleSdkVersion": "5.0.0(12)",
        "runtimeOS": "HarmonyOS",
        "buildOption": {
          "strictMode": {
            "useNormalizedOHMUrl": true
          }
        }
      }
    ]
  }
}
```

## Example

The following sample shows the basic usage of this library:

> [!WARNING] Keep the original import name unchanged.

Initialize the SDK only after the user accepts the privacy policy.

```javascript
import TDAnalytics, { TDAutoTrackEventType, TDMode } from 'react-native-thinking-data';

TDAnalytics.init({
  appId: '<YOUR_APPID>',
  serverUrl: 'https://<YOUR_SERVER>',
  mode: TDMode.NORMAL,
  enableLog: true,
});
TDAnalytics.login('account-id');
TDAnalytics.setSuperProperties({ channel: 'harmony' });
TDAnalytics.enableAutoTrack(
  TDAutoTrackEventType.APP_START | TDAutoTrackEventType.APP_END
);
TDAnalytics.track({
  eventName: 'product_buy',
  properties: { product_name: 'demo' },
});
TDAnalytics.userSet({ username: 'TE' });
TDAnalytics.flush();
TDAnalytics.getDistinctId()
  .then((id) => {
    console.log(id);
  })
  .catch(() => {});
```

To enable click / page-view auto-tracking, run the original hook script after `npm install`:

```bash
node node_modules/react-native-thinking-data/ThinkingDataRNHook.js -run
```

Restore the injected files:

```bash
node node_modules/react-native-thinking-data/ThinkingDataRNHook.js -reset
```

## Available APIs

> [!TIP] The "Platform" column indicates the platforms supported by the original third-party library.

> [!TIP] "OpenHarmony Support" is yes if HarmonyOS supports the API, no if it does not, and partially if it is only partly supported. Usage is the same across platforms, and behavior matches iOS or Android.

This library has no `configure` / subscription APIs, so there is no `useEffect` unsubscribe. Fields omitted from `init(config = {})` and `enableAutoTrackWithProperties(options = {})` are `undefined`.

### Constants

#### TDMode

| Name | Value | Type | Required | Platform | OpenHarmony Support | Description |
|--------|---------|-----|-------|--------|-----|-----------------|
| NORMAL | `'normal'` | string | No | All | yes | Normal reporting |
| DEBUG | `'debug'` | string | No | All | yes | Debug mode |
| DEBUG_ONLY | `'debugOnly'` | string | No | All | yes | Validate only, do not report |

#### TDAutoTrackEventType

Values can be combined with bitwise OR. On HarmonyOS the native layer converts a JS number or string array into a bitmask.

| Name | Value | Type | Required | Platform | OpenHarmony Support | Description |
|--------|---------|-----|-------|--------|-----|-----------------|
| APP_START | `1` | number | No | All | yes | App start |
| APP_END | `1 << 1` | number | No | All | yes | App end |
| APP_CLICK | `1 << 2` | number | No | All | yes | Click (also requires the Hook) |
| APP_VIEW_SCREEN | `1 << 3` | number | No | All | yes | Page view (also requires the Hook) |
| APP_CRASH | `1 << 4` | number | No | All | yes | Crash |
| APP_INSTALL | `1 << 5` | number | No | All | yes | Install |

#### TDTrackStatus

The constants are exported from JS. The matching API `setTrackStatus` is ignored on HarmonyOS.

| Name | Value | Type | Required | Platform | OpenHarmony Support | Description |
|--------|---------|-----|-------|--------|-----|-----------------|
| PAUSE | `'pause'` | string | No | All | no | Pause reporting |
| STOP | `'stop'` | string | No | All | no | Stop tracking |
| SAVE_ONLY | `'saveOnly'` | string | No | All | no | Save only, do not report |
| NORMAL | `'normal'` | string | No | All | no | Resume normal tracking |

#### TDThirdPartyType

The constants are exported from JS. The matching API `enableThirdPartySharing` is ignored on HarmonyOS.

| Name | Value | Type | Required | Platform | OpenHarmony Support | Description |
|--------|---------|-----|-------|--------|-----|-----------------|
| APPS_FLYER | `1` | number | No | All | no | AppsFlyer |
| IRON_SOURCE | `1 << 1` | number | No | All | no | IronSource |
| ADJUST | `1 << 2` | number | No | All | no | Adjust |
| BRANCH | `1 << 3` | number | No | All | no | Branch |
| TOP_ON | `1 << 4` | number | No | All | no | TopOn |
| TRACKING | `1 << 5` | number | No | All | no | TrackingIO |
| TRAD_PLUS | `1 << 6` | number | No | All | no | TradPlus |

### Properties

#### TDConfig

Object argument for `init`. `appid` is copied onto `appId`.

| Name | Description | Type | Required | Default | Platform | OpenHarmony Support |
|--------|---------|-----|-------|--------|--------|-----------------|
| appId | Project APP ID | string | Yes | `undefined` | All | yes |
| serverUrl | Reporting URL | string | Yes | `undefined` | All | yes |
| mode | Runtime mode | TDMode | No | `undefined` (native keeps the SDK default NORMAL) | All | yes |
| enableEncrypt | Enable encryption; also requires `secretKey` | boolean | No | `undefined` | All | yes |
| secretKey | Encryption key; see the table below | object | No | `undefined` | All | yes |
| enableLog | Enable local logging | boolean | No | `undefined` | All | yes |
| timeZone | Default time-zone offset (number, not a TimeZone string) | number | No | `undefined` | All | partially |

#### secretKey

Applied only when `enableEncrypt === true` and this object is present.

| Name | Description | Type | Required | Default | Platform | OpenHarmony Support |
|--------|---------|-----|-------|--------|--------|-----------------|
| publicKey | RSA public key | string | Yes | `undefined` | All | yes |
| version | Key version | number | Yes | `undefined` | All | yes |

#### TDEvent

| Name | Description | Type | Required | Default | Platform | OpenHarmony Support |
|--------|---------|-----|-------|--------|--------|-----------------|
| eventName | Event name | string | Yes | `undefined` | All | yes |
| properties | Event properties | object | No | `undefined` | All | yes |
| time | Event time | Date | No | `undefined` | All | yes |
| timeZone | Event time-zone offset (number) | number | No | `undefined` | All | yes |

#### TDSpecialEvent

| Name | Description | Type | Required | Default | Platform | OpenHarmony Support |
|--------|---------|-----|-------|--------|--------|-----------------|
| eventName | Event name | string | Yes | `undefined` | All | yes |
| properties | Event properties | object | No | `undefined` | All | yes |
| time | Event time | Date | No | `undefined` | All | yes |
| timeZone | Event time-zone offset (number) | number | No | `undefined` | All | yes |
| eventId | Event ID | string | No | `undefined` | All | yes |

#### enableAutoTrackWithProperties options

The JS field is `autoTrackTypes`. The bridge writes `types`, and native converts the array to a bitmask.

| Name | Description | Type | Required | Default | Platform | OpenHarmony Support |
|--------|---------|-----|-------|--------|--------|-----------------|
| autoTrackTypes | Auto-track type bitmask | number | Yes | `undefined` | All | yes |
| properties | Auto-track event properties | object | Yes | `undefined` | All | yes |
| appId | Instance APP ID | string | No | `undefined` | All | yes |

#### TDThirdPartyPramas

Used only by `enableThirdPartySharing`, which is ignored on HarmonyOS.

| Name | Description | Type | Required | Default | Platform | OpenHarmony Support |
|--------|---------|-----|-------|--------|--------|-----------------|
| types | Third-party type bitmask | TDThirdPartyType | Yes | `undefined` | All | no |
| params | Extra parameters | object | No | `undefined` | All | no |

### API

| Name | Type | Parameters | Return value | Required | Platform | OpenHarmony Support | Description |
|--------|---------|-----|-------|-------|--------|-----|-----------------|
| init | function | TDConfig | / | Yes | All | yes | Initialize the SDK with appId and serverUrl |
| init | function | string, string | / | Yes | All | yes | Overload: `init(appId, serverUrl)` |
| track | function | TDEvent, appId? | / | No | All | yes | Track a normal event |
| trackFirst | function | TDSpecialEvent, appId? | / | No | All | yes | Track a first event |
| trackUpdate | function | TDSpecialEvent, appId? | / | No | All | yes | Track an updatable event |
| trackOverwrite | function | TDSpecialEvent, appId? | / | No | All | yes | Track an overwritable event |
| timeEvent | function | string, appId? | / | No | All | yes | Record event duration |
| enableAutoTrack | function | number \| string[], object?, appId? | / | No | All | yes | Enable auto-tracking (start/end/crash/install; click/page-view also need the Hook) |
| enableAutoTrackWithProperties | function | object | / | No | All | partially | Set auto-track properties; JS only maps START/END/CRASH/INSTALL and does **not** forward APP_CLICK/APP_VIEW_SCREEN (use `enableAutoTrack(bitmask)` + Hook for click/view) |
| login | function | string, appId? | / | No | All | yes | Set the account ID without uploading a login event |
| logout | function | appId? | / | No | All | yes | Clear the account ID |
| setDistinctId | function | string, appId? | / | No | All | yes | Set the distinct ID |
| getDistinctId | function | appId? | Promise\<string \| null\> | No | All | yes | Get the distinct ID; may be null on failure |
| getAccountId | function | appId? | Promise\<string \| null\> | No | All | yes | Get the account ID; may be null on failure |
| getDeviceId | function | appId? | Promise\<string \| null\> | No | All | yes | Get the device ID; may be null on failure |
| userSet | function | object, appId? | / | No | All | yes | Set user properties |
| userSetOnce | function | object, appId? | / | No | All | yes | Set user properties once |
| userUnset | function | string, appId? | / | No | All | yes | Unset a user property |
| userAdd | function | object, appId? | / | No | All | yes | Add numeric user properties |
| userAppend | function | object, appId? | / | No | All | yes | Append list user properties |
| userUniqAppend | function | object, appId? | / | No | All | yes | Append unique list user properties |
| userDelete | function | appId? | / | No | All | yes | Delete user properties |
| setSuperProperties | function | object, appId? | / | No | All | yes | Set super properties |
| unsetSuperProperty | function | string, appId? | / | No | All | yes | Unset one super property |
| clearSuperProperties | function | appId? | / | No | All | yes | Clear super properties |
| getSuperProperties | function | appId? | Promise\<object \| null\> | No | All | yes | Get super properties; may be null on failure |
| getPresetProperties | function | appId? | Promise\<object \| null\> | No | All | yes | Get preset properties; may be null on failure |
| setDynamicSuperProperties | function | function, appId? | / | No | All | yes | Set dynamic super properties (merged on the JS side) |
| flush | function | appId? | / | No | All | yes | Flush the local cache queue |
| calibrateTime | function | number | / | No | All | yes | Calibrate time with a timestamp |
| calibrateTimeWithNtp | function | string | / | No | All | no | NTP calibration is not supported by the HarmonyOS SDK and is ignored |
| setTrackStatus | function | TDTrackStatus, appId? | / | No | All | no | Tracking status is not supported by the HarmonyOS SDK and is ignored |
| enableThirdPartySharing | function | TDThirdPartyPramas, appId? | / | No | All | no | Third-party sharing is not supported by the HarmonyOS SDK and is ignored |
| h5ClickHandler | function | string | / | No | All | yes | Forward H5 events to native tracking |

Gating and errors:

- `init`: if `appId` / `serverUrl` is empty, or native has no `UIAbilityContext`, the module logs `hilog.error` only. It does not report and does not throw to JS.
- `calibrateTimeWithNtp`, `setTrackStatus`, and `enableThirdPartySharing` are ignored on HarmonyOS and do not throw.
- Query APIs return Promises. The result may be `null` on failure; callers can add `.catch()`.

## Known Issues

- `calibrateTimeWithNtp`, `enableThirdPartySharing`, and `setTrackStatus` are not provided by the OpenHarmony SDK (`@thinkingdata/analytics`; see the [OpenHarmony guide](https://docs.thinkingdata.io/ta-manual/latest/installation/installation_menu/client_sdk/openharmony_sdk_installation/openharmony_sdk_installation.html)). The JS APIs remain callable; the native layer logs a warning and ignores them.
- Init `timeZone`: Android maps the JS numeric offset to a `TimeZone` object. Official HarmonyOS `TDConfig` documents `appId` / `serverUrl` / `mode` / `enableAutoCalibrated` only. This library still writes the JS offset to `defaultTimeZone` (2.x binding). If the runtime SDK ignores that field, events still carry `#zone_offset`.
- Click / page-view auto-tracking depends on `ThinkingDataRNHook.js` injecting into RN runtime files. Run `-run` after `npm install`. On RN 0.84 Fabric the target files may be missing; check the `-run` log. Same as upstream, `enableAutoTrackWithProperties` does not forward `APP_CLICK` / `APP_VIEW_SCREEN` bits; use `enableAutoTrack(bitmask)` for those.

## Other

None

## Directory Structure

````
/rntpc_react-native-thinking-data  # project root
├── harmony                        # HarmonyOS adaptation
│    ├─ thinking_analytics.har     # HAR package
│    └─ thinking_analytics         # HarmonyOS core code
│          ├─ index.ets            # HarmonyOS entry
│          ├─ ts.ets               # TurboModule / Package re-exports
│          ├─ oh-package.json5     # HarmonyOS module metadata
│          └─ src/main
│              ├─ module.json5     # Module config and permissions
│              ├─ cpp/             # C++ Package and TurboModule metadata
│              │    ├─ CMakeLists.txt
│              │    ├─ RNThinkingDataPackage.cpp
│              │    └─ RNThinkingDataPackage.h
│              ├─ ets/
│              │    ├─ RNThinkingAnalyticsModule.ets  # UITurboModule implementation
│              │    └─ RNThinkingDataPackage.ets      # Package registration
│              └─ resources/base/element/string.json  # Resource strings
├── index.js                       # NativeModules export
├── TDAnalytics.js                 # RN JS entry
├── TDAnalytics.d.ts               # TypeScript declarations
├── ThinkingAnalyticsAPI.js        # NativeModules bridge
├── ThinkingDataRNHook.js          # Click / page-view auto-track hook
├── LICENSE                        # Apache-2.0
├── CHANGELOG.md                   # Changelog
├── README.OpenSource              # Open-source notice
├── README.md                      # Chinese guide
└── README_en.md                   # English guide
````

## Contributing

If you find any issues, please submit an [Issue](https://gitcode.com/CPF-RN/rntpc_react-native-thinking-data/issues). Pull requests are also welcome: [PR](https://gitcode.com/CPF-RN/rntpc_react-native-thinking-data/pulls).

## License

This project is based on [Apache License 2.0](https://github.com/ThinkingDataAnalytics/react-native-sdk). Enjoy and participate in open source.
