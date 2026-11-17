package com.dualmind.hud

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.dualmind.hud.ui.HudScreen
import com.dualmind.hud.ui.HudViewModel
import com.dualmind.hud.ui.theme.DualMindTheme
import com.dualmind.hud.ui.theme.Obsidian950

class MainActivity : ComponentActivity() {

    private val viewModel: HudViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Mandatory Teleprompter Feature: Keep Screen On during negotiations
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Handle QR Code Deep Link (dualmind://join/DM-XXXX)
        handleIntent(intent)

        setContent {
            DualMindTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Obsidian950
                ) {
                    HudScreen(viewModel = viewModel)
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        val data: Uri? = intent?.data
        if (data != null && data.scheme == "dualmind" && data.host == "join") {
            val sessionCode = data.lastPathSegment
            if (!sessionCode.isNullOrBlank()) {
                viewModel.joinSession(sessionCode)
            }
        }
    }
}
