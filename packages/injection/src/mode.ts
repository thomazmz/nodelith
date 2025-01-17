export const Mode = ['spread', 'bundle'] as const

export type Mode = typeof Mode[number]