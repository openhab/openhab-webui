import { ref } from 'vue'
import type { Envelope, HostFeature, HostInfo, ReplyErrorCode, ReplyPayload, UIFeature } from './protocol'

/** Throw from a command handler to reply with this error code. */
export class BridgeError extends Error {
  constructor(
    readonly code: ReplyErrorCode,
    message?: string
  ) {
    super(message ?? code)
  }
}

type CommandHandler = (payload: any) => unknown

const SUPPORTED: HostFeature[] = ['navbar', 'menu', 'routeRestore']
const UI_FEATURES: UIFeature[] = ['navbar', 'menu', 'routeRestore', 'layout']
// Commands Main UI handles. Before their handler is registered they get a not_ready reply.
const COMMANDS = [
  'nav.navigate',
  'nav.back',
  'nav.openModal',
  'nav.closeModals',
  'nav.getState',
  'navbar.activate',
  'menu.activate',
  'layout.changed',
  'settings.changed',
  'ui.reload'
]
const REQUEST_TIMEOUT = 5000

let port: OHBridgePort | null = null
const handlers = new Map<string, CommandHandler>()
const requests = new Map<string, { resolve: (result: unknown) => void; reject: (error: Error) => void }>()
let nextId = 0
let helloSent = false
// Replies to recent commands, by id. The app resends a command it got no reply to, and a resent
// command gets the same reply instead of running again. Null while the command runs.
const answered = new Map<string, ReplyPayload | null>()
const ANSWERED_KEPT = 50

/** Dark mode set by the app, from its startup info or settings.changed. */
export const hostDarkMode = ref<'light' | 'dark' | undefined>()

/** Connects to window.OHBridge. Call before mounting the Vue app. */
export function installHostBridge(target: Window = window) {
  port = target.OHBridge ?? null
  if (!port) return
  hostDarkMode.value = port.info?.darkMode
  port.onmessage = (event) => receive(event.data)
}

export function hasHost(): boolean {
  return port !== null
}

export function hostInfo(): HostInfo | null {
  return port?.info ?? null
}

/** True if the app asked to handle `feature` and Main UI supports it. */
export function hostTakesOver(feature: HostFeature): boolean {
  return SUPPORTED.includes(feature) && !!port?.info?.features?.includes(feature)
}

export function onHostCommand(type: string, handler: CommandHandler) {
  handlers.set(type, handler)
}

/** Sends ui.hello. Only the first call does anything. */
export function sayHello(version?: string) {
  if (!port || helloSent) return
  helloSent = true
  send('ui.hello', {
    protocol: 1,
    impl: 'mainui',
    version,
    accepted: SUPPORTED.filter((f) => hostTakesOver(f)),
    features: UI_FEATURES
  })
}

export function hasSaidHello(): boolean {
  return helloSent
}

export function send(type: string, payload: object = {}) {
  post({ v: 1, type, payload })
}

/** Sends a request to the app and waits for the reply. */
export async function request<R>(type: string, payload: object = {}): Promise<R> {
  if (!port) throw new Error('No host')
  const id = 'w' + ++nextId
  return new Promise<R>((resolve, reject) => {
    const timer = setTimeout(() => {
      requests.delete(id)
      reject(new Error(`No answer to ${type}`))
    }, REQUEST_TIMEOUT)
    requests.set(id, {
      resolve: (result) => {
        clearTimeout(timer)
        resolve(result as R)
      },
      reject: (error) => {
        clearTimeout(timer)
        reject(error)
      }
    })
    post({ v: 1, type, id, payload })
  })
}

function post(message: Envelope) {
  if (!port) return
  try {
    port.postMessage(JSON.stringify(message))
  } catch (e) {
    console.warn('OHBridge: could not post', message.type, e)
  }
}

function reply(id: string | undefined, payload: ReplyPayload) {
  if (id) post({ v: 1, type: 'reply', replyTo: id, payload })
}

function receive(data: string) {
  let message: Envelope<any>
  try {
    message = JSON.parse(data) as Envelope<any>
  } catch {
    return
  }
  if (!message?.type) return

  if (message.type === 'reply') {
    const pending = message.replyTo ? requests.get(message.replyTo) : undefined
    if (!pending) return
    requests.delete(message.replyTo!)
    const answer = message.payload as ReplyPayload
    if (answer.ok) pending.resolve(answer.result)
    else pending.reject(new BridgeError(answer.error.code, answer.error.message))
    return
  }

  const handler = handlers.get(message.type)
  if (!handler) {
    reply(message.id, { ok: false, error: { code: COMMANDS.includes(message.type) ? 'not_ready' : 'unknown_type' } })
    return
  }
  const id = message.id
  if (id && answered.has(id)) {
    const previous = answered.get(id)
    if (previous) reply(id, previous)
    return
  }
  if (id) remember(id, null)
  const finish = (payload: ReplyPayload) => {
    if (id) remember(id, payload)
    reply(id, payload)
  }
  Promise.resolve()
    .then(() => handler(message.payload ?? {}))
    .then((result) => finish(result === undefined ? { ok: true } : { ok: true, result }))
    .catch((e: unknown) => {
      const code = e instanceof BridgeError ? e.code : 'failed'
      finish({ ok: false, error: { code, message: e instanceof Error ? e.message : String(e) } })
    })
}

function remember(id: string, payload: ReplyPayload | null) {
  answered.delete(id)
  answered.set(id, payload)
  if (answered.size > ANSWERED_KEPT) answered.delete(answered.keys().next().value!)
}

/** Resets all state. For tests. */
export function resetHostBridge() {
  port = null
  handlers.clear()
  requests.clear()
  answered.clear()
  nextId = 0
  helloSent = false
  hostDarkMode.value = undefined
}
