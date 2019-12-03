<template>
  <div ref="pageContainer" class="page-container">
  <!--工具栏-->
  <div class="list-select__container">
    <el-row :gutter="24" type="flex" justify="start" align="top">
      <el-col :span="6" :xs="12" :sm="8" :md="8" :lg="6">
        <el-input v-model="filters.name" size="small" placeholder="输入用户名模糊查询" clearable></el-input>
      </el-col>
      <el-col :span="8" :xs="12" :sm="10" :md="8" :lg="6" class="nopadding">
        <hm-button icon="fa fa-search" label="查询" perms="system:user:list" type="primary" @click="findPage(null)"/>
        <hm-button icon="fa fa-plus" label="新增" perms="system:user:add" type="primary" @click="handleAdd" />
      </el-col>
      <!-- <el-col :offset="4" :span="6" :sm="6" :md="4" :lg="6">
        <el-button-group>
        <el-tooltip content="刷新" placement="top">
          <el-button icon="fa fa-refresh" @click="findPage(null)"></el-button>
        </el-tooltip>
        <el-tooltip content="列显示" placement="top">
          <el-button icon="fa fa-filter" @click="displayFilterColumnsDialog"></el-button>
        </el-tooltip>
        </el-button-group>
      </el-col> -->
      <!--表格显示列界面-->
      <!-- <table-column-filter-dialog ref="tableColumnFilterDialog" :columns="columns"
        @handleFilterColumns="handleFilterColumns">
      </table-column-filter-dialog> -->
    </el-row>
  </div>
  <!--表格内容栏-->
  <!-- <hm-table :height="tableHeight" permsEdit="system:user:update" :showBatchDelete="false" permsDelete="system:user:remove"
    :data="pageResult" :columns="filterColumns"
    @findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
  </hm-table> -->
  <!--表格内容栏-->
  <el-table ref="userTable" :height="tableHeight" :data="pageResult.records" stripe size="mini"
    rowKey="id" v-loading="loading" element-loading-text="拼命加载中">
    <el-table-column type="index" width="50" label="序号"></el-table-column>
    <el-table-column
      prop="name" header-align="center" align="center" minWidth="120" label="用户名">
    </el-table-column>
    <el-table-column
      prop="organName" header-align="center" align="center" minWidth="120" label="机构">
    </el-table-column>
    <el-table-column
      prop="roleNames" header-align="center" align="center" minWidth="150" label="角色">
      <template slot-scope="scope">
        <el-tag class="role-tag" v-for="(role) in scope.row.roles" :key="role.id" size="small"
          :type="role.name.indexOf('管理员')>-1?'primary':'info'">{{role.name}} </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      prop="mobile" header-align="center" align="center" width="100" label="手机">
    </el-table-column>
    <el-table-column
      prop="status" header-align="center" align="center" width="90" label="状态">
      <template slot-scope="scope">
        <el-tag v-if="scope.row.status === 1" size="small" type="success">正常</el-tag>
        <el-tag v-else-if="scope.row.status === 0" size="small" type="warning">锁定</el-tag>
      </template>
    </el-table-column>
    <el-table-column
      fixed="right" header-align="center" align="center" width="250" label="操作">
      <template slot-scope="scope">
        <hm-button icon="fa fa-edit" label="编辑" perms="system:user:update" type="primary" size="mini" @click="handleEdit(scope.row)"/>
        <hm-button icon="fa fa-lock" :label="scope.row.status === 1 ? '锁定':'恢复'" perms="system:user:update"
          :type="scope.row.status === 1 ? 'warning':'success'" size="mini" @click="handleLock(scope.row)"/>
        <hm-button icon="fa fa-trash" label="删除" perms="system:user:remove" type="danger" size="mini" @click="handleDelete(scope.row)"/>
      </template>
    </el-table-column>
  </el-table>
  <!-- ------------------------------新增修改界面 begin-------------------------------- -->
  <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
    <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size"
      label-position="right">
      <input type="password" class="hide" id="loginPassword"/>
      <input type="text" class="hide" id="loginUserName"/>
      <el-form-item label="ID" prop="id" v-if="false">
        <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="name">
        <el-input v-model="dataForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="dataForm.password" type="password" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="机构" prop="organName">
        <OrganTreeInput :organName="dataForm.organName" :organId="dataForm.organId"
          :currentChangeHandle="organTreeCurrentChangeHandle">
        </OrganTreeInput>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dataForm.email" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="dataForm.mobile" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="角色" prop="userRoles" v-if="!operation">
        <el-select v-model="dataForm.roles" multiple placeholder="请选择"
            style="width: 100%;">
          <el-option v-for="item in roles" :key="item.id"
            :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :size="size" @click.native="dialogVisible = false">取消</el-button>
      <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">提交</el-button>
    </div>
  </el-dialog>
  <!-- ------------------------------新增修改界面 end-------------------------------- -->
  </div>
</template>

