import { IDrawInfo } from '@/components/RoomCanvas/index.d'

export interface IRtcInfo {
    app_id: string
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

export interface IDraInfo {
    action: string
    type: string
    id: string
    info: IDrawInfo
}

export interface ICacheData {
    pageCurrent: number
    drawInfo: IDraInfo[]
}

export interface IView {
    width: number;
    height: number;
    top: number;
    left: number;
}

export interface IViewSet {
    main: {
        width: number
        height: number
    }
    courseware: IView
    control: IView
    teacher?: IView
    student?: IView
    discuss?: IView
    self?: IView
}

export interface IStudent {
    uid: number
    active: boolean
    name: string
    avatar: string
    point: number
    group: number
    online?: boolean
    classStatus?: number,
    classStatusTime?: number,
    classStatusList?: number[],
}

export interface IActivityStudent {
    uid: number
    x: number
    y: number
}

export interface IDiscuss {
    list: Array<{
        name: string
        message: string
    }>
    message: string
}

export interface IAppraiseParam {
    uid: number
    id: number
    name: string
    url: string
    point: number
    medal_id?: number
}
