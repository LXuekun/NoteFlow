import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '../types'

interface ThemeState {
  mode: Theme
  accentColor: string

  // 操作
  setMode: (mode: Theme) => void
  setAccentColor: (color: string) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      accentColor: '#3b82f6',

      setMode: (mode) => set({ mode }),
      setAccentColor: (color) => set({ accentColor: color }),
    }),
    {
      name: 'noteflow-theme',
    }
  )
)