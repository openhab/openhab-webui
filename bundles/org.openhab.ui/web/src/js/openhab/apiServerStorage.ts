// **** Temporary types and functions until the openapi spec supports
import { client } from '@/api/client.gen'
import * as api from '@/api'
import type { RequestResult } from '@/api/client/types.gen'
import { buildClientParams } from '@/api/client'

type GetServerConfigValueResponses = {
    200: string | null
}

type GetServerConfigValueErrors = {
    404: unknown
}

export const getServerConfigValue = <ThrowOnError extends boolean = false>(parameters: {
    key: string
}, options?: api.Options<never, ThrowOnError>): RequestResult<GetServerConfigValueResponses, GetServerConfigValueErrors, ThrowOnError, 'data'> => {
    const params = buildClientParams([parameters], [{ args: [
            { in: 'query', key: 'key' }
    ] }])
    return (options?.client ?? client).get<GetServerConfigValueResponses, GetServerConfigValueErrors, ThrowOnError, 'data'>({
        responseStyle: 'data',
        url: '/client-store/{key}',
        ...options,
        ...params
    })
}

type PutServerConfigValueResponses = {
    200: unknown
}

type PutServerConfigValueErrors = {
    400: unknown
    404: unknown
}

export const putServerConfigValue = <ThrowOnError extends boolean = false>(parameters: {
    key: string
    body?: {
        value?: string
    }
}, options?: api.Options<never, ThrowOnError>): RequestResult<PutServerConfigValueResponses, PutServerConfigValueErrors, ThrowOnError, 'data'> => {
    const params = buildClientParams([parameters], [{ args: [
                { in: 'path', key: 'key' },
                { key: 'body', map: 'body' }
            ] }])
    return (options?.client ?? client).put<PutServerConfigValueResponses, PutServerConfigValueErrors, ThrowOnError, 'data'>({
        responseStyle: 'data',
        security: [{ scheme: 'bearer', type: 'http' }],
        url: '/client-store/{key}',
        ...options,
        ...params,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
            ...params.headers
        }
    })
}

type DeleteServerConfigValueResponses = {
    200: unknown
}

type DeleteServerConfigValueErrors = {
    400: unknown
    404: unknown
}

export const deleteServerConfigValue = <ThrowOnError extends boolean = false>(parameters: {
    key: string
}, options?: api.Options<never, ThrowOnError>): RequestResult<DeleteServerConfigValueResponses, DeleteServerConfigValueErrors, ThrowOnError, 'data'> => {
    const params = buildClientParams([parameters], [{ args: [
            { in: 'path', key: 'key' }
        ] }])
    return (options?.client ?? client).delete<DeleteServerConfigValueResponses, DeleteServerConfigValueErrors, ThrowOnError, 'data'>({
        responseStyle: 'data',
        security: [{ scheme: 'bearer', type: 'http' }],
        url: '/client-store/{key}',
        ...options,
        ...params
    })
}