/*
 * @Description:
 *  一、作用：更新Vuex的stroe状态
 *  主要包括两部分：
 *  1、字符串的事件类型(Type)
 *  2、一个回调函数(handler)，该回调函数的第一个参数就是state,我们需要改变state的值就要在回调函数中改变。
 *  在通过mutation更新数据时，有可能需要携带一些额外的参数，该参数称为mutation的载荷(Payload)
 *  二、使用：我们要执行这个回调函数，那么我们需要执行一个相应的调用方法：store.commit,参数为事件类型
 *  如：this.$store.commit('updateUserInfo',data) data为自定义参数
 *  注：
 *  1.mutations 中的方法是不分组件的 , 假如你在 dialog_stroe.js 文件中的定义了
 *  switch_dialog 方法 , 在其他文件中的一个 switch_dialog 方法 , 那么
 *  $store.commit('switch_dialog') 会执行所有的 switch_dialog 方法。
 *  2.mutations里的操作必须是同步的
 * @Author: tangwei
 * @Date: 2019-09-08 20:04:51
 */
import Vue from 'vue'
export default {
  /**
   * 更新用户信息
   * @param {object} data 用户信息对象
   * @author tw update (2020/03/18)
   */
  updateUserInfo (state, data) {
    Vue.set(state, 'userInfo', data)
  }
}
