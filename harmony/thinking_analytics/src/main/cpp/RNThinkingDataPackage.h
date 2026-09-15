#pragma once

#include "RNOH/Package.h"
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class JSI_EXPORT RNThinkingAnalyticsModule : public ArkTSTurboModule {
  public:
    RNThinkingAnalyticsModule(const ArkTSTurboModule::Context ctx, const std::string name);
};

class RNThinkingAnalyticsModuleTurboModuleFactoryDelegate : public TurboModuleFactoryDelegate {
  public:
    SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
        if (name == "RNThinkingAnalyticsModule") {
            return std::make_shared<RNThinkingAnalyticsModule>(ctx, name);
        }
        return nullptr;
    };
};

class RNThinkingDataPackage : public Package {
  public:
    RNThinkingDataPackage(Package::Context ctx) : Package(ctx){};

    std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate() override {
        return std::make_unique<RNThinkingAnalyticsModuleTurboModuleFactoryDelegate>();
    }

    std::vector<facebook::react::ComponentDescriptorProvider> createComponentDescriptorProviders() override {
        return {
        };
    }

    ComponentJSIBinderByString createComponentJSIBinderByName() override {
        return {
        };
    }
};

} // namespace rnoh
