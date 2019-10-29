import { get, post } from '../axios'

/*
 * 机构管理模块
 */
// 新增
export const add = (data) => {
  return post('/system/organ/add', data)
}
// 修改
export const update = (params, pathVariable) => {
  return post('/system/organ/update/{id}', params, pathVariable)
}
// 删除
export const batchDelete = (data) => {
  return post('/system/organ/remove', data)
}
// 查询机构树
export const findOrganTree = () => {
  return get('/system/organ/treeList')
}
// 查询机构列表
export const list = (data) => {
  return post('/system/organ/list', data)
}