// Copyright (c) 2025 Huawei Device Co., Ltd. All rights reserved
// Use of this source code is governed by a MIT license that can be
// found in the LICENSE file.

#include "RNOH/PackageProvider.h"
#include "RNThinkingDataPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx)
{
    return {
        std::make_shared<RNThinkingDataPackage>(ctx)
    };
}
