# MagnetMoney — React Native Android App
## Package: com.magnetmoney.app

---

## FILES
| File | Description |
|------|-------------|
| `UserApp.tsx` | User App — Login, Dashboard, Apply Loan, Status, Profile |
| `AdminApp.tsx` | Admin App — Dashboard, Applications, Users, Config |
| `package.json` | Dependencies |

---

## STEP 1 — Prerequisites (apne PC pe install karo)

### Windows:
1. **Node.js** → https://nodejs.org (v18 LTS)
2. **Android Studio** → https://developer.android.com/studio
   - Android Studio kholne ke baad:
   - SDK Manager → Android 13 (API 33) install karo
   - AVD Manager → ek emulator banao (Pixel 6, API 33)
3. **JDK 17** → Android Studio ke saath automatic aata hai

### Environment Variables set karo (Windows):
```
ANDROID_HOME = C:\Users\<YourName>\AppData\Local\Android\Sdk
Path += %ANDROID_HOME%\platform-tools
Path += %ANDROID_HOME%\emulator
```

---

## STEP 2 — React Native Project Banao

```bash
# New RN project banao
npx react-native@0.73.0 init MagnetMoney --template react-native-template-typescript

# Folder mein jao
cd MagnetMoney
```

---

## STEP 3 — Files Replace Karo

`MagnetMoney/App.tsx` ki jagah `UserApp.tsx` paste karo  
(Admin app ke liye alag project banao ya tab-based navigation add karo)

---

## STEP 4 — Dependencies Install Karo

```bash
npm install @react-native-async-storage/async-storage react-native-svg

# iOS ke liye (Mac pe)
cd ios && pod install && cd ..
```

---

## STEP 5 — Android Package Name Set Karo

File: `android/app/build.gradle`
```gradle
android {
    namespace "com.magnetmoney.app"
    defaultConfig {
        applicationId "com.magnetmoney.app"
        ...
    }
}
```

---

## STEP 6 — App Chalao (Emulator/Device)

```bash
# Metro bundler start karo
npm start

# Naye terminal mein:
npx react-native run-android
```

---

## STEP 7 — Release APK Banao

```bash
# Keystore banao (ek baar sirf)
keytool -genkey -v -keystore magnetmoney.keystore -alias magnetmoney -keyalg RSA -keysize 2048 -validity 10000

# android/gradle.properties mein add karo:
MYAPP_RELEASE_STORE_FILE=magnetmoney.keystore
MYAPP_RELEASE_KEY_ALIAS=magnetmoney
MYAPP_RELEASE_STORE_PASSWORD=your_password
MYAPP_RELEASE_KEY_PASSWORD=your_password

# android/app/build.gradle mein signing config add karo
# Phir build karo:
cd android && ./gradlew assembleRelease

# APK milega:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## WEB → REACT NATIVE CONVERSION SUMMARY

| Web (Old) | React Native (New) |
|-----------|-------------------|
| `div` | `View` |
| `span`, `p` | `Text` |
| `button` | `TouchableOpacity` |
| `input` | `TextInput` |
| `img` | `Image` |
| `select` | Custom `TouchableOpacity` chips |
| `css` / `className` | `StyleSheet.create()` |
| `@import fonts` | `react-native-google-fonts` |
| `localStorage` | `AsyncStorage` |
| `position:fixed` | `position:'absolute'` |
| `overflow:scroll` | `ScrollView` |
| CSS animations | `Animated` API |
| `BroadcastChannel` | Removed (AsyncStorage sync) |
| `navigator.clipboard` | `Clipboard` from RN |

---

## ADMIN APP

Admin app ke liye alag React Native project banao:
- Package name: `com.magnetmoney.admin`
- `AdminApp.tsx` → `App.tsx` mein paste karo

Ya ek hi app mein dono rakho using React Navigation:
```bash
npm install @react-navigation/native @react-navigation/stack
```

---

## SUPPORT
Koi problem ho to batao! 🚀
