
export interface IUserInfo {
    active: boolean;
    avatar: string;
    classStatus: number;
    gameScore: number;
    medal: Array;
    name: string;
    online: boolean;
    point: number;
    raise: boolean;
    uid: number;
}
export interface IMedal {
    medal_id: number,
    medal_uuid: string,
    name: string,
    point: number,
    icon_url: string,
}
