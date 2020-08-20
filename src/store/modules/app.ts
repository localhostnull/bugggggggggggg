import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { IAppStates } from './app.d'
import { loginApi, getUserInfoApi } from '@/servece/user'

@Module({
  name: 'App',
  stateFactory: true,
  dynamic: true
})
export default class App extends VuexModule {
  public states: IAppStates = {
    token: getToken(),
    name: '12312313',
    avatar: ''
  }

  get token() {
    return this.states.token
  }
  get name() {
    return this.states.name
  }
  get avatar() {
    return this.states.avatar
  }

  @Mutation
  public SET_TOKEN(token: string): void {
    this.states.token = token
  }

  @Mutation
  public SET_NAME(name: string): void {
    this.states.name = name
  }

  @Mutation
  public SET_AVATAR(avatar: string): void {
    this.states.avatar = avatar
  }

  @Action({ commit: 'SET_TOKEN', rawError: true })
  public async LoginByToken(token: string) {
    setToken(token)
    const res = await loginApi(token)
    setToken(res.data.token)
  }
  @Action
  public async GetUserInfo() {
    const res = await getUserInfoApi((this.states.token) as string)
    this.SET_NAME(res.data.name)
    this.SET_AVATAR(res.data.avatar_url)
  }
  @Action
  public async FedLogOut() {
    this.SET_TOKEN('')
    removeToken()
    return
  }
}