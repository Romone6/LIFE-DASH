package com.lifeos.app.sync

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json

private val Context.dataStore by preferencesDataStore(name = "lifeos_snapshots")

class SnapshotStore(private val context: Context) {
  private val key = stringPreferencesKey("snapshots_json")
  private val json = Json { ignoreUnknownKeys = true }

  suspend fun loadSnapshots(): List<SignalSnapshot> {
    val prefs = context.dataStore.data.first()
    val raw = prefs[key] ?: "[]"
    return json.decodeFromString(ListSerializer(SignalSnapshot.serializer()), raw)
  }

  suspend fun saveSnapshot(snapshot: SignalSnapshot, max: Int = 14) {
    val current = loadSnapshots().toMutableList()
    current.removeAll { it.dateLocal == snapshot.dateLocal }
    current.add(snapshot)
    val sorted = current.sortedBy { it.dateLocal }.takeLast(max)
    val encoded = json.encodeToString(ListSerializer(SignalSnapshot.serializer()), sorted)
    context.dataStore.edit { prefs ->
      prefs[key] = encoded
    }
  }
}
