package com.aurameter.webp

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class WebPImageManager : SimpleViewManager<WebPImageView>() {

    override fun getName() = "NativeWebPImage"

    override fun createViewInstance(context: ThemedReactContext): WebPImageView {
        return WebPImageView(context)
    }

    @ReactProp(name = "source")
    fun setSource(view: WebPImageView, source: ReadableMap?) {
        val uri = source?.getString("uri")
        if (!uri.isNullOrEmpty()) {
            view.setSource(uri)
        }
    }
}
