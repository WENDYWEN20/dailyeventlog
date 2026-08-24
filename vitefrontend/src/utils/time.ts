export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes}m`
  }

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function generateQuarterHourOptions(): string[] {
  return Array.from({ length: 24 * 4 }, (_, index) => {
    const totalMinutes = index * 15
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  })
}

export function formatTimeLabel(value: string): string {
  const [hours, minutes] = value.split(':').map(Number)
  const date = new Date()

  date.setHours(hours, minutes, 0, 0)

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)

  return hours * 60 + minutes
}

export function calculateDurationMinutes(
  startTime: string,
  endTime: string,
): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime)
}
