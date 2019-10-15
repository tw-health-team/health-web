import { get, post } from '../axios'

/*
 * 用户管理模块
 */

// 新增
export const add = (data) => {
  return post('/system/user/add', data)
}
// 修改
export const update = (data) => {
  return post('/system/user/update', data)
}
export const updateById = (params, pathVariable) => {
  return post('/system/user/update/{id}', params, pathVariable)
}
// 删除
export const remove = (params) => {
  return post('/system/user/remove/{id}', null, params)
}
// 分页查询
export const findPage = (data) => {
  return post('/system/user/list', data)
}
// 查找用户的菜单权限标识集合
export const findPermissions = (params) => {
  return get('/system/user/permissions/{username}', null, params)
}
