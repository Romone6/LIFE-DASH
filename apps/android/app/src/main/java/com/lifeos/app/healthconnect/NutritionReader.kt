package com.lifeos.app.healthconnect

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.records.NutritionRecord
import androidx.health.connect.client.time.TimeRangeFilter
import com.lifeos.app.sync.NutritionSummary
import java.time.LocalDate
import java.time.ZoneId

class NutritionReader(private val client: HealthConnectClient) {
  suspend fun readNutrition(date: LocalDate, zoneId: ZoneId): NutritionSummary? {
    val start = date.atStartOfDay(zoneId).toInstant()
    val end = date.plusDays(1).atStartOfDay(zoneId).toInstant()

    val response = client.readRecords(
      ReadRecordsRequest(
        recordType = NutritionRecord::class,
        timeRangeFilter = TimeRangeFilter.between(start, end)
      )
    )

    if (response.records.isEmpty()) return null

    var calories = 0.0
    var protein = 0.0
    var carbs = 0.0
    var fat = 0.0

    for (record in response.records) {
      calories += record.energy?.inKilocalories ?: 0.0
      protein += record.protein?.inGrams ?: 0.0
      carbs += record.totalCarbohydrate?.inGrams ?: 0.0
      fat += record.totalFat?.inGrams ?: 0.0
    }

    return NutritionSummary(
      caloriesTotal = calories,
      proteinGrams = protein,
      carbsGrams = carbs,
      fatGrams = fat
    )
  }
}
