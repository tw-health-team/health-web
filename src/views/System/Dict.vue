<template>
  <div class="page-container">
    <el-row :gutter="24" type="flex" justify="start" align="top" class="content-container">
      <el-col :span="5">
        <div class="tree-container">
          <div class="tree-select-wrap">
            <el-row :gutter="24" type="flex" justify="start" align="top">
              <el-col :span="18">
                <el-input placeholder="输入名称过滤" size="small" clearable v-model="dictClass.filterText"></el-input>
              </el-col>
              <el-col :span="6" class="switch-wrap nopadding">
                <el-switch v-model="dictClass.isFold" @change="expandOrFoldAllNode"></el-switch>
              </el-col>
            </el-row>
          </div>
          <!--字典分类树-->
          <el-tree class="dict-type-tree" :data="dictClass.treeData" size="mini" node-key="id" :props="dictClass.defaultProps"
            ref="dictClassTree" v-loading="dictClass.loading" element-loading-text="拼命加载中" :check-strictly="true"
            @node-click="handleNodeClick" highlight-current default-expand-all
            :render-content="renderTreeContent" :filter-node-method="filterTreeNode">
          </el-tree>
        </div>
      </el-col>
      <el-col :span="19">
        <!--搜索栏-->
        <div class="list-select__container">
          <el-row :gutter="24" type="flex" justify="start" align="top">
            <el-col :span="6" :xs="8" :sm="10" :md="10" :lg="8">
              <el-input v-model="filters.searchText" size="small" clearable placeholder="输入名称或拼音、五笔首拼模糊查询"></el-input>
            </el-col>
            <el-col :span="6" :xs="8" :sm="4" :md="6" :lg="4" class="nopadding">
              <hm-button icon="fa fa-search" label="查询" perms="system:dict:list" type="primary" @click="findList()"/>
            </el-col>
            <el-col :span="12" :xs="8" :sm="10" :md="8" :lg="12" class="list-select-right">
              <hm-button icon="fa fa-plus" label="新增" perms="system:dict:add" type="primary" @click="handleAdd" />
              <hm-button icon="fa fa-tags" label="字典分类" perms="system:dict:list" type="primary" @click="handleShowClass" />
            </el-col>
          </el-row>
        </div>
        <!--表格内容栏-->
        <el-table ref="dictTable" :height="tableHeight" :data="tableData" stripe size="mini"
          rowKey="id" v-loading="loading" element-loading-text="拼命加载中">
          <el-table-column
            prop="itemName" header-align="center" align="center" width="200" label="项目名">
          </el-table-column>
          <el-table-column
            prop="itemValue" header-align="center" align="center" label="项目值">
          </el-table-column>
          <el-table-column
            prop="sort" header-align="center" align="center" label="排序">
          </el-table-column>
          <el-table-column
            prop="remarks" header-align="center" align="center" label="备注">
          </el-table-column>
          <el-table-column
            fixed="right" header-align="center" align="center" width="150" label="操作">
            <template slot-scope="scope">
              <hm-button icon="fa fa-edit" label="编辑" perms="system:dict:update" type="primary" size="mini" @click="handleEdit(scope.row)"/>
              <hm-button icon="fa fa-trash" label="删除" perms="system:dict:remove" type="danger" size="mini" @click="handleDelete(scope.row)"/>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!-- 新增编辑界面 -->
    <el-dialog :title="operation?'新增':'编辑'" width="40%" :visible.sync="editDialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" :size="size">
        <el-form-item label="ID" prop="id"  v-if="false">
          <el-input v-model="dataForm.id" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="项目名" prop="itemName">
          <el-input v-model="dataForm.itemName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="项目值" prop="itemValue">
          <el-input v-model="dataForm.itemValue" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="dataForm.sort" controls-position="right" :min="1" label="排序"></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="dataForm.remarks" auto-complete="off" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="editDialogVisible = false">取消</el-button>
        <el-button :size="size" type="primary" @click.native="submitForm" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>
    <!-- 字典分类列表弹出框 -->
    <class-dialog :visible.sync="catalogueDialogVisible" @close="closeClassDialog()"></class-dialog>
  </div>
</template>

