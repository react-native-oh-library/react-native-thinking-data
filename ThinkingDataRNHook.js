var path = require("path"),
  fs = require("fs"),
  dir = path.resolve(__dirname, "..");
  //yalc发布
  // dir = path.resolve(__dirname, "../../node_modules");
  var userPackageJson = require("../../package.json");
var ignoreScreen = false;
var ignoreClick = false;
if (userPackageJson && userPackageJson['thinkingData']) {
  if(userPackageJson['thinkingData']['ignoreScreen']){
    ignoreScreen = true;
  }
  if(userPackageJson['thinkingData']['ignoreClick']){
    ignoreClick = true;
  }
}
var reactNavigationPath = dir + '/react-navigation',
  reactNavigationPath3X = dir + '/@react-navigation/native/src',
  reactNavigationPath4X = dir + '/@react-navigation/native/lib/module',
  reactNavigationPath7XCommon = dir + '/@react-navigation/core/lib/commonjs/BaseNavigationContainer.js',
  reactNavigationPath7XModule = dir + '/@react-navigation/core/lib/module/BaseNavigationContainer.js',
  reactNavigationPath7XSrc = dir + '/@react-navigation/core/src/BaseNavigationContainer.tsx';

var reactNavigationReduxCreatePath = [dir + '/react-navigation-redux-helpers/src/reduxify-navigator.js',
dir + '/react-navigation-redux-helpers/src/create-redux-container.js'];
var reactNavigationReduxMiddlePath = dir + '/react-navigation-redux-helpers/src/middleware.js';
var RNClickFilePath = dir + '/react-native/Libraries/Components/Touchable/Touchable.js';
var RNClickPressabilityFilePath = dir + '/react-native/Libraries/Pressability/Pressability.js';
var RNClickableFiles = [dir + '/react-native/Libraries/Renderer/src/renderers/native/ReactNativeFiber.js',
dir + '/react-native/Libraries/Renderer/src/renderers/native/ReactNativeFiber-dev.js',
dir + '/react-native/Libraries/Renderer/src/renderers/native/ReactNativeFiber-prod.js',
dir + '/react-native/Libraries/Renderer/src/renderers/native/ReactNativeFiber-profiling.js',
dir + '/react-native/Libraries/Renderer/ReactNativeFiber-dev.js',
dir + '/react-native/Libraries/Renderer/ReactNativeFiber-prod.js',
dir + '/react-native/Libraries/Renderer/oss/ReactNativeRenderer-dev.js',
dir + '/react-native/Libraries/Renderer/oss/ReactNativeRenderer-prod.js',
dir + '/react-native/Libraries/Renderer/ReactNativeStack-dev.js',
dir + '/react-native/Libraries/Renderer/ReactNativeStack-prod.js',
dir + '/react-native/Libraries/Renderer/oss/ReactNativeRenderer-profiling.js',
dir + '/react-native/Libraries/Renderer/ReactNativeRenderer-dev.js',
dir + '/react-native/Libraries/Renderer/ReactNativeRenderer-prod.js',
dir + '/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-profiling.js',
dir + '/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-dev.js',
dir + '/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod.js'];
var RNSliderFiles = [dir + '/react-native/Libraries/Components/Slider/Slider.js',
dir + '/react-native/Libraries/Components/Slider/Slider.js',
dir + '/@react-native-community/slider/js/Slider.js',
dir + '/@react-native-community/slider/dist/Slider.js',
dir + '/@react-native-community/js/Slider.js',
dir + '/@react-native-community/src/js/Slider.js'];
var RNSwitchFiles = [dir + '/react-native/Libraries/Components/Switch/Switch.js'];
var RNSegmentedControlFilePath = [dir + '/react-native/Libraries/Components/SegmentedControlIOS/SegmentedControlIOS.ios.js',
dir + '/@react-native-community/segmented-control/js/SegmentedControl.ios.js'];
var RNGestureButtonsFilePaths = [dir + '/react-native-gesture-handler/GestureButtons.js',
dir + '/react-native-gesture-handler/src/components/GestureButtons.tsx'];

// click 需 hook 的自执行代码
var thinkingdataClickHookCode = "(function(thatThis){ \n"
+ "  try {\n"
+ "    var ReactNative = require('react-native');\n"
+ "    var dataModule = ReactNative.NativeModules.RNThinkingAnalyticsModule;\n"
+ "    thatThis.props.onPress && dataModule && dataModule.trackViewClick && dataModule.trackViewClick(ReactNative.findNodeHandle(thatThis))\n"
+ "  } catch (error) { throw new Error('ThinkingData RN Hook Code 调用异常: ' + error);}\n"
+ "})(this); /* THINKINGDATA HOOK */ ";

var thinkingdataSliderHookCode = "(function(thatThis){\n"
+ "  try {\n"
+ "    var ReactNative = require('react-native');\n"
+ "    var dataModule = ReactNative.NativeModules.RNThinkingAnalyticsModule;\n"
+ "    dataModule && dataModule.trackViewClick && dataModule.trackViewClick(event.nativeEvent.target);\n"
+ "  } catch (error) { \n"
+ "      throw new Error('ThinkingData RN Hook Code 调用异常: ' + error);\n"
+ "  }\n"
+ "})(this); /* THINKINGDATA HOOK */";

var thinkingdataSwitchHookCode = "if(this.props.onChange != null || this.props.onValueChange != null){\n"
+ "  (function(thatThis){ \n"
+ "    try {\n"
+ "      var ReactNative = require('react-native');\n"
+ "      var dataModule = ReactNative.NativeModules.RNThinkingAnalyticsModule;\n"
+ "      dataModule && dataModule.trackViewClick && dataModule.trackViewClick(ReactNative.findNodeHandle(thatThis));\n"
+ "    } catch (error) { throw new Error('ThinkingData RN Hook Code 调用异常: ' + error);}\n"
+ "  })(this); /* THINKINGDATA HOOK */}";

var thinkingdataSwitchHookCode2 = "if(nativeSwitchRef.current && onValueChange){\n"
+ "  (function(thatThis){ \n"
+ "    try {\n"
+ "      var ReactNative = require('react-native');\n"
+ "      var dataModule = ReactNative.NativeModules.RNThinkingAnalyticsModule;\n"
+ "      dataModule && dataModule.trackViewClick && dataModule.trackViewClick(ReactNative.findNodeHandle(nativeSwitchRef.current));\n"
+ "    } catch (error) { throw new Error('ThinkingData RN Hook Code 调用异常: ' + error);}\n"
+ "  })(this); /* THINKINGDATA HOOK */}";

