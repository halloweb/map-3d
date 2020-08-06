import Vue from 'vue'
import VueRouter from 'vue-router'
import Mapbox from '@/view/mapbox'
Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    redirect: 'mapbox'
  },
  {
    path: '/mapbox',
    name: 'mapbox',
    component: Mapbox
  }
]

const router = new VueRouter({
  routes
})
export default router
