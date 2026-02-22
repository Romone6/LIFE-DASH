package com.lifeos.app.auth

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.lifeos.app.BuildConfig
import kotlinx.coroutines.flow.first
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject

private val Context.authStore by preferencesDataStore(name = "lifeos_auth")

class AuthRepository(private val context: Context) {
  private val client = OkHttpClient()
  private val tokenKey = stringPreferencesKey("access_token")

  suspend fun login(email: String, password: String): Boolean {
    if (BuildConfig.SUPABASE_URL.isBlank() || BuildConfig.SUPABASE_ANON_KEY.isBlank()) {
      return false
    }

    val url = "${BuildConfig.SUPABASE_URL}/auth/v1/token?grant_type=password"
    val body = FormBody.Builder()
      .add("email", email)
      .add("password", password)
      .build()

    val request = Request.Builder()
      .url(url)
      .addHeader("apikey", BuildConfig.SUPABASE_ANON_KEY)
      .addHeader("Content-Type", "application/x-www-form-urlencoded")
      .post(body)
      .build()

    client.newCall(request).execute().use { response ->
      if (!response.isSuccessful) return false
      val payload = response.body?.string() ?: return false
      val json = JSONObject(payload)
      val token = json.optString("access_token")
      if (token.isBlank()) return false
      context.authStore.edit { prefs ->
        prefs[tokenKey] = token
      }
      return true
    }
  }

  suspend fun currentToken(): String? {
    val prefs = context.authStore.data.first()
    return prefs[tokenKey]
  }

  suspend fun logout() {
    context.authStore.edit { prefs -> prefs.remove(tokenKey) }
  }
}
