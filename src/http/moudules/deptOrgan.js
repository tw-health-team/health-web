import { get, post } from '../axios'

/*
 * 院内科室管理模块
 */

// 新增
export const add = (data) => {
  return post('/system/deptOrgan/add', data)
}
// 修改
export const update = (data) => {
  return post('/system/deptOrgan/update', data)
}
// 删除
export const batchDelete = (data) => {
  return post('/system/deptOrgan/remove', data)
}
// 查询院内科室分页
export const findPage = (data) => {
  return post('system/deptOrgan/findPage', data)
}