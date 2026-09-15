> 文档模板：v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-thinking-data</code> </h1>
</p>

本项目基于 [react-native-thinking-data@3.2.1](https://github.com/ThinkingDataAnalytics/react-native-sdk) 开发。

新的包名为：`@react-native-ohos/react-native-thinking-data`，版本所属关系如下：

| 三方库名称 | 三方库版本（npm地址） | 发布信息 | 支持RN版本 | Autolink | 编译API版本 | 社区基线版本 | 源码地址 |
| ------------ | ------------ | ------------------------------ | ------------- | ------------- |------------------------ | ------------- | ------------- |
| @react-native-ohos/react-native-thinking-data | [~ 3.2.2](https://www.npmjs.com/package/@react-native-ohos/react-native-thinking-data) | [Gitcode Releases](https://gitcode.com/CPF-RN/rntpc_react-native-thinking-data/releases) | 0.84.* | 是 | API12+ | 3.2.1 | [br_rnoh0.84](https://gitcode.com/CPF-RN/rntpc_react-native-thinking-data/tree/br_rnoh0.84) |

## 简介

`react-native-thinking-data` 是数数科技（ThinkingData / TE）官方 React Native 埋点 SDK 的鸿蒙化实现。JS 侧继续使用原库 `TDAnalytics` API，鸿蒙侧通过 RNOH 0.84 **UITurboModule**（`RNThinkingAnalyticsModule`）桥接到 `@thinkingdata/analytics`，用于事件上报、用户识别、公共属性与自动采集。

## 下载安装

进入到工程目录并输入以下命令：

**npm**

```bash
npm install @react-native-ohos/react-native-thinking-data
```

**yarn**

```bash
yarn add @react-native-ohos/react-native-thinking-data
```

## Link

| | 是否支持autolink | RN框架版本 |
| --- | --- | --- |
| ~ 3.2.2 | 是 | 0.84 |

使用AutoLink的工程需要根据该文档配置，Autolink框架指导文档：https://gitcode.com/CPF-RN/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

如您使用的版本支持 Autolink，并且工程已接入 Autolink，可跳过ManualLink配置。
<details>
  <summary>ManualLink: 此步骤为手动配置原生依赖项的指导</summary>

首先需要使用 DevEco Studio 打开项目里的 HarmonyOS 工程 `harmony`。

### 1. Overrides RN SDK

为了让工程依赖同一个版本的 RN SDK，需要在工程根目录的 `oh-package.json5` 添加 overrides 字段，指向工程需要使用的 RN SDK 版本。替换的版本既可以是一个具体的版本号，也可以是一个模糊版本，还可以是本地存在的 HAR 包或源码目录。

关于该字段的作用请阅读[官方说明](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#zh-cn_topic_0000001792256137_overrides)

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "~0.84.3"
  }
}
```

### 2. 引入原生端代码

目前有两种方法：

- 通过 har 包引入；
- 直接链接源码。

方法一：通过 har 包引入（推荐）

> [!TIP] har 包位于三方库安装路径的 `harmony` 文件夹下。

打开 `entry/oh-package.json5`，添加以下依赖

```json
"dependencies": {
    "@react-native-ohos/react-native-thinking-data": "file:../../node_modules/@react-native-ohos/react-native-thinking-data/harmony/thinking_analytics.har"
  }
```

点击右上角的 `sync` 按钮

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

方法二：直接链接源码

> [!TIP] 如需使用直接链接源码，请参考[直接链接源码说明](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/link-source-code.md)

### 3. 配置 CMakeLists 和引入 RNThinkingDataPackage

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

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

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

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

### 4. 在 ArkTs 侧引入 RNThinkingDataPackage

打开 `entry/src/main/ets/RNPackagesFactory.ts`，添加：

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

### 运行

点击右上角的 `sync` 按钮

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

然后编译、运行即可。

## 约束与限制

### 兼容性

本文档内容基于以下版本验证通过：

1. RNOH: 0.84.3; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM: 6.0.0.120 SP7;

### 依赖要求

本库 JS 侧将 `@react-native-async-storage/async-storage` 声明为 **peerDependency**（与上游一致，用于本地缓存）。业务工程需自行安装，例如：

```bash
npm install @react-native-async-storage/async-storage
```

安装本库：

```bash
npm install @react-native-ohos/react-native-thinking-data
```

业务代码 `import` 仍使用原库名 `react-native-thinking-data`（通过 `harmony.alias` / Metro 映射）。

### 权限要求

HAR 模块已声明网络相关权限，集成时由应用合并生效。若宿主对权限做了白名单裁剪，请在 `entry/src/main/module.json5` 中保留：

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

### 编译配置

本库鸿蒙侧依赖 `@thinkingdata/analytics` 字节码 HAR。宿主应用工程级 `harmony/build-profile.json5` 必须开启 `useNormalizedOHMUrl`，否则会报错 `00306046`（Bytecode HARs not supported when useNormalizedOHMUrl is not true）。

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

## 使用示例

下面的代码展示了这个库的基本使用场景：

> [!WARNING] 使用时 import 的库名不变。

请在用户同意隐私政策后再初始化 SDK。

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

如需启用点击 / 页面浏览自动采集，请按原库流程执行：

```bash
node node_modules/react-native-thinking-data/ThinkingDataRNHook.js -run
```

恢复注入：

```bash
node node_modules/react-native-thinking-data/ThinkingDataRNHook.js -reset
```

## 接口说明

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "OpenHarmony Support"列为 yes 表示 OpenHarmony平台支持 该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

本库无 `configure` / 事件订阅 API，无需 `useEffect` 退订。`init(config = {})` 及 `enableAutoTrackWithProperties(options = {})` 未传入的字段为 `undefined`。

### 常量

#### TDMode

| 名称 | 取值 | 类型 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
|--------|---------|-----|-------|--------|-----|-----------------|
| NORMAL | `'normal'` | string | No | All | yes | 正常上报 |
| DEBUG | `'debug'` | string | No | All | yes | Debug 模式 |
| DEBUG_ONLY | `'debugOnly'` | string | No | All | yes | 仅校验不上报 |

#### TDAutoTrackEventType

可按位或组合。鸿蒙原生会把 JS 传入的 number 或字符串数组转为 bitmask。

| 名称 | 取值 | 类型 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
|--------|---------|-----|-------|--------|-----|-----------------|
| APP_START | `1` | number | No | All | yes | 启动 |
| APP_END | `1 << 1` | number | No | All | yes | 退出 |
| APP_CLICK | `1 << 2` | number | No | All | yes | 点击（另需 Hook） |
| APP_VIEW_SCREEN | `1 << 3` | number | No | All | yes | 页面浏览（另需 Hook） |
| APP_CRASH | `1 << 4` | number | No | All | yes | 崩溃 |
| APP_INSTALL | `1 << 5` | number | No | All | yes | 安装 |

#### TDTrackStatus

常量可从 JS 导出；对应 API `setTrackStatus` 在鸿蒙上会被忽略。

| 名称 | 取值 | 类型 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
|--------|---------|-----|-------|--------|-----|-----------------|
| PAUSE | `'pause'` | string | No | All | no | 暂停上报 |
| STOP | `'stop'` | string | No | All | no | 停止采集 |
| SAVE_ONLY | `'saveOnly'` | string | No | All | no | 只入库不上报 |
| NORMAL | `'normal'` | string | No | All | no | 恢复正常 |

#### TDThirdPartyType

常量可从 JS 导出；对应 API `enableThirdPartySharing` 在鸿蒙上会被忽略。

| 名称 | 取值 | 类型 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
|--------|---------|-----|-------|--------|-----|-----------------|
| APPS_FLYER | `1` | number | No | All | no | AppsFlyer |
| IRON_SOURCE | `1 << 1` | number | No | All | no | IronSource |
| ADJUST | `1 << 2` | number | No | All | no | Adjust |
| BRANCH | `1 << 3` | number | No | All | no | Branch |
| TOP_ON | `1 << 4` | number | No | All | no | TopOn |
| TRACKING | `1 << 5` | number | No | All | no | TrackingIO |
| TRAD_PLUS | `1 << 6` | number | No | All | no | TradPlus |

### 属性

#### TDConfig

`init` 对象入参。`appid` 会同步到 `appId`。

| 名称 | 描述 | 类型 | 必填 | 默认值 | 平台 | OpenHarmony平台支持 |
|--------|---------|-----|-------|--------|--------|-----------------|
| appId | 项目 APP ID | string | Yes | `undefined` | All | yes |
| serverUrl | 数据上报地址 | string | Yes | `undefined` | All | yes |
| mode | 运行模式 | TDMode | No | `undefined`（原生按 SDK 默认 NORMAL） | All | yes |
| enableEncrypt | 是否启用加密；需同时提供 `secretKey` | boolean | No | `undefined` | All | yes |
| secretKey | 加密密钥，见下表 | object | No | `undefined` | All | yes |
| enableLog | 是否开启本地日志 | boolean | No | `undefined` | All | yes |
| timeZone | 默认时区偏移（number，不是 TimeZone 字符串） | number | No | `undefined` | All | partially |

#### secretKey

仅在 `enableEncrypt === true` 且本对象存在时生效。

| 名称 | 描述 | 类型 | 必填 | 默认值 | 平台 | OpenHarmony平台支持 |
|--------|---------|-----|-------|--------|--------|-----------------|
| publicKey | RSA 公钥 | string | Yes | `undefined` | All | yes |
| version | 密钥版本 | number | Yes | `undefined` | All | yes |

#### TDEvent

| 名称 | 描述 | 类型 | 必填 | 默认值 | 平台 | OpenHarmony平台支持 |
|--------|---------|-----|-------|--------|--------|-----------------|
| eventName | 事件名 | string | Yes | `undefined` | All | yes |
| properties | 事件属性 | object | No | `undefined` | All | yes |
| time | 事件时间 | Date | No | `undefined` | All | yes |
| timeZone | 事件时区偏移（number） | number | No | `undefined` | All | yes |

#### TDSpecialEvent

| 名称 | 描述 | 类型 | 必填 | 默认值 | 平台 | OpenHarmony平台支持 |
|--------|---------|-----|-------|--------|--------|-----------------|
| eventName | 事件名 | string | Yes | `undefined` | All | yes |
| properties | 事件属性 | object | No | `undefined` | All | yes |
| time | 事件时间 | Date | No | `undefined` | All | yes |
| timeZone | 事件时区偏移（number） | number | No | `undefined` | All | yes |
| eventId | 事件 ID | string | No | `undefined` | All | yes |

#### enableAutoTrackWithProperties options

JS 入参字段为 `autoTrackTypes`；桥接到原生时写入 `types`，原生再把数组转为 bitmask。

| 名称 | 描述 | 类型 | 必填 | 默认值 | 平台 | OpenHarmony平台支持 |
|--------|---------|-----|-------|--------|--------|-----------------|
| autoTrackTypes | 自动采集类型 bitmask | number | Yes | `undefined` | All | yes |
| properties | 自动采集事件属性 | object | Yes | `undefined` | All | yes |
| appId | 实例 APP ID | string | No | `undefined` | All | yes |

#### TDThirdPartyPramas

仅用于 `enableThirdPartySharing`，鸿蒙上调用会被忽略。

| 名称 | 描述 | 类型 | 必填 | 默认值 | 平台 | OpenHarmony平台支持 |
|--------|---------|-----|-------|--------|--------|-----------------|
| types | 三方类型 bitmask | TDThirdPartyType | Yes | `undefined` | All | no |
| params | 额外参数 | object | No | `undefined` | All | no |

### API

| 名称 | 类型 | 参数类型 | 返回值 | 必填 | 平台 | OpenHarmony平台支持 | 描述 |
|--------|---------|-----|-------|-------|--------|-----|-----------------|
| init | function | TDConfig | / | Yes | All | yes | 初始化 SDK，需传入 appId 与 serverUrl |
| init | function | string, string | / | Yes | All | yes | 重载：`init(appId, serverUrl)` |
| track | function | TDEvent, appId? | / | No | All | yes | 上报普通事件 |
| trackFirst | function | TDSpecialEvent, appId? | / | No | All | yes | 上报首次事件 |
| trackUpdate | function | TDSpecialEvent, appId? | / | No | All | yes | 上报可更新事件 |
| trackOverwrite | function | TDSpecialEvent, appId? | / | No | All | yes | 上报可重写事件 |
| timeEvent | function | string, appId? | / | No | All | yes | 记录事件时长 |
| enableAutoTrack | function | number \| string[], object?, appId? | / | No | All | yes | 开启自动采集（启动/退出/崩溃/安装；点击/页面浏览另需 Hook） |
| enableAutoTrackWithProperties | function | object | / | No | All | partially | 为自动采集设置属性；JS 仅映射 START/END/CRASH/INSTALL，**不透传** APP_CLICK/APP_VIEW_SCREEN（点击/浏览请用 `enableAutoTrack(bitmask)` + Hook） |
| login | function | string, appId? | / | No | All | yes | 设置账号 ID，不上报登录事件 |
| logout | function | appId? | / | No | All | yes | 清除账号 ID |
| setDistinctId | function | string, appId? | / | No | All | yes | 设置访客 ID |
| getDistinctId | function | appId? | Promise\<string \| null\> | No | All | yes | 获取访客 ID；失败可为 null |
| getAccountId | function | appId? | Promise\<string \| null\> | No | All | yes | 获取账号 ID；失败可为 null |
| getDeviceId | function | appId? | Promise\<string \| null\> | No | All | yes | 获取设备 ID；失败可为 null |
| userSet | function | object, appId? | / | No | All | yes | 设置用户属性 |
| userSetOnce | function | object, appId? | / | No | All | yes | 设置用户属性（只设置一次） |
| userUnset | function | string, appId? | / | No | All | yes | 重置用户属性 |
| userAdd | function | object, appId? | / | No | All | yes | 累加数值型用户属性 |
| userAppend | function | object, appId? | / | No | All | yes | 追加 List 型用户属性 |
| userUniqAppend | function | object, appId? | / | No | All | yes | 追加并去重 List 型用户属性 |
| userDelete | function | appId? | / | No | All | yes | 删除用户属性 |
| setSuperProperties | function | object, appId? | / | No | All | yes | 设置公共事件属性 |
| unsetSuperProperty | function | string, appId? | / | No | All | yes | 删除单个公共事件属性 |
| clearSuperProperties | function | appId? | / | No | All | yes | 清空公共事件属性 |
| getSuperProperties | function | appId? | Promise\<object \| null\> | No | All | yes | 获取公共事件属性；失败可为 null |
| getPresetProperties | function | appId? | Promise\<object \| null\> | No | All | yes | 获取预置属性；失败可为 null |
| setDynamicSuperProperties | function | function, appId? | / | No | All | yes | 设置动态公共属性（JS 侧合并） |
| flush | function | appId? | / | No | All | yes | 立即上报缓存队列 |
| calibrateTime | function | number | / | No | All | yes | 使用时间戳校准 |
| calibrateTimeWithNtp | function | string | / | No | All | no | NTP 校时，鸿蒙 SDK 不支持，调用会被忽略 |
| setTrackStatus | function | TDTrackStatus, appId? | / | No | All | no | 采集开关，鸿蒙 SDK 不支持，调用会被忽略 |
| enableThirdPartySharing | function | TDThirdPartyPramas, appId? | / | No | All | no | 三方归因同步，鸿蒙 SDK 不支持，调用会被忽略 |
| h5ClickHandler | function | string | / | No | All | yes | 转发 H5 事件到原生上报 |

门控与异常：

- `init`：`appId` / `serverUrl` 为空，或原生侧无 `UIAbilityContext` 时，仅 `hilog.error`，不上报、不向 JS 抛错。
- `calibrateTimeWithNtp`、`setTrackStatus`、`enableThirdPartySharing`：鸿蒙忽略，不抛错。
- 查询类 API 返回 Promise；失败时结果可为 `null`，调用方可加 `.catch()`。

## 遗留问题

- `calibrateTimeWithNtp`、`enableThirdPartySharing`、`setTrackStatus` 在 OpenHarmony 官方 SDK 文档与 `@thinkingdata/analytics` 中无对应实现（[OpenHarmony 接入指南](https://docs.thinkingdata.io/ta-manual/latest/installation/installation_menu/client_sdk/openharmony_sdk_installation/openharmony_sdk_installation.html)）。JS API 仍可调用，原生侧仅 hilog 警告并忽略，与「入口保留、能力以鸿蒙 SDK 为准」一致。
- 初始化参数 `timeZone`：上游 Android 会转成 `TimeZone` 对象；鸿蒙官方 `TDConfig` 仅文档化 `appId` / `serverUrl` / `mode` / `enableAutoCalibrated`。本库仍把 JS 数字 offset 写入 `defaultTimeZone`（与 2.x 绑定字段一致）；若运行时 SDK 忽略该字段，事件仍会带 `#zone_offset`。
- 点击 / 页面浏览自动采集依赖 `ThinkingDataRNHook.js` 对 RN 运行时文件的注入，需在 `npm install` 后手动执行 `-run`。RN 0.84 Fabric 下注入目标文件可能不存在，请以实际 `-run` 日志为准。`enableAutoTrackWithProperties` 与上游一致，不会把 `APP_CLICK` / `APP_VIEW_SCREEN` bit 传给原生；这两类请用 `enableAutoTrack(bitmask)`。

## 其他

无

## 目录结构

````
/rntpc_react-native-thinking-data  # 项目根目录
├── harmony                        # 鸿蒙适配代码
│    ├─ thinking_analytics.har     # har 包
│    └─ thinking_analytics         # 鸿蒙适配核心代码
│          ├─ index.ets            # 鸿蒙适配代码入口
│          ├─ ts.ets               # TurboModule / Package 再导出
│          ├─ oh-package.json5     # 鸿蒙模块元数据
│          └─ src/main
│              ├─ module.json5     # 模块配置与权限
│              ├─ cpp/             # C++ Package 与 TurboModule 元数据
│              │    ├─ CMakeLists.txt
│              │    ├─ RNThinkingDataPackage.cpp
│              │    └─ RNThinkingDataPackage.h
│              ├─ ets/
│              │    ├─ RNThinkingAnalyticsModule.ets  # UITurboModule 实现
│              │    └─ RNThinkingDataPackage.ets      # Package 注册
│              └─ resources/base/element/string.json  # 资源字符串
├── index.js                       # NativeModules 导出
├── TDAnalytics.js                 # RN JS 层入口
├── TDAnalytics.d.ts               # TypeScript 类型声明
├── ThinkingAnalyticsAPI.js        # NativeModules 桥接实现
├── ThinkingDataRNHook.js          # 点击/页面浏览自动采集注入脚本
├── LICENSE                        # Apache-2.0
├── CHANGELOG.md                   # 变更记录
├── README.OpenSource              # 开源声明
├── README.md                      # 中文安装使用方法
└── README_en.md                   # 英文安装使用方法
````

## 贡献代码

使用过程中发现任何问题都可以提交 [Issue](https://gitcode.com/CPF-RN/rntpc_react-native-thinking-data/issues)，当然，也非常欢迎提交 [PR](https://gitcode.com/CPF-RN/rntpc_react-native-thinking-data/pulls) 。

## 开源协议

本项目基于 [Apache License 2.0](https://github.com/ThinkingDataAnalytics/react-native-sdk) ，请自由地享受和参与开源。
