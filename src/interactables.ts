import type { Interactable } from './lib/discord/Interactable'
import { settingsInteractables } from './modules/settings/messages'
import { themeInteractables } from './modules/theme/messages'

export const interactables: Interactable[] = [...themeInteractables, ...settingsInteractables]
