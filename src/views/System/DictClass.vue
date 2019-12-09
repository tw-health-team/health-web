<template>
  <div class="dialog-container">
    <!-- 字典分类列表弹窗 -->
    <el-dialog title="分类管理" :visible.sync="isShow"
              :before-close="handleClose"
              width="700px"
               :close-on-click-modal="false">
      <!--搜索栏-->
      <div class="dialog-select__container">
        <el-row :gutter="24" type="flex" justify="start" align="top">
          <el-col :span="6" :xs="12" :sm="8" :md="8" :lg="12">
            <el-input v-model="filters.name" size="small" clearable placeholder="请输入名称、或拼音、五笔首拼模糊查询"></el-input>
          </el-col>
          <el-col :span="18" :xs="12" :sm="10" :md="8" :lg="12" class="nopadding">
            <hm-button icon="fa fa-search" label="查询" perms="system:dict:list" type="primary" @click="findTreeData(null)"/>
            <hm-button icon="fa fa-plus" label="增加" perms="system:dict:add" type="primary" @click="handleAdd(null)"/>
            <el-switch v-model="isFold" @change="expandOrFoldAllNode"></el-switch>
          </el-col>
        </el-row>
      </div>
      <div class="dialog-table__container">
        <!--表格树内容栏-->
        <el-table ref="dictTable" :data="tableTreeData" stripe size="mini"
          rowKey="id" v-loading="loading" element-loading-text="拼命加载中" default-expand-all>
          <el-table-column
            prop="name" header-align="center" treeKey="id" width="150" label="名称">
          </el-table-column>
          <el-table-column
            prop="code" header-align="center" align="center" label="编码">
          </el-table-column>
          <el-table-column
            prop="sort" header-align="center" align="center" label="排序">
          </el-table-column>
          <el-table-column
            prop="remarks" header-align="center" align="center" label="备注">
          </el-table-column>
          <el-table-column
            fixed="right" header-align="center" align="center" width="250" label="操作">
            <template slot-scope="scope">
              <hm-button icon="fa fa-edit" label="编辑" perms="system:dict:update" type="primary" size="mini" @click="handleEdit(scope.row)"/>
              <hm-button icon="fa fa-plus" label="添加下级" perms="system:dict:add" type="success" size="mini" @click="handleAdd(scope.row)"/>
              <hm-button icon="fa fa-trash" label="删除" perms="system:dict:remove" type="danger" size="mini" @click="handleDelete(scope.row)"/>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="handleClose()">取消</el-button>
      </div>
    </el-dialog>
    <!-- ------------------------------新增修改界面 begin-------------------------------- -->
    <el-dialog :title="!dataForm.id ? '新增' : '修改'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="submitForm()"
        label-width="80px" :size="size" style="text-align:left;">
        <el-form-item label="上级分类" prop="parentName">
          <popup-tree-input
            :data="popupTreeData" :props="popupTreeProps" :prop="dataForm.parentName==null?'顶级分类':dataForm.parentName"
            :nodeKey="''+dataForm.parentId" :currentChangeHandle="handleTreeSelectChange">
          </popup-tree-input>
        </el-form-item>
        <div class="form-item-wrap">
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="dataForm.name" placeholder="名称" maxlength="50" clearable></el-input>
          </el-form-item>
        </div>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="dataForm.code" placeholder="编码" maxlength="50" clearable></el-input>
        </el-form-item>
        <el-form-item label="排序序号" prop="sort">
          <el-input-number v-model="dataForm.sort" controls-position="right" :min="1" label="排序序号"></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="dataForm.remarks" auto-complete="off" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :size="size"  @click="dialogVisible = false">取消</el-button>
        <el-button :size="size"  type="primary" @click="submitForm()">确定</el-button>
      </span>
    </el-dialog>
    <!-- ------------------------------新增修改界面 end-------------------------------- -->
  </div>
</template>

