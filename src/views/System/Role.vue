<template>
  <div class="page-container">
    <el-row :gutter="24" type="flex" justify="start" align="top" class="content-container">
      <el-col :span="18">
        <div class="list-title__container">
          <span>角色列表</span>
        </div>
        <!--搜索栏-->
        <div class="list-select__container">
          <el-row :gutter="24" type="flex" justify="start" align="top">
            <el-col :span="6" :xs="12" :sm="8" :md="8" :lg="6">
              <el-input v-model="filters.name" size="small" placeholder="角色名"></el-input>
            </el-col>
            <el-col :span="8" :xs="12" :sm="10" :md="8" :lg="6" class="nopadding">
              <hm-button icon="fa fa-search" label="查询" perms="system:role:list" type="primary" @click="findPage(null)"/>
              <hm-button icon="fa fa-plus" label="新增" perms="system:role:add" type="primary" @click="handleAdd" />
            </el-col>
          </el-row>
        </div>
        <!--表格内容栏-->
        <hm-table permsEdit="system:role:update" :height="tableHeight" permsDelete="system:role:remove" :highlightCurrentRow="true" :stripe="false"
          :data="pageResult" :columns="columns" :showBatchDelete="false" @handleCurrentChange="handleRoleSelectChange"
          @findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
        </hm-table>
      </el-col>
      <el-col :span="6" class="list-column__container">
        <div class="list-title__container">
          <span>菜单授权</span> - <span>{{selectRole.name?selectRole.name:'未选择角色'}}</span>
        </div>
        <!--搜索栏-->
        <div class="list-select__container">
          <el-row :gutter="24" type="flex" justify="start" align="top">
            <el-col :span="18">
              <el-input placeholder="输入名称过滤" size="small" clearable v-model="menuTree.filterText"></el-input>
            </el-col>
            <el-col :span="6" class="switch-wrap nopadding">
              <el-switch v-model="menuTree.isFold" @change="expandOrFoldAllNode"></el-switch>
            </el-col>
          </el-row>
        </div>
        <el-scrollbar class="list-tree__container">
          <el-tree :data="menuData" size="mini" show-checkbox node-key="id" :props="defaultProps"
            ref="menuTree" :render-content="renderContent"
            v-loading="menuLoading" element-loading-text="拼命加载中" :check-strictly="true"
            @check-change="handleMenuCheckChange" default-expand-all :filter-node-method="filterTreeNode">
          </el-tree>
        </el-scrollbar>
        <div class="toolbar">
          <div style="float:left;padding-top:5px;">
            <el-checkbox v-model="checkAll" @change="handleCheckAll" :disabled="this.selectRole.id == null"><b>全选</b></el-checkbox>
          </div>
          <div style="float:right;">
            <hm-button label="取消" perms="system:role:update" size="mini" type="primary" @click="resetSelection"
              :disabled="this.selectRole.id == null"/>
            <hm-button label="提交" perms="system:role:update" size="mini" type="primary" @click="submitAuthForm"
              :disabled="this.selectRole.id == null" :loading="authLoading"/>
          </div>
        </div>
      </el-col>
    </el-row>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size">
        <el-form-item label="ID" prop="id" v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色名" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注 " prop="remark">
          <el-input v-model="dataForm.remark" auto-complete="off" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible = false">取消</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import HmTable from '@/views/Core/HmTable'
