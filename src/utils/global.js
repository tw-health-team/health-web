/**
 * 全局常量、方法封装模块
 * 通过原型挂载到Vue属性
 * 通过 this.$global 调用
 */

// 后台管理系统服务器地址
export const baseUrl = window.baseUrl
// 系统数据备份还原服务器地址
export const backupBaseUrl = 'http://localhost:8002'
// 行政区划数据
export const addressData = window.addressData

/**
 * 判断是否为空
 * @param str 字符串
 */
const isEmpty = (str) => {
  if (!str || str === undefined) { return true } else { return false }
}

export default {
  baseUrl,
  backupBaseUrl,
  isEmpty,
  addressData
}
