<template>
  <div>
    <el-popover ref="popover" :placement="placement" trigger="click">
      <!--搜索栏-->
      <div class="select-wrap">
        <el-row :gutter="24" type="flex" justify="start" align="top">
          <el-col :span="24">
            <el-input placeholder="输入名称或拼音简称过滤" size="small" clearable v-model="filterText"></el-input>
          </el-col>
        </el-row>
      </div>
      <div class="tree-wrap">
        <el-scrollbar class="scrollbar-wrap">
          <el-tree
            :data="deptCenterData"
            :props="deptCenterTreeProps"
            node-key="deptCenterId"
            ref="deptCenterTree"
            accordion
            @current-change="currentChangeHandle"
            default-expand-all
            highlight-current
            :expand-on-click-node="true"
            :filter-node-method="filterTreeNode">
          </el-tree>
        </el-scrollbar>
      </div>
    </el-popover>
    <el-input v-model="deptCenterName" v-popover:popover :readonly="true" placeholder="点击选择科室" style="cursor:pointer;"></el-input>
  </div>
</template>

<script>
import PopupTreeInput from '@/components/PopupTreeInput'
export default {
  name: 'deptCenterTreeInput',
  components: {
    PopupTreeInput
  },
  props: {
    // 科室名称
    deptCenterName: {
      type: String,
      default: ''
    },
    // 科室代码
    deptCenterId: {
      type: String,
      default: ''
    },
    placement: {
      type: String,
      default: 'right-start'
    },
    currentChangeHandle: {
      type: Function,
      default: null
    }
  },
  data () {
    return {
      // 科室树数据
      deptCenterData: [],
      // 科室树配置
      deptCenterTreeProps: {
        label: 'name',
        children: 'children'
      },
      // 过滤条件
      filterText: ''
    }
  },
  methods: {
    // 获取机构列表
    async findDeptCenterTree () {
      let params = {id: '', name: ''}
      await this.$api.deptCenter.findDeptCenterTree(params).then((res) => {
        this.deptCenterData = res.data
        console.log('获取中心科室数据')
      })
    },
    // 过滤树节点
    filterTreeNode: function (value, data) {
      if (!value) {
        return true
      }
      let isExistsSpelling = false
      if (data.simpleSpelling) {
        isExistsSpelling = data.simpleSpelling.indexOf(value) !== -1
      }
      return data.name.indexOf(value) !== -1 || isExistsSpelling
    }
  },
  computed: {
    treeFilterText () {
      return this.filterText
    }
  },
  created () {
    console.log('--------created()----------------')
    this.findDeptCenterTree()
  },
  mounted () {
    this.$nextTick(function () {
      console.log('设置高亮')
      this.$refs.deptCenterTree.setCurrentKey(this.deptCenterId)
    })
  },
  watch: {
    treeFilterText (val) {
      this.$refs.deptCenterTree.filter(val)
    }
  }
}
</script>

<style scoped lang="scss">
  .tree-wrap {
    // height:400px;
    height:calc(100vh - 150px * 2)
  }
  .scrollbar-wrap {
    height: 100%;
  }
</style>
