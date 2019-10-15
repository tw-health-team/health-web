import { get, post } from '../axios'

/*
 * 字典管理模块
 */

// 新增
export const add = (data) => {
  return post('/system/dict/add', data)
}
// 修改
export const update = (data) => {
  return post('/system/dict/update', data)
}
// 删除
export const batchDelete = (data) => {
  return post('/system/dict/remove', data)
}
// 分页查询
export const findPage = (data) => {
  return post('/system/dict/list', data)
}