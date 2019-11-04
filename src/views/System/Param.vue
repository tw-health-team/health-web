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
    <el-form :model="dataForm"  :rules="dataFormRules" ref="dataForm" 
    label-width="80px" :size="size" style="text-align:left;">
      <!-- <el-form-item label="ID" prop="id" v-if="false">
        <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
      </el-form-item> -->
      <!-- <div class="form-item-wrap"> -->
          <el-form-item label="参数类型" prop="paramTypeCode">
            <el-select v-model="dataForm.paramTypeCode" placeholder="请选择"
                style="width: 100%;">
              <el-option v-for="item in this.getParamType" :key="item.id"
                :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
      <!-- </div> -->
      <el-form-item label="参数编码" prop="id">
        <el-input v-model="dataForm.id" auto-complete="off" :readonly="!operation" maxlength="25" show-word-limit></el-input>
      </el-form-item>
      <el-form-item label="参数名称" prop="name">
        <el-input v-model="dataForm.name" auto-complete="off" maxlength="50" show-word-limit></el-input>
      </el-form-item>
      <el-form-item label="参数说明" prop="description">
        <el-input v-model="dataForm.description" auto-complete="off" maxlength="125" show-word-limit></el-input>
      </el-form-item>
       <div class="form-item-wrap">
        <el-form-item label="值类型" prop="valueTypeCode">
          <el-select v-model="dataForm.valueTypeCode" placeholder="请选择"
              style="width: 100%;">
            <el-option v-for="item in this.getValueType" :key="item.id"
              :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="输入方式" prop="inputTypeCode">
          <el-select v-model="dataForm.inputTypeCode" placeholder="请选择"
              style="width: 100%;">
            <el-option v-for="item in this.getInputType" :key="item.id"
              :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </div>
      <el-form-item label="参数值" prop="value">
        <el-input v-model="dataForm.value" auto-complete="off" maxlength="250" show-word-limit></el-input>
      </el-form-item>
      
      <div class="form-item-wrap">
        <el-form-item label="最小值" prop="minValue">
          <el-input v-model="dataForm.minValue" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="最大值" prop="maxValue">
          <el-input v-model="dataForm.maxValue" auto-complete="off"></el-input>
        </el-form-item>
      </div>
       <el-form-item label="值说明" prop="valueDescription">
        <el-input v-model="dataForm.valueDescription" auto-complete="off" maxlength="125" show-word-limit></el-input>
      </el-form-item>
      <el-form-item label="取值SQL" prop="getValueSql">
        <el-input v-model="dataForm.getValueSql" auto-complete="off" maxlength="250" show-word-limit></el-input>
      </el-form-item>
       <el-form-item label="记录状态" prop="delFlag">
          <el-select v-model="dataForm.delFlag" placeholder="请选择"
              style="width: 100%;">
            <el-option v-for="item in this.getDelFlag" :key="item.id"
              :label="item.label" :value="item.value">
            </el-option>
          </el-select>
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
import { mapState, mapGetters } from 'vuex'
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
        paramTypeCode: '',
        delFlag: ''
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
  computed: {
    ...mapState('dict', [
      'dicProps'
    ]),
    ...mapGetters('dict', {
      getDic: 'getDic'
    }),
    getInputType () {
      return this.getDic('inputType')
    },
    getValueType () {
      return this.getDic('valueType')
    },
    getParamType () {
      return this.getDic('paramType')
    },
    getDelFlag () {
      return this.getDic('delFlag')
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
        paramTypeCode: '',
        delFlag: ''
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
    // 列值格式化
    delFlagFormat: function (row, column, cellValue, index) {
      return row.delFlag === '0' ? '正常' : '禁用'
    },
    paramTypeFormat: function (row, column, cellValue, index) {
      return row.paramTypeCode === '0' ? '框架参数' : '业务参数'
    },
    inputTypeFormat: function (row, column, cellValue, index) {
      return row.inputTypeCode === '0' ? '手工输入' : '列表选择'
    },
    valueTypeFormat: function (row, column, cellValue, index) {
      var val = ''
      if(row.valueTypeCode === '0') {
        val = '字符串'
      }else if(row.valueTypeCode === '1') {
        val = '整型'
      }else 
      {
        val = '时间'
      }
      return val
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
        {prop: 'paramTypeCode', label: '参数类型', minWidth: 120, formatter: this.paramTypeFormat},
        {prop: 'id', label: '参数编码', minWidth: 120},
        {prop: 'name', label: '参数名称', minWidth: 120},
        {prop: 'description', label: '参数说明', minWidth: 120},
        {prop: 'valueTypeCode', label: '参数值类型', minWidth: 120, formatter: this.valueTypeFormat},
        {prop: 'value', label: '参数值', minWidth: 120},
        {prop: 'maxValue', label: '最大值', minWidth: 120},
        {prop: 'minValue', label: '最小值', minWidth: 120},
        {prop: 'valueDescription', label: '参数值说明', minWidth: 120},
        {prop: 'inputTypeCode', label: '输入方式', minWidth: 120, formatter: this.inputTypeFormat},
        {prop: 'getValueSql', label: '取值SQL', minWidth: 120},
        {prop: 'delFlag', label: '记录状态', minWidth: 120, formatter: this.delFlagFormat}
        // {prop:'createBy', label:'创建人', minWidth:120},
        // {prop:'createTime', label:'创建时间', minWidth:120, formatter:this.dateFormat}
        // {prop:'lastUpdateBy', label:'更新人', minWidth:100},
        // {prop:'lastUpdateTime', label:'更新时间', minWidth:120, formatter:this.dateFormat}
      ]
      this.filterColumns = this.columns // JSON.parse(JSON.stringify(this.columns))
    },
    fetchDics () {
      /**
       * 请求字典数据
       */
      if (!this.getDictByType) {
        // 获取机构字典
        this.dicProps.param.forEach(prop => {
          this.$store.dispatch('dict/getDictByType', prop)
        })
      }
    }
  },
  mounted () {
    this.initColumns()
    this.fetchDics()
  }
}
</script>

<style scoped lang="scss">
  @import "@/assets/css/detail.scss";
  .el-button+.el-button--mini {
    margin-left: 0px;
    margin-top: 2px;
  }
</style>