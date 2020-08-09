import keys from '@/config/keys'

export default async function fetchAPI(endpoint: string, json: boolean = true, ...params: any[]) {
    const res = await fetch(`${keys.apiURL}/api${endpoint}`, ...params)
    if(json) return await res.json()
    return res
}