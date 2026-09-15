
import { NativeModules, Platform } from 'react-native';

function isHarmonyOS() {
    return Platform.OS === 'harmony' || Platform.OS === 'openharmony' || Platform.OS === 'ohos';
}

const { RNThinkingAnalyticsModule } = NativeModules;

export default RNThinkingAnalyticsModule;
