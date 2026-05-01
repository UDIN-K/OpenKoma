# How to Export/Convert OpenKoma to Android APK

OpenKoma uses **Capacitor** to convert the React/Vite web application into a native Android application. Follow these steps to build your own `.apk`.

## Prerequisites

Before building the Android app, ensure you have the following installed on your system:
1. **Node.js & npm**
2. **Java Development Kit (JDK 17+)**
3. **Android SDK & Tools** (Usually comes with Android Studio)

Ensure your `JAVA_HOME` environment variable is set correctly. For example:
```bash
export JAVA_HOME=/opt/android-studio/jbr
```

---

## Step 1: Install Dependencies
If you haven't already, install all Node dependencies for the web project.
```bash
npm install
```

## Step 2: Build the Web App
Compile the React code into static files (HTML, CSS, JS) that can be embedded into the Android WebView.
```bash
npm run build
```

## Step 3: Synchronize with Capacitor
Sync your freshly built web assets to the native Android project folder. This copies everything from the `dist/` folder into the `android/` project.
```bash
npx cap sync android
```

*(Optional) Regenerate App Icons:*
If you replaced `icon.png` in the project root and want to update the Android Launcher Icons and Splash Screen, run:
```bash
npx @capacitor/assets generate --android
```

---

## Step 4: Build the APK

Navigate into the Android directory:
```bash
cd android
```

### Option A: Build a Debug APK (For Testing)
Use this if you just want to test the app on your phone quickly. It does not require a keystore password.
```bash
./gradlew assembleDebug
```
**Output location:**
`android/app/build/outputs/apk/debug/app-debug.apk`

### Option B: Build a Signed Release APK (For Production)
Use this to build the official signed version of the app that can be installed without "Unsafe App" warnings or uploaded to app stores.

*(Note: OpenKoma's `build.gradle` is already configured to use the local `openkoma.keystore` file).*

```bash
./gradlew assembleRelease
```
**Output location:**
`android/app/build/outputs/apk/release/app-release.apk`

---

## Troubleshooting

1. **Permission Denied for `./gradlew`**
   If you get a permission error on Linux/macOS, run this inside the `android/` folder:
   ```bash
   chmod +x gradlew
   ```
2. **`[error] android platform has not been added yet`**
   Always run `npx cap sync android` from the **root directory** of the project (`OpenKoma/`), not inside the `android/` directory.
3. **Corrupt Gradle Wrapper**
   If Gradle fails to run due to a corrupt wrapper, you can regenerate it or use your system's global gradle:
   ```bash
   gradle wrapper
   ```
