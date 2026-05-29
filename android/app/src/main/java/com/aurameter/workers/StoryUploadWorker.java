package com.aurameter.workers;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.work.ForegroundInfo;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import android.content.pm.ServiceInfo;

import com.aurameter.modules.WorkManagerModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class StoryUploadWorker extends Worker {
    private static final String TAG = "StoryUploadWorker";
    private static final String CHANNEL_ID = "story_upload_channel";

    public StoryUploadWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    private static class ResultData {
            int code;
            String storyId;
            String blurhash;
            String status;


    ResultData(int code, String storyId, String blurhash,String status) {
        this.code = code;
        this.storyId = storyId;
        this.blurhash = blurhash;
        this.status=status;
    }

    }

    @NonNull
    @Override
    public Result doWork() {
        setForegroundAsync(createForegroundInfo());
        String local_id = getInputData().getString("local_id");
        String userId = getInputData().getString("userId");
        String caption = getInputData().getString("caption");
        String type = getInputData().getString("type");
        String filePath = getInputData().getString("filePath");
        String musicUrlJson = getInputData().getString("musicUrl");
        String location = getInputData().getString("location");
        String accessToken = getInputData().getString("accessToken");
       String taggedUsersJson = getInputData().getString("taggedUsers");
       String layersJson = getInputData().getString("layers");
        WritableMap params = Arguments.createMap();

        if (userId == null || local_id == null || type == null) {
            Log.e(TAG, "❌ Missing input parameters for story upload");
            params.putString("local_id", local_id);
            params.putString("status", "FAILED_INVALID_PARAMS");
            WorkManagerModule.sendEventToJS("storyUploadEvent", params);
            return Result.failure();
        }

        ResultData serverResponse = sendStoryToServer(
                local_id, filePath, caption, type, userId, musicUrlJson, location, accessToken,taggedUsersJson,layersJson
        );

        if (serverResponse.code == 401) {
            params.putString("local_id", local_id);
            params.putBoolean("success", false);
            params.putBoolean("isAuthError", true);
            WorkManagerModule.sendEventToJS("storyUploadEvent", params);
            return Result.failure();
        } 

        if (serverResponse.code != HttpURLConnection.HTTP_OK) {
            params.putString("local_id", local_id);
            params.putString("status", "FAILED_SERVER");
            updateUploadQueueFile(getApplicationContext(), local_id, false);
            WorkManagerModule.sendEventToJS("storyUploadEvent", params);
            return Result.failure();
        }

        // ✅ Success
        params.putString("local_id", local_id);
      params.putString("status", serverResponse.status != null
        ? serverResponse.status
        : "PENDING");

if (serverResponse.storyId != null) {
    params.putString("story_id", serverResponse.storyId);
}

if (serverResponse.blurhash != null) {
    params.putString("blurhash", serverResponse.blurhash);
}
        updateUploadQueueFile(getApplicationContext(), local_id, true);
        WorkManagerModule.sendEventToJS("storyUploadEvent", params);

        return Result.success();
    }

    private ResultData sendStoryToServer(
            String local_id, String filePath, String caption,
            String type, String userId, String musicUrlJson, String location, String accessToken, String taggedUsersJson,
            String layersJson
    ) {
        String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
        String LINE_FEED = "\r\n";

        try {
            URL url = new URL("http://localhost:5001/story/uploadStory");

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);

            if (accessToken != null && !accessToken.isEmpty()) {
                conn.setRequestProperty("Authorization", "Bearer " + accessToken);
            }
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (OutputStream outputStream = conn.getOutputStream()) {
                writeFormField(outputStream, "local_id", local_id, boundary, LINE_FEED);
                writeFormField(outputStream, "caption", caption != null ? caption : "", boundary, LINE_FEED);
                writeFormField(outputStream, "type", type, boundary, LINE_FEED);
                writeFormField(outputStream, "userId", userId, boundary, LINE_FEED);
                writeFormField(outputStream, "musicUrl", musicUrlJson != null ? musicUrlJson : "{}", boundary, LINE_FEED);
                writeFormField(outputStream, "location", location != null ? location : "", boundary, LINE_FEED);
                writeFormField(
                outputStream,
                "tagged_users",
                taggedUsersJson != null ? taggedUsersJson : "[]",
                boundary,
                LINE_FEED
                );

                writeFormField(
                outputStream,
                "layers",
                layersJson != null ? layersJson : "[]",
                boundary,
                LINE_FEED
                );
                if (filePath != null) {
                    if (filePath.startsWith("content://")) {
                        Uri uri = Uri.parse(filePath);
                        String mimeType = getApplicationContext().getContentResolver().getType(uri);
                        if (mimeType == null) mimeType = "application/octet-stream";

                        try (InputStream inputStream = getApplicationContext().getContentResolver().openInputStream(uri)) {
                            if (inputStream != null) {
                                String extension = getExtension(mimeType);
                                writeFileStream(outputStream, "file", "story." + extension, inputStream, boundary, LINE_FEED, mimeType);
                            } else {
                                Log.e(TAG, "InputStream is null for: " + filePath);
                            }
                        }
                    } else {
                        File file = new File(filePath);
                        if (file.exists()) {
                            String mimeType = getMimeTypeFromExtension(file.getName());
                            writeFileField(outputStream, "file", file, boundary, LINE_FEED, mimeType);
                        } else {
                            Log.e(TAG, "File does not exist: " + filePath);
                        }
                    }
                }

                outputStream.write(("--" + boundary + "--" + LINE_FEED).getBytes());
            }

            int responseCode = conn.getResponseCode();
            Log.d(TAG, "Server Response Code: " + responseCode);

            StringBuilder response = new StringBuilder();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"))) {
                    String line;
                    while ((line = br.readLine()) != null) {
                        response.append(line);
                    }
                }
                Log.d(TAG, "Server Response: " + response);

                try {
                   JSONObject json = new JSONObject(response.toString());
if (json.optBoolean("success", false)) {
    JSONObject storyObj = json.optJSONObject("story");
    if (storyObj != null) {
        String storyId = storyObj.optString("id", null);
        String blurhash = storyObj.optString("blurhash", null);
        String status = storyObj.optString("status", null);

        return new ResultData(responseCode, storyId, blurhash,status);
    }
}

                } catch (Exception e) {
                    Log.e(TAG, "❌ Failed to parse JSON", e);
                }
            }

            return new ResultData(responseCode, null,null,null);
        } catch (Exception e) {
            Log.e(TAG, "❌ Error sending story to server", e);
            return new ResultData(-1, null,null,null);
        }
    }

    private void writeFormField(OutputStream os, String name, String value, String boundary, String LINE_FEED) throws Exception {
        String fieldData = "--" + boundary + LINE_FEED +
                "Content-Disposition: form-data; name=\"" + name + "\"" + LINE_FEED +
                LINE_FEED +
                value + LINE_FEED;
        os.write(fieldData.getBytes());
    }

    private void writeFileField(OutputStream os, String fieldName, File file, String boundary, String LINE_FEED, String mimeType) throws Exception {
        String fileHeader = "--" + boundary + LINE_FEED +
                "Content-Disposition: form-data; name=\"" + fieldName + "\"; filename=\"" + file.getName() + "\"" + LINE_FEED +
                "Content-Type: " + mimeType + LINE_FEED +
                LINE_FEED;
        os.write(fileHeader.getBytes());

        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
        }

        os.write(LINE_FEED.getBytes());
    }

    private void writeFileStream(OutputStream os, String fieldName, String fileName, InputStream inputStream, String boundary, String LINE_FEED, String mimeType) throws Exception {
        String fileHeader = "--" + boundary + LINE_FEED +
                "Content-Disposition: form-data; name=\"" + fieldName + "\"; filename=\"" + fileName + "\"" + LINE_FEED +
                "Content-Type: " + mimeType + LINE_FEED +
                LINE_FEED;
        os.write(fileHeader.getBytes());

        byte[] buffer = new byte[4096];
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            os.write(buffer, 0, bytesRead);
        }

        os.write(LINE_FEED.getBytes());
    }

    private String getExtension(String mimeType) {
        if (mimeType.equals("image/jpeg")) return "jpg";
        if (mimeType.equals("image/png")) return "png";
        if (mimeType.equals("image/webp")) return "webp";
        return "bin";
    }

    private String getMimeTypeFromExtension(String fileName) {
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
        if (fileName.endsWith(".png")) return "image/png";
        if (fileName.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }

    private ForegroundInfo createForegroundInfo() {
        Context context = getApplicationContext();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Story Upload",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) manager.createNotificationChannel(channel);
        }

        Notification notification = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setContentTitle("Uploading story...")
                .setContentText("Your story is being uploaded in the background")
                .setSmallIcon(android.R.drawable.ic_menu_upload)
                .setOngoing(true)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return new ForegroundInfo(
                    2,
                    notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            );
        } else {
            return new ForegroundInfo(2, notification);
        }
    }

    private void updateUploadQueueFile(Context context, String local_id, boolean success) {
        try {
            File file = new File(context.getFilesDir(), "upload_queue.json");
            if (!file.exists()) return;

            FileInputStream fis = new FileInputStream(file);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int len;
            while ((len = fis.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
            fis.close();

            JSONArray queue = new JSONArray(baos.toString("UTF-8"));
            JSONArray updatedQueue = new JSONArray();

            for (int i = 0; i < queue.length(); i++) {
                JSONObject item = queue.getJSONObject(i);
                if (item.getString("local_id").equals(local_id)) {
                    if (!success) {
                        item.put("status", "FAILED");
                        updatedQueue.put(item);
                    }
                } else {
                    updatedQueue.put(item);
                }
            }

            FileOutputStream fos = new FileOutputStream(file, false);
            fos.write(updatedQueue.toString().getBytes());
            fos.close();

            Log.d(TAG, "Upload queue updated. Success=" + success);
        } catch (Exception e) {
            Log.e(TAG, "Failed to update upload queue", e);
        }
    }
}
