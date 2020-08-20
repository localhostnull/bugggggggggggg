import store from './index'
import { getModule } from 'vuex-module-decorators'
import App from '@/store/modules/app'

// 获取配置
export default {
  App: getModule(App, store)
}
