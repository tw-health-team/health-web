<template>
  <div class="page-container">
  <!--工具栏-->
  <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
    <el-form :inline="true" :model="filters" :size="size">
      <el-form-item>
        <el-input v-model="filters.name" placeholder="参数名"></el-input>
      </el-form-item>
      <el-form-item>
        <hm-button icon="fa fa-search" label="查询" perms="system:param:list" type="primary" @click="findPage(null)"/>
      </el-form-item>
      <el-form-item>
        <hm-button icon="fa fa-plus" label="新增" perms="system:param:add" type="primary" @click="handleAdd" />
      </el-form-item>
    </el-form>
  </div>
  <div class="toolbar" style="float:right;padding-top:10px;padding-right:15px;">
    <el-form :inline="true" :size="size">
      <el-form-item>
        <el-button-group>
        <el-tooltip content="刷新" placement="top">
          <el-button icon="fa fa-refresh" @click="findPage(null)"></el-button>
        </el-tooltip>
        <el-tooltip content="列显示" placement="top">
          <el-button icon="fa fa-filter" @click="displayFilterColumnsDialog"></el-button>
        </el-tooltip>
        <!-- <el-tooltip content="导出" placement="top">
          <el-button icon="fa fa-file-excel-o"></el-button>
        </el-tooltip> -->
        </el-button-group>
      </el-form-item>
    </el-form>
    <!--表格显示列界面-->
    <table-column-filter-dialog ref="tableColumnFilterDialog" :columns="columns"
      @handleFilterColumns="handleFilterColumns">
    </table-column-filter-dialog>
  </div>
  <!--表格内容栏-->
  <hm-table :height="350" permsEdit="system:param:update" :showBatchDelete="false" permsDelete="system:param:remove"
    :data="pageResult" :columns="filterColumns"
    @findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
  </hm-table>
  <!--新增编辑界面-->
  <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
    <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size"
      label-position="right">
      <!-- <el-form-item label="ID" prop="id" v-if="false">
        <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
      </el-form-item> -->
      <el-form-item label="参数编码" prop="id">
        <el-input v-model="dataForm.id" auto-complete="off" :readonly="!operation"></el-input>
      </el-form-item>
      <el-form-item label="参数名称" prop="name">
        <el-input v-model="dataForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="参数值" prop="value">
        <el-input v-model="dataForm.value" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="最大值" prop="maxValue">
        <el-input v-model="dataForm.maxValue" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="最小值" prop="minValue">
        <el-input v-model="dataForm.minValue" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="参数说明" prop="description">
        <el-input v-model="dataForm.description" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="参数值说明" prop="valueDescription">
        <el-input v-model="dataForm.valueDescription" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="输入方式" prop="inputTypeCode">
        <el-input v-model="dataForm.inputTypeCode" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="参数值类型" prop="valueTypeCode">
        <el-input v-model="dataForm.valueTypeCode" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="取值SQL" prop="getValueSql">
        <el-input v-model="dataForm.getValueSql" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="参数类型" prop="paramTypeCode">
        <el-input v-model="dataForm.paramTypeCode" auto-complete="off"></el-input>
      </el-form-item>
      <!-- <el-form-item label="机构" prop="deptName">
        <popup-tree-input
          :data="deptData"
          :props="deptTreeProps"
          :prop="dataForm.deptName"
          :nodeKey="''+dataForm.deptId"
          :currentChangeHandle="deptTreeCurrentChangeHandle">
        </popup-tree-input>
      </el-form-item> -->

      <!-- <el-form-item label="角色" prop="userRoles" v-if="!operation">
        <el-select v-model="dataForm.roles" multiple placeholder="请选择"
            style="width: 100%;">
          <el-option v-for="item in roles" :key="item.id"
            :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item> -->
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :size="size" @click.native="dialogVisible = false">取消</el-button>
      <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">提交</el-button>
    </div>
  </el-dialog>
  </div>
</template>