var thinkingdataSegmentedControlHookCode = "if(this.props.onChange != null || this.props.onValueChange != null){\n"
+ "(function(thatThis){\n"
+ "  try {\n"
+ "    var ReactNative = require('react-native');\n"
+ "    var dataModule = ReactNative.NativeModules.RNThinkingAnalyticsModule;\n"
+ "    dataModule && dataModule.trackViewClick && dataModule.trackViewClick(event.nativeEvent.target);\n"
+ "  } catch (error) { \n"
+ "      throw new Error('ThinkingData RN Hook Code 调用异常: ' + error);}\n"
+ "})(this); /* THINKINGDATA HOOK */}";

var thinkingdataClickHookPressabilityCode = "(function(thatThis){\n"
+ "  try {\n"
+ "    var ReactNative = require('react-native');\n"
+ "    var dataModule = ReactNative.NativeModules.RNThinkingAnalyticsModule;\n"
+ "    dataModule && dataModule.trackViewClick && dataModule.trackViewClick(event.nativeEvent.target);\n"
+ "  } catch (error) { \n"
+ "      throw new Error('ThinkingData RN Hook Code 调用异常: ' + error);\n"
+ "  }\n"
+ "})(this); /* THINKINGDATA HOOK */";

// 恢复被 hook 过的代码
thinkingdataResetRN = function (resetFilePath) {
  // 判断需要被恢复的文件是否存在
  if (!fs.existsSync(resetFilePath)) {
    return;
  }
  var fileContent = fs.readFileSync(resetFilePath, 'utf8');
  // 未被 hook 过代码，不需要处理
  if (fileContent.indexOf('THINKINGDATA HOOK') == -1) {
    return;
  }
  // 检查备份文件是否存在
  var backFilePath = `${resetFilePath}_thinkingdata_backup`;
  if (!fs.existsSync(backFilePath)) {
    throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
  }
  // 将备份文件重命名恢复 + 自动覆盖被 hook 过的同名 Touchable.js 文件
  fs.renameSync(backFilePath, resetFilePath);
  console.log(`found and reset file: ${resetFilePath}`);
};
// 工具函数- add try catch
addTryCatch = function (functionBody) {
  functionBody = functionBody.replace(/this/g, 'thatThis');
  return (
    '(function(thatThis){\n' +
    '    try{\n        ' +
    functionBody +
    "    \n    } catch (error) { throw new Error('ThinkingData RN Hook Code 调用异常: ' + error);}\n" +
    '})(this); /* THINKINGDATA HOOK */'
  );
};

navigationString = function (currentStateVarName, actionName) {
  var script = `function $$$getActivePageName$$$(navigationState){
    if(!navigationState)
        return null;
    const route = navigationState.routes[navigationState.index];
    if(route.routes){
      return $$$getActivePageName$$$(route);
    }else{
      var tdProperties = {};
      if(route.params) {
        if(!route.params.thinkingdataurl){
          tdProperties.thinkingdataurl = route.routeName;
        }else{
          tdProperties.thinkingdataurl = route.params.thinkingdataurl;
        }
        if(route.params.thinkingdataparams){
          tdProperties.thinkingdataparams = JSON.parse(JSON.stringify(route.params.thinkingdataparams));
        }
      } else {
        tdProperties.thinkingdataurl = route.routeName;
      }
      return tdProperties;
    }
  }`;
  if (actionName) {
    script = `${script}
    var type = ${actionName}.type;
    if(type == 'Navigation/SET_PARAMS' || type == 'Navigation/COMPLETE_TRANSITION') {
          return;
    }
    `;
  }
  script = `${script} var params = $$$getActivePageName$$$(${currentStateVarName});
    if(${ignoreScreen}){
      if(params.thinkingdataparams){
        params.thinkingdataparams.TDIgnoreViewScreen = true;
      }else{
        params.thinkingdataparams = {TDIgnoreViewScreen : true};
      }
    }
    if (require('react-native').Platform.OS === 'android'
        || require('react-native').Platform.OS === 'harmony'
        || require('react-native').Platform.OS === 'openharmony'
        || require('react-native').Platform.OS === 'ohos') {
        var ReactNative = require('react-native');
        var dataModule = ReactNative.NativeModules.RNThinkingAnalyticsModule;
        dataModule && dataModule.trackViewScreen && dataModule.trackViewScreen(params);
    }`;
  return script;
}

