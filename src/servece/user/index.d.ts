export interface IUser {
    token: string
    user_group_id: number
    user_id: number
    user_uuid: string
    utype: number
}

export interface IUserInfo {
    avatar_url: string
    name: string
    roles: string[]
    user_id: number
    user_uuid: string
}