<script>
import PopupTreeInput from '@/components/PopupTreeInput'
import HmTable from '@/views/Core/HmTable'
import HmButton from '@/views/Core/HmButton'
import TableColumnFilterDialog from '@/views/Core/TableColumnFilterDialog'
import { format } from '@/utils/datetime'
export default {
  components: {
    PopupTreeInput,
    HmTable,
    HmButton,
    TableColumnFilterDialog
  },
  data () {
    return {
      size: 'small',
      filters: {
        name: ''
      },
      columns: [],
      filterColumns: [],
      pageRequest: { pageNum: 1, pageSize: 10 },
      pageResult: {},
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      dataFormRules: {
        id: [
          { required: true, message: '请输入参数编码', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 新增编辑界面数据
      dataForm: {
        id: '',
        name: '',
        value: '',
        maxValue: '',
        minValue: '',
        description: '',
        valueDescription: '',
        inputTypeCode: '',
        valueTypeCode: '',
        getValueSql: '',
        paramTypeCode: ''
      },
      deptData: [],
      deptTreeProps: {
        label: 'name',
        children: 'children'
      },
      roles: [],
      type: 1 // 1 新增 2 修改
    }
  },
  methods: {
    // 获取分页数据
    findPage: function (data) {
      if (data !== null) {
        this.pageRequest = data.pageRequest
      }
      this.pageRequest.name = this.filters.name
      this.$api.param.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        // this.findAllRoles()
      }).then(data != null ? data.callback : '')
    },
    // 批量删除
    handleDelete: function (data) {
      // this.$api.param.remove({ id: data.params[0] }).then(data != null ? data.callback : '')
      this.$api.param.batchDelete(data.params).then(data != null ? data.callback : '')
    },
    // 显示新增界面
    handleAdd: function () {
      this.type = 1
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: '',
        name: '',
        value: '',
        maxValue: '',
        minValue: '',
        description: '',
        valueDescription: '',
        inputTypeCode: '',
        valueTypeCode: '',
        getValueSql: '',
        paramTypeCode: ''
      }
    },
    // 显示编辑界面
    handleEdit: function (params) {
      this.type = 2
      this.dialogVisible = true
      this.operation = false
      this.dataForm = Object.assign({}, params.row)
    },
    // 编辑
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            if (this.type === 1) {
              this.$api.param.add(params).then((res) => {
                this.editLoading = false
                if (res.status === 1) {
                  this.$message({ message: '操作成功', type: 'success' })
                  this.dialogVisible = false
                  this.$refs['dataForm'].resetFields()
                } else {
                  this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                }
                this.findPage(null)
              })
            } else {
              this.$api.param.update(params).then(res => {
                this.editLoading = false
                if (res.status === 1) {
                  this.$message({ message: '操作成功', type: 'success' })
                  this.$refs['dataForm'].resetFields()
                  this.dialogVisible = false
                } else {
                  this.$message({
                    message: '操作失败, ' + res.msg,
                    type: 'error'
                  })
                }
                this.findPage(null)
              })
            }
          })
        }
      })
    },
    // 时间格式化
    dateFormat: function (row, column, cellValue, index) {
      return format(row[column.property])
    },
    // 角色格式化
    // roleFormat: function (row, column, cellValue, index) {
    //   let roles = []
    //   if (row.roles != null && row.roles.length > 0) {
    //     row.roles.forEach(element => {
    //       roles.push(element.name + '；')
    //     })
    //   }
    //   return roles
    // },
    // 状态格式化
    statusFormat: function (row, column, cellValue, index) {
      return row.status === 1 ? '正常' : '锁定中'
    },
    // 处理表格列过滤显示
    displayFilterColumnsDialog: function () {
      this.$refs.tableColumnFilterDialog.setDialogVisible(true)
    },
    // 处理表格列过滤显示
    handleFilterColumns: function (data) {
      this.filterColumns = data.filterColumns
      this.$refs.tableColumnFilterDialog.setDialogVisible(false)
    },
    // 处理表格列过滤显示
    initColumns: function () {
      this.columns = [
        {prop: 'id', label: '参数编码', minWidth: 120},
        {prop: 'name', label: '参数名称', minWidth: 120},
        {prop: 'value', label: '参数值', minWidth: 120},
        {prop: 'maxValue', label: '最大值', minWidth: 120},
        {prop: 'minValue', label: '最小值', minWidth: 120},
        {prop: 'description', label: '参数说明', minWidth: 120},
        {prop: 'valueDescription', label: '参数值说明', minWidth: 120},
        {prop: 'inputTypeCode', label: '输入方式', minWidth: 120},
        {prop: 'valueTypeCode', label: '参数值类型', minWidth: 120},
        {prop: 'getValueSql', label: '取值SQL', minWidth: 120},
        {prop: 'paramTypeCode', label: '参数类型', minWidth: 120},
        {prop: 'status', label: '状态', minWidth: 70, formatter: this.statusFormat}
        // {prop:'createBy', label:'创建人', minWidth:120},
        // {prop:'createTime', label:'创建时间', minWidth:120, formatter:this.dateFormat}
        // {prop:'lastUpdateBy', label:'更新人', minWidth:100},
        // {prop:'lastUpdateTime', label:'更新时间', minWidth:120, formatter:this.dateFormat}
      ]
      this.filterColumns = this.columns // JSON.parse(JSON.stringify(this.columns))
    }
  },
  mounted () {
    this.initColumns()
  }
}
</script>

<style scoped>
.hide{
  width: 0;
  position: absolute
}
</style>