<script>
import HmTable from '@/views/Core/HmTable'
import HmButton from '@/views/Core/HmButton'
import ClassDialog from '@/views/System/DictClass'
import { format } from '@/utils/datetime'
export default {
  components: {
    HmTable,
    HmButton,
    ClassDialog
  },
  data () {
    return {
      // -----------------字典分类树 begin------------------
      dictClass: {
        isFold: true, // 是否折叠所有节点
        filterText: '',
        treeData: [],
        loading: false,
        defaultProps: {
          children: 'children',
          label: 'name'
        }
      },
      // -----------------字典分类树 end------------------
      // -----------------字典列表 begin------------------
      catalogueDialogVisible: false,
      tableData: [],
      tableHeight: null,
      loading: false,
      size: 'small',
      // 列表查询条件
      filters: {
        searchText: '',
        classCode: ''
      },
      operation: false, // true:新增, false:编辑
      // -----------------字典列表 end--------------------------
      // -----------------字典项新增编辑 begin------------------
      editDialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      dataFormRules: {
        itemName: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { required: true, message: '已存在该名称的字典项', validator: this.existsItem, trigger: 'blur' }
        ],
        itemValue: [
          { required: true, message: '请输入值', trigger: 'blur' },
          { required: true, message: '已存在该值的字典项', validator: this.existsItem, trigger: 'blur' }
        ]
      },
      // 新增编辑界面数据
      dataForm: {
        id: '',
        itemName: '',
        itemValue: '',
        classCode: '',
        sort: 0,
        remarks: ''
      },
      type: 1 // 1 新增 2 修改
      // -----------------字典项新增编辑 end------------------
    }
  },
  methods: {
    // ---------------字典树 begin---------------
    // 获取字典分类树
    findDictClassTree: function () {
      this.dictClass.loading = true
      this.$api.dict.findDictClassTree().then((res) => {
        this.dictClass.treeData = res.data
        this.dictClass.loading = false
      })
    },
    // 渲染树节点的内容区
    renderTreeContent: function (h, { node, data, store }) {
      return (
        <span>
          <i class={data.children.length > 0 ? 'fa fa-folder-open' : 'fa fa-file-o'}></i>
          <span class="el-tree-node__label"> {data.name}</span>
        </span>)
    },
    // 过滤树节点
    filterTreeNode: function (value, data) {
      if (!value) {
        return true
      }
      return data.name.indexOf(value) !== -1
    },
    // 展开/折叠所有节点
    expandOrFoldAllNode () {
      for (var i = 0; i < this.$refs.dictClassTree.store._getAllNodes().length; i++) {
        this.$refs.dictClassTree.store._getAllNodes()[i].expanded = this.dictClass.isFold
      }
    },
    /**
     * 节点点击事件
     * @param {Object} data 传递给 data 属性的数组中该节点所对应的对象
     * @param {Object} node 节点对应的 Node
     * @param {Object} obj  节点组件本身
     */
    handleNodeClick: function (data, node, obj) {
      if (data) {
        // 根据所选节点的字典分类代码获取字典项数据
        this.filters.classCode = data.code
        this.findList()
      }
    },
    // ---------------字典树 end---------------
    // ---------------字典表格 begin---------------
    // 获取列表数据
    findList: function () {
      this.loading = true
      this.$api.dict.findList(this.filters).then((res) => {
        this.tableData = res.data
        this.loading = false
      })
    },
    // 批量删除
    handleDelete: function (row) {
      this.$confirm('确认删除该字典项吗？', '提示', {
        type: 'warning'
      }).then(() => {
        let params = []
        params.push(row.id)
        this.$api.dict.batchDelete(params).then(res => {
          this.findList()
          if (res.status === 1) {
            this.$message({ message: '删除成功', type: 'success' })
          } else {
            this.$message({ message: '删除失败,' + res.msg, type: 'error' })
          }
        })
      }).catch(() => {})
    },
    // 显示新增界面
    handleAdd: function () {
      if (this.$global.isEmpty(this.filters.classCode)) {
        this.$message({ message: '请先选择字典分类！', type: 'warning' })
        return
      }
      this.type = 1
      this.editDialogVisible = true
      this.operation = true
      this.dataForm = {
        id: '',
        itemName: '',
        itemValue: '',
        classCode: this.filters.classCode,
        sort: 0,
        remarks: ''
      }
    },
    // 显示编辑界面
    handleEdit: function (row) {
      this.type = 2
      this.editDialogVisible = true
      this.operation = false
      Object.assign(this.dataForm, row)
    },
    handleShowClass: function (row) {
      this.catalogueDialogVisible = true
    },
    closeClassDialog: function () {
      this.catalogueDialogVisible = false
    },
    // ---------------字典表格 end---------------
    // ---------------字典项弹框 begin---------------
    // 编辑
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            let callback = res => {
              if (res.status === 1) {
                this.$message({ message: '操作成功', type: 'success' })
                this.$refs['dataForm'].resetFields()
                this.editDialogVisible = false
                this.findList()
              } else {
                this.$message({message: '操作失败, ' + res.msg, type: 'error'})
              }
              this.editLoading = false
            }
            if (this.type === 1) {
              this.$api.dict.add(params).then(callback)
            } else {
              this.$api.dict.update(params).then(callback)
            }
          })
        }
      })
    },
    /**
     * 自定义验证
     * @param {Object} rule 规则对象
     * @param {String} value 值
     * @param {Function} cb 回调函数
     */
    existsItem (rule, value, cb) {
      let params = {itemName: '', itemValue: '', classCode: '', id: ''}
      params.classCode = this.dataForm.classCode
      params.id = this.dataForm.id
      // 如果是判断字典项名称 则将值置空查询
      if (rule.field === 'itemName') {
        params.itemName = value
      } else if (rule.field === 'itemValue') {
        params.itemValue = value
      }
      this.$api.dict.existsDict(params).then(res => {
        if (res) {
          let result = res.data
          if (result) {
            rule.required ? cb(new Error(rule.message)) : cb()
          } else {
            cb()
          }
        } else {
          cb()
        }
      })
    },
    // 时间格式化
    dateFormat: function (row, column, cellValue, index) {
      return format(row[column.property])
    }
    // ---------------字典项弹框 end---------------
  },
  mounted () {
    // 获取字典分类树
    this.findDictClassTree()
    // window.innerHeight:浏览器的可用高度
    this.tableHeight = window.innerHeight - 180
    // 赋值vue的this
    const that = this
    // window.onresize中的this指向的是window，不是指向vue
    window.onresize = () => {
      return (() => {
        that.tableHeight = window.innerHeight - 180
      })()
    }
  },
  computed: {
    treeFilterText () {
      return this.dictClass.filterText
    }
  },
  watch: {
    tableHeight (val) {
      this.tableHeight = val
    },
    treeFilterText (val) {
      this.$refs.dictClassTree.filter(val)
    }
  }
}
</script>

<style scoped lang="scss">
@import "~theme";
// 字典分类树高度
.dict-type-tree{
  height: calc(100% - 62px);
}
.el-col+.el-col {
  padding-left:0px !important;
}
</style>