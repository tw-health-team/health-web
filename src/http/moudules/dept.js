import { get, post } from '../axios'

/*
 * 机构管理模块
 */
// 新增
export const add = (data) => {
  return post('/system/dept/add', data)
}
// 修改
export const update = (params, pathVariable) => {
  return post('/system/dept/update/{id}', params, pathVariable)
}
// 删除
export const batchDelete = (data) => {
  return post('/system/dept/remove', data)
}
// 查询机构树
export const findDeptTree = () => {
  return get('/system/dept/treeList')
}
// 查询机构列表
export const list = (data) => {
  return post('/system/dept/list', data)
}