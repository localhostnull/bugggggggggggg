export interface IMsg {
    type: string,
    message: string,
    peerId: string
}

export interface IForm {
    channel: string,
    name: string,
    role: string
}