navigationString3 = function (prevStateVarName,currentStateVarName,actionName) {
  var script = `
    function $$$getActivePageName$$$(navigationState){
      if(!navigationState)
        return null;
      const route = navigationState.routes[navigationState.index];
      if(route.routes){
        return $$$getActivePageName$$$(route);
      }else{
        var tdProperties = {};
        if(route.params) {
          if(!route.params.thinkingdataurl){
            tdProperties.thinkingdataurl = route.routeName;
          }else{
            tdProperties.thinkingdataurl = route.params.thinkingdataurl;
          }
          if(route.params.thinkingdataparams){
            tdProperties.thinkingdataparams = JSON.parse(JSON.stringify(route.params.thinkingdataparams));
          }
        } else {
          tdProperties = {thinkingdataurl:route.routeName};
        }
        return tdProperties;
      }
    }`;
  if (actionName) {
    script = `
    ${script}
    var type = ${actionName}.type;
    var iosOnPageShow = false;
    var tdPlatformOS = require('react-native').Platform.OS;
    if (tdPlatformOS === 'android' || tdPlatformOS === 'harmony' || tdPlatformOS === 'openharmony' || tdPlatformOS === 'ohos') {
      if(type == 'Navigation/SET_PARAMS' || type == 'Navigation/COMPLETE_TRANSITION') {
        return;
      }
    } else if (tdPlatformOS === 'ios') {
      if(type == 'Navigation/BACK' && (${currentStateVarName} && !${currentStateVarName}.isTransitioning)) {
        iosOnPageShow = true;
      } else if (!(type == 'Navigation/SET_PARAMS' || type == 'Navigation/COMPLETE_TRANSITION')) {
        iosOnPageShow = true;
      }
      if (!iosOnPageShow) {
        return;
      }
    }`;
  }
  script = `
  ${script} var params = $$$getActivePageName$$$(${currentStateVarName});
    if(${ignoreScreen}){
      if(params.thinkingdataparams){
        params.thinkingdataparams.TDIgnoreViewScreen = true;
      }else{
        params.thinkingdataparams = {TDIgnoreViewScreen : true};
      }
    }
    if(require('react-native').Platform.OS === 'android'
      || require('react-native').Platform.OS === 'harmony'
      || require('react-native').Platform.OS === 'openharmony'
      || require('react-native').Platform.OS === 'ohos') {
      if(${prevStateVarName}){
        var prevParams = $$$getActivePageName$$$(${prevStateVarName});
        if (params.thinkingdataurl == prevParams.thinkingdataurl){
          return;
        }
      }
      var ReactNative = require('react-native');
      var dataModule = ReactNative.NativeModules.RNThinkingAnalyticsModule;
      dataModule && dataModule.trackViewScreen && dataModule.trackViewScreen(params);
    } else if (require('react-native').Platform.OS === 'ios') {
      if(!${actionName} || iosOnPageShow) {
        var ReactNative = require('react-native');
        var dataModule = ReactNative.NativeModules.RNThinkingAnalyticsModule;
        dataModule && dataModule.trackViewScreen && dataModule.trackViewScreen(params);
      }
    }`;
  return script;
}
var thinkingdataImportReactNativeHookCode = "import ReactNative from 'react-native';\n";
var thinkingdataNavigation5HookCode = `

  function getCurrentRouteName(){
    let state = getRootState();
    if (state === undefined) {
      return undefined;
    }
    while (state.routes[state.index].state !== undefined) {
        state = state.routes[state.index].state as NavigationState;
    }
    return state.routes[state.index].name;
  }

  function getParams(state:any):any{
    if(!state){
       return null;
     }
     var route = state.routes[state.index];
     var params = route.params;
     if(route.state){
       var p = getParams(route.state);
       if(p){
         params = p;
       }
     }
    return params;
  }

  function trackViewScreen(state: any): void {
    if (!state) {
      return;
    }
    var route = state.routes[state.index];
    if (route.name === 'Root') {
      trackViewScreen(route.state);
      return;
    }
    var screenName = getCurrentRouteName();
    var params = getParams(state);
    var tdProperties = {};
    if (params) {
      if (!params.thinkingdataurl) {
        tdProperties.thinkingdataurl = screenName;
      }else{
        tdProperties.thinkingdataurl = params.thinkingdataurl;
      }
      if(params.thinkingdataparams){
        tdProperties.thinkingdataparams = JSON.parse(JSON.stringify(params.thinkingdataparams));
      }
    } else {
        tdProperties.thinkingdataurl = screenName;
    }
    if(${ignoreScreen}){
        if(tdProperties.thinkingdataparams){
          tdProperties.thinkingdataparams.TDIgnoreViewScreen = true;
        }else{
          tdProperties.thinkingdataparams = {TDIgnoreViewScreen : true};
        }
    }
    var dataModule = ReactNative?.NativeModules?.RNThinkingAnalyticsModule;
    dataModule?.trackViewScreen && dataModule.trackViewScreen(tdProperties);
  }
  trackViewScreen(getRootState());
  /* THINKINGDATA HOOK */ `;

  var thinkingdataNavigation5JSHookCode = `

  function getCurrentRouteName(){
    let state = getRootState();
    if (state === undefined) {
      return undefined;
    }
    while (state.routes[state.index].state !== undefined) {
        state = state.routes[state.index].state;
    }
    return state.routes[state.index].name;
  }

  function getParams(state){
    if(!state){
       return null;
     }
     var route = state.routes[state.index];
     var params = route.params;
     if(route.state){
       var p = getParams(route.state);
       if(p){
         params = p;
       }
     }
    return params;
  }

  function trackViewScreen(state) {
    if (!state) {
      return;
    }
    var route = state.routes[state.index];
    if (route.name === 'Root') {
      trackViewScreen(route.state);
      return;
    }
    var screenName = getCurrentRouteName();
    var params = getParams(state);
    var tdProperties = {};
    if (params) {
      if (!params.thinkingdataurl) {
        tdProperties.thinkingdataurl = screenName;
      }else{
        tdProperties.thinkingdataurl = params.thinkingdataurl;
      }
      if(params.thinkingdataparams){
        tdProperties.thinkingdataparams = JSON.parse(JSON.stringify(params.thinkingdataparams));
      }
    } else {
        tdProperties.thinkingdataurl = screenName;
    }
    if(${ignoreScreen}){
        if(tdProperties.thinkingdataparams){
          tdProperties.thinkingdataparams.TDIgnoreViewScreen = true;
        }else{
          tdProperties.thinkingdataparams = {TDIgnoreViewScreen : true};
        }
    }
    var dataModule = ReactNative?.NativeModules?.RNThinkingAnalyticsModule;
    dataModule?.trackViewScreen && dataModule.trackViewScreen(tdProperties);
  }
  trackViewScreen(getRootState());
  /* THINKINGDATA HOOK */ `;

var thinkingdataHookReduxCreateCode =
  ` function getParams(route){
      if(!route){
        return null;
      }
      var childRoute = route.routes[route.index];
      var params = childRoute.params;
      if(childRoute.routes){
        var p = getParams(childRoute);
        if(p){
          params = p;
        }
      }
      return params;
    }
    function getScreenName(route){
      if(!route){
        return null;
      }
      var childRoute = route.routes[route.index];
      var screenName = childRoute.routeName;
      if(childRoute.routes){
        var name = getScreenName(childRoute);
        if(name){
          screenName = name;
        }
      }
      return screenName;
    }
    function trackViewScreen(route){
      if (!route) {
        return;
      }
      var childRoute = route.routes[route.index];
      if (route.name === 'Root') {
        trackViewScreen(childRoute);
        return;
      }
      var screenName = getScreenName(route);
      var params = getParams(route);
      var tdProperties = {};
      if (params) {
        if (!params.thinkingdataurl) {
          tdProperties.thinkingdataurl = screenName;
        }else{
          tdProperties.thinkingdataurl = params.thinkingdataurl;
        }
        if(params.thinkingdataparams){
          tdProperties.thinkingdataparams = JSON.parse(JSON.stringify(params.thinkingdataparams));
        }
      } else {
        tdProperties.thinkingdataurl = screenName;
      }
      if(${ignoreScreen}){
        if(tdProperties.thinkingdataparams){
          tdProperties.thinkingdataparams.TDIgnoreViewScreen = true;
        }else{
          tdProperties.thinkingdataparams = {TDIgnoreViewScreen : true};
        }
      }
      var dataModule = ReactNative?.NativeModules?.RNThinkingAnalyticsModule;
      dataModule?.trackViewScreen && dataModule.trackViewScreen(tdProperties);
    }
    trackViewScreen(this.props.state);
    /* THINKINGDATA HOOK */
    `;

