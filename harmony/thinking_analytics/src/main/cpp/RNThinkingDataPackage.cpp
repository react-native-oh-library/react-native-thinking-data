#include "RNThinkingDataPackage.h"

namespace rnoh {
using namespace facebook;

RNThinkingAnalyticsModule::RNThinkingAnalyticsModule(const ArkTSTurboModule::Context ctx, const std::string name)
    : ArkTSTurboModule(ctx, name) {
  methodMap_ = {
      ARK_METHOD_METADATA(init, 2),
      ARK_METHOD_METADATA(track, 1),
      ARK_METHOD_METADATA(trackUpdate, 1),
      ARK_METHOD_METADATA(trackOverwrite, 1),
      ARK_METHOD_METADATA(trackFirstEvent, 1),
      ARK_METHOD_METADATA(timeEvent, 1),
      ARK_METHOD_METADATA(login, 1),
      ARK_METHOD_METADATA(logout, 1),
      ARK_METHOD_METADATA(userSet, 1),
      ARK_METHOD_METADATA(userUnset, 1),
      ARK_METHOD_METADATA(userSetOnce, 1),
      ARK_METHOD_METADATA(userAdd, 1),
      ARK_METHOD_METADATA(userDel, 1),
      ARK_METHOD_METADATA(userAppend, 1),
      ARK_METHOD_METADATA(userUniqAppend, 1),
      ARK_METHOD_METADATA(setSuperProperties, 1),
      ARK_METHOD_METADATA(unsetSuperProperty, 1),
      ARK_METHOD_METADATA(clearSuperProperties, 1),
      ARK_METHOD_METADATA(identify, 1),
      ARK_METHOD_METADATA(flush, 1),
      ARK_METHOD_METADATA(enableAutoTrack, 1),
      ARK_METHOD_METADATA(setAutoTrackProperties, 1),
      ARK_METHOD_METADATA(calibrateTime, 1),
      ARK_METHOD_METADATA(calibrateTimeWithNtp, 1),
      ARK_METHOD_METADATA(enableThirdPartySharing, 1),
      ARK_METHOD_METADATA(setTrackStatus, 1),
      ARK_ASYNC_METHOD_METADATA(getPresetProperties, 1),
      ARK_ASYNC_METHOD_METADATA(getSuperProperties, 1),
      ARK_ASYNC_METHOD_METADATA(getDistinctId, 1),
      ARK_ASYNC_METHOD_METADATA(getAccountId, 1),
      ARK_ASYNC_METHOD_METADATA(getDeviceId, 1),
      ARK_METHOD_METADATA(trackViewScreen, 1),
      ARK_METHOD_METADATA(trackViewClick, 1),
      ARK_METHOD_METADATA(saveViewProperties, 3),
      ARK_METHOD_METADATA(saveRootViewProperties, 4)};
}

} // namespace rnoh
