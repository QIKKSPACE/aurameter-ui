import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { ensureFreshToken } from "../services/tokenManager";

export default function useAuraChatSocket(onNewMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function initSocket() {
      const token = await ensureFreshToken(); // ensures fresh JWT

      socketRef.current = io("http://localhost:5001/aurachat", {
        auth: { token },
        autoConnect: true, // default true
      });

      // Auto refresh token on reconnect attempts
      socketRef.current.io.on("reconnect_attempt", async () => {
        const newToken = await ensureFreshToken(); // get fresh token
        socketRef.current.auth = { token: newToken }; // update socket auth
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current.id);
      });

      socketRef.current.on("new-aura-reply", (data) => {
        console.log("New Aura reply:", data);
        onNewMessage(data);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }

    if (isMounted) initSocket();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
}
