import { get, post } from '../axios'

/*
 * 日志管理模块
 */

// 分页查询
export const findPage = (data) => {
  return post('/system/log/list', data)
}