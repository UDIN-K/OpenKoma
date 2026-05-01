import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.openkoma',
  appName: 'OpenKoma',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#070B14",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#22D3EE"
    },
    StatusBar: {
      style: "DARK",
      overlaysWebView: true,
      backgroundColor: "#00000000"
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"]
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
