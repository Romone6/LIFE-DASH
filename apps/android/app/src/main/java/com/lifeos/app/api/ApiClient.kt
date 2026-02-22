package com.lifeos.app.api

import com.lifeos.app.BuildConfig
import com.lifeos.app.sync.SignalSnapshot
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class ApiClient(private val authRepository: com.lifeos.app.auth.AuthRepository) {
  private val client = OkHttpClient()
  private val json = Json { ignoreUnknownKeys = true }

  suspend fun uploadSnapshot(snapshot: SignalSnapshot): Boolean {
    val token = authRepository.currentToken() ?: return false
    val body = json.encodeToString(snapshot)
      .toRequestBody("application/json".toMediaType())

    val request = Request.Builder()
      .url("${BuildConfig.API_BASE_URL}/v1/healthconnect/snapshots")
      .addHeader("Authorization", "Bearer $token")
      .post(body)
      .build()

    client.newCall(request).execute().use { response ->
      return response.isSuccessful
    }
  }
}
