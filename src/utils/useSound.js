import { useRef } from "react";

export default function useSound() {
  const enabledRef = useRef(false);
  const setEnabled = (v) => (enabledRef.current = v);
  return {
    enabled: enabledRef.current,
    setEnabled,
    playMove: () => {},
    playWin: () => {},
  };
}