import { get, post } from '../axios'

/*
 * 字典管理模块
 */

// 获取字典分类树
export const findDictClassTree = () => {
  return get('/system/dict/classTree')
}
// 通过字典分类获取字典项
export const findDictByType = (params) => {
  return get('/system/dict/items/{classCode}', null, params)
}
// 查询字典项列表
export const findList = (data) => {
  return post('/system/dict/list', data)
}
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
// 字典项是否存在
export const existsDict = (data) => {
  return post('/system/dict/item', data)
}
// 获取字典分类列表
export const findDictClassList = (data) => {
  return post('/system/dict/classList', data)
}
// 新增字典分类
export const addDictClass = (data) => {
  return post('/system/dict/addClass', data)
}
// 修改字典分类
export const updateDictClass = (data) => {
  return post('/system/dict/updateClass', data)
}
// 通过字典分类获取字典项
export const removeDictClass = (params) => {
  return post('/system/dict/removeClass/{id}', null, params)
}