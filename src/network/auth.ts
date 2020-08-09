import fetchAPI from './request'

export async function isAuthenticated(): Promise<boolean> {
    try {
        const status = await fetchAPI('/status', true, { credentials: 'include'})
        return status.authenticated
    } catch(e) {
        return false
    }
}