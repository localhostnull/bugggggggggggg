import { IUser, IUserInfo } from './index.d'
import request from '@/utils/request'

export const loginApi = () => request.post<IUser>('/user/user/login')

export const getUserInfoApi = () => request.post<IUserInfo>('/user/user/get-user-info')
