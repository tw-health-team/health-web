<template>
  <!-- 测试提交 -->
  <div class="page-container">
    <!--工具栏-->
    <div class="list-select__container">
      <el-form :inline="true" :model="filters" :size="size">
        <el-form-item>
          <el-input v-model="filters.id" placeholder="请输入地址编码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.name" placeholder="请输入地址名称、拼音或五笔"></el-input>
        </el-form-item>
        <el-form-item>
          <hm-button icon="fa fa-search" label="查询" perms="system:area:list" type="primary" @click="findTreeData(null)"/>
        </el-form-item>
        <el-form-item>
          <hm-button icon="fa fa-plus" label="新增" perms="system:area:add" type="primary" @click="handleAdd" />
        </el-form-item>
      </el-form>
    </div>
    <div class="list-table__container">
    <!--表格树内容栏-->
      <el-table :data="tableTreeData" stripe size="mini" style="width: 100%;"
        rowKey="id" v-loading="loading" element-loading-text="拼命加载中">
        <el-table-column
          prop="id" header-align="center" treeKey="id" width="150" label="地址代码">
        </el-table-column>
        <el-table-column
          prop="name" header-align="center" align="center" width="120" label="地址名称">
        </el-table-column>
        <el-table-column
          prop="shortName" header-align="center" align="center" label="地址简称">
        </el-table-column>
        <el-table-column
          prop="fullName" header-align="center" align="center" label="地址全称">
        </el-table-column>
        <el-table-column
          prop="typeName" header-align="center" align="center" label="地址类型">
        </el-table-column>
        <el-table-column
          prop="organName" header-align="center" align="center" label="所属机构">
        </el-table-column>
        <el-table-column
          prop="year" header-align="center" align="center" label="年份">
        </el-table-column>
        <el-table-column
          fixed="right" header-align="center" align="left" width="250" label="操作">
          <template slot-scope="scope">
            <hm-button icon="fa fa-edit" label="编辑" perms="system:area:update" type="primary" size="mini" @click="handleEdit(scope.row)"/>
            <hm-button icon="fa fa-plus" label="添加下级" perms="system:area:add" type="success" size="mini" @click="handleAdd(scope.row)"/>
            <hm-button icon="fa fa-trash" label="删除" perms="system:area:remove" type="danger" size="mini" @click="handleDelete(scope.row)"/>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--新增编辑界面-->
    <el-dialog :title="!dataForm.id ? '新增' : '修改'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataRule" ref="dataForm" :size="size">
        <el-form-item label="地址编码" prop="id" >
          <el-input v-model="dataForm.id" auto-complete="off" maxlength="64"></el-input>
        </el-form-item>
        <el-form-item label="地址名称" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="地址简称" prop="shortName">
          <el-input v-model="dataForm.shortName" auto-complete="off" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="地址全称" prop="fullName">
          <el-input v-model="dataForm.fullName" auto-complete="off" maxlength="50"></el-input>
        </el-form-item>
        <div class="form-item-wrap">
          <el-form-item label="地址类型" prop="type">
            <el-select v-model="dataForm.type" placeholder="请选择"
                style="width: 100%;">
              <el-option v-for="item in this.getType" :key="item.classCode"
                :label="item.itemName" :value="item.itemValue">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="省市类型" prop="provincesType">
            <el-select v-model="dataForm.provincesType" placeholder="请选择"
                style="width: 100%;">
              <el-option v-for="item in this.getProvincesType" :key="item.classCode"
                :label="item.itemName" :value="item.itemValue">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="上级地址" prop="parentName">
          <AreaTreeInput :name="dataForm.parentName" :id="dataForm.parentId"
            :currentChangeHandle="handleAreaTreeSelectChange">
          </AreaTreeInput>
        </el-form-item>
        <el-form-item label="所属机构" prop="organName">
          <OrganTreeInput :organName="dataForm.organName" :organId="dataForm.organId"
            :currentChangeHandle="handleOrganTreeSelectChange">
          </OrganTreeInput>
        </el-form-item>
        <el-form-item label="填报年份" prop="year">
          <el-input v-model="dataForm.year" auto-complete="off" maxlength="255"></el-input>
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
import OrganTreeInput from '@/views/Core/OrganTree'
import AreaTreeInput from '@/views/Core/AreaTree'
import { format } from '@/utils/datetime'
import { mapState, mapGetters } from 'vuex'
export default {
  components: {
    HmTable,
    HmButton,
    TableTreeColumn,
    AreaTreeInput,
    OrganTreeInput
  },
  data () {
    return {
      size: 'small',
      loading: false,
      filters: {
        id: '',
        name: ''
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
        shortName: '',
        fullName: '',
        type: '',
        provincesType: '',
        typeName: '',
        parentId: '',
        parentName: '',
        organId: '',
        organName: '',
        year: ''
      },
      popupTreeData: [],
      popupTreeProps: {
        label: 'name',
        children: 'children'
      },
      dataRule: {
        id: [
          { required: true, message: '地址编码不能为空', trigger: 'change' }
        ],
        name: [
          { required: true, message: '地址名称不能为空', trigger: 'change' }
        ],
        fullName: [
          { required: true, message: '地址全称不能为空', trigger: 'change' }
        ],
        type: [
          { required: true, message: '地址类型不能为空', trigger: 'change' }
        ],
        year: [
          { required: true, message: '填报年份不能为空', trigger: 'change' }
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
    getType () {
      return this.getDic('type')
    },
    getProvincesType () {
      return this.getDic('provincesType')
    }
  },
  methods: {
    fetchDics () {
      /**
       * 请求字典数据
       */
      if (!this.getDictByType) {
        // 获取机构字典
        this.dicProps.area.forEach(prop => {
          this.$store.dispatch('dict/getDictByType', prop)
        })
      }
    },
    // 获取数据
    findTreeData: function () {
      this.loading = true
      let params = {id: this.filters.id, name: this.filters.name}
      this.$api.area.findAreaTree(params).then((res) => {
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
    // 上级地址选中
    handleAreaTreeSelectChange (data, node) {
      this.dataForm.parentId = data.id
      this.dataForm.parentName = data.name
    },
    // 所属机构选中
    handleOrganTreeSelectChange (data, node) {
      this.dataForm.organId = data.id
      this.dataForm.organName = data.name
    },
    // 删除
    handleDelete (row) {
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        let params = this.getDeleteIds([], row)
        this.$api.area.batchDelete(params).then(res => {
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
        shortName: '',
        fullName: '',
        type: '',
        provincesType: '',
        typeName: '',
        parentId: parent == null ? 0 : parent.id,
        parentName: parent == null ? '' : parent.name,
        organId: '',
        organName: '',
        year: ''
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
              this.$api.area.add(params).then((res) => {
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
              this.$api.area.update(params).then(res => {
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