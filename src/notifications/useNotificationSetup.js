// notifications/useNotificationSetup.js
import { useEffect } from "react";
import { Platform, PermissionsAndroid, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveFcmToken } from "../utils/saveFcmToken";
import { NOTIFICATION_ATTEMPTS_KEY } from "./notificationKeys";

export const useNotificationSetup = (userId) => {
  useEffect(() => {
    if (!userId) return;
    if (Platform.OS !== "android") return;

    const setupNotifications = async () => {
      try {
        let granted = true;

        if (Platform.Version >= 33) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          granted = result === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (granted) {
          await saveFcmToken(userId);
          return;
        }

        // Permission denied → show prompt occasionally
        let attempts = parseInt(
          await AsyncStorage.getItem(NOTIFICATION_ATTEMPTS_KEY),
          10
        );

        if (isNaN(attempts)) attempts = 0;

        if (attempts === 0 || attempts % 10 === 0) {
          showPrompt(userId);
        }

        await AsyncStorage.setItem(
          NOTIFICATION_ATTEMPTS_KEY,
          String(attempts + 1)
        );
      } catch (err) {
        console.log("Notification setup error:", err);
      }
    };

    const showPrompt = (userId) => {
      Alert.alert(
        "Enable Notifications",
        "Turn on notifications to get instant updates.",
        [
          { text: "Not now", style: "cancel" },
          {
            text: "Enable",
            onPress: async () => {
              try {
                const result = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                if (result === PermissionsAndroid.RESULTS.GRANTED) {
                  await saveFcmToken(userId);
                }
              } catch (e) {
                console.log("Notification permission error:", e);
              }
            },
          },
        ]
      );
    };

    setupNotifications();
  }, [userId]);
};
