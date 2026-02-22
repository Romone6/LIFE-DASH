package com.lifeos.app.sync

class BaselineCalculator {
  fun compute(snapshots: List<SignalSnapshot>): BaselineMetrics {
    if (snapshots.isEmpty()) {
      return BaselineMetrics(
        avgSleepMinutes = 0.0,
        avgSteps = 0.0,
        avgProtein = 0.0,
        avgCalories = 0.0,
        confidence = "LOW"
      )
    }

    val sleepAvg = snapshots.mapNotNull { it.sleep?.durationMinutes?.toDouble() }.averageOrZero()
    val stepsAvg = snapshots.mapNotNull { it.activity?.stepsTotal?.toDouble() }.averageOrZero()
    val proteinAvg = snapshots.mapNotNull { it.nutrition?.proteinGrams }.averageOrZero()
    val caloriesAvg = snapshots.mapNotNull { it.nutrition?.caloriesTotal }.averageOrZero()

    val confidence = if (snapshots.size >= 7) "MEDIUM" else "LOW"

    return BaselineMetrics(
      avgSleepMinutes = sleepAvg,
      avgSteps = stepsAvg,
      avgProtein = proteinAvg,
      avgCalories = caloriesAvg,
      confidence = confidence
    )
  }

  private fun List<Double>.averageOrZero(): Double {
    return if (isEmpty()) 0.0 else sum() / size
  }
}
