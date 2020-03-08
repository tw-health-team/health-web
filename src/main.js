// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// 以 vue 插件的形式引入 axios，这样在其他地方就可通过 this.$api 调用相关的接口了
import api from './http/index'
// 引用vuex
import store from './store'
// 引入全局js
import global from '@/utils/global'
// 引用elment组件和样式
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 引用font-awesome
import 'font-awesome/css/font-awesome.min.css'
// 引入iconfont-阿里图标
import '@/assets/iconfont/iconfont.css'
// 自定义样式
import '@/assets/css/index.scss'
// 行政区划插件
import vRegion from 'v-region-plus'

Vue.use(ElementUI)
Vue.use(api)
Vue.use(vRegion)

Vue.prototype.$global = global

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store, // 使用store
  render: h => h(App)
})
