"use client"

import { useState, useEffect } from "react"
import { Home, Wifi, WifiOff } from "lucide-react"

export function Header() {
  const [isConnected, setIsConnected] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simula conexão MQTT intermitente
    const connectionTimer = setInterval(() => {
      setIsConnected((prev) => (Math.random() > 0.1 ? true : !prev))
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(connectionTimer)
    }
  }, [])

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Smart Home Hub</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Monitor da Casa Inteligente</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {currentTime.toLocaleTimeString("pt-BR")}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {currentTime.toLocaleDateString("pt-BR")}
              </div>
            </div>

            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                isConnected
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span className="hidden sm:inline">{isConnected ? "Conectado" : "Desconectado"}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
