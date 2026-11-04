import { getStore } from '@valenced/discord/flux'
import { getModules } from '@valenced/modules/finders'
import { withProps } from '@valenced/modules/finders/filters'
import { instead } from '@valenced/patcher'
import {
	clampMonths,
	DefaultSettings,
	LIMIT_FUNCTIONS,
	limitBytes,
	setRefresh,
	subscriberFields,
} from './shared'
import SettingsComponent from './settings'
import type { JsonStorage } from '@valenced/json-storage'
import type { Settings } from './shared'

type Row = Record<string, any>

const isRecord = (value: unknown): value is Row =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

let storage: JsonStorage<Settings> | undefined

function current(): Settings {
	return { ...DefaultSettings, ...(storage?.cache as Partial<Settings> | undefined) }
}

// The copies keep the original's prototype and are reused per day and setting.
const copies = new WeakMap<object, { key: string; copy: any }>()

// Returns a copy of the user or profile that Discord sees as a Nitro subscriber.
function asSubscriber(original: any) {
	const settings = current()
	if (!isRecord(original) || !settings.enabled) return original

	const fields = subscriberFields(clampMonths(settings.months))
	const key = String(fields.premium_since).slice(0, 10)
	const cached = copies.get(original)
	if (cached?.key === key) return cached.copy

	try {
		const copy = Object.create(Object.getPrototypeOf(original))
		for (const name of Reflect.ownKeys(original)) {
			const descriptor = Object.getOwnPropertyDescriptor(original, name)
			if (descriptor)
				Object.defineProperty(copy, name, {
					...descriptor,
					configurable: true,
					...('value' in descriptor ? { writable: true } : {}),
				})
		}
		for (const [name, value] of Object.entries(fields))
			Object.defineProperty(copy, name, {
				configurable: true,
				enumerable: true,
				writable: true,
				value,
			})
		copies.set(original, { key, copy })
		return copy
	} catch {
		return original
	}
}

export default plugin<{ jsonStorage: Settings }>({
	jsonStorage: { load: true, default: DefaultSettings },

	start({ cleanup, jsonStorage, plugin: self }) {
		// Enabling mid-session leaves the stores half-patched: ask for a reload instead.
		if (self.startedLate) {
			self.requireReload()
			return
		}

		storage = jsonStorage

		// Only your own user and profile are changed. Everyone else's stay as they are.
		let ownId: string | undefined
		let userStore: any

		cleanup(
			getStore('UserStore', (store: any) => {
				userStore = store

				cleanup(
					instead(store, 'getCurrentUser', function (args, original) {
						const user: any = Reflect.apply(original, this, args)
						if (user?.id) ownId = user.id
						return asSubscriber(user)
					}),
				)
				cleanup(
					instead(store, 'getUser', function (args, original) {
						const user: any = Reflect.apply(original, this, args)
						return ownId && args[0] === ownId ? asSubscriber(user) : user
					}),
				)
			}),
		)

		cleanup(
			getStore('UserProfileStore', (store: any) => {
				cleanup(
					instead(store, 'getUserProfile', function (args, original) {
						const profile: any = Reflect.apply(original, this, args)
						return ownId && args[0] === ownId ? asSubscriber(profile) : profile
					}),
				)
			}),
		)

		// The upload size limit Discord checks before sending a file. The server has the final say, so
		// this only lifts the check on your device.
		for (const name of LIMIT_FUNCTIONS) {
			cleanup(
				getModules(withProps(name), (module: any) => {
					if (typeof module?.[name] !== 'function') return
					try {
						cleanup(
							instead(module, name, function (args, original) {
								const settings = current()
								if (!settings.raiseLimit) return Reflect.apply(original, this, args)
								const real = Reflect.apply(original, this, args)
								const wanted = limitBytes(settings.limitMb)
								return typeof real === 'number' ? Math.max(real, wanted) : wanted
							}),
						)
					} catch {
						// A function that can't be patched is left alone.
					}
				}),
			)
		}

		setRefresh(() => userStore?.emitChange?.())
		cleanup(jsonStorage.subscribe(() => userStore?.emitChange?.()))

		cleanup(() => {
			setRefresh(undefined)
			storage = undefined
		})
	},

	// Unpatching can't undo what Discord already rendered.
	stop({ plugin: self }) {
		self.requireReload()
	},

	SettingsComponent,
})
