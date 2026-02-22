package com.lifeos.app.sync

import kotlinx.serialization.Serializable

@Serializable
data class SleepSummary(
  val durationMinutes: Int,
  val startTime: String,
  val endTime: String,
  val sleepStageBreakdown: Map<String, Int>? = null
)

@Serializable
data class ActivitySummary(
  val stepsTotal: Long,
  val exerciseSessions: List<ExerciseSession>? = null,
  val caloriesBurned: Double? = null
)

@Serializable
data class ExerciseSession(
  val title: String,
  val startTime: String,
  val endTime: String,
  val caloriesBurned: Double? = null
)

@Serializable
data class NutritionSummary(
  val caloriesTotal: Double,
  val proteinGrams: Double,
  val carbsGrams: Double,
  val fatGrams: Double,
  val micronutrients: Map<String, Double>? = null
)

@Serializable
data class Provenance(
  val dataSource: String,
  val timestampCollected: String,
  val missingFields: List<String>
)

@Serializable
data class Confidence(
  val level: String,
  val score: Double
)

@Serializable
data class BaselineMetrics(
  val avgSleepMinutes: Double,
  val avgSteps: Double,
  val avgProtein: Double,
  val avgCalories: Double,
  val confidence: String
)

@Serializable
data class SignalSnapshot(
  val snapshotId: String,
  val userId: String,
  val dateLocal: String,
  val timezone: String,
  val generatedAt: String,
  val sleep: SleepSummary?,
  val activity: ActivitySummary?,
  val nutrition: NutritionSummary?,
  val provenance: Provenance,
  val confidence: Confidence,
  val baseline: BaselineMetrics
)
