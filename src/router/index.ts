/**
 * @description vue-router
 * @extends https://router.vuejs.org/zh/installation.html
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import { isString } from '@/underline'

const router = createRouter({
  history: createWebHashHistory('/'),
  routes: [
    {
      path: '/template',
      component: () => import('@/examples/template/index.vue')
    },
    {
      path: '/taodou-ticket',
      meta: { title: '淘豆购票' },
      component: () => import('@/examples/taodou-ticket/index.vue')
    },
    {
      path: '/sky-sea',
      meta: { title: '海天一色' },
      component: () => import('@/examples/sky-sea/index.vue')
    },
    {
      path: '/panda-earth',
      meta: { title: '熊猫地球' },
      component: () => import('@/examples/panda-earth/index.vue')
    },
    {
      path: '/china-map',
      meta: { title: '中国地图' },
      component: () => import('@/examples/china-map/index.vue')
    },
    { path: '/:catchAll(.*)', redirect: '/template' } // 不匹配路由进入模版页
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ? savedPosition : { top: 0, left: 0 }
  }
})

router.beforeEach(async (to, _from, next) => {
  document.title = isString(to.meta?.title) ? to.meta.title : 'three.js-example'
  next()
})

export default router
