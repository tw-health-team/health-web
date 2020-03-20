/*
 * 全局常量、方法封装模块
 * 通过原型挂载到Vue属性
 * 通过 this.$global 调用
 *
 * @Author: tangwei
 * @Date: 2019-09-17 14:48:23
 */

// 后台管理系统服务器地址
export const baseUrl = window.baseUrl
// 系统数据备份还原服务器地址
export const backupBaseUrl = 'http://localhost:8002'
// 行政区划数据
export const addressData = window.addressData
// 页面标题头高度（对应src\style\theme\_size.scss）
export const headerHeight = 60
// tab标签高度
export const tabHeight = 40
// 空白间隔高度
export const spaceHeight = 9
// 列表分页栏告诉
export const pagingBarHeight = 32
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
  addressData,
  headerHeight,
  tabHeight,
  spaceHeight,
  pagingBarHeight
}
