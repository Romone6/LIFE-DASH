package com.lifeos.app.sync

import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.UUID

class SignalSnapshotBuilder {
  fun build(
    userId: String,
    date: LocalDate,
    zoneId: ZoneId,
    sleep: SleepSummary?,
    activity: ActivitySummary?,
    nutrition: NutritionSummary?,
    baseline: BaselineMetrics
  ): SignalSnapshot {
    val missing = mutableListOf<String>()
    if (sleep == null) missing.add("sleep")
    if (activity == null) missing.add("activity")
    if (nutrition == null) missing.add("nutrition")

    val confidenceScore = when {
      sleep == null && nutrition == null -> 0.4
      sleep == null -> 0.6
      nutrition == null -> 0.7
      else -> 0.9
    }

    val confidenceLevel = when {
      confidenceScore >= 0.85 -> "HIGH"
      confidenceScore >= 0.65 -> "MEDIUM"
      confidenceScore >= 0.45 -> "LOW"
      else -> "EXPERIMENTAL"
    }

    return SignalSnapshot(
      snapshotId = UUID.randomUUID().toString(),
      userId = userId,
      dateLocal = date.toString(),
      timezone = zoneId.id,
      generatedAt = ZonedDateTime.now(zoneId).toString(),
      sleep = sleep,
      activity = activity,
      nutrition = nutrition,
      provenance = Provenance(
        dataSource = "Health Connect",
        timestampCollected = ZonedDateTime.now(zoneId).toString(),
        missingFields = missing
      ),
      confidence = Confidence(
        level = confidenceLevel,
        score = confidenceScore
      ),
      baseline = baseline
    )
  }
}
