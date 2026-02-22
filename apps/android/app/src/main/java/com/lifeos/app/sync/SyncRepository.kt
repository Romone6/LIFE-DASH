package com.lifeos.app.sync

import android.content.Context
import com.lifeos.app.api.ApiClient
import com.lifeos.app.auth.AuthRepository
import com.lifeos.app.healthconnect.ActivityReader
import com.lifeos.app.healthconnect.HcClient
import com.lifeos.app.healthconnect.NutritionReader
import com.lifeos.app.healthconnect.SleepReader
import java.time.LocalDate
import java.time.ZoneId

class SyncRepository(private val context: Context) {
  private val client = HcClient.client(context)
  private val sleepReader = SleepReader(client)
  private val activityReader = ActivityReader(client)
  private val nutritionReader = NutritionReader(client)
  private val snapshotStore = SnapshotStore(context)
  private val baselineCalculator = BaselineCalculator()
  private val builder = SignalSnapshotBuilder()
  private val auth = AuthRepository(context)
  private val api = ApiClient(auth)

  suspend fun sync(userId: String): Boolean {
    val zoneId = ZoneId.systemDefault()
    val today = LocalDate.now(zoneId)

    val sleep = sleepReader.readSleep(today, zoneId)
    val activity = activityReader.readActivity(today, zoneId)
    val nutrition = nutritionReader.readNutrition(today, zoneId)

    val previous = snapshotStore.loadSnapshots().filter { it.dateLocal != today.toString() }
    val baseline = baselineCalculator.compute(previous)

    val snapshot = builder.build(
      userId = userId,
      date = today,
      zoneId = zoneId,
      sleep = sleep,
      activity = activity,
      nutrition = nutrition,
      baseline = baseline
    )

    val uploaded = api.uploadSnapshot(snapshot)
    if (uploaded) {
      snapshotStore.saveSnapshot(snapshot)
    }

    return uploaded
  }
}
