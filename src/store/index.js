/*
 * @Author: tangwei
 * @Date: 2019-09-08 18:40:26
 */
import Vue from 'vue'
import Vuex from 'vuex'

import state from './state'
import getters from './getters'
import mutations from './mutations.js'
import actions from './actions'
import modules from './modules/index'
// 1.安装插件
Vue.use(Vuex)

// 2.创建对象 3.导出对象
// 4.main.js中挂载
export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules
})
