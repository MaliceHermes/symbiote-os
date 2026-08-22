import { useEffect } from 'react'
import { useStore } from './store'

// Symbiote OS Phase definitions with full metaphor mapping
const PHASES = [
  {
    id: 1,
    name: 'Venom',
    full: 'Phase 1: Venom',
    status: 'Complete',
    desc: 'Portable Debian 13 SSD + Hyprland window manager',
    detail: 'UEFI-bootable USB SSD with full agentic toolchain (Hermes, Codex, Ollama)',
    color: 'green',
    icon: '🧠',
    target: 'Q3 2026',
    issues: ['CI/CD pipeline', 'Install script', 'Frontend scaffold']
  },
  {
    id: 2,
    name: 'Hive',
    full: 'Phase 2: Hive',
    status: 'In Progress',
    desc: '3-cage vault — Life-OS, Business-Private, Claude-Brain',
    detail: 'Symlinked to MEGA for cross-surface sync. Carnage ACL enforces cage isolation.',
    color: 'yellow',
    icon: '🐝',
    target: 'Q3–Q4 2026',
    issues: ['Cage permissions matrix', 'Proton Drive integration', 'Brain state sync']
  },
  {
    id: 3,
    name: 'Carnage',
    full: 'Phase 3: Carnage',
    status: 'Complete',
    desc: 'ACL enforcement + PII redaction + audit logging',
    detail: 'Hermes (uid 996) blocked from Business-Private/ and .env files. Decisions logged to .carnage_audit.log.',
    color: 'red',
    icon: '🔪',
    target: 'Q3 2026',
    issues: ['Business-Private enforcement', 'PII redaction engine', 'Audit log API']
  },
  {
    id: 4,
    name: 'Phage-Local',
    full: 'Phase 4: Phage (Local)',
    status: 'Pending',
    desc: 'Ollama models for air-gap inference',
    detail: 'hermes3:8b, qwen2.5-coder:1.5b, phi4-mini, llama3.2:3b running locally on SSD',
    color: 'gray',
    icon: '🦠',
    target: 'Q4 2026',
    issues: ['Model selection policy', 'Local inference API', 'Prompt routing']
  },
  {
    id: 5,
    name: 'Tendril',
    full: 'Phase 5: Tendril',
    status: 'In Progress',
    desc: 'Tor onion service + OTG amnesic jump-box',
    detail: 'Onion service for cross-surface sync. Tails/LiveOS USB for air-gap bridging.',
    color: 'yellow',
    icon: '🕸️',
    target: 'Q4 2026–Q1 2027',
    issues: ['Onion service config', 'OTG Tails setup', 'Sync encryption']
  },
  {
    id: 6,
    name: 'Toxin',
    full: 'Phase 6: Toxin',
    status: 'Pending',
    desc: 'Android prototype (microG + LineageOS + Shelter)',
    detail: 'AVD Toxin-microG-API34 on AOSP x86_64. Syncthing for vault sync. Aurora Store + F-Droid.',
    color: 'gray',
    icon: ' 🧪',
    target: 'Q1–Q2 2027',
    issues: ['AVD microG setup', 'Syncthing config', 'App sandboxing']
  },
  {
    id: 7,
    name: 'Phage-Cloud',
    full: 'Phase 7: Phage (Cloud)',
    status: 'Pending',
    desc: 'OpenAI/Nous cloud LLM bridge (fallback for local)',
    detail: 'API keys stored in Business-Private cage. Cloud inference only when local fails.',
    color: 'gray',
    icon: '☁️',
    target: 'Q2 2027',
    issues: ['Key management', 'Bridge API', 'Usage billing']
  },
]

const statusConfig = {
  Complete: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-500',
    badge: 'bg-green-500',
    label: '✓ Complete'
  },
  'In Progress': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-500',
    badge: 'bg-yellow-500',
    label: '⋯ In Progress'
  },
  Pending: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-400',
    badge: 'bg-gray-400',
    label: '— Pending'
  },
}

export default function RoadmapTab() {
  const { info, setInfo, health } = useStore()

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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Symbiote-OS Roadmap</h2>
        <p className="text-sm text-gray-500 mt-1">
          {info.phase || 'Phase 1–5 in progress'} — {info.description || 'Local-first portable agentic OS'}
        </p>
      </div>

      {/* Phase timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-8">
          {PHASES.map((phase, index) => {
            const config = statusConfig[phase.status] || statusConfig.Pending
            const isActiveBorder = phase.status === 'In Progress' ? 'border-yellow-500' : config.border

            return (
              <div key={phase.id} className="relative flex items-start gap-6">
                {/* Phase number badge on timeline */}
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full text-white text-sm font-bold
                  ${config.badge} shadow-md
                `}>
                  {phase.id}
                </div>

                {/* Phase card */}
                <div className={`
                  flex-1 rounded-xl border-2 p-5 bg-white
                  ${isActiveBorder}
                  transition-shadow hover:shadow-md
                `}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">{phase.icon}</span>
                        {phase.full}
                      </h3>
                      <p className={`text-xs font-medium px-2 py-0.5 rounded ${config.bg} ${config.text} inline-block mt-1`}>
                        {config.label}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.text}`}>
                      Target: {phase.target}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{phase.desc}</p>
                  <p className="text-sm text-gray-500 mb-4">{phase.detail}</p>

                  {/* Issues checklist */}
                  {phase.issues.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Deliverables:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {phase.issues.map((issue, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Status indicator bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`
                      h-full ${config.badge.replace('bg-', 'bg-')} 
                      ${phase.status === 'Complete' ? 'w-full' : 'w-1/2'}
                    `}></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary footer */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Total phases: {PHASES.length}</span>
          <span>Complete: {PHASES.filter(p => p.status === 'Complete').length}</span>
          <span>In Progress: {PHASES.filter(p => p.status === 'In Progress').length}</span>
          <span>Pending: {PHASES.filter(p => p.status === 'Pending').length}</span>
        </div>
      </div>
    </div>
  )
}