var thinkingdataHookReduxMiddleCode = `
  if(oldState !== newState){
    var type = action.type;
    if(type === 'Navigation/BACK' ||
        type === 'Navigation/NAVIGATE' ||
          type === 'Navigation/POP' ||
          type === 'Navigation/POP_TO_TOP' ||
          type === 'Navigation/PUSH' ||
          type === 'Navigation/RESET' ||
          type === 'Navigation/REPLACE' ||
          type === 'Navigation/GO_BACK' ||
          type === 'Navigation/JUMP_TO' ||
          type === 'Navigation/OPEN_DRAWER' ||
          type === 'Navigation/CLOSE_DRAWER'){
      function getParams(route){
        if(!route){
          return null;
        }
        var childRoute = route.routes[route.index];
        var params = childRoute.params;
        if(childRoute.routes){
          var p = getParams(childRoute);
          if(p){
            params = p;
          }
        }
        return params;
      }
      function getScreenName(route){
        if(!route){
          return null;
        }
        var childRoute = route.routes[route.index];
        var screenName = childRoute.routeName;
        if(childRoute.routes){
          var name = getScreenName(childRoute);
          if(name){
            screenName = name;
          }
        }
        return screenName;
      }
      function trackViewScreen(route){
        if (!route) {
          return;
        }
        var childRoute = route.routes[route.index];
        if (route.name === 'Root') {
          trackViewScreen(childRoute);
          return;
        }
        var screenName = getScreenName(route);
        var params = getParams(route);
        var tdProperties = {};
        if (params) {
          if (!params.thinkingdataurl) {
            tdProperties.thinkingdataurl = screenName;
          }else{
            tdProperties.thinkingdataurl = params.thinkingdataurl;
          }
          if(params.thinkingdataparams){
            tdProperties.thinkingdataparams = JSON.parse(JSON.stringify(params.thinkingdataparams));
          }
        } else {
          tdProperties.thinkingdataurl = screenName;
        }
        if(${ignoreScreen}){
          if(tdProperties.thinkingdataparams){
            tdProperties.thinkingdataparams.TDIgnoreViewScreen = true;
          }else{
            tdProperties.thinkingdataparams = {TDIgnoreViewScreen : true};
          }
        }
        var dataModule = ReactNative?.NativeModules?.RNThinkingAnalyticsModule;
        dataModule?.trackViewScreen && dataModule.trackViewScreen(tdProperties);
      }
      trackViewScreen(navStateSelector(newState));
      /* THINKINGDATA HOOK */
    }
  }
`;
injectReactNavigation = function (dirPath, type, reset = false) {
  if (!dirPath.endsWith('/')) {
    dirPath += '/';
  }
  if (type == 1) {
    var createNavigationContainerJsFilePath = `${dirPath}src/createNavigationContainer.js`;
    var getChildEventSubscriberJsFilePath = `${dirPath}src/getChildEventSubscriber.js`;
    if (!fs.existsSync(createNavigationContainerJsFilePath)) {
      return;
    }
    if (!fs.existsSync(getChildEventSubscriberJsFilePath)) {
      return;
    }
    if (reset) {
      thinkingdataResetRN(createNavigationContainerJsFilePath);
      thinkingdataResetRN(getChildEventSubscriberJsFilePath);
    } else {
      // 读取文件内容
      var content = fs.readFileSync(
        createNavigationContainerJsFilePath,
        'utf8'
      );
      // 已经 hook 过了，不需要再次 hook
      if (content.indexOf('THINKINGDATA HOOK') > -1) {
        return;
      }
      console.log(`navigation.js path: ${getChildEventSubscriberJsFilePath}`);
      // 获取 hook 的代码插入的位置
      var index = content.indexOf(
        "if (typeof this.props.onNavigationStateChange === 'function') {"
      );
      if (index == -1) throw 'index is -1';
      content =
        content.substring(0, index) +
        addTryCatch(navigationString('nav', 'action')) +
        '\n' +
        content.substring(index);
      var didMountIndex = content.indexOf('componentDidMount() {');
      if (didMountIndex == -1) throw 'didMountIndex is -1';
      var forEachIndex = content.indexOf(
        'this._actionEventSubscribers.forEach(subscriber =>',
        didMountIndex
      );
      var clojureEnd = content.indexOf(';', forEachIndex);
      // 插入 hook 代码
      content =
        content.substring(0, forEachIndex) +
        '{' +
        addTryCatch(navigationString('this.state.nav', null)) +
        '\n' +
        content.substring(forEachIndex, clojureEnd + 1) +
        '}' +
        content.substring(clojureEnd + 1);
      // 备份 navigation 源文件
      fs.renameSync(
        createNavigationContainerJsFilePath,
        `${createNavigationContainerJsFilePath}_thinkingdata_backup`
      );
      // 重写文件
      fs.writeFileSync(createNavigationContainerJsFilePath, content, 'utf8');
      var content = fs.readFileSync(getChildEventSubscriberJsFilePath, 'utf8');
      // 已经 hook 过了，不需要再次 hook
      if (content.indexOf('THINKINGDATA HOOK') > -1) {
        return;
      }
      // 获取 hook 的代码插入的位置
      var script = 'const emit = (type, payload) => {';
      var index = content.indexOf(script);
      if (index == -1) throw 'index is -1';
      content =
        content.substring(0, index + script.length) +
        addTryCatch(navigationString('this.state.nav', null)) +
        '\n' +
        content.substring(index + script.length);
      // 备份 navigation 源文件
      fs.renameSync(
        getChildEventSubscriberJsFilePath,
        `${getChildEventSubscriberJsFilePath}_thinkingdata_backup`
      );
      // 重写文件
      fs.writeFileSync(getChildEventSubscriberJsFilePath, content, 'utf8');
      console.log(`modify navigation.js succeed`);
    }
  } else if (type == 2) {
    const createAppContainerJsFilePath = `${dirPath}/createAppContainer.js`;
    if (!fs.existsSync(createAppContainerJsFilePath)) {
      return;
    }
    if (reset) {
      thinkingdataResetRN(createAppContainerJsFilePath);
    } else {
      var content = fs.readFileSync(createAppContainerJsFilePath, 'utf8');
      // 已经 hook 过了，不需要再次 hook
      if (content.indexOf('THINKINGDATA HOOK') > -1) {
        return;
      }
      console.log(`found navigation.js: ${createAppContainerJsFilePath}`);
      var index = content.indexOf(
        "if (typeof this.props.onNavigationStateChange === 'function') {"
      );
      if (index == -1) throw 'index is -1';
      content = content.substring(0, index) + addTryCatch(navigationString3('prevNav', 'nav', 'action')) + '\n' +content.substring(index);
      var didMountIndex = content.indexOf('componentDidMount() {');
      if (didMountIndex == -1) throw 'didMountIndex is -1';
      var forEachIndex = content.indexOf(
        'this._actionEventSubscribers.forEach(subscriber =>',
        didMountIndex
      );
      if (forEachIndex == -1) {
        forEachIndex = content.indexOf(
          'this._actionEventSubscribers.forEach((subscriber) =>',
          didMountIndex
        );
      }
      var clojureEnd = content.indexOf(';', forEachIndex);
      content =
      content.substring(0, forEachIndex) +
      '{' +
      addTryCatch(navigationString3(null, 'this.state.nav', null)) +
      '\n' +
      content.substring(forEachIndex, clojureEnd + 1) +
      '}' +
      content.substring(clojureEnd + 1);
      // 备份 navigation 源文件
      fs.renameSync(
        createAppContainerJsFilePath,
        `${createAppContainerJsFilePath}_thinkingdata_backup`
      );
      // 重写文件
      fs.writeFileSync(createAppContainerJsFilePath, content, 'utf8');
      console.log(`modify navigation.js succeed`);
    }
  }

}


