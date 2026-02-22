package com.lifeos.app.healthconnect

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.HealthConnectClient.Companion.SDK_AVAILABLE

object HcClient {
  fun isAvailable(context: Context): Boolean {
    return HealthConnectClient.getSdkStatus(context) == SDK_AVAILABLE
  }

  fun client(context: Context): HealthConnectClient {
    return HealthConnectClient.getOrCreate(context)
  }
}
