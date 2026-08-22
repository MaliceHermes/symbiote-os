import { useEffect } from 'react'
import { useStore } from './store'

export default function ChatsTab() {
  const { chats, setChats } = useStore()

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch('http://localhost:3030/api/chats')
        const data = await res.json()
        setChats(data.chats || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchChats()
  }, [setChats])

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Chats</h2>

      {chats.length === 0 ? (
        <p className="text-gray-500">No chats yet. Be the first to send a message!</p>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <div key={chat.id} className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-500">{new Date(chat.timestamp).toLocaleString()}</p>
              <div className="mt-1 text-sm">
                {chat.prompt && <div><span className="font-medium">Prompt:</span> {chat.prompt}</div>}
                {chat.response && <div className="mt-1"><span className="font-medium">Response:</span> {chat.response}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const prompt = e.target.elements.prompt.value.trim()
          if (!prompt) return
          await fetch('http://localhost:3030/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          })
          e.target.reset()
          // Re-fetch
          const res = await fetch('http://localhost:3030/api/chats')
          const data = await res.json()
          setChats(data.chats || [])
        }}
        className="mt-4 flex gap-2"
      >
        <input
          name="prompt"
          placeholder="Type a prompt for Hermes/Codex..."
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  )
}
