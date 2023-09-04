import useSWR from 'swr'

import { IGetPoll, IPostPoll } from '@/models/Poll'
import { IPostUser, IGetUser } from '@/models/User'
import { IPostSchool, IGetSchool } from '@/models/School'
import { IEntry } from '@/models/Entry'
import { IStats } from '@/pages/api/stats'
import { IDictElement, IPostDict } from '@/models/Dict'

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

export function useIndex<T>(url: string, query?: any, enabled=true) {
    return useSWR<Data<T>>([enabled ? `/api/${url}` : null, query], fetcher)
}

export function useGet<T>(url: string, id_: string) {
    return useSWR<Data<T>>([`/api/${url}/${id_}`], fetcher)
}

export async function post<T>(url: string, data: T) {
    const res = await fetcher([`/api/${url}`], {
        method: 'POST',
        body: JSON.stringify(data)
    })
    return res
}

interface WithId {
    _id: string
}

export async function remove(url: string, obj: WithId) {
    return await fetcher([`/api/${url}/${obj._id}`], {
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
    return useIndex<IGetPoll[]>('polls', filter, enabled)
}

export async function postPoll(poll: IPostPoll): Promise<{data: IGetPoll}> {
    return await post<IPostPoll>('polls', poll)
}

export async function patchPoll(poll: any) {
    return await patch('polls', poll)
}

export async function deletePoll(poll: IGetPoll) {
    await remove('polls', poll)
}

export function useEntries() {
    return useIndex<IEntry[]>('entries')
}

export function useStats(query?: any) {
    return useIndex<IStats>('stats', query)
}

export function useUsers() {
    return useIndex<IGetUser[]>('users')
}

export function patchUser(user: any) {
    return patch('users', user)
}

export async function postUser(user: IPostUser): Promise<{data: IGetUser, password: string}> {
    return await post<IPostUser>('users', user)
}

export async function deleteUser(user: IGetUser) {
    return await remove('users', user)
}

export function useSchools() {
    return useIndex<IGetSchool[]>('schools')
}

export function patchSchool(school: any) {
    return patch('schools', school)
}

export async function postSchool(school: IPostSchool): Promise<{data: IGetSchool}> {
    return await post<IPostSchool>('schools', school)
}

export async function deleteSchool(school: IGetSchool) {
    return await remove('schools', school)
}

export function useDict() {
    return useIndex<IDictElement[]>('dict')
}    

export async function postDict(dict: IPostDict): Promise<{data: IDictElement}> {
    return await post<IPostDict>('dict', dict)
}