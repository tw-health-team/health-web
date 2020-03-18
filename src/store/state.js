/*
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