thinkingdataHookNavigation5 = function (arg) {
  var reactNavigationPath5X;
  var hookCode;
  if (arg === 'src') {
    reactNavigationPath5X = reactNavigationPath7XSrc;
    hookCode = thinkingdataNavigation5HookCode;
  } else if (arg === 'commonjs') {
    reactNavigationPath5X = reactNavigationPath7XCommon;
    hookCode = thinkingdataNavigation5JSHookCode;
  } else if(arg === 'module'){
    reactNavigationPath5X = reactNavigationPath7XModule;
    hookCode = thinkingdataNavigation5JSHookCode;
  }
  if (fs.existsSync(reactNavigationPath5X)) {
    // 读取文件内容
    var fileContent = fs.readFileSync(reactNavigationPath5X, 'utf8');
    // 已经 hook 过了，不需要再次 hook
    if (fileContent.indexOf('THINKINGDATA HOOK') > -1) {
      return;
    }
    console.log(`found BaseNavigationContainer.tsx: ${reactNavigationPath5X}`);
    // 获取 hook 的代码插入的位置
    var scriptStr = 'isFirstMountRef.current = false;';
    var hookIndex = fileContent.lastIndexOf(scriptStr);
    // 判断文件是否异常，不存在代码，导致无法 hook 点击事件
    if (hookIndex == -1) {
      throw "navigation Can't not find `isFirstMountRef.current = false;` code";
    }
    // 插入 hook 代码
    var hookedContent = `${fileContent.substring(0, hookIndex
    )}\n${hookCode}\n${fileContent.substring(hookIndex)}`;
    // BaseNavigationContainer.tsx
    fs.renameSync(
      reactNavigationPath5X,
      `${reactNavigationPath5X}_thinkingdata_backup`
    );
    hookedContent = thinkingdataImportReactNativeHookCode + hookedContent;
    fs.writeFileSync(reactNavigationPath5X, hookedContent, 'utf8');
    console.log(`modify BaseNavigationContainer.tsx succeed`);
  }
}

thinkingdataHookNavigationReduxCreate = function (reset = false) {
  reactNavigationReduxCreatePath.forEach(function (onefile) {
    if (fs.existsSync(onefile)) {
      var fileContent = fs.readFileSync(onefile, 'utf8');
      if (reset) {
        // 未被 hook 过代码，不需要处理
        if (fileContent.indexOf('THINKINGDATA HOOK') == -1) {
          return;
        }
        // 检查备份文件是否存在
        var backFilePath = `${onefile}_thinkingdata_backup`;
        if (!fs.existsSync(backFilePath)) {
          throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
        }
        // 将备份文件重命名恢复 + 自动覆盖被 hook 过的同名文件
        fs.renameSync(backFilePath, onefile);
        console.log(`found and reset js: ${onefile}`);
      }else{
        // 已经 hook 过了，不需要再次 hook
        if (fileContent.indexOf('THINKINGDATA HOOK') > -1) {
          return;
        }
        console.log(`found redux : ${onefile}`);
        // 获取 hook 的代码插入的位置
        var scriptStr = 'initializeListeners(key, this.props.state);';
        var hookIndex = fileContent.indexOf(scriptStr);
        // 判断文件是否异常，不存在 touchableHandlePress 方法，导致无法 hook 点击事件
        if (hookIndex == -1) {
          throw "Can't not find code \"initializeListeners(key, this.props.state);\"";
        }
        var hookedContent = thinkingdataImportReactNativeHookCode + `${fileContent.substring(
          0,
          hookIndex + scriptStr.length
        )}\n${thinkingdataHookReduxCreateCode}\n${fileContent.substring(
          hookIndex + scriptStr.length
        )}`;
        // 备份源文件
        fs.renameSync(onefile, `${onefile}_thinkingdata_backup`);
        // 重写文件
        fs.writeFileSync(onefile, hookedContent, 'utf8');
        console.log(`modify redux succeed`);
      }
    }
  });
}

thinkingdataHookNavigationReduxMiddle = function () {
  if (fs.existsSync(reactNavigationReduxMiddlePath)) {
    // 读取文件内容
    var fileContent = fs.readFileSync(reactNavigationReduxMiddlePath, 'utf8');
    // 已经 hook 过了，不需要再次 hook
    if (fileContent.indexOf('THINKINGDATA HOOK') > -1) {
      return;
    }
    console.log(`found middleware.js: ${reactNavigationReduxMiddlePath}`);
    // 获取 hook 的代码插入的位置
    var scriptStr = 'const newState = store.getState();';
    var hookIndex = fileContent.indexOf(scriptStr);
    // 判断文件是否异常，不存在该代码，导致无法 hook 点击事件
    if (hookIndex == -1) {
      throw "Can't not find code \"const newState = store.getState();\n";
    }
    // 插入 hook 代码
    var hookedContent = thinkingdataImportReactNativeHookCode + `${fileContent.substring(
      0,
      hookIndex + scriptStr.length
    )}\n${thinkingdataHookReduxMiddleCode}\n${fileContent.substring(
      hookIndex + scriptStr.length
    )}`;
    // 备份 middleware.js 源文件
    fs.renameSync(
      reactNavigationReduxMiddlePath,
      `${reactNavigationReduxMiddlePath}_thinkingdata_backup`
    );
    // 重写 middleware.js 文件
    fs.writeFileSync(reactNavigationReduxMiddlePath, hookedContent, 'utf8');
    console.log(`modify middleware.js succeed`);
  }
}

