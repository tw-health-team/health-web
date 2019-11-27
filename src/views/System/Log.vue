<template>
  <div ref="pageContainer" class="page-container">
    <!--搜索栏-->
    <div class="list-select__container">
      <el-row :gutter="24" type="flex" justify="start" align="top">
        <el-col :span="6">
          <el-input v-model="filters.name" size="small" placeholder="用户名"></el-input>
        </el-col>
        <el-col :span="6" class="nopadding">
          <hm-button icon="fa fa-search" label="查询" perms="system:log:list" type="primary" @click="findPage(null)"/>
        </el-col>
      </el-row>
    </div>
    <!--表格内容栏-->
    <hm-table :height="tableHeight"
      :data="pageResult" :columns="columns" :showOperation="showOperation" @findPage="findPage">
    </hm-table>
  </div>
</template>

<script>
import HmTable from '@/views/Core/HmTable'
import HmButton from '@/views/Core/HmButton'
import { format } from '@/utils/datetime'
export default {
  components: {
    HmTable,
    HmButton
  },
  data () {
    return {
      tableHeight: null,
      size: 'small',
      filters: {
        name: ''
      },
      columns: [
        // {prop: 'id', label: 'ID', minWidth: 60},
        {prop: 'username', label: '用户名', minWidth: 100},
        // {prop:'operation', label:'操作', minWidth:120},
        {prop: 'classMethod', label: '方法', minWidth: 180},
        {prop: 'params', label: '参数', minWidth: 220},
        {prop: 'ip', label: 'IP', minWidth: 120},
        // {prop: 'time', label: '耗时', minWidth: 80},
        // {prop: 'createBy', label: '创建人', minWidth: 100},
        {prop: 'createDate', label: '创建时间', minWidth: 120, formatter: this.dateFormat},
        {prop: 'actionName', label: '接口描述', minWidth: 120}
        // {prop:'lastUpdateBy', label:'更新人', minWidth:100},
        // {prop:'lastUpdateTime', label:'更新时间', minWidth:120, formatter:this.dateFormat}
      ],
      pageRequest: { pageNum: 1, pageSize: 10, asc: false },
      pageResult: {},
      showOperation: false
    }
  },
  methods: {
    // 获取分页数据
    findPage: function (data) {
      if (data !== null) {
        this.pageRequest = data.pageRequest
      }
      this.pageRequest.name = this.filters.name
      this.pageRequest.asc = false
      this.$api.log.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
      }).then(data != null ? data.callback : '')
    },
    // 时间格式化
    dateFormat: function (row, column, cellValue, index) {
      return format(row[column.property])
    }
  },
  mounted () {
    // window.innerHeight:浏览器的可用高度
    this.tableHeight = window.innerHeight - 220
    // 赋值vue的this
    const that = this
    // window.onresize中的this指向的是window，不是指向vue
    window.onresize = () => {
      return (() => {
        that.tableHeight = window.innerHeight - 220
      })()
    }
  },
  watch: {
    tableHeight (val) {
      this.tableHeight = val
    }
  }
}
</script>

<style scoped lang="scss">

</style>