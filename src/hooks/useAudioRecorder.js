import { useState, useRef } from "react";
import { Platform } from "react-native";
import Sound from "react-native-nitro-sound";

export const useAudioRecorder = (maxBars = 25) => {
  const SAFE_MAX_BARS = Math.min(Math.max(maxBars, 15), 25);

  const [isRecording, setIsRecording] = useState(false);
  const [waveform, setWaveform] = useState([]);
   
  const startTimeRef = useRef(0);
  const hasListenerRef = useRef(false);

  // --------------------
  // START RECORDING
  // --------------------
  const startRecording = async () => {
    try {
      setWaveform([]);
      startTimeRef.current = Date.now();

      // ✅ Let Nitro Sound decide file path
      await Sound.startRecorder(undefined, undefined, true);

      Sound.addRecordBackListener((e) => {
        const metering = Math.max(-160, Math.min(0, e.currentMetering ?? -160));
        const normalized = (metering + 160) / 160;

        setWaveform((prev) => {
          const next = [...prev, normalized];
          return next.length > SAFE_MAX_BARS ? next.slice(1) : next;
        });
      });

      hasListenerRef.current = true;
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setIsRecording(false);
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

      const duration = (Date.now() - startTimeRef.current) / 1000;
      const waveformSnapshot = [...waveform];

      return {
        audioUrl: `file://${audioPath}`,
        waveform: compressWaveform(waveformSnapshot, SAFE_MAX_BARS),
        duration,
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

  return {
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    waveform,
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
    return slice.length ? Math.max(...slice) : 0;
  });
};