thinkingdataHookClickRN = function(){
  if (fs.existsSync(RNClickFilePath)) {
    // 读取文件内容
    var fileContent = fs.readFileSync(RNClickFilePath, 'utf8');
    // 已经 hook 过了，不需要再次 hook
    if (fileContent.indexOf('THINKINGDATA HOOK') > -1) {
      return;
    }
    console.log(`found Touchable.js: ${RNClickFilePath}`);
    // 获取 hook 的代码插入的位置
    var hookIndex = fileContent.indexOf("this.touchableHandlePress(");
    // 判断文件是否异常，不存在 touchableHandlePress 方法，导致无法 hook 点击事件
    if (hookIndex == -1) {
      throw "Can't not find touchableHandlePress function";
    };
    // 插入 hook 代码
    var hookedContent = `${fileContent.substring(0, hookIndex)}\n${thinkingdataClickHookCode}\n${fileContent.substring(hookIndex)}`;
    // 备份 Touchable.js 源文件
    fs.renameSync(RNClickFilePath, `${RNClickFilePath}_thinkingdata_backup`);
    // 重写 Touchable.js 文件
    fs.writeFileSync(RNClickFilePath, hookedContent, 'utf8');
    console.log(`modify Touchable.js succeed`);
  }
}

function lastArgumentName(content, index) {
  --index;
  var lastComma = content.lastIndexOf(',', index);
  var lastParentheses = content.lastIndexOf('(', index);
  var start = Math.max(lastComma, lastParentheses);
  return content.substring(start + 1, index + 1);
}

thinkingdataHookClickableRN = function (reset = false) {
  RNClickableFiles.forEach(function (onefile) {
    if (fs.existsSync(onefile)) {
      if (reset) {
        // 读取文件内容
        var fileContent = fs.readFileSync(onefile, 'utf8');
        // 未被 hook 过代码，不需要处理
        if (fileContent.indexOf('THINKINGDATA HOOK') == -1) {
          return;
        }
        // 检查备份文件是否存在
        var backFilePath = `${onefile}_thinkingdata_backup`;
        if (!fs.existsSync(backFilePath)) {
          throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
        }
        // 将备份文件重命名恢复 + 自动覆盖被 hook 过的同名文件
        fs.renameSync(backFilePath, onefile);
        console.log(`found and reset clickable: ${onefile}`);
      } else {
        // 读取文件内容
        var content = fs.readFileSync(onefile, 'utf8');
        // 已经 hook 过了，不需要再次 hook
        if (content.indexOf('THINKINGDATA HOOK') > -1) {
          return;
        }
        console.log(`found clickable.js: ${onefile}`);
        // 获取 hook 的代码插入的位置
        var objRe = /ReactNativePrivateInterface\.UIManager\.createView\([\s\S]{1,60}\.uiViewClassName,[\s\S]*?\)[,;]/;
        var match = objRe.exec(content);
        if (!match) {
          objRe = /UIManager\.createView\([\s\S]{1,60}\.uiViewClassName,[\s\S]*?\)[,;]/;
          match = objRe.exec(content);
        }
        if (!match) {
          throw "can't inject clickable js";
        }
        var lastParentheses = content.lastIndexOf(')', match.index);
        var nextCommaIndex = content.indexOf(',', match.index);
        if (nextCommaIndex == -1)
          throw "can't inject clickable js, and nextCommaIndex is -1";
        var tagName = lastArgumentName(content, nextCommaIndex).trim();
        var functionBody = `
          var taElement;
          if(typeof internalInstanceHandle !== 'undefined'){
            taElement = internalInstanceHandle;
          }else if(typeof workInProgress !== 'undefined'){
            taElement = workInProgress;
          }else if(typeof thatThis._currentElement !== 'undefined'){
            taElement = thatThis._currentElement;
          }
          var title;
          var eachProgress = function (workInProgress){
            if(workInProgress == null){
              return;
            }
            var props;
            if(workInProgress.memoizedProps){
              props = workInProgress.memoizedProps;
            }else if(workInProgress.props){
              props = workInProgress.props;
            }
            if(props && props.title){
              title = props.title;
            }
            if(props && props.thinkingdataparams){
              return props.thinkingdataparams;
            }else{
              if(!props ||
                !workInProgress.type ||
                workInProgress.type.displayName === 'TouchableOpacity' ||
                workInProgress.type.displayName === 'TouchableHighlight' ||
                workInProgress.type.displayName === 'TouchableWithoutFeedback'||
                workInProgress.type.displayName === 'TouchableNativeFeedback'||
                workInProgress.type.displayName === 'Pressable'||
                workInProgress.type.name === 'TouchableOpacity' ||
                workInProgress.type.name === 'TouchableHighlight' ||
                workInProgress.type.name === 'TouchableNativeFeedback'||
                workInProgress.type.name === 'TouchableWithoutFeedback'||
                workInProgress.type.displayName === undefined||
                workInProgress.type.name === undefined ||
                !props.onPress){
	                 if(workInProgress.return){
	                   return eachProgress(workInProgress.return);
	                 }else{
	                   if(workInProgress._owner && workInProgress._owner._currentElement){
	                     return eachProgress(workInProgress._owner._currentElement);
	                   }else{
	                     return eachProgress(workInProgress._owner);
	                   }
	                 }
	              }
              }
            };
            var elementProps;
            if(taElement && taElement.memoizedProps){
	            elementProps = taElement.memoizedProps;
	          }else if(taElement && taElement.props){
	            elementProps = taElement.props;
	          }
	          if (elementProps) {
                var taProps = eachProgress(taElement);
                var ReactNative = require('react-native');
                var dataModule = ReactNative.NativeModules.RNThinkingAnalyticsModule;
                if (dataModule && dataModule.saveRootViewProperties) {
                  var taRootTag;
                  if (typeof nativeTopRootTag !== 'undefined') {
                    taRootTag = nativeTopRootTag;
                  } else if (typeof rootContainerInstance !== 'undefined') {
                    taRootTag = rootContainerInstance;
                  } else if (typeof renderExpirationTime !== 'undefined') {
                    taRootTag = renderExpirationTime;
                  } else if (typeof renderLanes !== 'undefined') {
                    taRootTag = renderLanes;
                  }
                  if (taRootTag && (typeof taRootTag === 'number')) {
                    dataModule.saveRootViewProperties(current, title, taProps, taRootTag);
                    return;
                  }
                }
                dataModule && dataModule.saveViewProperties && dataModule.saveViewProperties(current, title, taProps);
          }`;
        var call = addTryCatch(functionBody);
        var lastReturn = content.lastIndexOf('return', match.index);
        var splitIndex = match.index;
        if (lastReturn > lastParentheses) {
          splitIndex = lastReturn;
        }
        var hookedContent = `${content.substring(
          0,
          splitIndex
        )}\n${call}\n${content.substring(splitIndex)}`;
        // 备份源文件
        fs.renameSync(onefile, `${onefile}_thinkingdata_backup`);
        // 重写文件
        fs.writeFileSync(onefile, hookedContent, 'utf8');
        console.log(`modify clickable.js succeed`);
      }
    }
  })
}

