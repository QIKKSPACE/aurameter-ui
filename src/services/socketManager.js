import io from "socket.io-client";
import { store } from "../store/store";

const sockets = {}; // singleton per namespace

export const getSocket = (namespace, listeners = {}) => {
  // ---- normalize namespace ----
  const ns = `/${namespace.replace(/^\//, "")}`;
  let socket = sockets[ns];
//https://api.aurameter.in
  // ---- reuse socket if exists ----
  if (socket) {
    // reconnect if needed
    if (!socket.connected) {
      socket.connect();
    }

    // safely update listeners
    Object.entries(listeners).forEach(([event, callback]) => {
      socket.off(event, callback);
      socket.on(event, callback);
    });

    return socket;
  }

  // ---- create new socket ----
  socket = io(`https://api.aurameter.in${ns}`, {
    // dynamic token on every connection attempt
    auth: (cb) => {
      const token = store.getState().user?.token;
      cb({ token });
    },

    transports: ["polling", "websocket"], // polling first → upgrades automatically
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
  });

  // ---- base events ----
  socket.on("connect", () => {
    console.log(`[${ns}] connected`, socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[${ns}] disconnected`, reason);
  });

  socket.on("connect_error", (err) => {
    console.log(`[${ns}] connect_error`, err.message);
  });

  // ---- attach listeners ----
  Object.entries(listeners).forEach(([event, callback]) => {
    socket.on(event, callback);
  });

  sockets[ns] = socket;
  return socket;
};

export const disconnectAllSockets = () => {
  Object.keys(sockets).forEach((ns) => {
    sockets[ns].removeAllListeners();
    sockets[ns].disconnect();
    delete sockets[ns];
    console.log(`[${ns}] socket destroyed`);
  });
};
