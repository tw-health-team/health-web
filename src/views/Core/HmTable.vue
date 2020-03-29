<template>
  <div>
    <!--表格栏-->
    <el-table :data="data.records" :highlight-current-row="highlightCurrentRow" @selection-change="selectionChange"
          @current-change="handleCurrentChange" v-loading="loading" element-loading-text="拼命加载中" :border="border" :stripe="stripe"
          :show-overflow-tooltip="showOverflowTooltip" :height="height" :size="size" :align="align"
          style="width:100%;" :primaryKey="primaryKey">
      <el-table-column type="selection" width="40" v-if="showBatchDelete & showOperation"></el-table-column>
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <el-table-column v-for="column in columns" header-align="left" align="left"
        :prop="column.prop" :label="column.label" :width="column.width" :min-width="column.minWidth"
        :fixed="column.fixed" :key="column.prop" :type="column.type" :formatter="column.formatter"
        :sortable="column.sortable==null?true:column.sortable">
      </el-table-column>
      <el-table-column label="操作" width="185" fixed="right" v-if="showOperation" header-align="center" align="center">
        <template slot-scope="scope">
          <hm-button icon="fa fa-edit" label="编辑" :perms="permsEdit" :size="size" type="primary" @click="handleEdit(scope.$index, scope.row)" />
          <hm-button icon="fa fa-trash" label="删除" :perms="permsDelete" :size="size" type="danger" @click="handleDelete(scope.$index, scope.row)" />
        </template>
      </el-table-column>
    </el-table>
    <!--分页栏-->
    <div class="toolbar clearfix">
      <hm-button label="批量删除" :perms="permsDelete" :size="size" type="danger" @click="handleBatchDelete()"
        :disabled="this.selections.length===0" style="float:left;" v-if="showBatchDelete & showOperation"/>
      <el-pagination layout="total, sizes, prev, pager, next, jumper"
        @current-change="refreshPageRequest"
        @size-change="handleSizeChange"
        :current-page="pageRequest.pageNum"
        :page-sizes="[20, 50, 100]"
        :page-size="pageRequest.pageSize" :total="data.total" style="float:right;">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import HmButton from '@/views/Core/HmButton'
export default {
  name: 'HmTable',
  components: {
    HmButton
  },
  props: {
    primaryKey: String, // 主键名
    columns: Array, // 表格列配置
    data: Object, // 表格分页数据
    permsEdit: String, // 编辑权限标识
    permsDelete: String, // 删除权限标识
    size: { // 尺寸样式
      type: String,
      default: 'mini'
    },
    align: { // 文本对齐方式
      type: String,
      default: 'left'
    },
    maxHeight: { // 表格最大高度
      type: Number,
      default: 420
    },
    height: { // 表格高度
      type: Number,
      default: 350
    },
    showOperation: { // 是否显示操作组件
      type: Boolean,
      default: true
    },
    border: { // 是否显示边框
      type: Boolean,
      default: false
    },
    stripe: { // 是否显示斑马线
      type: Boolean,
      default: true
    },
    highlightCurrentRow: { // 是否高亮当前行
      type: Boolean,
      default: true
    },
    showOverflowTooltip: { // 是否单行显示
      type: Boolean,
      default: true
    },
    showBatchDelete: { // 是否显示操作组件
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      // 分页信息
      pageRequest: {
        pageNum: 1,
        pageSize: 20
      },
      loading: false, // 加载标识
      selections: [] // 列表选中列
    }
  },
  methods: {
    handleSizeChange (val) {
      this.pageRequest.pageSize = val
      this.findPage()
    },
    // 分页查询
    findPage: function () {
      this.loading = true
      let callback = res => {
        this.loading = false
      }
      this.$emit('findPage', { pageRequest: this.pageRequest, callback: callback })
    },
    // 选择切换
    selectionChange: function (selections) {
      this.selections = selections
      this.$emit('selectionChange', {selections: selections})
    },
    // 选择切换
    handleCurrentChange: function (val) {
      this.$emit('handleCurrentChange', {val: val})
    },
    // 换页刷新
    refreshPageRequest: function (pageNum) {
      this.pageRequest.pageNum = pageNum
      this.findPage()
    },
    // 编辑
    handleEdit: function (index, row) {
      this.$emit('handleEdit', {index: index, row: row})
    },
    // 删除
    handleDelete: function (index, row) {
      let id
      if (this.primaryKey) {
        // 主键名不为空 则根据外部传的主键名获取主键值
        id = row[this.primaryKey]
      } else {
        // 获取默认的主键id的值
        id = row.id
      }
      this.delete(id)
    },
    // 批量删除
    handleBatchDelete: function () {
      let ids = this.selections.map(item => item.id).toString()
      this.delete(ids)
    },
    // 删除操作
    delete: function (ids) {
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        let params = []
        let idArray = (ids + '').split(',')
        for (var i = 0; i < idArray.length; i++) {
          params.push(idArray[i])
        }
        this.loading = true
        let callback = res => {
          if (res.status === 1) {
            this.$message({message: '删除成功', type: 'success'})
            this.findPage()
          } else {
            this.$message({message: '操作失败, ' + res.msg, type: 'error'})
          }
          this.loading = false
        }
        this.$emit('handleDelete', {params: params, callback: callback})
      })
        .catch(() => {
        })
    }
  },
  mounted () {
    // 刷新页面
    this.refreshPageRequest(1)
  }
}
</script>

<style scoped lang="scss">
.clearfix:after {
  content: ".";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}

/* Hides from IE-mac \*/
* html .clearfix {
  height: 1%;
}
/* End hide from IE-mac */
</style>
