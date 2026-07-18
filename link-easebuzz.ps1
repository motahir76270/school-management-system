# link-easebuzz.ps1
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Linking react-native-easebuzz-kit" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Check if package exists
Write-Host "`n[1/6] Checking package installation..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules/react-native-easebuzz-kit")) {
    Write-Host "❌ Package not found in node_modules" -ForegroundColor Red
    Write-Host "Please install it first: npm install" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Package found" -ForegroundColor Green

# 2. Update settings.gradle
Write-Host "`n[2/6] Updating settings.gradle..." -ForegroundColor Yellow
$settingsFile = "android/settings.gradle"
if (Test-Path $settingsFile) {
    $settingsContent = Get-Content $settingsFile -Raw
    
    if ($settingsContent -match "react-native-easebuzz-kit") {
        Write-Host "✅ Already in settings.gradle" -ForegroundColor Green
    } else {
        # Remove the last line, add our lines, then put back the last line
        $lines = $settingsContent -split "`r?`n"
        $lastLine = $lines[-1]
        $lines = $lines[0..($lines.Length - 2)]
        $lines += ""
        $lines += "include ':react-native-easebuzz-kit'"
        $lines += "project(':react-native-easebuzz-kit').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-easebuzz-kit/android')"
        $lines += $lastLine
        $newContent = $lines -join "`r`n"
        Set-Content -Path $settingsFile -Value $newContent
        Write-Host "✅ Added to settings.gradle" -ForegroundColor Green
    }
} else {
    Write-Host "❌ settings.gradle not found" -ForegroundColor Red
}

# 3. Update app/build.gradle
Write-Host "`n[3/6] Updating app/build.gradle..." -ForegroundColor Yellow
$buildFile = "android/app/build.gradle"
if (Test-Path $buildFile) {
    $buildContent = Get-Content $buildFile -Raw
    
    if ($buildContent -match "implementation project\(':react-native-easebuzz-kit'\)") {
        Write-Host "✅ Already in app/build.gradle" -ForegroundColor Green
    } else {
        # Add the dependency after the dependencies block starts
        $buildContent = $buildContent -replace '(dependencies \{)', "`$1`r`n    implementation project(':react-native-easebuzz-kit')"
        Set-Content -Path $buildFile -Value $buildContent
        Write-Host "✅ Added to app/build.gradle" -ForegroundColor Green
    }
} else {
    Write-Host "❌ app/build.gradle not found" -ForegroundColor Red
}

# 4. Copy AAR file to package libs
Write-Host "`n[4/6] Copying AAR file..." -ForegroundColor Yellow
$libsPath = "node_modules/react-native-easebuzz-kit/android/libs"
New-Item -ItemType Directory -Force -Path $libsPath | Out-Null

if (Test-Path "android/app/libs/peb-lib-android-x.aar") {
    Copy-Item "android/app/libs/peb-lib-android-x.aar" -Destination "$libsPath/" -Force
    Write-Host "✅ Copied peb-lib-android-x.aar" -ForegroundColor Green
} else {
    Write-Host "⚠️ peb-lib-android-x.aar not found in android/app/libs/" -ForegroundColor Yellow
}

# 5. Update build.gradle of the package
Write-Host "`n[5/6] Updating package build.gradle..." -ForegroundColor Yellow
$pkgBuildFile = "node_modules/react-native-easebuzz-kit/android/build.gradle"
if (Test-Path $pkgBuildFile) {
    $newContent = @'
buildscript {
    repositories {
        google()
        mavenCentral()
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.1'
    }
}

apply plugin: 'com.android.library'

def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

def DEFAULT_COMPILE_SDK_VERSION = 34
def DEFAULT_BUILD_TOOLS_VERSION = "34.0.0"
def DEFAULT_MIN_SDK_VERSION = 23
def DEFAULT_TARGET_SDK_VERSION = 34

android {
    compileSdkVersion safeExtGet('compileSdkVersion', DEFAULT_COMPILE_SDK_VERSION)
    buildToolsVersion safeExtGet('buildToolsVersion', DEFAULT_BUILD_TOOLS_VERSION)

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', DEFAULT_MIN_SDK_VERSION)
        targetSdkVersion safeExtGet('targetSdkVersion', DEFAULT_TARGET_SDK_VERSION)
        versionCode 1
        versionName "1.0"
        multiDexEnabled true
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    
    lintOptions {
        abortOnError false
    }
    
    packagingOptions {
        exclude 'META-INF/DEPENDENCIES'
        exclude 'META-INF/NOTICE'
        exclude 'META-INF/LICENSE'
        exclude 'META-INF/LICENSE.txt'
        exclude 'META-INF/NOTICE.txt'
    }
}

repositories {
    google()
    mavenCentral()
    flatDir {
        dirs 'libs'
    }
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
    implementation(name: 'peb-lib-android-x', ext: 'aar')
    implementation 'com.google.android.material:material:1.3.0'
    implementation 'com.squareup.okhttp:okhttp:2.4.0'
    implementation 'androidx.multidex:multidex:2.0.0'
    implementation 'com.squareup.okhttp:okhttp-urlconnection:2.2.0'
    implementation 'com.squareup.retrofit2:retrofit:2.5.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.5.0'
    implementation 'com.google.android.gms:play-services-auth:17.0.0'
    implementation 'com.google.android.gms:play-services-auth-api-phone:17.1.0'
}
'@
    Set-Content -Path $pkgBuildFile -Value $newContent
    Write-Host "✅ Updated package build.gradle" -ForegroundColor Green
}

# 6. Create type declaration
Write-Host "`n[6/6] Creating TypeScript declaration..." -ForegroundColor Yellow
$typesDir = "types"
New-Item -ItemType Directory -Force -Path $typesDir | Out-Null
$dtsContent = @'
declare module 'react-native-easebuzz-kit' {
  export function initializeEasebuzzCheckout(
    accessKey: string,
    payMode: string
  ): Promise<any>;
}
'@
Set-Content -Path "$typesDir/react-native-easebuzz-kit.d.ts" -Value $dtsContent
Write-Host "✅ Created TypeScript declaration" -ForegroundColor Green

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "✅ Linking complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "`nNow run these commands:" -ForegroundColor Yellow
Write-Host "1. cd android && ./gradlew clean" -ForegroundColor White
Write-Host "2. cd .. && npx expo run:android --no-build-cache" -ForegroundColor White