export interface Tag {
    readonly id: number
    name: string
    positive?: boolean
}

export interface Disruption {
    tagID: number
    readonly startTime: number
    endTime: number
}