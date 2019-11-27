import { get, post } from '../axios'

// 分页查询
export const findPage = (data) => {
  return post('/system/healthPerson/list', data)
}
// 删除
export const remove = (params) => {
  return post('/system/healthPerson/remove/{id}', null, params)
}

// 新增
export const add = (data) => {
  return post('/system/healthPerson/add', data)
}

// 修改
export const update = (data) => {
  return post('/system/healthPerson/update', data)
}
export const updateById = (params, pathVariable) => {
  return post('/system/healthPerson/update/{id}', params, pathVariable)
}