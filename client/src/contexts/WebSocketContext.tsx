// contexts/WebSocketContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";

type WebSocketContextType = {
  socket: Socket | null;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  leaveAllRooms: () => void;
};

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  joinRoom: () => {},
  leaveRoom: () => {},
  leaveAllRooms: () => {},
});

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "", {
      path: "/socket.io",
      transports: ["websocket"],
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = useCallback((room: string) => {
    if (socket) {
      socket.emit("join", room);
    }
  }, [socket]);

  const leaveRoom = useCallback((room: string) => {
    if (socket) {
      socket.emit("leave", room);
    }
  }, [socket]);

  const leaveAllRooms = useCallback(() => {
    if (socket) {
      // You might need to track rooms on the client side if you need this
      // For now, we'll rely on the server to handle this
    }
  }, [socket]);

  return (
    <WebSocketContext.Provider value={{ socket, joinRoom, leaveRoom, leaveAllRooms }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);