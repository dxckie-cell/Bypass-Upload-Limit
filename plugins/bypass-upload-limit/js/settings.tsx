import Page from '@valenced/components/Page'
import { Design } from '@valenced/discord/design'
import { useState } from 'react'
import { Text } from 'react-native'
import { clampMb, clampMonths, DefaultSettings, refreshUser } from './shared'
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
	const [limit, setLimit] = useState(String(settings.limitMb))

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
			<TableRowGroup title="Upload limit">
				<TableSwitchRow
					label="Raise the upload size limit"
					subLabel="Makes Discord's size check on your device allow bigger files. Discord's servers still decide what is really accepted."
					value={settings.raiseLimit !== false}
					onValueChange={(raiseLimit: boolean) => {
						storage.set({ raiseLimit })
						refreshUser()
					}}
				/>
			</TableRowGroup>
			<Stack spacing={16}>
				<TextInput
					label="Upload limit (MB)"
					placeholder="1024"
					size="md"
					value={limit}
					onChange={(value: string) => {
						setLimit(value)
						storage.set({ limitMb: clampMb(value) })
					}}
				/>
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
			{settings.lastBlocked ? (
				<TableRowGroup title="Last blocked (send a screenshot)">
					<Text selectable style={{ fontSize: 11 }}>
						{settings.lastBlocked}
					</Text>
				</TableRowGroup>
			) : null}
		</Page>
	)
}