import HmButton from '@/views/Core/HmButton'
import TableTreeColumn from '@/views/Core/TableTreeColumn'
import { format } from '@/utils/datetime'
export default {
  components: {
    HmTable,
    HmButton,
    TableTreeColumn
  },
  data () {
    return {
      // 菜单树
      menuTree: {
        isFold: true, // 是否折叠所有节点
        filterText: ''
      },
      tableHeight: null,
      size: 'small',
      filters: {
        name: ''
      },
      columns: [
        // {prop: 'id', label: 'ID', minWidth: 50},
        {prop: 'name', label: '角色名', minWidth: 120},
        {prop: 'remark', label: '备注', minWidth: 120}
        // {prop: 'createBy', label: '创建人', minWidth: 120},
        // {prop: 'createTime', label: '创建时间', minWidth: 120, formatter: this.dateFormat}
        // {prop:'lastUpdateBy', label:'更新人', minWidth:100},
        // {prop:'lastUpdateTime', label:'更新时间', minWidth:120, formatter:this.dateFormat}
      ],
      pageRequest: { pageNum: 1, pageSize: 10 },
      pageResult: {},
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      dataFormRules: {
        name: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ]
      },
      // 新增编辑界面数据
      dataForm: {
        id: 0,
        name: '',
        remark: ''
      },
      selectRole: {},
      menuData: [],
      menuSelections: [],
      menuLoading: false,
      authLoading: false,
      checkAll: false,
      currentRoleMenus: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      type: 1 // 1 新增 2 修改
    }
  },
  methods: {
    // ------------------------------左侧列表begin-------------------------------------
    // 获取分页数据
    findPage: function (data) {
      if (data !== null) {
        this.pageRequest = data.pageRequest
      }
      this.pageRequest.columnFilters = {name: {name: 'name', value: this.filters.name}}
      this.$api.role.list(this.pageRequest).then((res) => {
        this.pageResult = res.data
        this.findTreeData()
      }).then(data != null ? data.callback : '')
    },
    // 角色删除
    handleDelete: function (data) {
      this.$api.role.remove({ id: data.params[0] }).then(data.callback)
    },
    // ------------------------------左侧列表end-------------------------------------
    // ------------------------------右侧树begin-------------------------------------
    // 展开/折叠所有节点
    expandOrFoldAllNode () {
      for (var i = 0; i < this.$refs.menuTree.store._getAllNodes().length; i++) {
        this.$refs.menuTree.store._getAllNodes()[i].expanded = this.menuTree.isFold
      }
    },
    // 过滤树节点
    filterTreeNode: function (value, data) {
      if (!value) {
        return true
      }
      return data.name.indexOf(value) !== -1
    },
    // ------------------------------右侧树end-------------------------------------
    // 显示新增界面
    handleAdd: function () {
      this.type = 1
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: 0,
        name: '',
        remark: ''
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
              this.$api.role.add(params).then((res) => {
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
              this.$api.role.update(this.dataForm, params).then((res) => {
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
            }
          })
        }
      })
    },
    // 获取数据
    findTreeData: function () {
      this.menuLoading = true
      this.$api.menu.findResourceTree().then((res) => {
        this.menuData = res.data
        this.menuLoading = false
      })
    },
    // 角色选择改变监听
    handleRoleSelectChange (val) {
      if (val == null || val.val == null) {
        return
      }
      this.selectRole = val.val
      this.selectRoleName = this.selectRole.name
      this.$api.role.findRoleMenus({'roleId': val.val.id}).then((res) => {
        this.currentRoleMenus = res.data
        if (this.currentRoleMenus === null) {
          this.$refs.menuTree.setCheckedNodes([])
        } else {
          this.$refs.menuTree.setCheckedNodes(res.data)
        }
      })
    },
    // 树节点选择监听
    handleMenuCheckChange (data, check, subCheck) {
      if (check) {
        // 节点选中时同步选中父节点
        let parentId = data.parentId
        if (parentId !== null) {
          this.$refs.menuTree.setChecked(parentId, true, false)
        }
        // if (data.children != null) {
        //   // 节点选中时同步选中子节点
        //   data.children.forEach(element => {
        //     this.$refs.menuTree.setChecked(element.id, true, false)
        //   })
        // }
      } else {
        // 节点取消选中时同步取消选中子节点
        if (data.children != null) {
          data.children.forEach(element => {
            this.$refs.menuTree.setChecked(element.id, false, false)
          })
        }
      }
    },
    // 重置选择
    resetSelection () {
      this.checkAll = false
      if (this.currentRoleMenus === null) {
        this.$refs.menuTree.setCheckedNodes([])
      } else {
        this.$refs.menuTree.setCheckedNodes(this.currentRoleMenus)
      }
    },
    // 全选操作
    handleCheckAll () {
      if (this.checkAll) {
        let allMenus = []
        this.checkAllMenu(this.menuData, allMenus)
        this.$refs.menuTree.setCheckedNodes(allMenus)
      } else {
        this.$refs.menuTree.setCheckedNodes([])
      }
    },
    // 递归全选
    checkAllMenu (menuData, allMenus) {
      menuData.forEach(menu => {
        allMenus.push(menu)
        if (menu.children) {
          this.checkAllMenu(menu.children, allMenus)
        }
      })
    },
    // 角色菜单授权提交
    submitAuthForm () {
      let roleId = this.selectRole.id
      if (this.selectRole.name === 'admin') {
        this.$message({message: '超级管理员拥有所有菜单权限，不允许修改！', type: 'error'})
        return
      }
      this.authLoading = true
      let checkedNodes = this.$refs.menuTree.getCheckedNodes(false, true)
      let roleMenus = []
      for (let i = 0, len = checkedNodes.length; i < len; i++) {
        let roleMenu = { roleId: roleId, resourceId: checkedNodes[i].id }
        roleMenus.push(roleMenu)
      }
      this.$api.role.saveRoleMenus(roleMenus).then((res) => {
        if (res.status === 1) {
          this.$message({ message: '操作成功', type: 'success' })
        } else {
          this.$message({message: '操作失败, ' + res.msg, type: 'error'})
        }
        this.authLoading = false
      })
    },
    renderContent (h, { node, data, store }) {
      return (
        <div class="column-container">
          <span style="text-algin:center;margin-right:40px;">
            <i class={ data.icon }></i> {data.name}
          </span>
          <span style="text-algin:center;">
            <el-tag type={ data.type === 0 ? '' : data.type === 1 ? 'success' : 'info' } size="small">
              { data.type === 0 ? '目录' : data.type === 1 ? '菜单' : '按钮' }
            </el-tag>
          </span>
        </div>)
    },
    // 时间格式化
    dateFormat: function (row, column, cellValue, index) {
      return format(row[column.property])
    }
  },
  computed: {
    treeFilterText () {
      return this.menuTree.filterText
    }
  },
  mounted () {
    // window.innerHeight:浏览器的可用高度
    this.tableHeight = window.innerHeight - 180 - 32 - 32
    // 赋值vue的this
    const that = this
    // window.onresize中的this指向的是window，不是指向vue
    window.onresize = () => {
      return (() => {
        that.tableHeight = window.innerHeight - 180 - 32 - 32
      })()
    }
  },
  watch: {
    tableHeight (val) {
      this.tableHeight = val
    },
    treeFilterText (val) {
      this.$refs.menuTree.filter(val)
    }
  }
}
</script>
<style scoped lang="scss">
.menu-container {
  margin-top: 10px;
}
/deep/.scrollbar-wrap{
  height: 100%;
}
.el-col+.el-col {
  padding-left:0px !important;
}
</style>