<script>
import HmButton from '@/views/Core/HmButton'
import TableTreeColumn from '@/views/Core/TableTreeColumn'
import PopupTreeInput from '@/components/PopupTreeInput'
import FaIconTooltip from '@/components/FaIconTooltip'
import { format } from '@/utils/datetime'
import { mapState, mapGetters } from 'vuex'
export default {
  components: {
    PopupTreeInput,
    HmButton,
    TableTreeColumn,
    FaIconTooltip
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    visible (val, oldVal) {
      if (val === oldVal) {
        return
      }
      if (val) {
        // 操作
      }
      this.isShow = val
    },
    // 如果内部有新值变化，更新外部visible
    isShow (val, oldVal) {
      if (val === oldVal) {
        return
      }
      this.$emit('update:visible', val)
    }
  },
  data () {
    return {
      isShow: this.visible,
      isFold: true, // 是否折叠所有节点
      size: 'small',
      loading: false,
      filters: {
        name: ''
      },
      tableTreeData: [],
      dialogVisible: false,
      dataForm: {
        id: '',
        name: '',
        code: '',
        parentId: 0,
        parentName: '',
        sort: 0,
        remarks: ''
      },
      dataRule: {
        code: [
          { required: true, message: '分类编码不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' }
        ],
        parentId: [
          { required: true, message: '上级分类不能为空', trigger: 'change' }
        ]
      },
      popupTreeData: [],
      popupTreeProps: {
        label: 'name',
        children: 'children'
      },
      dict: [{}],
      type: 1 // 1 新增 2 修改
    }
  },
  computed: {
  },
  methods: {
    /**
     * 展开或搜索table行
     * @$table table组件
     * @data table数据
     * @flag true 展开 false收缩
     */
    expandOrFoldTableRow ($table, data, flag) {
      if (data.children && data.children.length > 0) {
        $table.toggleRowExpansion(data, flag)
        data.children.map(item => {
          this.expandOrFoldTableRow($table, item, flag)
        })
      }
    },
    // 展开/折叠所有节点
    expandOrFoldAllNode (value) {
      console.log(value)
      if (this.tableTreeData) {
        // 遍历table数据
        this.tableTreeData.map(item => {
          // 展开或收缩table行
          this.expandOrFoldTableRow(this.$refs.dictTable, item, value)
        })
      }
    },
    // 获取数据
    findTreeData: function () {
      this.loading = true
      let params = {searchText: this.filters.name}
      this.$api.dict.findDictClassList(params).then((res) => {
        this.tableTreeData = res.data
        this.popupTreeData = this.getParentDictTree(res.data)
        this.loading = false
      })
    },
    // 获取上级字典树
    getParentDictTree: function (tableTreeData) {
      let parent = {
        id: 0,
        name: '顶级分类',
        children: tableTreeData
      }
      return [parent]
    },
    /**
     * 触发父组件的关闭事件
     */
    handleClose () {
      this.$emit('close')
    },
    // 显示新增界面
    handleAdd: function (parent = null) {
      this.type = 1
      this.dialogVisible = true
      this.dataForm = {
        id: '',
        name: '',
        code: '',
        parentId: parent == null ? 0 : parent.id,
        parentName: parent == null ? '' : parent.name,
        sort: 0,
        remarks: ''
      }
    },
    // 显示编辑界面
    handleEdit: function (row) {
      this.type = 2
      this.dialogVisible = true
      Object.assign(this.dataForm, row)
    },
    // 删除
    handleDelete (row) {
      let msg = ''
      if (row.children && row.children.length > 0) {
        msg = '确认删除【' + row.name + '】及其所有下级分类吗？'
      } else {
        msg = '确认删除【' + row.name + '】吗？'
      }
      this.$confirm(msg, '提示', {
        type: 'warning'
      }).then(() => {
        this.$api.dict.removeDictClass({ id: row.id }).then(res => {
          this.findTreeData()
          if (res.status === 1) {
            this.$message({ message: '删除成功', type: 'success' })
          } else {
            this.$message({ message: '删除失败,' + res.msg, type: 'error' })
          }
        })
      }).catch(() => {})
    },
    // 字典树选中
    handleTreeSelectChange (data, node) {
      this.dataForm.parentId = data.id
      this.dataForm.parentName = data.name
    },
    // 表单提交
    submitForm () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            let callback = res => {
              this.editLoading = false
              if (res.status === 1) {
                this.$message({ message: '操作成功', type: 'success' })
                this.$refs['dataForm'].resetFields()
                this.dialogVisible = false
              } else {
                this.$message({ message: '操作失败, ' + res.msg, type: 'error' })
              }
              this.findTreeData()
            }
            if (this.type === 1) {
              this.$api.dict.addDictClass(params).then(callback)
            } else {
              this.$api.dict.updateDictClass(this.dataForm, params).then(callback)
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

<style scoped lang="scss">
  @import "@/assets/css/detail.scss";
  @import "~theme";

</style>