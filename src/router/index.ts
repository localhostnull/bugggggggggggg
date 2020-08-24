import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import ClassRoom from '../views/ClassRoom.vue'

Vue.use(VueRouter)

  const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/room1/student/*',
    name: 'room1Student',
    component: () => import('../views/room1/Student.vue')
  },
  {
    path: '/room1/teacher/*',
    name: 'room1Teacher',
    component: () => import('../views/room1/Teacher.vue')
  },
  // {
  //   path: '/room1/tutor',
  //   name: 'room1Tutor',
  //   component: () => import('../views/room1/Tutor.vue')
  // },
  {
    path: '/room1/courseware/*',
    name: 'room1Courseware',
    component: () => import('@/views/room1/Couseware.vue')
  },
  // {
  //   path: '/error',
  //   name: 'error',
  //   component: () => import('../views/Error.vue')
  // },
  // {
  //   path: '*',
  //   redirect: '/error'
  // },
  // {
  //   path: '/',
  //   name: 'ClassRoom',
  //   component: ClassRoom
  // }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
