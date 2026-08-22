import { useEffect } from 'react'
import { useStore } from './store'

export default function CarnageTab() {
  const { carnage, setCarnage } = useStore()

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await fetch('http://localhost:3030/api/carnage')
        const data = await res.json()
        setCarnage(data.entries || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchAudit()
  }, [setCarnage])

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Carnage — Audit Log</h2>

      {carnage.length === 0 ? (
        <p className="text-gray-500">No audit entries yet.</p>
      ) : (
        <div className="space-y-3">
          {carnage.map((entry, i) => (
            <div key={entry.id || i} className="p-3 bg-gray-50 rounded-lg border">
              {entry.timestamp && <p className="text-xs text-gray-500">{entry.timestamp}</p>}
              <pre className="text-xs text-gray-700 mt-1 overflow-x-auto">
                {JSON.stringify(entry, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
