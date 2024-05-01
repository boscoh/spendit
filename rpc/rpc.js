import config from './config.json'

const remoteUrl = config.apiUrl
console.log(`config=${JSON.stringify(config)}`)
console.log(`rpc.remoteUrl=${remoteUrl}`)

function clone(o) {
    return JSON.parse(JSON.stringify(o))
}



/**
 * RPC interface to talk to a function on a server.
 *
 * Say, to run myFunction on the server remotely, the calling code
 * is:
 *
 *   let response = await remote.myFunction(a, b)
 *
 * This will pass method=functionOnServer, params=[a, b] to the
 * rpc function, which will package the method & params and send them
 * to the server, then wait for the results
 *
 * The results from the server are then returned asyncronously to
 * the caller using the JSON-RPC format
 *
 * @returns {Promise} - which wraps:
 *   1. on success:
 *      {
 *        result: {any} - result returned from myFunction on server
 *      }
 *   2. on any error:
 *      {
 *        error: {
 *          code: {number},
 *          message: {string}
 *        }
 *      }
 */
async function runRemoteMethod(method, ...params) {
    let startTime = new Date()

    const id = Math.random().toString(36).slice(-6)

    let s = `rpc.${method}.start(`
    let n = params.length
    for (let i = 0; i < n; i += 1) {
        s += JSON.stringify(clone(params[i]))
        if (i < n - 1) {
            s += ', '
        }
    }
    s += ')'
    console.log(s)

    let response
    try {
        const payload = {method, params, jsonrpc: '2.0', id}
        const fetchResponse = await fetch(remoteUrl, {
            method: 'post',
            mode: 'cors',
            cache: 'no-cache',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        })

        response = await fetchResponse.json()

        let elapsed = new Date() - startTime
        if ("result" in response) {
            console.log(`rpc.${method}.result[${elapsed}ms]: ↓`)
            console.groupCollapsed()
            console.log(clone(response.result))
            console.groupEnd()
        } else {
            console.log(`rpc.${method}.error[${elapsed}ms]:`, clone(response.error))
            for (let line of response.error.message) {
                console.log(`!! ${line}`)
            }
        }
    } catch (e) {
        let elapsed = new Date() - startTime
        console.log(`rpc.${method}.fail[${elapsed}ms]: ${e}`)
        response = {
            error: {message: `${e}`, code: -32000},
            jsonrpc: '2.0',
            id
        }
    }
    return response
}

class RemoteRpcProxy {
    constructor() {
        return new Proxy(this, {
            get(target, prop) {
                return async function (...rest) {
                    return await runRemoteMethod(prop, ...rest)
                }
            }
        })
    }
}


function saveBlobFile(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename)
    } else {
        const a = document.createElement('a')
        document.body.appendChild(a)
        const url = window.URL.createObjectURL(blob)
        a.href = url
        a.download = filename
        a.click()
        setTimeout(() => {
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        }, 0)
    }
}

function saveTextFile(text, filename) {
    let element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()
    document.body.removeChild(element)
}

const remote = new RemoteRpcProxy()

export {remote, remoteUrl, runRemoteMethod, saveBlobFile, saveTextFile}
