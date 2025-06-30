"use client"

import { useState, useEffect } from "react"
import { Thermometer, Droplets, Lightbulb, DoorOpen, DoorClosed, Activity, AlertTriangle } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface Sensor {
  id: string
  name: string
  type: "sensor" | "actuator"
  sensorType: "temperature" | "humidity" | "light" | "door"
  value: string
  unit?: string
  status?: "on" | "off" | "open" | "closed"
  location: string
  lastUpdate: Date
}

interface SensorCardProps {
  sensor: Sensor
  onToggle?: () => void
}

export function SensorCard({ sensor, onToggle }: SensorCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }, [sensor.value, sensor.status])

  const getIcon = () => {
    switch (sensor.sensorType) {
      case "temperature":
        return <Thermometer className="h-6 w-6" />
      case "humidity":
        return <Droplets className="h-6 w-6" />
      case "light":
        return <Lightbulb className="h-6 w-6" />
      case "door":
        return sensor.status === "open" ? <DoorOpen className="h-6 w-6" /> : <DoorClosed className="h-6 w-6" />
      default:
        return <Activity className="h-6 w-6" />
    }
  }

  const getCardStyle = () => {
    if (sensor.type === "actuator" && sensor.sensorType === "light") {
      return sensor.status === "on"
        ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700"
        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    }

    if (sensor.sensorType === "door") {
      return sensor.status === "open"
        ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200 dark:from-red-900/20 dark:to-orange-900/20 dark:border-red-700"
        : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700"
    }

    return "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
  }

  const getIconStyle = () => {
    if (sensor.type === "actuator" && sensor.sensorType === "light") {
      return sensor.status === "on" ? "text-yellow-600 dark:text-yellow-400" : "text-slate-400 dark:text-slate-500"
    }

    if (sensor.sensorType === "temperature") {
      const temp = Number.parseFloat(sensor.value)
      if (temp > 25) return "text-red-500"
      if (temp < 18) return "text-blue-500"
      return "text-green-500"
    }

    if (sensor.sensorType === "humidity") {
      return "text-blue-500"
    }

    if (sensor.sensorType === "door") {
      return sensor.status === "open" ? "text-red-500" : "text-green-500"
    }

    return "text-slate-600 dark:text-slate-400"
  }

  const getStatusText = () => {
    if (sensor.type === "actuator") {
      return sensor.status === "on" ? "Ligada" : "Desligada"
    }
    if (sensor.sensorType === "door") {
      return sensor.status === "open" ? "Aberta" : "Fechada"
    }
    return null
  }

  const timeSinceUpdate = Math.floor((Date.now() - sensor.lastUpdate.getTime()) / 1000)
  const isStale = timeSinceUpdate > 60

  return (
    <div
      className={`rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md ${getCardStyle()} ${
        isAnimating ? "scale-105" : "scale-100"
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-700 ${getIconStyle()}`}>{getIcon()}</div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{sensor.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{sensor.location}</p>
            </div>
          </div>

          {isStale && <AlertTriangle className="h-4 w-4 text-amber-500" title="Dados desatualizados" />}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              {sensor.type === "sensor" ? (
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{sensor.value}</span>
                  {sensor.unit && <span className="text-sm text-slate-500 dark:text-slate-400">{sensor.unit}</span>}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-lg font-semibold ${
                      sensor.status === "on"
                        ? "text-green-600 dark:text-green-400"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {getStatusText()}
                  </span>
                </div>
              )}
            </div>

            {sensor.type === "actuator" && onToggle && (
              <Switch
                checked={sensor.status === "on"}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-green-600"
              />
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Atualizado há {timeSinceUpdate}s</span>
            <div
              className={`w-2 h-2 rounded-full ${
                timeSinceUpdate < 30 ? "bg-green-400" : timeSinceUpdate < 60 ? "bg-yellow-400" : "bg-red-400"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
