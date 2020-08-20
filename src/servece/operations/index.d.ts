import { IMedal } from '@/components/Appraise/index.d'

export interface IMedalInfo {
    list: IMedal[];
    pageCount: number
    pageNo: number
    pageSize: number
    total: number
}

export interface IRoomUser {
    avatar: string;
    group: number;
    name: string;
    role: string;
    uid: number;
}

export interface IRoomInfo {
    courseware_url: string;
    logo: string;
    room_id?: string;
    teacher_uid: number;
    title: string;
    tutor_uid: number;
    uid: number;
    role?: string;
    user_list: IRoomUser[];
    medal_data?: [];
}
