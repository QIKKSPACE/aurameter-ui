package com.aurameter.webp

import android.content.Context
import android.widget.ImageView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy

class WebPImageView(context: Context) : ImageView(context) {

    private var currentUrl: String? = null  // Track current URL

    init {
        scaleType = ScaleType.CENTER_INSIDE
    }

    fun setSource(url: String) {
        // Only reload if URL changed
        if (currentUrl != url) {
            currentUrl = url
            Glide.with(this)
                .asDrawable()
                .load(url)
                .diskCacheStrategy(DiskCacheStrategy.AUTOMATIC)
                .dontAnimate() // important for animated WebP
                .into(this)
        }
    }

}
