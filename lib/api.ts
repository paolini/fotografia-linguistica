import useSWR from 'swr'

import { IGetPoll, IPostPoll } from '@/models/Poll'
import { IEntry } from '@/models/Entry'
import { IStats } from '@/pages/api/stats'
import { IUser } from '@/models/User'

async function fetcher([url, query]: [url:URL|RequestInfo, query?: any], init?: RequestInit) {
    if (query) {
        const params = new URLSearchParams(query)
        url = `${url}?${params}`
    }
    const res = await fetch(url, init)
    if (!res.ok) {
        throw new Error(`fetch error: ${res.status}`)
    }
    const json = await res.json()
    return json 
}

export interface Data<T> {
    data: T
}

export function index<T>(url: string, query?: any, enabled=true) {
    if (enabled) {
        return useSWR<Data<T>>([`/api/${url}`, query], fetcher)
    } else {
        return useSWR<Data<T>>(null, fetcher)
    }
}

export async function post<T>(url: string, data: T) {
    return await fetcher([`/api/${url}`], {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

interface WithId {
    _id: string
}

export async function remove(url: string, obj: WithId) {
    await fetcher([`/api/${url}/${obj._id}`], {
        method: 'DELETE',
    })
}

export async function patch(url: string, obj: WithId) {
    const res = await fetcher([`/api/${url}/${obj._id}`], {
        method: 'PATCH',
        body: JSON.stringify(obj)
    })
    return res
}

export function usePolls(filter?: any, enabled=true) {
    return index<IGetPoll[]>('polls', filter, enabled)
}

export async function postPoll(poll: IPostPoll) {
    return await post<IPostPoll>('polls', poll)
}

export async function deletePoll(poll: IGetPoll) {
    await remove('polls', poll)
}

export function useEntries() {
    return index<IEntry[]>('entries')
}

export function useStats() {
    return index<IStats>('stats')
}

export function useUsers() {
    return index<IUser[]>('users')
}

export function patchUser(user: any) {
    return patch('users', user)
}
