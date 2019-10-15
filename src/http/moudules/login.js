import { post } from '../axios'

/*
 * 系统登录模块
 */

// 登录
export const login = data => {
  return post('/account/sign-in', data)
}

// 登出
export const logout = () => {
  return post('/account/logout')
}
