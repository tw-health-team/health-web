/*
 * 接口统一集成模块
 */
import * as login from './moudules/login'
import * as user from './moudules/user'
import * as organ from './moudules/organ'
import * as role from './moudules/role'
import * as menu from './moudules/menu'
import * as dict from './moudules/dict'
import * as log from './moudules/log'
import * as deptCenter from './moudules/deptCenter'

// 默认全部导出
export default {
  login,
  user,
  deptCenter,
  organ,
  role,
  menu,
  dict,
  log
}