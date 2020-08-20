import { IAppStates } from './modules/app.d'

const getters = {
    token: (state: IAppStates) => state.token,
    avatar: (state: IAppStates) => state.avatar,
    name: (state: IAppStates) => state.name
}
export default getters
