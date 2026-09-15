import {
  RNPackage,
  UITurboModule,
  UITurboModuleContext
} from '@rnoh/react-native-openharmony/ts';
import { RNThinkingAnalyticsModule } from './RNThinkingAnalyticsModule';

export class RNThinkingDataPackage extends RNPackage {
  override getUITurboModuleFactoryByNameMap(): Map<string, (ctx: UITurboModuleContext) => UITurboModule | null> {
    const factoryMap: Map<string, (ctx: UITurboModuleContext) => UITurboModule | null> = new Map();
    factoryMap.set('RNThinkingAnalyticsModule', (ctx: UITurboModuleContext): UITurboModule | null => {
      return new RNThinkingAnalyticsModule(ctx);
    });
    return factoryMap;
  }

  override getDebugName(): string | undefined {
    return 'RNThinkingDataPackage';
  }
}
