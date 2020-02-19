import { get, post } from '../axios'

/*
 * 地址管理模块
 */

// 新增
export const add = (data) => {
  return post('/system/area/add', data)
}
// 修改
export const update = (data) => {
  return post('/system/area/update', data)
}
// 删除
export const batchDelete = (data) => {
  return post('/system/area/remove', data)
}
// 查询字典树
export const findAreaTree = (data) => {
  return post('system/area/findTree', data)
}