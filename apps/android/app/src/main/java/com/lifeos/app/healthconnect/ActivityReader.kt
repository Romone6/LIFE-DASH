package com.lifeos.app.healthconnect

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.time.TimeRangeFilter
import com.lifeos.app.sync.ActivitySummary
import com.lifeos.app.sync.ExerciseSession
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime

class ActivityReader(private val client: HealthConnectClient) {
  suspend fun readActivity(date: LocalDate, zoneId: ZoneId): ActivitySummary? {
    val start = date.atStartOfDay(zoneId).toInstant()
    val end = date.plusDays(1).atStartOfDay(zoneId).toInstant()

    val stepsResponse = client.readRecords(
      ReadRecordsRequest(
        recordType = StepsRecord::class,
        timeRangeFilter = TimeRangeFilter.between(start, end)
      )
    )

    val stepsTotal = stepsResponse.records.sumOf { it.count }

    val exerciseResponse = client.readRecords(
      ReadRecordsRequest(
        recordType = ExerciseSessionRecord::class,
        timeRangeFilter = TimeRangeFilter.between(start, end)
      )
    )

    val sessions = exerciseResponse.records.map {
      ExerciseSession(
        title = it.title ?: "Exercise",
        startTime = ZonedDateTime.ofInstant(it.startTime, zoneId).toString(),
        endTime = ZonedDateTime.ofInstant(it.endTime, zoneId).toString(),
        caloriesBurned = it.totalEnergyBurned?.inKilocalories
      )
    }

    val caloriesResponse = client.readRecords(
      ReadRecordsRequest(
        recordType = TotalCaloriesBurnedRecord::class,
        timeRangeFilter = TimeRangeFilter.between(start, end)
      )
    )

    val caloriesBurned = caloriesResponse.records.sumOf { it.energy.inKilocalories }

    if (stepsTotal == 0L && sessions.isEmpty() && caloriesBurned == 0.0) {
      return null
    }

    return ActivitySummary(
      stepsTotal = stepsTotal,
      exerciseSessions = if (sessions.isEmpty()) null else sessions,
      caloriesBurned = if (caloriesBurned == 0.0) null else caloriesBurned
    )
  }
}
