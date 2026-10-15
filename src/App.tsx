import React from 'react'
import { Dashboard } from './pages/Dashboard'
import { OperationsPage } from './pages/Operations'
import { CardsPage } from './pages/Cards'
import { SettingsPage } from './pages/Settings'

export default function App() {
  const [route, setRoute] = React.useState('dashboard')

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 bg-white border-r px-4 py-6">
        <h1 className="text-lg font-semibold mb-4">Учёт RUB ↔ USDT</h1>
        <nav className="space-y-2 text-sm">
          <button className="w-full text-left" onClick={() => setRoute('dashboard')}>Главная</button>
          <button className="w-full text-left" onClick={() => setRoute('operations')}>Все операции</button>
          <button className="w-full text-left" onClick={() => setRoute('cards')}>Карты</button>
          <button className="w-full text-left" onClick={() => setRoute('settings')}>Настройки</button>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {route === 'dashboard' && <Dashboard />}
        {route === 'operations' && <OperationsPage />}
        {route === 'cards' && <CardsPage />}
        {route === 'settings' && <SettingsPage />}
      </main>
    </div>
  )
}
