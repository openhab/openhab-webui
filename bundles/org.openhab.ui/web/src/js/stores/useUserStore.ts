import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  name: string
  roles?: string[]
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const noAuth = ref(false)

  function isAdmin (): boolean {
    const admin = noAuth.value || (user.value?.roles?.indexOf('administrator') ?? -1) >= 0
    return admin
  }

  function setUser (newUser: User | null) {
    user.value = newUser
  }

  function setNoAuth (value: boolean) {
    noAuth.value = value
  }

  return { user, noAuth, isAdmin, setUser, setNoAuth }
})
