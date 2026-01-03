import Constants from "expo-constants"; // To get the current app version
import { Alert, Linking } from "react-native";

// 🛠️ CONFIGURATION
const GITHUB_USER = "Pradipram";
const GITHUB_REPO = "MyAllowance";

export const checkForUpdates = async (isManualCheck = false) => {
  try {
    // 1. Fetch latest release info from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch release info");
    }

    const data = await response.json();

    // 2. Extract version and download URL
    const latestVersionTag = data.tag_name; // e.g., "v2.1.0"
    const latestVersion = latestVersionTag.replace("v", ""); // "2.1.0"
    const currentVersion = Constants.expoConfig?.version || "1.0.0";

    // 3. Find the APK download asset
    // Look for a file ending in .apk
    const apkAsset = data.assets.find((asset: any) =>
      asset.name.endsWith(".apk")
    );

    if (!apkAsset) {
      if (isManualCheck)
        Alert.alert("Error", "No APK found in the latest release.");
      return;
    }

    // 4. Compare Versions
    // console.log("Current Version:", currentVersion);
    // console.log("Latest Version:", latestVersion);
    if (isNewerVersion(currentVersion, latestVersion)) {
      Alert.alert(
        "Update Available! 🚀",
        `A new version (${latestVersion}) is available. Your current version is ${currentVersion}.\n\nChanges:\n${data.body}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Download & Install",
            onPress: () => Linking.openURL(apkAsset.browser_download_url),
          },
        ]
      );
    } else {
      if (isManualCheck) {
        Alert.alert("Up to Date", "You are using the latest version.");
      }
    }
  } catch (error) {
    console.error("Update check failed:", error);
    if (isManualCheck) Alert.alert("Error", "Failed to check for updates.");
  }
};

// Helper function to compare semantic versions (e.g., "1.0.0" vs "1.0.1")
const isNewerVersion = (current: string, latest: string) => {
  const currentParts = current.split(".").map(Number);
  const latestParts = latest.split(".").map(Number);

  for (let i = 0; i < latestParts.length; i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false; // Equal
};
