import { useEffect } from 'react'
import { useStore } from './store'

export default function HiveTab() {
  const { hive, brainState, setBrainState, setHive } = useStore()

  useEffect(() => {
    const fetchHive = async () => {
      try {
        const [h, b] = await Promise.all([
          fetch('http://localhost:3030/api/hive').then(r => r.json()),
          fetch('http://localhost:3030/api/brain-state').then(r => r.json()),
        ])
        setHive(h)
        setBrainState(b)
      } catch (err) {
        console.error(err)
      }
    }
    fetchHive()
  }, [setHive, setBrainState])

  if (!hive) return <div className="p-6">Loading Hive...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">The Hive — Vault Structure</h2>
      <p className="text-sm text-gray-500 mb-4">Root: {hive.root}</p>

      <div className="grid gap-4">
        {hive.cages.map((cage) => (
          <div
            key={cage.name}
            className={`p-4 rounded-lg border ${
              cage.locked
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <h3 className="font-semibold flex items-center gap-2">
              {cage.name}
              {cage.locked && (
                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                  LOCKED (700)
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Path: {cage.path} {cage.exists ? '✓' : '✗'}
            </p>
          </div>
        ))}
      </div>

      {brainState && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Brain State</h3>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            {JSON.stringify(brainState, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
