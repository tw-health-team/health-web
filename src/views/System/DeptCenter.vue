<template>
  <!-- 测试提交 -->
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.deptCode" placeholder="科室代码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.deptName" placeholder="科室名称"></el-input>
        </el-form-item>
        <el-form-item>
          <hm-button icon="fa fa-search" label="查询" perms="system:deptCenter:list" type="primary" @click="findTreeData(null)"/>
        </el-form-item>
        <el-form-item>
          <hm-button icon="fa fa-plus" label="新增" perms="system:deptCenter:add" type="primary" @click="handleAdd" />
        </el-form-item>
      </el-form>
    </div>
        <!--表格树内容栏-->
    <el-table :data="tableTreeDdata" stripe size="mini" style="width: 100%;"
      rowKey="id" v-loading="loading" element-loading-text="拼命加载中">
      <el-table-column
        prop="id" header-align="center" treeKey="id" width="150" label="科室代码">
      </el-table-column>
      <el-table-column
        prop="name" header-align="center" align="center" width="120" label="科室名称">
      </el-table-column>
      <el-table-column
        prop="category" header-align="center" align="center" label="科室类别">
      </el-table-column>
      <el-table-column
        prop="runk" header-align="center" align="center" label="科室级别">
      </el-table-column>
      <el-table-column
        prop="remarks" header-align="center" align="center" label="备注">
      </el-table-column>
      <el-table-column
        prop="createBy" header-align="center" align="center" label="创建人">
      </el-table-column>
      <el-table-column
        prop="createTime" header-align="center" align="center" label="创建时间" :formatter="dateFormat">
      </el-table-column>
      <el-table-column
        fixed="right" header-align="center" align="center" width="185" label="操作">
        <template slot-scope="scope">
          <hm-button icon="fa fa-edit" label="编辑" perms="system:deptCenter:update" @click="handleEdit(scope.row)"/>
          <hm-button icon="fa fa-trash" label="删除" perms="system:deptCenter:remove" type="danger" @click="handleDelete(scope.row)"/>
        </template>
      </el-table-column>
    </el-table>
    <!--新增编辑界面-->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="editDialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size">
        <el-form-item label="科室编码" prop="id" >
          <el-input v-model="dataForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="科室名称" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="科室类别" prop="category">
          <el-input v-model="dataForm.category" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="科室级别" prop="runk">
          <el-input v-model="dataForm.runk" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="上级科室 " prop="parent_id">
          <el-input v-model="dataForm.parent_id" auto-complete="off" ></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="dataForm.remarks" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="editDialogVisible = false">取消</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>
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
      size: 'small',
      filters: {
        deptCode: '',
        deptName: ''
      },
      tableTreeDdata: [],
      pageResult: {},
      operation: false, // true:新增, false:编辑
      editDialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      dataFormRules: {
        label: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      // 新增编辑界面数据
      dataForm: {
        id: '',
        label: '',
        value: '',
        type: '',
        sort: 0,
        description: '',
        remarks: ''
      },
      type: 1 // 1 新增 2 修改
    }
  },
  methods: {
    // 获取数据
    findTreeData: function () {
      this.loading = true
      let params = {id: this.filters.deptCode, name: this.filters.deptName}
      this.$api.deptCenter.findDeptCenterTree(params).then((res) => {
        this.tableTreeDdata = res.data
        this.loading = false
      })
    },
    // 批量删除
    handleDelete: function (data) {
      this.$api.deptCenter.batchDelete(data.params).then(data != null ? data.callback : '')
    },
    // 显示新增界面
    handleAdd: function () {
      this.type = 1
      this.editDialogVisible = true
      this.operation = true
      this.dataForm = {
        id: '',
        label: '',
        value: '',
        type: '',
        sort: 0,
        description: '',
        remarks: ''
      }
    },
    // 显示编辑界面
    handleEdit: function (params) {
      this.type = 2
      this.editDialogVisible = true
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
              this.$api.deptCenter.add(params).then((res) => {
                if (res.status === 1) {
                  this.$message({ message: '操作成功', type: 'success' })
                } else {
                  this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                }
                this.editLoading = false
                this.$refs['dataForm'].resetFields()
                this.editDialogVisible = false
                this.findPage(null)
              })
            } else {
              this.$api.deptCenter.update(params).then(res => {
                if (res.status === 1) {
                  this.$message({ message: '操作成功', type: 'success' })
                } else {
                  this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                }
                this.editLoading = false
                this.$refs['dataForm'].resetFields()
                this.editDialogVisible = false
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
    }
  },
  mounted () {
    this.findTreeData()
  }
}
</script>

<style scoped>

</style>