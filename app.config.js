const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.pradipram.MyAllowance.dev";
  }

  if (IS_PREVIEW) {
    return "com.pradipram.MyAllowance.preview";
  }

  return "com.pradipram.MyAllowance";
};

const getAppName = () => {
  if (IS_DEV) {
    return "MyAllowance (Dev)";
  }

  if (IS_PREVIEW) {
    return "MyAllowance (Preview)";
  }

  return "MyAllowance";
};

export default {
  expo: {
    name: getAppName(),
    slug: "MyAllowance",
    version: "2.2.0",
    orientation: "portrait",
    icon: "./assets/images/myallowanceicon.png",
    scheme: "myallowance",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: getUniqueIdentifier(),
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/myAllowanceForeground.png",
        backgroundImage: "./assets/images/myAllowanceBackground.png",
        monochromeImage: "./assets/images/myAllowanceMonochromic.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: getUniqueIdentifier(),
    },
    web: {
      output: "static",
      favicon: "./assets/images/myallowanceicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/myallowanceicon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "d186b512-a9b9-4bc6-98d0-d4ce25519e52",
      },
    },
  },
};
