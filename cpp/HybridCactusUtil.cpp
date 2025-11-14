#include "HybridCactusUtil.hpp"

namespace margelo::nitro::cactus
{

HybridCactusUtil::HybridCactusUtil() : HybridObject(TAG) {}

std::shared_ptr<Promise<std::string>> HybridCactusUtil::registerApp(const std::string &encryptedData)
{
  return Promise<std::string>::async([encryptedData]() -> std::string {
    const char *raw = register_app(encryptedData.c_str());

    if (raw == nullptr) {
      throw std::runtime_error("Failed to register app");
    }

    std::string registerAppStr(raw);
    free_string(raw);

    return registerAppStr;
  });
}

std::shared_ptr<Promise<std::optional<std::string>>> HybridCactusUtil::getDeviceId() {
  return Promise<std::optional<std::string>>::async([]() -> std::optional<std::string> {
    const char* deviceId = get_device_id();
    return deviceId ? std::optional<std::string>(deviceId) : std::nullopt;
  });
}

std::shared_ptr<Promise<void>> HybridCactusUtil::setAndroidDataDirectory(const std::string &dataDir) {
  return Promise<void>::async([dataDir]() -> void {
#ifdef __ANDROID__
    set_android_data_directory(dataDir.c_str());
#endif
  });
}

} // namespace margelo::nitro::cactus
