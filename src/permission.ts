import router from './router'
import store from './store'
import { getToken } from '@/utils/auth' // getToken from cookie

const whiteList = ['/', '/error']

router.beforeEach((to, from, next) => {
  if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
    next()
  }else{
    if (getToken()) {
      if (store.state.name.length === 0) { // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetUserInfo').then(() => { // 拉取user_info
          next()
        }).catch(() => {
          next({ path: '/error' })
        })
      } else {
        next()
      }
    } else {
      next({ path: '/error' })
    }
  }
})

router.afterEach(() => {
})
