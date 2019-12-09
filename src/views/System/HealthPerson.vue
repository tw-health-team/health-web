<template>
  <div class="page-container">
  <!--工具栏-->
  <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
    <el-form :inline="true" :model="filters" :size="size">
      <el-form-item>
        <el-input v-model="filters.name" placeholder="卫生人员姓名"></el-input>
      </el-form-item>
      <el-form-item>
        <hm-button icon="fa fa-search" label="查询" perms="system:healthperson:list" type="primary" @click="findPage(null)"/>
      </el-form-item>
      <el-form-item>
        <hm-button icon="fa fa-plus" label="新增" perms="system:healthperson:add" type="primary" @click="handleAdd" />
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
  <hm-table :height="350" permsEdit="system:healthperson:update" :showBatchDelete="false" permsDelete="system:healthperson:remove"
    :data="pageResult" :columns="filterColumns"
    @findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
  </hm-table>
  <!--新增编辑界面-->
  <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
    <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size"
      label-position="right">
      <!-- <el-form-item label="所属机构" prop="organName">
        <popup-tree-input
          :data="deptData"
          :props="deptTreeProps"
          :prop="dataForm.organName"
          :nodeKey="''+dataForm.organId"
          :currentChangeHandle="organTreeCurrentChangeHandle">
        </popup-tree-input>
      </el-form-item> -->
      <el-form-item label="所属机构" prop="organName">
          <popup-tree-input
            :data="popupTreeData" :props="popupTreeProps" :prop="dataForm.organName==null?'顶级机构':dataForm.organName"
            :nodeKey="''+dataForm.organId" :currentChangeHandle="organTreeCurrentChangeHandle">
          </popup-tree-input>
        </el-form-item>
      <el-form-item label="人员工号" prop="jobNumber">
        <el-input v-model="dataForm.jobNumber" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="人员姓名" prop="name">
        <el-input v-model="dataForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="出生日期" prop="birthday">
        <el-input v-model="dataForm.birthday" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-input v-model="dataForm.sex" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="身份证号" prop="idcard">
        <el-input v-model="dataForm.idcard" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="telephone">
        <el-input v-model="dataForm.telephone" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="文化程度" prop="education">
        <el-input v-model="dataForm.education" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="职  称" prop="title">
        <el-input v-model="dataForm.title" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="职  务" prop="post">
        <el-input v-model="dataForm.post" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="电子邮箱" prop="email">
        <el-input v-model="dataForm.email" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="所属科室" prop="belongDepart">
        <el-input v-model="dataForm.belongDepart" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="启用状态" prop="enabled">
        <el-input v-model="dataForm.enabled" auto-complete="off"></el-input>
      </el-form-item>
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
        organName: [
          { required: true, message: '请选择所属机构', trigger: 'blur' }
        ],
        jobNumber: [
          { required: true, message: '请输入人员工号', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入人员姓名', trigger: 'blur' }
        ]/* ,
        birthday: [
          { required: true, message: '请输入出生日期', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '请输入性别', trigger: 'blur' }
        ],
        idcard: [
          { required: true, message: '请输入身份证号', trigger: 'blur' }
        ],
        telephone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' }
        ] */
      },
      // 新增编辑界面数据
      dataForm: {
        organId: '',
        organName: '',
        jobNumber: '',
        name: '',
        birthday: '',
        sex: '',
        idcard: '',
        telephone: '',
        education: '',
        title: '',
        post: '',
        email: '',
        belongDepart: '',
        enabled: ''
      },
      popupTreeData: [],
      popupTreeProps: {
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
      // debugger
      // this.pageRequest.columnFilters = {name: {name: 'name', value: this.filters.name}}
      this.pageRequest.name = this.filters.name
      this.$api.healthPerson.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        // this.findAllRoles()
      }).then(data != null ? data.callback : '')
    },
    // 加载用户角色信息
    findAllRoles: function () {
      this.$api.role.findAll().then((res) => {
        // 加载角色集合
        this.roles = res.data
      })
    },
    // 批量删除
    handleDelete: function (data) {
      this.$api.healthPerson.remove({ id: data.params[0] }).then(data != null ? data.callback : '')
    },
    // 显示新增界面
    handleAdd: function () {
      this.type = 1
      this.dialogVisible = true
      this.operation = false
      this.dataForm = {
        organId: '',
        organName: '',
        jobNumber: '',
        name: '',
        birthday: '',
        sex: '',
        idcard: '',
        telephone: '',
        education: '',
        title: '',
        post: '',
        email: '',
        belongDepart: '',
        enabled: ''
      }
    },
    // 显示编辑界面
    handleEdit: function (params) {
      this.type = 2
      this.dialogVisible = true
      this.operation = false
      this.dataForm = Object.assign({}, params.row)
      /* let userRoles = []
      for (let i = 0, len = params.row.roles.length; i < len; i++) {
        userRoles.push(params.row.roles[i].id)
      }
      this.dataForm.roles = userRoles */
    },
    // 编辑
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            // debugger
            let params = Object.assign({}, this.dataForm)
            /* let userRoles = []
            if (params.roles !== null) {
              for (let i = 0, len = params.roles.length; i < len; i++) {
                let userRole = {
                  id: params.roles[i]
                }
                userRoles.push(userRole)
              }
            }
            params.roles = userRoles */
            if (this.type === 1) {
              this.$api.healthPerson.add(params).then((res) => {
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
              this.$api.healthPerson.update(params).then(res => {
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
    // 获取机构列表
    findOrganData: function () {
      this.$api.organ.findOrganTree().then((res) => {
        this.popupTreeData = res.data
      })
    },
    // 机构树选中
    organTreeCurrentChangeHandle (data, node) {
      this.dataForm.organId = data.id
      this.dataForm.organName = data.name
    },
    // 时间格式化
    dateFormat: function (row, column, cellValue, index) {
      return format(row[column.property])
    },
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
        // {prop: 'id', label: 'ID', minWidth: 50},
        {prop: 'organName', label: '机构名称', minWidth: 120},
        {prop: 'jobNumber', label: '人员工号', minWidth: 120},
        {prop: 'name', label: '人员姓名', minWidth: 100},
        {prop: 'birthday', label: '出生日期', minWidth: 120, formatter: this.dateFormat},
        // {prop: 'sex', label: '性别', minWidth: 100},
        {prop: 'idcard', label: '身份证号', minWidth: 200},
        {prop: 'telephone', label: '联系电话', minWidth: 100},
        {prop: 'belongDepart', label: '所属科室', minWidth: 100},
        {prop: 'enabled', label: '启用状态', minWidth: 100}
        // {prop:'createBy', label:'创建人', minWidth:120},
        // {prop:'createTime', label:'创建时间', minWidth:120, formatter:this.dateFormat}
        // {prop:'lastUpdateBy', label:'更新人', minWidth:100},
        // {prop:'lastUpdateTime', label:'更新时间', minWidth:120, formatter:this.dateFormat}
      ]
      this.filterColumns = this.columns // JSON.parse(JSON.stringify(this.columns))
    }
  },
  mounted () {
    this.findOrganData()
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