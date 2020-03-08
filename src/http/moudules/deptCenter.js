import { get, post } from '../axios'

/*
 * 中心科室管理模块
 */

// 新增
export const add = (data) => {
  return post('/system/deptCenter/add', data)
}
// 修改
export const update = (data) => {
  return post('/system/deptCenter/update', data)
}
// 删除
export const batchDelete = (data) => {
  return post('/system/deptCenter/remove', data)
}
// 查询字典树
export const findDeptCenterTree = (data) => {
  return post('system/deptCenter/findTree', data)
}