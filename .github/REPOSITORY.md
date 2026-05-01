# OpenKoma Repository Documentation

Welcome to the OpenKoma repository! Below you will find shortcuts to all important guides and documentation.

## 📌 Quick Links

| Document | Description |
|----------|-------------|
| [📖 README](../README.md) | Project overview, features, and quick-start instructions |
| [🤖 Android Build Guide](../HOW-TO-BUILD-ANDROID.md) | How to compile OpenKoma into a native Android APK |
| [🤝 Contributing Guidelines](../CONTRIBUTING.md) | How to contribute to the project |
| [📜 Code of Conduct](../CODE_OF_CONDUCT.md) | Community standards and expectations |
| [🔒 Security Policy](../SECURITY.md) | How to report security vulnerabilities |
| [⚖️ License](../LICENSE) | Apache 2.0 License |

## 🗂️ Repository Structure

```
OpenKoma/
├── src/                    # Application source code
├── android/                # Native Android project (Capacitor)
├── public/                 # Static assets
├── README.md               # Project overview
├── HOW-TO-BUILD-ANDROID.md # Android APK build guide
├── CONTRIBUTING.md         # Contributing guidelines
├── CODE_OF_CONDUCT.md      # Code of conduct
├── SECURITY.md             # Security policy
└── LICENSE                 # Apache 2.0 License
```

## 📱 Android Build

The fastest path to building the Android APK:

```bash
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

See the full [**Android Build Guide**](../HOW-TO-BUILD-ANDROID.md) for detailed instructions, troubleshooting tips, and how to build a signed release APK.
