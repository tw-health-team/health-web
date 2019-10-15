/*
 * 用户管理模块
 */

// 保存
export function save () {
  return {
    url: 'user/save',
    type: 'post',
    data: {
      'code': 200,
      'msg': null,
      'data': 1
    }
  }
}
// 批量删除
export function batchDelete () {
  return {
    url: 'user/delete',
    type: 'post',
    data: {
      'code': 200,
      'msg': null,
      'data': 1
    }
  }
}
// 分页查询
export function findPage (params) {
  let findPageData = {
    'code': 200,
    'msg': null,
    'data': {}
  }
  let pageNum = 1
  let pageSize = 8
  if (params !== null) {
    // pageNum = params.pageNum
  }
  if (params !== null) {
    // pageSize = params.pageSize
  }
  let totalSize = 42
  let totalPages = 9
  let content = []
  for (let i = 0; i < pageSize; i++) {
    let obj = {}
    obj.id = i + 1
    obj.name = 'kitty' + (i + 1)
    obj.password = '9ec9750e709431dad22365cabc5c625482e574c74adaebba7dd02f1129e4ce1d'
    obj.salt = 'YzcmCZNvbXocrsz9dm8e'
    obj.email = 'kitty' + (i + 1) + '@qq.com'
    obj.mobile = '18688982323'
    obj.status = 1
    obj.deptId = 12
    obj.deptName = 'Dev'
    content.push(obj)
  }
  findPageData.data.pageNum = pageNum
  findPageData.data.pageSize = pageSize
  findPageData.data.totalSize = totalSize
  findPageData.data.totalPages = totalPages
  findPageData.data.content = content
  return {
    url: 'user/findPage',
    type: 'post',
    data: findPageData
  }
}
// 查找用户的菜单权限标识集合
export function findPermissions () {
  let permsData = {
    'code': 200,
    'msg': null,
    'data': [
      null,
      'sys:user:view',
      'sys:menu:delete',
      'sys:dept:edit',
      'sys:dict:edit',
      'sys:dict:delete',
      'sys:menu:add',
      'sys:user:add',
      'sys:log:view',
      'sys:dept:delete',
      'sys:role:edit',
      'sys:role:view',
      'sys:dict:view',
      'sys:user:edit',
      'sys:user:delete',
      'sys:dept:view',
      'sys:dept:add',
      'sys:role:delete',
      'sys:menu:view',
      'sys:menu:edit',
      'sys:dict:add',
      'sys:role:add'
    ]
  }
  return {
    url: 'user/findPermissions',
    type: 'get',
    data: permsData
  }
}
