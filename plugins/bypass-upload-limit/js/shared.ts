export interface Settings {
	// Treat the current user as a Nitro subscriber.
	enabled: boolean
	// How many months ago the subscription is said to have started.
	months: number
}

export const DefaultSettings: Settings = {
	enabled: true,
	months: 0,
}

let refresh: (() => void) | undefined

export const setRefresh = (fn: (() => void) | undefined) => {
	refresh = fn
}

// Makes Discord ask its stores again, so a changed setting shows straight away.
export const refreshUser = () => {
	try {
		refresh?.()
	} catch {
		// Never break the settings over a redraw.
	}
}

export const clampMonths = (value: unknown): number => {
	const months = Math.floor(Number(value))
	return Number.isFinite(months) ? Math.min(Math.max(months, 0), 240) : 0
}

// The profile fields that make Discord treat you as a Nitro subscriber since `months` ago.
export function subscriberFields(months: number): Record<string, unknown> {
	const since = new Date()
	since.setMonth(since.getMonth() - months)
	since.setHours(12, 0, 0, 0)
	return {
		premiumType: 2,
		premium_type: 2,
		premiumSince: since,
		premium_since: since.toISOString(),
	}
}
