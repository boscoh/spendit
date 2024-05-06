import config from './config.json'

const remoteUrl = config.apiUrl

console.log(`config=${JSON.stringify(config)}`)
console.log(`rpc.remoteUrl=${remoteUrl}`)

declare global {
    interface Window {
        URL: any
    }
}

declare global {
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean
    }
}

interface IResponseResult {
    result: any
    jsonrpc?: string
    id?: string
}

interface IResponseError {
    error: {
        code: number
        message: string
    }
    jsonrpc?: string
    id?: string
}

type IResponseType = IResponseResult | IResponseError

function clone(o: any) {
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
 * The results from the server are then returned asynchronously to
 * the caller using the JSON-RPC format
 *
 * @returns {Promise<IResponseType>} - which wraps:
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
async function aysncRpc(
    method: string,
    ...params: any[]
): Promise<IResponseType> {
    const startTime = new Date().getTime()

    const id = Math.random().toString(36).slice(-6)

    let debugStr = `rpc.${method}.start(`
    const n = params.length
    for (let i = 0; i < n; i += 1) {
        debugStr += JSON.stringify(clone(params[i]))
        if (i < n - 1) {
            debugStr += ', '
        }
    }
    debugStr += ')'
    console.log(debugStr)

    let response
    try {
        const payload = { method, params, jsonrpc: '2.0', id }
        const fetchResponse = await fetch(remoteUrl, {
            method: 'post',
            mode: 'cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        response = await fetchResponse.json()

        const elapsed = new Date().getTime() - startTime
        if ('result' in response) {
            console.log(`rpc.${method}.result[${elapsed}ms]: ↓`)
            console.groupCollapsed()
            console.log(clone(response.result))
            console.groupEnd()
        } else {
            console.log(
                `rpc.${method}.error[${elapsed}ms]:`,
                clone(response.error)
            )
            for (const line of response.error.message) {
                console.log(`!! ${line}`)
            }
        }
    } catch (e) {
        const elapsed = new Date().getTime() - startTime
        console.log(`rpc.${method}.fail[${elapsed}ms]: ${e}`)
        response = {
            error: { message: `${e}`, code: -32000 },
            jsonrpc: '2.0',
            id,
        }
    }
    return response
}

async function remoteUpload(file: File, method: string, ...params: any[]) {
    const formData = new FormData()
    formData.append('file', file, file.name)
    formData.append('method', method)
    formData.append('paramsJson', JSON.stringify(params))
    let payload = { body: formData, method: 'post' }
    console.log('payload', payload)
    let startTime = new Date().getTime()
    console.log(`rpc.start.upload`, payload)
    let response = await fetch(remoteUrl.replace('rpc-run', 'upload/'), payload)
    let elapsed: number = new Date().getTime() - startTime

    const jsonResponse = await response.json()
    if ('result' in jsonResponse) {
        console.log(`rpc.result.upload[${elapsed}ms]: ↓`)
        console.groupCollapsed()
        console.log(jsonResponse.result)
        console.groupEnd()
    }

    return jsonResponse
}

type rpcFn = (...rest: any[]) => Promise<IResponseType>

class RemoteRpcProxy {
    constructor() {
        return new Proxy(this, {
            get(_, prop: string): rpcFn {
                return async function (...rest: any[]): Promise<IResponseType> {
                    return await aysncRpc(prop, ...rest)
                }
            },
        })
    }
}

interface IRemoteRpc {
    [key: string]: rpcFn
}

const remote = new RemoteRpcProxy() as IRemoteRpc

function saveBlobFile(blob: Blob, filename: string) {
    const nav = window.navigator as any
    if (nav.msSaveOrOpenBlob) {
        nav.msSaveOrOpenBlob(blob, filename)
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

function saveTextFile(text: string, filename: string) {
    const element = document.createElement('a')
    element.setAttribute(
        'href',
        'data:text/csv;charset=utf-8,' + encodeURIComponent(text)
    )
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()
    document.body.removeChild(element)
}

export { remote, remoteUrl, remoteUpload, aysncRpc, saveBlobFile, saveTextFile }
