/*
 * @Description:
 * @Author: tangwei
 * @Date: 2019-10-17 16:30:17
 */
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    dicProps: { // 字典项合集
      resource: [
        { typeCode: '0001', typeName: 'systemType' } // 系统分类
      ],
      organ: [ // 机构
        { typeCode: '1001001', typeName: 'level' }, // 医疗机构级别
        { typeCode: '1001002', typeName: 'classification' } // 医疗机构类型
      ],
      param: [ // 参数
        { typeCode: '2001', typeName: 'inputType' }, // 参数输入方式
        { typeCode: '2002', typeName: 'valueType' }, // 参数值类型
        { typeCode: '2003', typeName: 'paramType' }, // 参数类型
        { typeCode: '2004', typeName: 'delFlag' } // 参数状态
      ],
      deptCenter: [ // 中心科室
        { typeCode: '1005001', typeName: 'category' }, // 科室类别
        { typeCode: '1005002', typeName: 'runk' } // 科室级别
      ],
      deptOrgan: [ // 院内科室
        { typeCode: '1005003', typeName: 'outpatientType' }, // 门诊类型
        { typeCode: '1005004', typeName: 'registeredState' } // 挂号状态
      ]
    },
    dictByType: {} // 以type存储的字典数据
  },
  getters: {
    /**
     * 返回字典列表
     * @author tangwei add(20191017)
     */
    getDic: state => prop => {
      /**
       * 根据字典名称获取对应数据
       * @param {String} prop 字典对应的typeName
       */
      return state.dictByType[prop] || []
    }
  },
  mutations: {
    updateDic (state, data) {
      /**
       * 更新字典项目
       * @param {Object} data data.name 字典名称  data.data 字典数据
       */
      Vue.set(state.dictByType, data.name, data.data)
    }
  },
  actions: {
    /**
     * 通过字典类型获取字典项数据
     * @param {object} context({commit}使用了对象的解构)
     * @param {object} payload 请求参数
     */
    getDictByType ({commit}, payload) {
      let _this = Vue.prototype
      _this.$api.dict.findDictByType({
        classCode: payload.typeCode
      }).then((res) => {
        if (!res.data) return
        commit('updateDic', {
          name: payload.typeName,
          data: res.data
        })
      })
    }
  }
}