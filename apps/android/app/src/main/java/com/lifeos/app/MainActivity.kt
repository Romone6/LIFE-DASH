package com.lifeos.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.health.connect.client.permission.PermissionController
import androidx.health.connect.client.HealthConnectClient
import com.lifeos.app.auth.AuthRepository
import com.lifeos.app.healthconnect.HcClient
import com.lifeos.app.healthconnect.HcPermissions
import com.lifeos.app.sync.SyncRepository
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
      LifeOSApp()
    }
  }
}

@Composable
fun LifeOSApp() {
  val scope = rememberCoroutineScope()
  val context = androidx.compose.ui.platform.LocalContext.current
  val authRepository = remember { AuthRepository(context) }
  val syncRepository = remember { SyncRepository(context) }

  var email by remember { mutableStateOf("") }
  var password by remember { mutableStateOf("") }
  var status by remember { mutableStateOf("Idle") }
  var userId by remember { mutableStateOf("") }
  var permissionsGranted by remember { mutableStateOf(false) }

  val permissionLauncher = rememberLauncherForActivityResult(
    contract = PermissionController.createRequestPermissionActivityContract()
  ) { granted ->
    permissionsGranted = granted.containsAll(HcPermissions.required)
  }

  LaunchedEffect(Unit) {
    if (HcClient.isAvailable(context)) {
      val client = HealthConnectClient.getOrCreate(context)
      val granted = client.permissionController.getGrantedPermissions()
      permissionsGranted = granted.containsAll(HcPermissions.required)
    }
  }

  MaterialTheme {
    Surface(modifier = Modifier.fillMaxSize()) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
      ) {
        Text(text = "LifeOS", style = MaterialTheme.typography.headlineMedium)

        Button(onClick = {
          permissionLauncher.launch(HcPermissions.required)
        }) {
          Text(if (permissionsGranted) "Permissions Granted" else "Request Permissions")
        }

        OutlinedTextField(
          value = email,
          onValueChange = { email = it },
          label = { Text("Email") }
        )

        OutlinedTextField(
          value = password,
          onValueChange = { password = it },
          label = { Text("Password") }
        )

        OutlinedTextField(
          value = userId,
          onValueChange = { userId = it },
          label = { Text("User ID (UUID)") }
        )

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
          Button(onClick = {
            scope.launch {
              status = "Logging in..."
              val ok = authRepository.login(email, password)
              status = if (ok) "Logged in" else "Login failed"
            }
          }) { Text("Login") }

          Button(onClick = {
            scope.launch {
              status = "Syncing..."
              val ok = syncRepository.sync(userId)
              status = if (ok) "Sync success" else "Sync failed"
            }
          }) { Text("Sync Now") }
        }

        Text(text = "Status: $status")
      }
    }
  }
}
