export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 md:mb-0">
            Projeto com fins educacionais © 2025.1 Sistemas Distribuídos UFPI.
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
            <a href="https://www.flaticon.com/br/icones-gratis/wi-fi" title="wi-fi ícones">Atribuição: Wi-fi ícones criados por Freepik - Flaticon</a>
            <span>•</span>
            <span>Docker, MQTT, Next.js e Python</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
