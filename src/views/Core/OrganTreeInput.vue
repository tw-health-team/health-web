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
            :data="organData"
            :props="organTreeProps"
            node-key="organId"
            ref="organTree"
            accordion
            @current-change="currentChangeHandle"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            :filter-node-method="filterTreeNode">
          </el-tree>
        </el-scrollbar>
      </div>
    </el-popover>
    <el-input v-model="organName" v-popover:popover :readonly="true" placeholder="点击选择机构" style="cursor:pointer;"></el-input>
  </div>
</template>

<script>
import PopupTreeInput from '@/components/PopupTreeInput'
export default {
  name: 'OrganTreeInput',
  components: {
    PopupTreeInput
  },
  props: {
    // 机构名
    organName: {
      type: String,
      default: ''
    },
    // 机构ID
    organId: {
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
      // 机构树数据
      organData: [],
      // 机构树配置
      organTreeProps: {
        label: 'name',
        children: 'children'
      },
      // 过滤条件
      filterText: ''
    }
  },
  methods: {
    // 获取机构列表
    async findOrganTree () {
      await this.$api.organ.findOrganTree().then((res) => {
        this.organData = res.data
        console.log('获取机构数据')
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
    this.findOrganTree()
  },
  mounted () {
    this.$nextTick(function () {
      console.log('设置高亮')
      this.$refs.organTree.setCurrentKey(this.organId)
    })
  },
  watch: {
    treeFilterText (val) {
      this.$refs.organTree.filter(val)
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
