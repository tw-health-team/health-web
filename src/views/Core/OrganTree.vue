<template>
<div class="list-column__container">
  <div class="list-title__container">
    <span>机构选择</span>
  </div>
  <div class="list-select__container">
    <el-row :gutter="24" type="flex" justify="start" align="top">
      <el-col :span="18">
        <el-input placeholder="输入名称或拼音简称过滤" size="small" clearable v-model="filterText"></el-input>
      </el-col>
      <el-col :span="6" class="switch-wrap nopadding">
        <el-switch v-model="isFold" @change="expandOrFoldAllNode"></el-switch>
      </el-col>
    </el-row>
  </div>
  <el-scrollbar class="list-tree__container">
  <!--机构树-->
    <el-tree :data="organData" :props="organTreeProps" node-key="id"
              ref="organTree" @current-change="currentChangeHandle"
              default-expand-all highlight-current
              :expand-on-click-node="false" :filter-node-method="filterTreeNode">
    </el-tree>
  </el-scrollbar>
</div>
</template>

<script>
export default {
  name: 'OrganTree',
  components: {
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
      // 默认选中的key
      defaultSelectedKey: '',
      // 过滤条件
      filterText: '',
      isFold: true
    }
  },
  methods: {
    // 获取机构列表
    async findOrganTree () {
      await this.$api.organ.findOrganTree().then((res) => {
        this.organData = res.data
        if (this.organId) {
          this.defaultSelectedKey = this.organId
          console.log('默认父组件传的机构ID')
        } else {
          this.defaultSelectedKey = res.data[0].id
          console.log('获取第一行的ID')
        }
        console.log('获取机构数据END')
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
    },
    // 展开/折叠所有节点
    expandOrFoldAllNode () {
      for (var i = 0; i < this.$refs.organTree.store._getAllNodes().length; i++) {
        this.$refs.organTree.store._getAllNodes()[i].expanded = this.isFold
      }
    }
  },
  computed: {
    treeFilterText () {
      return this.filterText
    },
    defaultSelected () {
      return this.defaultSelectedKey
    }
  },
  created () {
    console.log('--------created()----------------')
    this.findOrganTree()
  },
  mounted () {
  },
  watch: {
    treeFilterText (val) {
      this.$refs.organTree.filter(val)
    },
    defaultSelected (val) {
      // 默认选中行 后不能触发current-change事件 暂时注释
      // this.$nextTick(function () {
      //   console.log('设置默认高亮行')
      //   console.log(val)
      //   this.$refs.organTree.setCurrentKey(val)
      // })
    }
  }
}
</script>

<style scoped lang="scss">
  /deep/.tree-wrap {
    height: calc(100% - 62px);
  }
</style>