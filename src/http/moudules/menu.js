import { get, post } from '../axios'

/*
 * 菜单管理模块
 */

// 新增
export const add = (data) => {
  return post('/system/resource/add', data)
}
// 修改
export const update = (params, pathVariable) => {
  return post('/system/resource/update/{id}', params, pathVariable)
}
// 删除
export const remove = (params) => {
  return post('/system/resource/remove/{id}', null, params)
}
// 批量删除
export const batchDelete = (data) => {
  return post('/system/resource/delete', data)
}
// 查找导航菜单树
export const findNavTree = (params) => {
  return get('/system/resource/navTree/{username}', null, params)
}
// 获取所有资源树
export const findResourceTree = () => {
  return post('/system/resource/list')
}