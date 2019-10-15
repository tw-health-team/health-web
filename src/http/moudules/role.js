import { get, post } from '../axios'

/*
 * 角色管理模块
 */

// 新增
export const add = (data) => {
  return post('/system/role/add', data)
}
// 修改
export const update = (params, pathVariable) => {
  return post('/system/role/update/{id}', params, pathVariable)
}
// 删除
export const remove = (params) => {
  return post('/system/role/remove/{id}', null, params)
}
// 分页查询
export const list = (data) => {
  return post('/system/role/list', data)
}
// 查询全部
export const findAll = () => {
  return get('/system/role/all')
}
// 查询角色菜单集合
export const findRoleMenus = (params) => {
  return get('/system/role/roleResource/{roleId}', null, params)
}
// 保存角色菜单集合
export const saveRoleMenus = (data) => {
  return post('/system/role/saveRoleResource', data)
}