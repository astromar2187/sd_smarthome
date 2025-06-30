"use client"
import { Header } from "@/components/header"
import { SensorCard } from "@/components/sensor-card"
import { Footer } from "@/components/footer"
import { useSmartHomeData } from "@/hooks/use-smart-home-data"
import { useState, useEffect } from 'react';
import mqtt from 'mqtt';

export default function SmartHomeDashboard() {
  const { sensors, toggleDevice } = useSmartHomeData()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Status dos Dispositivos</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Monitoramento em tempo real dos sensores e atuadores da casa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sensors.map((sensor) => (
            <SensorCard
              key={sensor.id}
              sensor={sensor}
              onToggle={sensor.type === "actuator" ? () => toggleDevice(sensor.id) : undefined}
            />
          ))}
        </div>

        <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Resumo do Sistema</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {sensors.filter((s) => s.type === "sensor").length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Sensores Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sensors.filter((s) => s.type === "actuator" && s.status === "on").length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Dispositivos Ligados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {sensors
                  .filter((s) => s.sensorType === "temperature")
                  .reduce((avg, s) => avg + Number.parseFloat(s.value), 0) /
                  sensors.filter((s) => s.sensorType === "temperature").length || 0}
                °C
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Temp. Média</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {sensors
                  .filter((s) => s.sensorType === "humidity")
                  .reduce((avg, s) => avg + Number.parseFloat(s.value), 0) /
                  sensors.filter((s) => s.sensorType === "humidity").length || 0}
                %
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Umidade Média</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
