package com.dualmind.hud.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = EmeraldNano,
    secondary = CyanCloud,
    tertiary = AmberWarning,
    background = Obsidian950,
    surface = Obsidian900,
    onPrimary = Obsidian950,
    onSecondary = Obsidian950,
    onBackground = Slate200,
    onSurface = Slate200,
    error = CrimsonAlert
)

@Composable
fun DualMindTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
