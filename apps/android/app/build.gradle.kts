plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  id("org.jetbrains.kotlin.plugin.serialization") version "1.9.22"
}

android {
  namespace = "com.lifeos.app"
  compileSdk = 35

  defaultConfig {
    applicationId = "com.lifeos.app"
    minSdk = 26
    targetSdk = 35
    versionCode = 1
    versionName = "1.0"

    buildConfigField("String", "SUPABASE_URL", "\"\"")
    buildConfigField("String", "SUPABASE_ANON_KEY", "\"\"")
    buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:4000\"")
  }

  buildFeatures {
    compose = true
    buildConfig = true
  }

  composeOptions {
    kotlinCompilerExtensionVersion = "1.5.8"
  }

  kotlinOptions {
    jvmTarget = "17"
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }
}

dependencies {
  implementation("androidx.core:core-ktx:1.12.0")
  implementation("androidx.activity:activity-compose:1.8.2")
  implementation("androidx.compose.ui:ui:1.6.3")
  implementation("androidx.compose.ui:ui-tooling-preview:1.6.3")
  implementation("androidx.compose.material3:material3:1.2.1")
  implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
  implementation("androidx.datastore:datastore-preferences:1.1.1")

  implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
  implementation("com.squareup.okhttp3:okhttp:4.12.0")

  implementation("androidx.health.connect:connect-client:1.1.0-alpha11")

  debugImplementation("androidx.compose.ui:ui-tooling:1.6.3")
}
