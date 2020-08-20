import { IUser, IUserInfo } from './index.d'
import request from '@/utils/request'

export const loginApi = (token: string) => request.post<IUser>('/user/user/login', token)

export const getUserInfoApi = (token: string) => request.post<IUserInfo>('/user/user/login', token)
