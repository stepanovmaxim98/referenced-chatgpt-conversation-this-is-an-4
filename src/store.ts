export type SavedPrompt = { id: string; title: string; content: string; createdAt: string }
export type LabEntry = { id: string; title: string; goal: string; output: string; reflection: string; createdAt: string }

export type AppData = {
  guideCompleted: string[]
  scenarioCompleted: string[]
  safetyAnswers: Record<string, number>
  savedPrompts: SavedPrompt[]
  labEntries: LabEntry[]
}

export const storageKey = 'generative-ai-education-v1'

export const initialAppData: AppData = {
  guideCompleted: [],
  scenarioCompleted: [],
  safetyAnswers: {},
  savedPrompts: [],
  labEntries: [],
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return initialAppData
    const parsed = JSON.parse(raw) as Partial<AppData>
    return {
      guideCompleted: Array.isArray(parsed.guideCompleted) ? parsed.guideCompleted : [],
      scenarioCompleted: Array.isArray(parsed.scenarioCompleted) ? parsed.scenarioCompleted : [],
      safetyAnswers: parsed.safetyAnswers && typeof parsed.safetyAnswers === 'object' ? parsed.safetyAnswers : {},
      savedPrompts: Array.isArray(parsed.savedPrompts) ? parsed.savedPrompts : [],
      labEntries: Array.isArray(parsed.labEntries) ? parsed.labEntries : [],
    }
  } catch {
    return initialAppData
  }
}
