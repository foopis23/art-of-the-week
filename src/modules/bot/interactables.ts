import type { Interactable } from '../../lib/discord/Interactable'
import { jamInteractables } from '../jams/messages'
import { settingsInteractables } from '../settings/messages'

export const interactables: Interactable[] = [...jamInteractables, ...settingsInteractables]
