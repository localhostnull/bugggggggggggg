import { IDrawInfo } from '@/components/RoomCanvas/index.d'

export interface IRtcInfo {
    appID: string
    channel: string
    uid: number
    token: string
}

export type IRtmInfo = IRtcInfo
export type IRtc = IRtm

export interface IRtm {
    client: any
    channel?: any
    joined: boolean
    published: boolean
    localStream: any
    remoteStreams: any[]
    params: any
}

export interface IDragData {
    x: number
    y: number
    show: boolean
}

export interface IDrawSet {
    list: Array<{ title: string; type: string }>
    color?: string[]
    colorSelect?: number
    select: number
}

export interface IPageSet {
    total: number
    current: number
}

export interface ICacheData {
    pageCurrent: number
    drawInfo: Array<{
        action: string
        type: string
        id: string
        info: IDrawInfo
    }>
}

export interface IViewSet {
    main: {
        width: number
        height: number
    }
    courseware: {
        width: number;
        height: number;
        top: number;
        left: number;
    }
    control: {
        width: number;
        height: number;
        top: number;
        left: number;
    }
}

export interface IStudent {
    uid: number
    active: boolean
    name: string
    avatar: string
    point: number
    group: number
}

export interface IActivityStudent {
    uid: number
    x: number
    y: number
}
