/*
 * Vuex的store中的state是响应式的，当state的数据更新时，vue组件会自动更新
 * 前提：
 * 1、提前在store中初始化好所需的属性
 * 2、当给state的对象添加新属性时，使用下面方式：
 * 方式一：使用Vue.set(obj,'newProp',123)
 * 方式二：用新的对象给旧对象重新赋值
 * 删除：Vue.delete(state.info,'age')
 * @Description:
 * @Author: tangwei
 * @Date: 2019-09-08 20:23:52
 */
// state为单一状态树，在state中需要定义我们所需要管理的数组、对象、字符串等等，
// 只有在这里定义了，在vue.js的组件中才能获取你定义的这个对象的状态
export default {
  userInfo: {
    id: '', // 登录id
    name: '', // 登录名
    organId: '', // 机构id
    organName: '' // 机构名称
  }
}