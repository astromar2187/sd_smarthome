export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 md:mb-0">
            © 2024 Smart Home Hub. Sistema de monitoramento residencial.
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
            <span>Versão 1.0.0</span>
            <span>•</span>
            <span>MQTT Conectado</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
