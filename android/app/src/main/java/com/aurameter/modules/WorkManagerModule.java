package com.aurameter.modules;

import android.util.Log;

import androidx.work.Data;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;
import androidx.work.WorkRequest;
import androidx.work.OutOfQuotaPolicy;
import androidx.work.ExistingWorkPolicy;

import com.aurameter.workers.StoryUploadWorker;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
public class WorkManagerModule extends ReactContextBaseJavaModule {
    private static final String TAG = "WorkManagerModule";
    private static ReactApplicationContext reactContext;
    
    public WorkManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        WorkManagerModule.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "WorkManagerModule";
    }

    @ReactMethod
    public void scheduleStoryUpload(
            String local_id,
            String filePath,
            String caption,
            String type,
            String userId,
            String musicUrlJson,
            String selectedLocation,
            String accessToken,
             String taggedUsersJson,   // ✅
        String layersJson,        
            Promise promise
    ) {
        if (local_id == null || filePath == null || type == null || userId == null) {
            Log.e(TAG, "❌ Invalid parameters for story upload");
            promise.reject("ERROR_INVALID_PARAMS", "Missing required parameters for story upload");
            return;
        }

        Data inputData = new Data.Builder()
                .putString("local_id", local_id)
                .putString("filePath", filePath)
                .putString("caption", caption != null ? caption : "")
                .putString("type", type)
                .putString("userId", userId)
                .putString("location", selectedLocation)
                .putString("musicUrl", musicUrlJson)
                .putString("accessToken", accessToken)
                .putString("taggedUsers", taggedUsersJson) // ✅
                .putString("layers", layersJson)           // 
                .build();

        WorkRequest storyWork = new OneTimeWorkRequest.Builder(StoryUploadWorker.class)
                .setInputData(inputData)
                .addTag("StoryUpload_" + local_id)
                .setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST)
                .build();

        WorkManager.getInstance(getReactApplicationContext()).enqueueUniqueWork(
                "StoryUpload_" + local_id,
                ExistingWorkPolicy.REPLACE,
                (OneTimeWorkRequest) storyWork
        );

        Log.d(TAG, "📸 Story WorkManager scheduled: " + local_id);
        promise.resolve("Story upload task scheduled");
    }
    public static void sendEventToJS(String eventName, WritableMap params) {
        if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        } else {
            Log.e(TAG, "❌ ReactContext is not active, cannot send event.");
        }
    }
}
