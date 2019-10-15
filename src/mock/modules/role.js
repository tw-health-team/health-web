/*
 * 角色管理模块
 */

// 保存
export function save () {
  return {
    url: 'role/save',
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
    url: 'role/delete',
    type: 'post',
    data: {
      'code': 200,
      'msg': null,
      'data': 1
    }
  }
}
// 查询全部
export function findAll () {
  let findAllData = {
    'code': 200,
    'msg': null,
    'data': [
      {
        'id': 1,
        'createBy': 'admin',
        'createTime': '2018-08-14T03:11:11.000+0000',
        'lastUpdateBy': 'admin',
        'lastUpdateTime': '2018-08-14T03:11:11.000+0000',
        'name': 'admin',
        'remark': '超级管理员',
        'delFlag': 0
      },
      {
        'id': 2,
        'createBy': 'admin',
        'createTime': '2018-08-14T03:11:11.000+0000',
        'lastUpdateBy': 'admin',
        'lastUpdateTime': '2018-08-14T03:11:11.000+0000',
        'name': 'dev',
        'remark': '开发人员',
        'delFlag': 0
      },
      {
        'id': 3,
        'createBy': 'admin',
        'createTime': '2018-08-14T03:11:11.000+0000',
        'lastUpdateBy': 'admin',
        'lastUpdateTime': '2018-08-14T03:11:11.000+0000',
        'name': 'test',
        'remark': '测试人员',
        'delFlag': 0
      }
    ]
  }
  return {
    url: 'role/findAll',
    type: 'get',
    data: findAllData
  }
}

// 查询角色菜单集合
export function findRoleMenus (params) {
  let findRoleMenuData = {
    'code': 200,
    'msg': null,
    'data': {}
  }
  return {
    url: 'role/findRoleMenus',
    type: 'get',
    data: findRoleMenuData
  }
}
