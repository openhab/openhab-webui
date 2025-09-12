declare namespace _default {
    /**
     * Connect to the WebSocket at the given path.
     * This method provides raw access to WebSockets, the caller has to take care of the keepalive mechanism by specifying a heartbeat callback.
     *
     * @param {string} path path to connect to, e.g. `/ws`
     * @param {fn} messageCallback message callback to handle incoming messages
     * @param {fn} heartbeatCallback heartbeat callback
     * @param {fn} [readyCallback] ready callback
     * @param {fn} [errorCallback] error callback
     * @param {number} [heartbeatInterval=5] heartbeat interval in seconds
     * @return {WebSocket}
     */
    function connect(path: string, messageCallback: (event: object) => void, heartbeatCallback: () => void, readyCallback?: (event: object) => void, errorCallback?: (event: object) => void, heartbeatInterval?: number): WebSocket;
    /**
     * Connect to the event WebSocket, which provides direct access to the EventBus.
     * This convenience method takes care of the keepalive mechanism as well as filter setup.
     *
     * @param {string[]} topics array of event topics to filter by, if empty all events are received
     * @param {fn} messageCallback message callback to handle incoming messages
     * @param {fn} [readyCallback] ready callback
     * @param {fn} [errorCallback] error callback
     * @return {WebSocket}
     */
    function events(topics: string[], messageCallback: (event: object) => void, readyCallback?: (event: object) => void, errorCallback?: (event: object) => void): WebSocket;
    /**
     * Close the given WebSocket connection.
     *
     * @param {WebSocket} socket
     * @param {fn} [callback=null] callback to execute on connection close
     */
    function close(socket: WebSocket, callback?: (event: object) => void): void;
}
export default _default
