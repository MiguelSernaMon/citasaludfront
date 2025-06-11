"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"

interface Notification {
  id: string
  message: string
  timestamp: string
  type: string
  // Agregamos un hash para detectar duplicados
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
  
  // Usamos useRef para asegurarnos de que solo creamos una conexión WebSocket
  const clientRef = useRef<Client | null>(null)
  
  // Usamos otro ref para rastrear las notificaciones procesadas recientemente
  const processedNotifications = useRef<Set<string>>(new Set())
  
  // Generar un hash simple para el contenido del mensaje (para detectar duplicados)
  const generateContentHash = (message: string, timestamp: number): string => {
    return `${message}-${Math.floor(timestamp / 10000)}` // Agrupar por franjas de 10 segundos
  }

  // Función para agregar una notificación de prueba
  // const addTestNotification = () => {
  //   console.log("Agregando notificación de prueba")
  //   const now = Date.now()
  //   const message = "Esta es una notificación de prueba"
  //   const contentHash = generateContentHash(message, now)
    
  //   // Verificar si ya procesamos una notificación similar recientemente
  //   if (processedNotifications.current.has(contentHash)) {
  //     console.log("Notificación duplicada detectada y omitida:", contentHash)
  //     return
  //   }
    
  //   // Marcar esta notificación como procesada
  //   processedNotifications.current.add(contentHash)
    
  //   // Eliminar notificaciones antiguas del registro (más de 30 segundos)
  //   setTimeout(() => {
  //     processedNotifications.current.delete(contentHash)
  //   }, 30000)
    
  //   setNotifications((prev) => [
  //     {
  //       id: `${now}-${Math.random().toString(36).substring(2, 9)}`, // ID verdaderamente único
  //       message: message,
  //       timestamp: new Date().toISOString(),
  //       type: "info",
  //       contentHash
  //     },
  //     ...prev
  //   ])
  // }

  // Función para formatear una fecha desde el array [año, mes, día, hora, minuto]
  const formatDate = (dateArray: number[]) => {
    if (!dateArray || dateArray.length < 5) return "Fecha no disponible";
    
    // Nota: En JavaScript los meses van de 0-11, mientras que en el array vienen 1-12
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

  // Función para convertir un mensaje Kafka a una notificación
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
  
  // Función para procesar y agregar una notificación evitando duplicados
  const addNotification = (notification: Notification) => {
    // Si la notificación no tiene un hash de contenido, generarlo
    if (!notification.contentHash) {
      notification.contentHash = generateContentHash(
        notification.message, 
        new Date(notification.timestamp).getTime()
      );
    }
    
    // Verificar si ya procesamos una notificación similar recientemente
    if (processedNotifications.current.has(notification.contentHash)) {
      console.log("Notificación duplicada detectada y omitida:", notification.contentHash);
      return;
    }
    
    // Marcar esta notificación como procesada
    processedNotifications.current.add(notification.contentHash);
    
    // Limpiar el registro después de un tiempo
    setTimeout(() => {
      processedNotifications.current.delete(notification.contentHash as string);
    }, 30000);
    
    setNotifications(prev => [notification, ...prev]);
  }

  useEffect(() => {
    console.log("Intentando conectar al WebSocket...")
    setConnectionStatus("connecting")
    
    // Agregar notificación de prueba al inicio para verificar que el sistema funciona
    // Pero solo la primera vez, con un pequeño retraso
    // const timeoutId = setTimeout(() => {
    //   addTestNotification();
    // }, 2000);
    
    // Evitar conexiones múltiples - verificar si ya tenemos un cliente
    // if (clientRef.current) {
    //   console.log("Ya existe una conexión WebSocket, reutilizando");
    //   return () => {
    //     clearTimeout(timeoutId);
    //   };
    // }
    
    try {
      // Configurar conexión WebSocket con opciones CORS
      const client = new Client({
        webSocketFactory: () => {
          const socket = new SockJS("http://localhost:8080/ws-mantenimiento", [], {
            transports: ['websocket', 'xhr-streaming', 'xhr-polling']
          });
          return socket;
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log("Conectado al servidor WebSocket")
          setConnectionStatus("connected")
          
          // Suscribirse al tema de notificaciones de mantenimiento
          client.subscribe("/topic/notificaciones/123", (message) => {
            console.log("Mensaje recibido:", message)
            try {
              console.log("Contenido del mensaje:", message.body);
              
              const kafkaMessage = JSON.parse(message.body) as KafkaMessage;
              console.log("Mensaje Kafka parseado:", kafkaMessage);
              
              // Procesar el mensaje específico de Kafka
              const notification = kafkaMessageToNotification(kafkaMessage);
              console.log("Notificación generada:", notification);
              
              addNotification(notification);
            } catch (error) {
              console.error("Error al procesar la notificación:", error)
              
              // Intentar usar el mensaje crudo como notificación
              const now = Date.now();
              const notificationMessage = `Nuevo mantenimiento: ${message.body}`;
              const contentHash = generateContentHash(notificationMessage, now);
              
              addNotification({
                id: `${now}-${Math.random().toString(36).substring(2, 9)}`,
                message: notificationMessage,
                timestamp: new Date().toISOString(),
                type: "info",
                contentHash
              });
            }
          })
          
          // También suscribirse a otros posibles tópicos
          client.subscribe("/topic/alerts", (message) => {
            try {
              const notification = JSON.parse(message.body)
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
              console.error("Error al procesar la alerta:", error)
            }
          })
        },
        onStompError: (frame) => {
          console.error("Error STOMP:", frame)
          setConnectionStatus("error")
        },
        onWebSocketError: (event) => {
          console.error("Error en WebSocket:", event)
          setConnectionStatus("error")
          
          // Solo mostrar notificación de error si no hay conexión activa
          // if (connectionStatus !== "connected") {
          //   // Agregar notificación de error para ver si el componente funciona
          //   setTimeout(() => {
          //     addTestNotification();
          //   }, 1000);
          // }
        },
        onWebSocketClose: () => {
          console.log("WebSocket cerrado")
          setConnectionStatus("disconnected")
          // Limpiar la referencia cuando la conexión se cierre
          clientRef.current = null;
        }
      })

      // Guardar referencia al cliente para evitar conexiones duplicadas
      clientRef.current = client;
      
      // Iniciar conexión
      client.activate()

      // Limpiar al desmontar
      return () => {
        // clearTimeout(timeoutId);
        if (client && client.connected) {
          console.log("Desactivando cliente WebSocket existente");
          client.deactivate()
        }
        clientRef.current = null;
      }
    } catch (error) {
      console.error("Error al configurar WebSocket:", error)
      setConnectionStatus("error")
      
      // Solo mostrar notificación de error si no hay conexión activa
      if (connectionStatus !== "connected") {
        // Agregar notificación de error para ver si el componente funciona
        setTimeout(() => {
          // addTestNotification();
        }, 1000);
      }
      
      return () => {
        // clearTimeout(timeoutId);
      };
    }
  }, [connectionStatus]) // Solo dependemos de connectionStatus para reconectar si es necesario

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
      connectionStatus,
      // addTestNotification
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}