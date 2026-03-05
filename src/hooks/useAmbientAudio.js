import { useRef, useState } from "react";

export function useAmbientAudio() {
  const videoRef = useRef(null);

  const [song, setSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);

  const audioUrl =
    song?.downloadUrl?.[song.downloadUrl.length - 1]?.url;

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);

  const fadeTo = (target, duration = 800) => {
    const steps = 20;
    const diff = (target - volume) / steps;
    const stepTime = duration / steps;

    let current = volume;

    const interval = setInterval(() => {
      current += diff;
      if (
        (diff > 0 && current >= target) ||
        (diff < 0 && current <= target)
      ) {
        setVolume(target);
        clearInterval(interval);
      } else {
        setVolume(current);
      }
    }, stepTime);
  };

  return {
    videoRef,
    song,
    setSong,
    audioUrl,
    isPlaying,
    play,
    pause,
    volume,
    fadeTo,
  };
}
