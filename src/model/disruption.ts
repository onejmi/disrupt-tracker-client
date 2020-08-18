export interface Tag {
    readonly id: string
    name: string
    color: number
    positive?: boolean
}

export interface Disruption {
    tagID: string
    readonly startTime: number
    endTime: number
}

export function getMinutesFromDisruption(disruption: Disruption) {
    const millis = disruption.endTime - disruption.startTime
    return ( millis / 1000 / 60 )
}