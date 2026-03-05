package com.aurameter

import android.graphics.Color
import android.os.Build
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class StatusBarModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "StatusBarModule"

    @ReactMethod
    fun setStatusBarColor(color: String, isLightContent: Boolean, promise: Promise) {
        android.util.Log.d("StatusBarModule", "🎨 Setting status bar color: $color, isLightContent: $isLightContent")
        
        try {
            val activity = reactApplicationContext.currentActivity
            if (activity != null) {
                activity.runOnUiThread {
                    val window = activity.window
                    
                    // Parse color string (remove # if present)
                    val cleanColor = color.replace("#", "")
                    val colorInt = Color.parseColor("#$cleanColor")
                    
                    android.util.Log.d("StatusBarModule", "🎨 Parsed color: $colorInt")
                    
                    // Set status bar color
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        window.statusBarColor = colorInt
                        android.util.Log.d("StatusBarModule", "✅ Status bar color set to: $colorInt")
                    }
                    
                    // Set status bar content color using WindowCompat
                    val insetsController = WindowCompat.getInsetsController(window, window.decorView)
                    insetsController.isAppearanceLightStatusBars = !isLightContent
                    
                    android.util.Log.d("StatusBarModule", "✅ Status bar content style set: ${!isLightContent}")
                    
                    promise.resolve(true)
                }
            } else {
                android.util.Log.e("StatusBarModule", "❌ No current activity found")
                promise.reject("NO_ACTIVITY", "No current activity found")
            }
        } catch (e: Exception) {
            android.util.Log.e("StatusBarModule", "❌ Error setting status bar color: ${e.message}")
            promise.reject("STATUS_BAR_ERROR", e.message)
        }
    }
}
