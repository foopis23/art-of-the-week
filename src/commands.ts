import { pingCommands } from '@/modules/ping/commands'
import { settingsCommands } from '@/modules/settings/commands'
import { themeCommands } from '@/modules/theme/commands'

export const commands = [...pingCommands, ...themeCommands, ...settingsCommands]
