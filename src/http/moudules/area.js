/*
 * @Descripttion:
 * @version:
 * @Author: sueRimn
 * @Date: 2020-02-26 13:42:42
 * @LastEditors: sueRimn
 * @LastEditTime: 2020-03-06 17:51:28
 */
import { get, post } from '../axios'

/*
 * 行政区划模块
 */

// 通过行政区划编码获取下级区划
export const getChildrenByID = (params) => {
  return get('/system/area/children/{id}', null, params)
}
// 获取下级区划树
export const getChildrenTree = (data) => {
  return post('/system/area/findTree', data)
}
// 根据id查找行政区划
export const getArea = (params) => {
  return get('/system/area/{id}', null, params)
}
// 根据id查找父级行政区划
export const getParent = (params) => {
  return get('/system/area/parent/{id}', null, params)
}
// 新增
export const add = (data) => {
  return post('/system/area/add', data)
}
// 修改
export const update = (data) => {
  return post('/system/area/update', data)
}
// 删除
export const remove = (params) => {
  return post('/system/area/remove/{id}', null, params)
}
// 生成所有下级行政区划json文件
export const createAreaJsonFile = (params) => {
  return get('/system/area/jsonFile/{id}', null, params)
}