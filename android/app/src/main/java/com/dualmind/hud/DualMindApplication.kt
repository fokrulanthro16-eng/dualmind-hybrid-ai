package com.dualmind.hud

import android.app.Application
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.appcheck.FirebaseAppCheck
import com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreSettings

class DualMindApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // 1. Initialize Firebase
        FirebaseApp.initializeApp(this)

        // 2. Initialize Mandatory Firebase App Check
        try {
            val firebaseAppCheck = FirebaseAppCheck.getInstance()
            // In debug mode, install DebugAppCheckProviderFactory
            firebaseAppCheck.installAppCheckProviderFactory(
                DebugAppCheckProviderFactory.getInstance()
            )
            Log.d("DualMind", "Firebase App Check initialized successfully with Debug Provider")
        } catch (e: Exception) {
            Log.w("DualMind", "Firebase App Check initialization notice: ${e.message}")
        }

        // 3. Configure Firestore Offline Persistence
        try {
            val firestore = FirebaseFirestore.getInstance()
            val settings = FirebaseFirestoreSettings.Builder()
                .setPersistenceEnabled(true)
                .build()
            firestore.firestoreSettings = settings
        } catch (e: Exception) {
            Log.w("DualMind", "Firestore offline settings notice: ${e.message}")
        }

        // 4. Anonymous Authentication for security rules compliance
        try {
            val auth = FirebaseAuth.getInstance()
            if (auth.currentUser == null) {
                auth.signInAnonymously()
                    .addOnSuccessListener {
                        Log.d("DualMind", "Anonymous Auth succeeded: ${it.user?.uid}")
                    }
                    .addOnFailureListener {
                        Log.w("DualMind", "Anonymous Auth note (running in local mode): ${it.message}")
                    }
            }
        } catch (e: Exception) {
            Log.w("DualMind", "Auth exception: ${e.message}")
        }
    }
}