thinkingdataHookSliderRN = function (reset = false) {
  RNSliderFiles.forEach(function (onefile) {
    if (fs.existsSync(onefile)) {
      // 读取文件内容
      var fileContent = fs.readFileSync(onefile, 'utf8');
      if (reset) {
        // 未被 hook 过代码，不需要处理
        if (fileContent.indexOf('THINKINGDATA HOOK') == -1) {
          return;
        }
        // 检查备份文件是否存在
        var backFilePath = `${onefile}_thinkingdata_backup`;
        if (!fs.existsSync(backFilePath)) {
          throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
        }
        // 将备份文件重命名恢复 + 自动覆盖被 hook 过的同名文件
        fs.renameSync(backFilePath, onefile);
        console.log(`found and reset Slider.js: ${onefile}`);
      } else {
        // 已经 hook 过了，不需要再次 hook
        if (fileContent.indexOf('THINKINGDATA HOOK') > -1) {
          return;
        }
        console.log(`found Slider.js: ${onefile}`);
        // 获取 hook 的代码插入的位置
        var scriptStr = 'onSlidingComplete(event.nativeEvent.value);';
        var hookIndex = fileContent.indexOf(scriptStr);
        if (hookIndex == -1) {
          throw "Can't not find onSlidingComplete function";
        }
        // 插入 hook 代码
        var hookedContent = `${fileContent.substring(
          0,
          hookIndex + scriptStr.length
        )}\n${thinkingdataSliderHookCode}\n${fileContent.substring(
          hookIndex + scriptStr.length
        )}`;
        // 备份源文件
        fs.renameSync(onefile, `${onefile}_thinkingdata_backup`);
        // 重写文件
        fs.writeFileSync(onefile, hookedContent, 'utf8');
        console.log(`modify Slider.js succeed`);
      }
    }
  });
}

thinkingdataHookSwitchRN = function (reset = false) {
  RNSwitchFiles.forEach(function (onefile) {
    if (fs.existsSync(onefile)) {
      var fileContent = fs.readFileSync(onefile, 'utf8');
      if (reset) {
        if (fileContent.indexOf('THINKINGDATA HOOK') == -1) {
          return;
        }
        var backFilePath = `${onefile}_thinkingdata_backup`;
        if (!fs.existsSync(backFilePath)) {
          throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
        }
        fs.renameSync(backFilePath, onefile);
        console.log(`found and reset Switch.js: ${onefile}`);
      }else{
        if (fileContent.indexOf('THINKINGDATA HOOK') > -1) {
          return;
        }
        console.log(`found Switch.js: ${onefile}`);
        var scriptStr = 'if (this.props.onValueChange != null) {';
        var hookIndex = fileContent.indexOf(scriptStr);
        if (hookIndex > -1) {
          // 插入 hook 代码
          var hookedContent = `${fileContent.substring(
            0,
            hookIndex
          )}\n${thinkingdataSwitchHookCode}\n${fileContent.substring(
            hookIndex
          )}`;
          // 备份源文件
          fs.renameSync(onefile, `${onefile}_thinkingdata_backup`);
          // 重写文件
          fs.writeFileSync(onefile, hookedContent, 'utf8');
          console.log(`modify Switch.js: ${onefile}`);
        } else {
          // 获取 hook 的代码插入的位置
          scriptStr = 'this.props.onValueChange(event.nativeEvent.value);';
          hookIndex = fileContent.indexOf(scriptStr);
          var hookcontent;
          if (hookIndex == -1) {
            scriptStr = 'onValueChange?.(event.nativeEvent.value);';
            hookIndex = fileContent.indexOf(scriptStr);
            hookcontent = thinkingdataSwitchHookCode2;
          } else {
            hookcontent = thinkingdataSwitchHookCode;
          }
          if (hookIndex == -1) {
            throw "Can't not find onValueChange function";
          }
          // 插入 hook 代码
          var hookedContent = `${fileContent.substring(
            0,
            hookIndex + scriptStr.length
          )}\n${hookcontent}\n${fileContent.substring(
            hookIndex + scriptStr.length
          )}`;
          // 备份源文件
          fs.renameSync(onefile, `${onefile}_thinkingdata_backup`);
          // 重写文件
          fs.writeFileSync(onefile, hookedContent, 'utf8');
          console.log(`modify Switch.js succeed`);
        }
      }
    }
  });
}

