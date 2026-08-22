import { useEffect } from 'react'
import { useStore } from './store'

export default function OllamaTab() {
  const { ollama, setOllama } = useStore()

  useEffect(() => {
    const fetchOllama = async () => {
      try {
        const res = await fetch('http://localhost:3030/api/ollama/tags')
        const data = await res.json()
        setOllama(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchOllama()
    const interval = setInterval(fetchOllama, 10000)
    return () => clearInterval(interval)
  }, [setOllama])

  if (!ollama) return <div className="p-6">Loading Ollama...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Ollama — Local Models</h2>

      {ollama.models && ollama.models.length === 0 ? (
        <p className="text-gray-500">No models installed. Run <code className="bg-gray-200 px-1 rounded">ollama pull mistral</code> to add one.</p>
      ) : (
        <div className="space-y-3">
          {ollama.models?.map((model) => (
            <div key={model.model} className="p-3 border rounded-lg">
              <h3 className="font-semibold">{model.model}</h3>
              <p className="text-sm text-gray-600">
                {(model.size / (1024 ** 3)).toFixed(2)} GB · {new Date(model.modified_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
