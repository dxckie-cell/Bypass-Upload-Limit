export interface Settings {
	// Treat the current user as a Nitro subscriber.
	enabled: boolean
	// How many months ago the subscription is said to have started.
	months: number
	// Also raise the upload size limit Discord checks on your device.
	raiseLimit: boolean
	// The size limit to report, in MB.
	limitMb: number
	// What the last "too big" popup was opened from, to find the real size check.
	lastBlocked: string
}

export const DefaultSettings: Settings = {
	enabled: true,
	months: 0,
	raiseLimit: true,
	limitMb: 1024,
	lastBlocked: '',
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

export const clampMb = (value: unknown): number => {
	const mb = Math.floor(Number(value))
	return Number.isFinite(mb) ? Math.min(Math.max(mb, 1), 102400) : DefaultSettings.limitMb
}

export const limitBytes = (mb: number) => clampMb(mb) * 1024 * 1024

// Names of Discord's size-limit functions are not known, so any exported function that looks like
// one is patched. LIMIT returns a number of bytes, TOO_BIG answers whether a file is over the limit.
export const LIMIT_NAME = /^(get|use)?(max.*(file|upload|attachment)|(file|upload|attachment).*(limit|max))/i
export const TOO_BIG_NAME = /(file|upload|attachment).*(too(big|large)|exceed|overlimit)|(too(big|large)|exceed).*(file|upload|attachment)/i

export const limitKeys = (target: unknown): string[] => {
	const keys: string[] = []
	try {
		if (!target || (typeof target !== 'object' && typeof target !== 'function')) return keys
		for (const key of Object.keys(target as object)) {
			if ((LIMIT_NAME.test(key) || TOO_BIG_NAME.test(key)) && typeof (target as any)[key] === 'function') keys.push(key)
		}
	} catch {
		// A module that can't be read is skipped.
	}
	return keys
}
