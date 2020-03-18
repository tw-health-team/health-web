/*
 * @Description:
    每个mutation都有一个字符串类型的事件类型和一个回调函数，我们需要改变state的值就要在回调函数中改变。
    我们要执行这个回调函数，那么我们需要执行一个相应的调用方法：store.commit
    注：
    1.mutations 中的方法是不分组件的 , 假如你在 dialog_stroe.js 文件中的定义了
    switch_dialog 方法 , 在其他文件中的一个 switch_dialog 方法 , 那么
    $store.commit('switch_dialog') 会执行所有的 switch_dialog 方法。
    2.mutations里的操作必须是同步的
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
