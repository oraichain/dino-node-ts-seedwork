import { AbstractKeyValueRepository } from "@ports/database/keyvalue/KeyValueRepository";
import { EventHandlingTracker } from "../EventHandlingTracker";

export class KeyValueEventHandlingTracker implements EventHandlingTracker {
  private keyValueStore: AbstractKeyValueRepository

  constructor(keyValueStore: AbstractKeyValueRepository, prefix: string) {
    keyValueStore.setPrefix(prefix)
    this.keyValueStore = keyValueStore
  }

  static factory(keyValueStore: AbstractKeyValueRepository, prefix: string) {
    return new KeyValueEventHandlingTracker(keyValueStore, prefix)
  }

  async checkIfNotifHandled(aMessageId: string): Promise<boolean> {
    const v = await this.keyValueStore.get(aMessageId)
    return (v && v.toString()) === 'true'
  }

  async markNotifAsHandled(aMessageId: string): Promise<void> {
    await this.keyValueStore.set(aMessageId, 'true')
  }
}
