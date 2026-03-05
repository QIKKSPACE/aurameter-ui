// src/hooks/useStoryUploadEvents.ts
import { useEffect } from "react";
import { NativeModules, NativeEventEmitter } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateStoryStatuses } from "../store/storySlice";
import { updateUploadStatus } from "../utils/UploadQueue";
import { useToast } from "../constants/context/ErrorContext";

const { WorkManagerModule } = NativeModules;

export const useStoryUploadEvents = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const userId = useSelector(s => s.user?.userData?.id);

  useEffect(() => {
    if (!WorkManagerModule) return;

    const emitter = new NativeEventEmitter(WorkManagerModule);

    const sub = emitter.addListener("storyUploadEvent", async (event = {}) => {
      const { status, story_id, blurhash, local_id } = event;

      const update = { local_id };

      if (status === "FAILED_SERVER") {
        update.status = "FAILED";
        showToast("Unable to send story, retry again!", "error");
      }

      if (status === "PENDING") {
        update.status = "PENDING";
        update.story_id = story_id;
        update.blurhash = blurhash;
      }

      await updateUploadStatus(update);
      dispatch(updateStoryStatuses([update]));
    });

    return () => sub.remove();
  }, [userId]);
};
