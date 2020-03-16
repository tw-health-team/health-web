<template>
  <!-- 测试提交 -->
  <div class="page-container">
    <!--工具栏-->
    <div class="list-select__container">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item label="所属机构" prop="organName">
          <OrganTreeInput :organName="organName" :organId="organId"
            :currentChangeHandle="handleOrganTreeSelectChange">
          </OrganTreeInput>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.deptId" placeholder="请输入科室代码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.deptName" placeholder="请输入科室名称、拼音或五笔"></el-input>
        </el-form-item>
        <el-form-item>
          <hm-button icon="fa fa-search" label="查询" perms="system:deptOrgan:list" type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <hm-button icon="fa fa-plus" label="新增" perms="system:deptOrgan:add" type="primary" @click="handleAdd" />
        </el-form-item>
      </el-form>
    </div>
    <div class="list-table__container">
    <!--表格显示列界面-->
      <!--table-column-filter-dialog ref="tableColumnFilterDialog" :columns="columns"
        @handleFilterColumns="handleFilterColumns">
      </table-column-filter-dialog-->
      <!--表格内容栏-->
      <hm-table :height="350" permsEdit="system:deptOrgan:update" permsDelete="system:deptOrgan:remove"
        :data="pageResult" :columns="columns" :showBatchDelete="false"
        @findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
      </hm-table>
    </div>
    <!--新增编辑界面-->
    <el-dialog :title="!dataForm.id ? '新增' : '修改'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataRule" ref="dataForm" :size="size">
        <el-form-item label="科室编码" prop="deptId" >
          <el-input v-model="dataForm.deptId" :disabled="this.type !== 1" auto-complete="off" maxlength="64"></el-input>
        </el-form-item>
        <el-form-item label="科室名称" prop="deptName">
          <el-input v-model="dataForm.deptName" auto-complete="off" maxlength="70"></el-input>
        </el-form-item>
        <el-form-item label="所属机构" prop="organName">
          <OrganTreeInput :organName="dataForm.organName" :organId="dataForm.organId"
            :currentChangeHandle="handleOrganTreeSelectChangeAdd">
          </OrganTreeInput>
        </el-form-item>
        <el-form-item label="卫生局科室" prop="deptCenterName">
          <DeptCenterTreeInput :deptCenterName="dataForm.deptCenterName" :deptCenterId="dataForm.deptCenterId"
            :currentChangeHandle="handleDeptCenterTreeSelectChange">
          </DeptCenterTreeInput>
        </el-form-item>
        <el-form-item label="社保局科室代码" prop="deptSocialSecurityId">
          <el-input v-model="dataForm.deptSocialSecurityId" auto-complete="off" maxlength="64"></el-input>
        </el-form-item>
        <div class="form-item-wrap">
          <el-form-item label="门诊类型" prop="outpatientType">
            <el-select v-model="dataForm.outpatientType" placeholder="请选择"
                style="width: 100%;">
              <el-option v-for="item in this.getOutpatientType" :key="item.classCode"
                :label="item.itemName" :value="item.itemValue">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="挂号状态" prop="registeredState">
            <el-select v-model="dataForm.registeredState" placeholder="请选择"
                style="width: 100%;">
              <el-option v-for="item in this.getRegisteredState" :key="item.classCode"
                :label="item.itemName" :value="item.itemValue">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
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
import OrganTreeInput from '@/views/Core/OrganTree'
import DeptCenterTreeInput from '@/views/Core/DeptCenterTree'
import TableColumnFilterDialog from '@/views/Core/TableColumnFilterDialog'
import { format } from '@/utils/datetime'
import { mapState, mapGetters } from 'vuex'
export default {
  components: {
    HmTable,
    HmButton,
    OrganTreeInput,
    TableColumnFilterDialog,
    DeptCenterTreeInput
  },
  data () {
    return {
      size: 'small',
      loading: false,
      filters: {
        deptId: '',
        deptName: '',
        organId: ''
      },
      columns: [
        // {prop: 'id', label: 'ID', minWidth: 50},
        {prop: 'organName', label: '机构名称', minWidth: 100},
        {prop: 'deptId', label: '科室代码', minWidth: 100},
        {prop: 'deptName', label: '科室名称', minWidth: 100},
        {prop: 'outpatientTypeName', label: '门诊类型', minWidth: 100},
        {prop: 'registeredStateName', label: '挂号状态', minWidth: 100},
        {prop: 'remarks', label: '备注', minWidth: 120},
        {prop: 'createUserName', label: '创建人', minWidth: 100},
        {prop: 'createTime', label: '创建时间', minWidth: 120, formatter: this.dateFormat}
      ],
      tableTreeData: [],
      pageResult: {},
      organId: '',
      organName: '',
      deptCenterId: '',
      deptCenterName: '',
      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      pageRequest: { pageNum: 1, pageSize: 10 },
      dataFormRules: {
        label: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      // 新增编辑界面数据
      dataForm: {
        id: '',
        deptId: '',
        deptName: '',
        organId: '',
        organName: '',
        deptCenterId: '',
        deptCenterName: '',
        deptSocialSecurityId: '',
        outpatientType: '',
        outpatientTypeName: '',
        registeredState: '',
        registeredStateName: '',
        remarks: ''
      },
      popupTreeData: [],
      popupTreeProps: {
        label: 'name',
        children: 'children'
      },
      popupOrganTreeData: [],
      popupDeptCenterTreeData: [],
      popupDeptCenterTreeProps: {
        label: 'name',
        children: 'children'
      },
      dataRule: {
        deptId: [
          { required: true, message: '科室编码不能为空', trigger: 'change' }
        ],
        deptName: [
          { required: true, message: '科室名称不能为空', trigger: 'change' }
        ],
        organId: [
          { required: true, message: '所属机构不能为空', trigger: 'change' }
        ],
        deptCenterId: [
          { required: true, message: '卫生局科室不能为空', trigger: 'change' }
        ],
        deptSocialSecurityId: [
          { required: true, message: '社保局科室代码不能为空', trigger: 'change' }
        ],
        outpatientType: [
          { required: true, message: '门诊类型不能为空', trigger: 'change' }
        ],
        registeredState: [
          { required: true, message: '挂号状态不能为空', trigger: 'change' }
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
    getOutpatientType () {
      return this.getDic('outpatientType')
    },
    getRegisteredState () {
      return this.getDic('registeredState')
    }
  },
  methods: {
    fetchDics () {
      /**
       * 请求字典数据
       */
      if (!this.getDictByType) {
        // 获取机构字典
        this.dicProps.deptOrgan.forEach(prop => {
          this.$store.dispatch('dict/getDictByType', prop)
        })
      }
    },
    // 获取数据
    findPage: function (data) {
      if (data !== null) {
        this.pageRequest = data.pageRequest
      }
      this.pageRequest.organId = this.organId
      this.pageRequest.deptId = this.filters.deptId
      this.pageRequest.deptName = this.filters.deptName
      this.$api.deptOrgan.findPage(this.pageRequest).then((res) => {
        this.pageResult = res.data
      }).then(data != null ? data.callback : '')
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
    // 处理表格列过滤显示
    handleFilterColumns: function (data) {
      this.filterColumns = data.filterColumns
      this.$refs.tableColumnFilterDialog.setDialogVisible(false)
    },
    // 机构树选中
    handleOrganTreeSelectChange (data, node) {
      this.organId = data.id
      this.organName = data.name
    },
    // 新增界面机构树选中
    handleOrganTreeSelectChangeAdd (data, node) {
      this.dataForm.organId = data.id
      this.dataForm.organName = data.name
    },
    // 中心科室选择
    handleDeptCenterTreeSelectChange (data, node) {
      this.dataForm.deptCenterId = data.id
      this.dataForm.deptCenterName = data.name
    },
    // 删除
    handleDelete (row) {
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        let params = this.getDeleteIds([], row)
        this.$api.deptOrgan.batchDelete(params).then(res => {
          this.findPage(null)
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
        deptId: '',
        deptName: '',
        organId: '',
        organName: '',
        deptCenterId: '',
        deptCenterName: '',
        deptSocialSecurityId: '',
        outpatientType: '',
        outpatientTypeName: '',
        registeredState: '',
        registeredStateName: '',
        remarks: ''
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
              this.$api.deptOrgan.add(params).then((res) => {
                if (res.status === 1) {
                  this.$message({ message: '操作成功', type: 'success' })
                } else {
                  this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                }
                this.editLoading = false
                this.$refs['dataForm'].resetFields()
                this.dialogVisible = false
                this.findPage(null)
              })
            } else {
              this.$api.deptOrgan.update(params).then(res => {
                if (res.status === 1) {
                  this.$message({ message: '操作成功', type: 'success' })
                } else {
                  this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                }
                this.editLoading = false
                this.$refs['dataForm'].resetFields()
                this.dialogVisible = false
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
    this.fetchDics()
  }
}
</script>

<style scoped>

</style>