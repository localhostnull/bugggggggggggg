import request from '@/utils/request'
import { IMedalInfo, IRoomInfo, IRoomUser } from './index.d'
import { IRtmInfo, IRtcInfo } from '@/views/room1'

export const getMedalInfoApi = (room_id: string) => request.post<IMedalInfo>('/medal/medal/get-list', { room_id })

export const sendMedalApi = (data: { user_id: number, medal_uuid: string }) => request.post('/medal/medal/send', data)

export const getRoomInfoApi = (room_id: string) => request.post<IRoomInfo>('/classroom/agora/get-room-info', { room_id })

export const getRtmInfoApi = (room_id: string) => request.post<IRtmInfo>('/classroom/agora/get-rtm-token', { room_id })

export const getRtcInfoApi = (room_id: string) => request.post<IRtcInfo>('/classroom/agora/get-rtc-token', { room_id })

export const getAgoraUserInfoApi = (uid: number) => request.post<IRoomUser>('/classroom/agora/get-user-info', { uid })