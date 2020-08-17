import keys from '@/config/keys'

export default async function fetchAPI(endpoint: string, options?: object, json: boolean = true, withError: boolean = false) {
    const res = await fetch(
        `${keys.apiURL}/api${endpoint}`, 
        {
            credentials: 'include', 
            headers: {
                ...(json && {'Accept': 'application/json'}),
                'Content-Type': 'application/json'
            },
            ...options
        }
    )
    if(json && !withError) return await res.json()
    return res
}