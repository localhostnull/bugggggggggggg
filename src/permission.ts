import router from './router'
import { getToken } from '@/utils/auth' // getToken from cookie
import AppModule from '@/store/modules/app'

const whiteList = ['/', '/error']

router.beforeEach((to, from, next) => {
  if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
    next()
  }else{
    if (getToken()) {
      if (AppModule.name.length === 0) { // 判断当前用户是否已拉取完user_info信息
        AppModule.GetUserInfo().then((res) => { // 拉取user_info
          console.log(res, 'permission')
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
