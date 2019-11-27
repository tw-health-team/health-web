import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    dicProps: { // 字典项合集
      organ: [ // 机构
        { typeCode: '1001', typeName: 'level' }, // 医疗机构级别
        { typeCode: '1002', typeName: 'classification' } // 医疗机构类型
      ],
      deptCenter: [ // 中心科室
        { typeCode: '1101', typeName: 'category' }, // 医疗机构级别
        { typeCode: '1102', typeName: 'runk' } // 医疗机构类型
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
       * @param {Object} data data.code 字典名称  data.data 字典数据
       */
      Vue.set(state.dictByType, data.name, data.data)
    }
  },
  actions: {
    getDictByType ({commit}, payload) {
      let _this = Vue.prototype
      _this.$api.dict.findDictByType({
        type: payload.typeCode
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