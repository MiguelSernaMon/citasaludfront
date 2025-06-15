"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"

interface Notification {
  id: string
  message: string
  timestamp: string
  type: string
  contentHash?: string
}

interface KafkaMessage {
  consultorioId: number
  fechaInicio: number[]
  fechaFin: number[]
  motivo: string
  coordinadorUserId: number
}

interface NotificationContextType {
  notifications: Notification[]
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
  connectionStatus: string
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  clearNotification: () => {},
  clearAllNotifications: () => {},
  connectionStatus: "disconnected",
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")
  
  const clientRef = useRef<Client | null>(null)
  const processedNotifications = useRef<Set<string>>(new Set())
  const connectAttemptRef = useRef<number>(0)
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)

  const WEBSOCKED_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:8080/ws-mantenimiento";

  
  const generateContentHash = (message: string, timestamp: number): string => {
    return `${message}-${Math.floor(timestamp / 10000)}`
  }

  const formatDate = (dateArray: number[]) => {
    if (!dateArray || dateArray.length < 5) return "Fecha no disponible";
    
    const [year, month, day, hour, minute] = dateArray;
    const date = new Date(year, month-1, day, hour, minute);
    return date.toLocaleString('es-ES', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const kafkaMessageToNotification = (kafkaMessage: KafkaMessage): Notification => {
    const fechaInicio = formatDate(kafkaMessage.fechaInicio);
    const fechaFin = formatDate(kafkaMessage.fechaFin);
    const message = `Mantenimiento en consultorio ${kafkaMessage.consultorioId}: "${kafkaMessage.motivo}" programado desde ${fechaInicio} hasta ${fechaFin}`;
    const now = Date.now();
    const contentHash = generateContentHash(message, now);
    
    return {
      id: `${now}-${Math.random().toString(36).substring(2, 9)}`,
      message,
      timestamp: new Date().toISOString(),
      type: "warning",
      contentHash
    };
  };
  
  const addNotification = (notification: Notification) => {
    if (!notification.contentHash) {
      notification.contentHash = generateContentHash(
        notification.message, 
        new Date(notification.timestamp).getTime()
      );
    }
    
    if (processedNotifications.current.has(notification.contentHash)) {
      console.log("Notificación duplicada detectada y omitida:", notification.contentHash);
      return;
    }
    
    processedNotifications.current.add(notification.contentHash);
    
    setTimeout(() => {
      processedNotifications.current.delete(notification.contentHash as string);
    }, 30000);
    
    setNotifications(prev => [notification, ...prev]);
  }

  const setupStompClient = () => {
    if (clientRef.current && clientRef.current.active) {
      return;
    }

    // Si hay demasiados intentos, esperar más tiempo antes de reintentar
    if (connectAttemptRef.current > 5) {
      console.log("[DEBUG] Demasiados intentos, esperando 30 segundos antes de reintentar");
      setConnectionStatus("waiting");
      
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      
      reconnectTimerRef.current = setTimeout(() => {
        connectAttemptRef.current = 0;
        setConnectionStatus("disconnected");
      }, 30000);
      
      return;
    }

    connectAttemptRef.current += 1;
    console.log(`[DEBUG] Intento de conexión #${connectAttemptRef.current}`);
    
    try {
      const client = new Client({
        webSocketFactory: () => {
          console.log(`[DEBUG] Creando SockJS con URL ${WEBSOCKED_URL}`);
          return new SockJS(WEBSOCKED_URL);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (msg) => console.log("[DEBUG STOMP]", msg),
        onConnect: (frame) => {
          console.log("[DEBUG] STOMP conectado con frame:", frame);
          setConnectionStatus("connected");
          connectAttemptRef.current = 0;

          console.log("[DEBUG] Suscribiendo a /topic/notificaciones/123");
          client.subscribe("/topic/notificaciones", (message) => {
            console.log("[DEBUG] Mensaje recibido en /topic/notificaciones/123:", message);
            try {
              const kafkaMessage = JSON.parse(message.body) as KafkaMessage;
              console.log("[DEBUG] KafkaMessage parseado:", kafkaMessage);
              const notification = kafkaMessageToNotification(kafkaMessage);
              console.log("[DEBUG] Notificación creada:", notification);
              addNotification(notification);
            } catch (error) {
              console.error("[DEBUG] Error al parsear el mensaje de Kafka:", error);
            }
          });

          console.log("[DEBUG] Suscribiendo también a /topic/alerts");
          client.subscribe("/topic/alerts", (message) => {
            console.log("[DEBUG] Alerta recibida:", message.body);
            try {
              const notification = JSON.parse(message.body);
              const now = Date.now();
              const msg = notification.message || "Nueva alerta recibida";
              const contentHash = generateContentHash(msg, now);
              addNotification({ 
                id: `${now}-${Math.random().toString(36).substring(2, 9)}`,
                message: msg,
                timestamp: new Date().toISOString(), 
                type: notification.type || "info",
                contentHash
              });
            } catch (error) {
              console.error("[DEBUG] Error al parsear la alerta:", error);
            }
          });
        },
        onWebSocketError: (event) => {
          console.error("[DEBUG] Error en WebSocket:", event);
          setConnectionStatus("error");
        },
        onWebSocketClose: (event) => {
          console.warn("[DEBUG] WebSocket cerrado:", event);
          clientRef.current = null;
        },
        onStompError: (frame) => {
          console.error("[DEBUG] Error STOMP:", frame);
          setConnectionStatus("error");
        }
      });

      clientRef.current = client;
      console.log("[DEBUG] Activando STOMP.");
      client.activate();
    } catch (error) {
      console.error("[DEBUG] Excepción al preparar STOMP:", error);
      setConnectionStatus("error");
    }
  };

  useEffect(() => {
    console.log("[DEBUG] Intentando preparar WebSocket.");
    setConnectionStatus("connecting");
    setupStompClient();

    return () => {
      console.log("[DEBUG] Limpieza de STOMP.");
      if (clientRef.current && clientRef.current.active) {
        console.log("[DEBUG] Desactivando.");
        clientRef.current.deactivate();
      }
      
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      
      clientRef.current = null;
    }
  }, []); // Sin dependencias para evitar ciclos

  // Efecto para manejar reconexiones cuando hay errores
  useEffect(() => {
    if (connectionStatus === "error" || connectionStatus === "disconnected") {
      const timer = setTimeout(() => {
        if (!clientRef.current || !clientRef.current.active) {
          console.log("[DEBUG] Intentando reconexión tras estado:", connectionStatus);
          setupStompClient();
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }
  
  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      clearNotification, 
      clearAllNotifications,
      connectionStatus
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}