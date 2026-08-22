import { create } from 'zustand'

export const useStore = create((set) => ({
  health: { status: 'checking', service: 'symbiote-orchestrator', uptime: 0, hive: '', timestamp: '' },
  info: null,
  hive: null,
  brainState: null,
  chats: [],
  carnage: [],
  ollama: null,
  activeTab: 'hive',
  setHealth: (health) => set({ health }),
  setInfo: (info) => set({ info }),
  setHive: (hive) => set({ hive }),
  setBrainState: (state) => set({ brainState: state }),
  setChats: (chats) => set({ chats }),
  setCarnage: (entries) => set({ carnage: entries }),
  setOllama: (data) => set({ ollama: data }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  fetchAll: async () => {
    const base = 'http://localhost:3030'
    try {
      const [healthRes, infoRes, hiveRes, brainRes, chatsRes, carnageRes, ollamaRes] = await Promise.all([
        fetch(`${base}/api/health`),
        fetch(`${base}/api/info`),
        fetch(`${base}/api/hive`),
        fetch(`${base}/api/brain-state`),
        fetch(`${base}/api/chats`),
        fetch(`${base}/api/carnage`),
        fetch(`${base}/api/ollama/tags`),
      ])
      set({
        health: await healthRes.json(),
        info: await infoRes.json(),
        hive: await hiveRes.json(),
        brainState: await brainRes.json(),
        chats: (await chatsRes.json()).chats || [],
        carnage: (await carnageRes.json()).entries || [],
        ollama: await ollamaRes.json(),
      })
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }
}))
