import { get, post } from '../axios'

/*
 * 用户管理模块
 */

// 新增
export const add = (data) => {
  return post('/system/param/add', data)
}
// 修改
export const update = (data) => {
  return post('/system/param/update', data)
}
export const updateById = (params, pathVariable) => {
  return post('/system/param/update/{id}', params, pathVariable)
}
// // 删除
// export const remove = (params) => {
//   return post('/system/param/remove/{id}', null, params)
// }
// 删除
export const batchDelete = (data) => {
  return post('/system/param/remove', data)
}
// 分页查询
export const findPage = (data) => {
  return post('/system/param/list', data)
}
// 查找用户的菜单权限标识集合
export const findPermissions = (params) => {
  return get('/system/user/permissions/{username}', null, params)
}