thinkingdataHookSegmentedControlRN = function (reset = false) {
  RNSegmentedControlFilePath.forEach(function (onefile) {
    if (fs.existsSync(onefile)) {
      var fileContent = fs.readFileSync(onefile, 'utf8');
      if (reset) {
        if (fileContent.indexOf('THINKINGDATA HOOK') == -1) {
          return;
        }
        var backFilePath = `${onefile}_thinkingdata_backup`;
        if (!fs.existsSync(backFilePath)) {
          throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
        }
        fs.renameSync(backFilePath, onefile);
        console.log(`found and reset SegmentedControl.js: ${onefile}`);
      }else{
        if (fileContent.indexOf('THINKINGDATA HOOK') > -1) {
          return;
        }
        console.log(`found SegmentedControl.js: ${onefile}`);
        var scriptStr = 'this.props.onValueChange(event.nativeEvent.value);';
        var hookIndex = fileContent.indexOf(scriptStr);
        // 判断文件是否异常，不存在 touchableHandlePress 方法，导致无法 hook 点击事件
        if (hookIndex == -1) {
          throw "Can't not find onValueChange function";
        }
        var hookedContent = `${fileContent.substring(
          0,
          hookIndex + scriptStr.length
        )}\n${thinkingdataSegmentedControlHookCode}\n${fileContent.substring(
          hookIndex + scriptStr.length
        )}`;
        // 备份 Touchable.js 源文件
        fs.renameSync(onefile, `${onefile}_thinkingdata_backup`);
        // 重写 Touchable.js 文件
        fs.writeFileSync(onefile, hookedContent, 'utf8');
        console.log(`modify SegmentedControl.js succeed`);
      }
    }
  })
}

thinkingdataHookGestureButtonsRN = function (reset = false) {
  RNGestureButtonsFilePaths.forEach(function (onefile) {
    if (fs.existsSync(onefile)) {
      var fileContent = fs.readFileSync(onefile, 'utf8');
      if (reset) {
        if (fileContent.indexOf('THINKINGDATA HOOK') == -1) {
          return;
        }
        var backFilePath = `${onefile}_thinkingdata_backup`;
        if (!fs.existsSync(backFilePath)) {
          throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
        }
        fs.renameSync(backFilePath, onefile);
        console.log(`found and reset GestureButtons: ${onefile}`);
      }else{
        if (fileContent.indexOf('THINKINGDATA HOOK') > -1) {
          return;
        }
        console.log(`found GestureButtons: ${onefile}`);
        var scriptStr = 'this.props.onPress(active);';
        var hookIndex = fileContent.indexOf(scriptStr);
        if (hookIndex == -1) {
          console.log("Can't not find this.props.onPress(active); ");
          return false;
        }
        var hookedContent = `${fileContent.substring(
          0,
          hookIndex + scriptStr.length,
        )}\n${thinkingdataClickHookCode}\n${fileContent.substring(
          hookIndex + scriptStr.length,
        )}`;
        fs.renameSync(
          onefile,
          `${onefile}_thinkingdata_backup`,
        );
        fs.writeFileSync(onefile, hookedContent, 'utf8');
        console.log(`modify GestureButtons succeed`);
      }
    }
  });
}

thinkingdataHookPressabilityClickRN = function(){
  if (fs.existsSync(RNClickPressabilityFilePath)) {
    var fileContent = fs.readFileSync(RNClickPressabilityFilePath, 'utf8');
    if (fileContent.indexOf('THINKINGDATA HOOK') > -1) {
      return;
    }
    console.log(`found Pressability.js: ${RNClickPressabilityFilePath}`);
    var scriptStr = 'onPress(event);';
    var hookIndex = fileContent.lastIndexOf(scriptStr);
    if (hookIndex == -1) {
      throw "Can't not find onPress(event); code";
    };
    var hookedContent = `${fileContent.substring(
      0,
      hookIndex
    )}\n${thinkingdataClickHookPressabilityCode}\n${fileContent.substring(
      hookIndex
    )}`;
    fs.renameSync(RNClickPressabilityFilePath, `${RNClickPressabilityFilePath}_thinkingdata_backup`);
    fs.writeFileSync(RNClickPressabilityFilePath, hookedContent, 'utf8');
    console.log(`modify Pressability.js succeed`);
  }
}

thinkingdataResetRN = function (resetFilePath) {
  // 判断需要被恢复的文件是否存在
  if (!fs.existsSync(resetFilePath)) {
    return;
  }
  var fileContent = fs.readFileSync(resetFilePath, 'utf8');
  // 未被 hook 过代码，不需要处理
  if (fileContent.indexOf('THINKINGDATA HOOK') == -1) {
    return;
  }
  // 检查备份文件是否存在
  var backFilePath = `${resetFilePath}_thinkingdata_backup`;
  if (!fs.existsSync(backFilePath)) {
    throw `File: ${backFilePath} not found, Please rm -rf node_modules and npm install again`;
  }
  // 将备份文件重命名恢复 + 自动覆盖被 hook 过的同名 Touchable.js 文件
  fs.renameSync(backFilePath, resetFilePath);
  console.log(`found and reset file: ${resetFilePath}`);
};

allThinkingDataHookRN = function () {

  if(!ignoreClick){
    thinkingdataHookClickRN();
    thinkingdataHookClickableRN();
    thinkingdataHookSliderRN();
    thinkingdataHookSwitchRN();
    thinkingdataHookSegmentedControlRN();
    thinkingdataHookGestureButtonsRN();
    thinkingdataHookPressabilityClickRN();
  }

  if(!ignoreScreen){
    injectReactNavigation(reactNavigationPath, 1);
    injectReactNavigation(reactNavigationPath3X, 2);
    injectReactNavigation(reactNavigationPath4X, 2);
    thinkingdataHookNavigation5('src');
    thinkingdataHookNavigation5('commonjs');
    thinkingdataHookNavigation5('module');
    thinkingdataHookNavigationReduxCreate();
    thinkingdataHookNavigationReduxMiddle();
  }
}

resetAllSensorsdataHookRN = function(){
  thinkingdataResetRN(RNClickFilePath);
  thinkingdataHookClickableRN(true);
  thinkingdataHookSliderRN(true);
  thinkingdataHookSwitchRN(true);
  thinkingdataHookSegmentedControlRN(true);
  thinkingdataHookGestureButtonsRN(true);
  thinkingdataResetRN(RNClickPressabilityFilePath);

  //reset hook page view
  injectReactNavigation(reactNavigationPath, 1, true);
  injectReactNavigation(reactNavigationPath3X, 2, true);
  injectReactNavigation(reactNavigationPath4X, 2, true);
  thinkingdataResetRN(reactNavigationPath7XSrc);
  thinkingdataResetRN(reactNavigationPath7XCommon);
  thinkingdataResetRN(reactNavigationPath7XModule);
  thinkingdataHookNavigationReduxCreate(false);
  thinkingdataResetRN(reactNavigationReduxMiddlePath);
}

switch (process.argv[2]) {
  case '-run':
    resetAllSensorsdataHookRN();
    allThinkingDataHookRN();
    break;
  case '-reset':
    resetAllSensorsdataHookRN();
    break;
  default:
    console.log('can not find this options: ' + process.argv[2]);
}