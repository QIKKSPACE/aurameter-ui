package com.aurameter

import android.os.Bundle
import android.view.animation.AnimationUtils
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
 import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate
class MainActivity : ReactActivity() {

    private var splashContainer: FrameLayout? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
         HealthConnectPermissionDelegate.setPermissionDelegate(this)
        // Edge-to-edge UI
        WindowCompat.setDecorFitsSystemWindows(window, true)
        WindowInsetsControllerCompat(window, window.decorView).systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        // Inflate splash layout
        val splashView = layoutInflater.inflate(R.layout.splash, null)
        splashContainer = splashView.findViewById(R.id.splash_container)

        // Prevent insets from shifting layout
        splashView.setOnApplyWindowInsetsListener { _, insets ->
            insets.consumeSystemWindowInsets()
        }

        // Attach splash above React root
        addContentView(
            splashView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        )

        val logo = splashView.findViewById<ImageView>(R.id.splash_logo)
        val text = splashView.findViewById<TextView>(R.id.splash_text)

        // Initial alpha and scale
        logo.alpha = 0f
        text.alpha = 0f

        // --- Logo fade-in ---
        logo.animate()
            .alpha(1f)
            .setDuration(700)
            .withEndAction {
                // --- Text fade-in after logo ---
                text.animate()
                    .alpha(1f)
                    .setDuration(900)
                    .withEndAction {
                        // --- Start glow pulse on text ---
                        val glowPulse = AnimationUtils.loadAnimation(this, R.anim.glow_pulse)
                        glowPulse.fillAfter = true
                        text.startAnimation(glowPulse)
                    }
                    .start()
            }
            .start()
    }

    // Called from SplashModule.hide()
    fun hideSplash() {
        runOnUiThread {
            splashContainer?.animate()
                ?.alpha(0f)
                ?.setDuration(500)
                ?.withEndAction {
                    splashContainer?.visibility = android.view.View.GONE
                    splashContainer = null
                }
                ?.start()
        }
    }

    override fun getMainComponentName(): String = "Aurameter"

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return object : DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled) {
            override fun createRootView(): ReactRootView {
                return ReactRootView(this@MainActivity)
            }
        }
    }
}
