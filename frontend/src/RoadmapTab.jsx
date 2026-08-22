import { useEffect } from 'react'
import { useStore } from './store'

export default function RoadmapTab() {
  const { info, setInfo } = useStore()

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch('http://localhost:3030/api/info')
        const data = await res.json()
        setInfo(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchInfo()
  }, [setInfo])

  if (!info) return <div className="p-6">Loading...</div>

  const phases = [
    { name: 'Phase 1: Venom', status: 'Complete', desc: 'Portable Debian 13 SSD + Hyprland' },
    { name: 'Phase 2: Hive', status: 'In Progress', desc: '3-cage vault + sync + ProtonDrive' },
    { name: 'Phase 3: Carnage', status: 'Ready', desc: 'ACL + PII redaction + audit logging' },
    { name: 'Phase 4: Phage-Local', status: 'Pending', desc: 'Ollama models + air-gap inference' },
    { name: 'Phase 5: Tendril', status: 'In Progress', desc: 'Tor onion service + OTG jump-box' },
    { name: 'Phase 6: Toxin', status: 'Pending', desc: 'Android + LineageOS + Shelter' },
  ]

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Symbiote-OS Roadmap</h2>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p><span className="font-medium">Name:</span> {info.name}</p>
        <p><span className="font-medium">Version:</span> {info.version}</p>
        <p><span className="font-medium">Phase:</span> {info.phase}</p>
        <p><span className="font-medium">CLIs:</span> {info.clis.join(', ')}</p>
      </div>

      <div className="space-y-3">
        {phases.map((phase) => {
          const statusClass = {
            'Complete': 'bg-green-100 text-green-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Ready': 'bg-blue-100 text-blue-800',
            'Pending': 'bg-gray-100 text-gray-600',
          }[phase.status] || 'bg-gray-100 text-gray-600'

          return (
            <div key={phase.name} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{phase.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded ${statusClass}`}>{phase.status}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{phase.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
