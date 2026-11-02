import Page from '@valenced/components/Page'
import { Design } from '@valenced/discord/design'
import { useState } from 'react'
import { clampMonths, DefaultSettings, refreshUser } from './shared'
import type { PluginSettingsComponent } from '@valenced/plugins/types'
import type { ComponentProps } from 'react'
import type { Settings } from './shared'

const { Stack, TableRowGroup, TableSwitchRow, TextInput } = Design

type Props = ComponentProps<PluginSettingsComponent<{ jsonStorage: Settings }>>

export default function SettingsComponent({
	api: { jsonStorage: storage },
}: Props) {
	const settings = { ...DefaultSettings, ...storage.use() }
	const [months, setMonths] = useState(String(settings.months))

	return (
		<Page>
			<TableRowGroup title="Nitro">
				<TableSwitchRow
					label="Treat me as a Nitro subscriber"
					subLabel="Makes Discord treat your own account as a Nitro subscriber, only on your device."
					value={settings.enabled !== false}
					onValueChange={(enabled: boolean) => {
						storage.set({ enabled })
						refreshUser()
					}}
				/>
			</TableRowGroup>
			<Stack spacing={16}>
				<TextInput
					label="Subscriber for (months)"
					placeholder="0"
					size="md"
					value={months}
					onChange={(value: string) => {
						setMonths(value)
						storage.set({ months: clampMonths(value) })
						refreshUser()
					}}
				/>
			</Stack>
		</Page>
	)
}
