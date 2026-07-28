import { useState, useRef, useEffect } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import Sound from "react-native-nitro-sound";

export const useAudioRecorder = (maxBars = 25) => {
  const SAFE_MAX_BARS = Math.min(Math.max(maxBars, 15), 25);

  const [isRecording, setIsRecording] = useState(false);
  const [waveform, setWaveform] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(null); // 👈 NEW

  const startTimeRef = useRef(0);
  const hasListenerRef = useRef(false);

  // --------------------
  // REQUEST PERMISSION
  // --------------------
 const requestPermission = async () => {
  if (Platform.OS !== "android") {
    setPermissionGranted(true);
    return {
      granted: true,
      wasAlreadyGranted: true,
    };
  }

  try {
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );

    if (alreadyGranted) {
      setPermissionGranted(true);

      return {
        granted: true,
        wasAlreadyGranted: true,
      };
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );

    const granted =
      result === PermissionsAndroid.RESULTS.GRANTED;

    setPermissionGranted(granted);

    return {
      granted,
      wasAlreadyGranted: false,
    };
  } catch (err) {
    console.error(err);

    return {
      granted: false,
      wasAlreadyGranted: false,
    };
  }
};

  // --------------------
  // START RECORDING
  // --------------------
 const startRecording = async () => {
  try {
    const permission = await requestPermission();

    // User denied permission
    if (!permission.granted) {
      console.log("Mic permission denied");
      return false;
    }

    // Permission was just granted from popup
    // Require user to tap mic again
    if (!permission.wasAlreadyGranted) {
      console.log("Mic permission granted. Tap again to record.");
      return false;
    }

    if (isRecording) return true;

    setWaveform([]);
    startTimeRef.current = Date.now();

    try {
      await Sound.stopRecorder();
    } catch (_) {}

    await Sound.startRecorder(undefined, undefined, true);

    Sound.addRecordBackListener((e) => {
      const metering = Math.max(
        -160,
        Math.min(0, e.currentMetering ?? -160)
      );

      const normalized = (metering + 160) / 160;

      setWaveform((prev) => {
        const next = [...prev, normalized];
        return next.length > SAFE_MAX_BARS
          ? next.slice(1)
          : next;
      });
    });

    hasListenerRef.current = true;
    setIsRecording(true);

    return true;
  } catch (err) {
    console.error("Failed to start recording:", err);

    if (hasListenerRef.current) {
      Sound.removeRecordBackListener();
      hasListenerRef.current = false;
    }

    setIsRecording(false);
    return false;
  }
};

  // --------------------
  // STOP RECORDING
  // --------------------
  const stopRecording = async () => {
    try {
      if (!isRecording) return null;

      const audioPath = await Sound.stopRecorder();

      if (hasListenerRef.current) {
        Sound.removeRecordBackListener();
        hasListenerRef.current = false;
      }

      setIsRecording(false);

      const durationMs = Date.now() - startTimeRef.current;
      if (durationMs < 800) return null;

      const normalizedPath = audioPath.startsWith("file://")
        ? audioPath
        : `file://${audioPath}`;

      const waveformSnapshot = [...waveform];

      return {
        audioUrl: normalizedPath,
        waveform: compressWaveform(waveformSnapshot, SAFE_MAX_BARS),
        duration: Math.max(1, Math.round(durationMs / 1000)),
      };
    } catch (err) {
      console.error("Failed to stop recording:", err);
      setIsRecording(false);
      return null;
    }
  };

  // --------------------
  // CANCEL RECORDING
  // --------------------
  const cancelRecording = async () => {
    try {
      if (!isRecording) return;

      await Sound.stopRecorder();

      if (hasListenerRef.current) {
        Sound.removeRecordBackListener();
        hasListenerRef.current = false;
      }

      setWaveform([]);
      setIsRecording(false);
    } catch (err) {
      console.error("Failed to cancel recording:", err);
      setIsRecording(false);
    }
  };

  // --------------------
  // CLEANUP (IMPORTANT)
  // --------------------
  useEffect(() => {
    return () => {
      if (hasListenerRef.current) {
        Sound.removeRecordBackListener();
        hasListenerRef.current = false;
      }
    };
  }, []);

  return {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    waveform,
    permissionGranted, // 👈 expose to UI
  };
};

// --------------------
// WAVEFORM COMPRESSOR
// --------------------
const compressWaveform = (data, bars) => {
  if (!data || data.length === 0) return Array(bars).fill(0);

  const blockSize = Math.ceil(data.length / bars);

  return Array.from({ length: bars }).map((_, i) => {
    const slice = data.slice(i * blockSize, (i + 1) * blockSize);
    if (!slice.length) return 0;

    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    const peak = Math.max(...slice);

    return (avg + peak) / 2; // smoother waveform
  });
};
