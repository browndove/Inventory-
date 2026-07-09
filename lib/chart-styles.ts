export const CHART_COLORS = {
  foreground: '#18181b',
  secondary: '#52525b',
  muted: '#71717a',
  border: '#e4e4e7',
  fill: '#f4f4f5',
} as const

export const chartAxisStyle = {
  fontSize: 12,
  fill: CHART_COLORS.muted,
}

export const chartGridStyle = {
  stroke: CHART_COLORS.border,
  strokeDasharray: '4 4',
  vertical: false,
}
