import request from '@/utils/request'
import { IMedalInfo, IRoomInfo } from './index.d'
import { IRtmInfo } from '@/views/room1'

export const getMedalInfoApi = (room_id: string) => request.post<IMedalInfo>('/medal/medal/get-list', { room_id })

export const sendMedalApi = (data: { user_id: number, medal_uuid: string }) => request.post('/medal/medal/send', data)

export const getRoomInfoApi = (room_id: string) => request.post<IRoomInfo>('/classroom/agora/get-room-info', { room_id })

export const getRtmInfoApi = (room_id: string) => request.post<IRtmInfo>('/classroom/agora/get-rtm-token', { room_id })