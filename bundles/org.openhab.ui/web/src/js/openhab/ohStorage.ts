import type { Ref } from 'vue'
import * as api from './apiServerStorage'
import type { StorageLikeAsync } from '@vueuse/core'

class OHStorage implements StorageLikeAsync {
    constructor(syncSettings: Ref<boolean>, localPrefix: string = '', serverPrefix: string = '') {
        this.syncWithServer = syncSettings
        this.localPrefix = localPrefix
        this.serverPrefix = serverPrefix
    }

    public localPrefix: string
    public serverPrefix: string
    public syncWithServer: Ref<boolean>

    async getItem(key: string) : Promise<string | null> {
        if (this.syncWithServer.value) {
            let serverValue: string | null | undefined = null
            try {
                await new Promise(resolve => {          // temporary to model server fetch delay
                    setTimeout(resolve, 300);
                    console.log('Simulating server fetch delay for key:', key)
                    return localStorage.getItem(`${this.localPrefix}${key}`)
                })
                /*
                serverValue = await api.getServerConfigValue({ key: `${this.serverPrefix}${key}` })
                if (serverValue) {
                    localStorage.setItem(`${this.localPrefix}${key}`, serverValue)
                }
                return null
                */
            } catch (error) {
                console.error('Failed to get item from server:', error)
                // TODO: should we return the local value if server fetch fails? For now, we return null to indicate failure.
                return null
            }
        } else {
            return localStorage.getItem(`${this.localPrefix}${key}`)
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        if (this.syncWithServer.value) {
            await api.putServerConfigValue({ key: `${this.serverPrefix}${key}`, body: { value } })
        }
        localStorage.setItem(`${this.localPrefix}${key}`, value)
    }

    async removeItem(key: string) : Promise<void> {
        if (this.syncWithServer) {
            await api.deleteServerConfigValue({ key: `${this.serverPrefix}${key}` })
        }
        localStorage.removeItem(`${this.localPrefix}${key}`)
    }

    // @nadahar - consider adding a "key and clear" rest call to model similar calls to localStorage
    async clear(): Promise<void> {
        // Only clear items with the specific prefix
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i)
            if (key && key.startsWith(this.localPrefix)) {
                localStorage.removeItem(key)
            }
        }
    }

    key(index: number) {
        const key = localStorage.key(index)
        if (key && key.startsWith(this.localPrefix)) {
            return key.substring(this.localPrefix.length)
        }
        return null
    }

    setSyncWithServer(sync: boolean) {
        this.syncWithServer = sync
    }
}


export { OHStorage }