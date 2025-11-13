import type { Interactable } from './lib/discord/Interactable'
import { jamInteractables } from './modules/jams/messages'
import { settingsInteractables } from './modules/settings/messages'

export const interactables: Interactable[] = [...jamInteractables, ...settingsInteractables]