<script>
import HmTable from '@/views/Core/HmTable'
import HmButton from '@/views/Core/HmButton'
import OrganTreeInput from '@/views/Core/OrganTree'
import TableColumnFilterDialog from '@/views/Core/TableColumnFilterDialog'
import { format } from '@/utils/datetime'
export default {
  components: {
    OrganTreeInput,
    HmTable,
    HmButton,
    TableColumnFilterDialog
  },
  data () {
    return {
      // -----------------列表 begin------------------
      tableHeight: null,
      loading: false,
      size: 'small',
      filters: {
        name: ''
      },
      columns: [],
      filterColumns: [],
      pageRequest: { pageNum: 1, pageSize: 10 },
      // 分页数据
      pageResult: {},
      // -----------------列表 end--------------------------
      // -----------------新增编辑 begin------------------
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      dataFormRules: {
        name: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      },
      // 新增编辑界面数据
      dataForm: {
        id: 0,
        name: '',
        password: '123456',
        organId: '',
        organName: '',
        email: '',
        mobile: '',
        status: 1,
        userRoles: []
      },
      roles: [],
      type: 1 // 1 新增 2 修改
      // -----------------新增编辑 end------------------
    }
  },
  methods: {
    // 获取分页数据
    findPage: function (data) {
      if (data !== null) {
        this.pageRequest = data.pageRequest
      }
      // this.pageRequest.columnFilters = {name: {name: 'name', value: this.filters.name}}
      this.pageRequest.name = this.filters.name
      this.$api.user.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
        this.findAllRoles()
      })
    },
    // 加载用户角色信息
    findAllRoles: function () {
      this.$api.role.findAll().then((res) => {
        // 加载角色集合
        this.roles = res.data
      })
    },
    // 删除
    handleDelete: function (data) {
      this.$confirm('确认删除该用户吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$api.user.remove({ id: data.id }).then((res) => {
          this.callBack(res, '删除成功')
        })
      }).catch(() => {})
    },
    callBack: function (res, successMsg) {
      if (res.status > 0) {
        this.findPage(null)
        if (successMsg) {
          this.$message({ message: successMsg, type: 'success' })
        }
      } else {
        this.$message({message: res.msg, type: 'error'})
      }
    },
    // 显示新增界面
    handleAdd: function () {
      this.type = 1
      this.dialogVisible = true
      this.operation = false
      this.dataForm = {
        id: 0,
        name: '',
        password: '',
        organId: '',
        organName: '',
        email: '',
        mobile: '',
        status: 1,
        roles: []
      }
    },
    // 显示编辑界面
    handleEdit: function (row) {
      this.type = 2
      this.dialogVisible = true
      this.operation = false
      this.dataForm = Object.assign({}, row)
      let userRoles = []
      for (let i = 0, len = row.roles.length; i < len; i++) {
        userRoles.push(row.roles[i].id)
      }
      this.dataForm.roles = userRoles
    },
    // 锁定/恢复账户
    handleLock: function (row) {
      if (row.status === 1) {
        this.$confirm('锁定后该用户将无法登陆，是否确定锁定？', '提示', {
          type: 'warning'
        }).then(() => {
          // 锁定
          this.$api.user.lock({'id': row.id}).then(res => {
            this.callBack(res, '锁定成功！')
          })
        })
      } else if (row.status === 0) {
        // 恢复
        this.$api.user.unlock({'id': row.id}).then(res => {
          this.callBack(res, '恢复成功！')
        })
      }
    },
    // 编辑
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            let userRoles = []
            if (params.roles !== null) {
              for (let i = 0, len = params.roles.length; i < len; i++) {
                let userRole = {
                  id: params.roles[i]
                }
                userRoles.push(userRole)
              }
            }
            params.roles = userRoles
            if (this.type === 1) {
              this.$api.user.add(params).then((res) => {
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
              this.$api.user.update(params).then(res => {
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
    // 机构树选中
    organTreeCurrentChangeHandle (data, node) {
      this.dataForm.organId = data.id
      this.dataForm.organName = data.name
    },
    // 时间格式化
    dateFormat: function (row, column, cellValue, index) {
      return format(row[column.property])
    },
    // 角色格式化
    roleFormat: function (row, column, cellValue, index) {
      let roles = []
      if (row.roles != null && row.roles.length > 0) {
        row.roles.forEach(element => {
          roles.push(element.name + '；')
        })
      }
      return roles
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
        {prop: 'name', label: '用户名', minWidth: 120},
        {prop: 'organName', label: '机构', minWidth: 120},
        {prop: 'roleNames', label: '角色', minWidth: 100, formatter: this.roleFormat},
        {prop: 'email', label: '邮箱', minWidth: 120},
        {prop: 'mobile', label: '手机', minWidth: 100},
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
    this.findPage(null)
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
    this.initColumns()
  },
  watch: {
    tableHeight (val) {
      this.tableHeight = val
    }
  }
}
</script>

<style scoped lang="scss">
.hide{
  width: 0px;
  height: 0px;
  padding: 0px;
  border: 0px;
  position: absolute
}
.role-tag+.role-tag{
  margin: 2px 0px 2px 2px;
}
</style>