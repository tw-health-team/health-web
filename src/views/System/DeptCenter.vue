<template>
  <!-- 测试提交 -->
  <div class="page-container">
    <!--工具栏-->
    <div class="list-select__container">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.deptCode" placeholder="请输入科室代码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.deptName" placeholder="请输入科室名称、拼音或五笔"></el-input>
        </el-form-item>
        <el-form-item>
          <hm-button icon="fa fa-search" label="查询" perms="system:deptCenter:list" type="primary" @click="findTreeData(null)"/>
        </el-form-item>
        <el-form-item>
          <hm-button icon="fa fa-plus" label="新增" perms="system:deptCenter:add" type="primary" @click="handleAdd" />
        </el-form-item>
      </el-form>
    </div>
    <div class="list-table__container">
    <!--表格树内容栏-->
      <el-table :data="tableTreeData" stripe size="mini" style="width: 100%;"
        rowKey="id" v-loading="loading" element-loading-text="拼命加载中">
        <el-table-column
          prop="id" header-align="center" treeKey="id" width="150" label="科室代码">
        </el-table-column>
        <el-table-column
          prop="name" header-align="center" align="center" width="120" label="科室名称">
        </el-table-column>
        <el-table-column
          prop="categoryName" header-align="center" align="center" label="科室类别">
        </el-table-column>
        <el-table-column
          prop="runkName" header-align="center" align="center" label="科室级别">
        </el-table-column>
        <el-table-column
          prop="remarks" header-align="center" align="center" label="备注">
        </el-table-column>
        <el-table-column
          prop="createUserName" header-align="center" align="center" label="创建人">
        </el-table-column>
        <el-table-column
          prop="createTime" header-align="center" align="center" label="创建时间" :formatter="dateFormat">
        </el-table-column>
        <el-table-column
          fixed="right" header-align="center" align="left" width="250" label="操作">
          <template slot-scope="scope">
            <hm-button icon="fa fa-edit" label="编辑" perms="system:deptCenter:update" type="primary" size="mini" @click="handleEdit(scope.row)"/>
            <hm-button icon="fa fa-plus" label="添加下级" perms="system:deptCenter:add" type="success" size="mini" @click="handleAdd(scope.row)"/>
            <hm-button icon="fa fa-trash" label="删除" perms="system:deptCenter:remove" type="danger" size="mini" @click="handleDelete(scope.row)"/>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--新增编辑界面-->
    <el-dialog :title="!dataForm.id ? '新增' : '修改'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataRule" ref="dataForm" :size="size">
        <el-form-item label="科室编码" prop="id" >
          <el-input v-model="dataForm.id" :disabled="this.type !== 1" auto-complete="off" maxlength="64"></el-input>
        </el-form-item>
        <el-form-item label="科室名称" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off" maxlength="50"></el-input>
        </el-form-item>
        <div class="form-item-wrap">
          <el-form-item label="科室类别" prop="category">
            <el-select v-model="dataForm.category" placeholder="请选择"
                style="width: 100%;">
              <el-option v-for="item in this.getCategory" :key="item.classCode"
                :label="item.itemName" :value="item.itemValue">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="科室级别" prop="runk">
            <el-select v-model="dataForm.runk" placeholder="请选择"
                style="width: 100%;">
              <el-option v-for="item in this.getRunk" :key="item.classCode"
                :label="item.itemName" :value="item.itemValue">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="上级科室" prop="parentName">
          <DeptCenterTreeInput :deptCenterName="dataForm.parentName" :deptCenterId="dataForm.parentId"
            :currentChangeHandle="handleDeptCenterTreeSelectChange">
          </DeptCenterTreeInput>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="dataForm.remarks" auto-complete="off" maxlength="255"></el-input>
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
import DeptCenterTreeInput from '@/views/Core/DeptCenterTree'
import { format } from '@/utils/datetime'
import { mapState, mapGetters } from 'vuex'
export default {
  components: {
    HmTable,
    HmButton,
    TableTreeColumn,
    DeptCenterTreeInput
  },
  data () {
    return {
      size: 'small',
      loading: false,
      filters: {
        deptCode: '',
        deptName: ''
      },
      tableTreeData: [],
      pageResult: {},
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      dataFormRules: {
        label: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      // 新增编辑界面数据
      dataForm: {
        id: '',
        name: '',
        category: '',
        runk: '',
        remarks: '',
        parentId: '',
        parentName: ''
      },
      popupTreeData: [],
      popupTreeProps: {
        label: 'name',
        children: 'children'
      },
      dataRule: {
        id: [
          { required: true, message: '科室编码不能为空', trigger: 'change' }
        ],
        name: [
          { required: true, message: '科室名称不能为空', trigger: 'change' }
        ],
        parentId: [
          { required: true, message: '上级科室不能为空', trigger: 'change' }
        ],
        category: [
          { required: true, message: '科室类别不能为空', trigger: 'change' }
        ],
        runk: [
          { required: true, message: '科室级别不能为空', trigger: 'change' }
        ]
      },
      dict: [{}],
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
    getCategory () {
      return this.getDic('category')
    },
    getRunk () {
      return this.getDic('runk')
    }
  },
  methods: {
    fetchDics () {
      /**
       * 请求字典数据
       */
      if (!this.getDictByType) {
        // 获取机构字典
        this.dicProps.deptCenter.forEach(prop => {
          this.$store.dispatch('dict/getDictByType', prop)
        })
      }
    },
    // 获取数据
    findTreeData: function () {
      this.loading = true
      let params = {id: this.filters.deptCode, name: this.filters.deptName}
      this.$api.deptCenter.findDeptCenterTree(params).then((res) => {
        this.tableTreeData = res.data
        this.popupTreeData = this.getParentMenuTree(res.data)
        this.loading = false
      })
    },
    // 获取上级机构树
    getParentMenuTree: function (tableTreeData) {
      let parent = {
        parentId: '',
        name: '顶级菜单',
        children: tableTreeData
      }
      return [parent]
    },
    // 机构树选中
    handleDeptCenterTreeSelectChange (data, node) {
      this.dataForm.parentId = data.id
      this.dataForm.parentName = data.name
    },
    // 删除
    handleDelete (row) {
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        let params = this.getDeleteIds([], row)
        this.$api.deptCenter.batchDelete(params).then(res => {
          this.findTreeData()
          if (res.status === 1) {
            this.$message({ message: '删除成功', type: 'success' })
          } else {
            this.$message({ message: '删除失败,' + res.msg, type: 'error' })
          }
        })
      })
    },
    // 获取删除的包含子机构的id列表
    getDeleteIds (ids, row) {
      ids.push(row.id)
      if (row.children != null) {
        for (let i = 0, len = row.children.length; i < len; i++) {
          this.getDeleteIds(ids, row.children[i])
        }
      }
      return ids
    },
    // 显示新增界面
    handleAdd: function (parent = null) {
      this.type = 1
      this.dialogVisible = true
      this.operation = true
      this.dataForm = {
        id: '',
        name: '',
        category: '',
        runk: '',
        remarks: '',
        parentId: parent == null ? 0 : parent.id,
        parentName: parent == null ? '' : parent.name
      }
    },
    // 显示编辑界面
    handleEdit: function (row) {
      this.type = 2
      this.dialogVisible = true
      Object.assign(this.dataForm, row)
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
                this.dialogVisible = false
                this.findTreeData()
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
                this.dialogVisible = false
                this.findTreeData()
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
    this.fetchDics()
  }
}
</script>

<style scoped>

</style>