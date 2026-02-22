package com.lifeos.app.healthconnect

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.time.TimeRangeFilter
import com.lifeos.app.sync.SleepSummary
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime

class SleepReader(private val client: HealthConnectClient) {
  suspend fun readSleep(date: LocalDate, zoneId: ZoneId): SleepSummary? {
    val start = date.atStartOfDay(zoneId).toInstant()
    val end = date.plusDays(1).atStartOfDay(zoneId).toInstant()

    val response = client.readRecords(
      ReadRecordsRequest(
        recordType = SleepSessionRecord::class,
        timeRangeFilter = TimeRangeFilter.between(start, end)
      )
    )

    if (response.records.isEmpty()) return null

    val sessions = response.records
    val totalMinutes = sessions.sumOf {
      val duration = it.endTime.toEpochMilli() - it.startTime.toEpochMilli()
      (duration / 60000.0).toInt()
    }

    val first = sessions.minBy { it.startTime }
    val last = sessions.maxBy { it.endTime }

    return SleepSummary(
      durationMinutes = totalMinutes,
      startTime = ZonedDateTime.ofInstant(first.startTime, zoneId).toString(),
      endTime = ZonedDateTime.ofInstant(last.endTime, zoneId).toString(),
      sleepStageBreakdown = null
    )
  }
}
