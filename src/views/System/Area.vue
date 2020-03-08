<template>
  <div ref="pageContainer" class="page-container">
    <el-row :gutter="24" type="flex" justify="start" align="top" class="content-container">
      <el-col :span="5">
        <div class="list-title__container">
          <span>省(自治区、直辖市)选择</span>
        </div>
        <!--搜索栏-->
        <div class="list-select__container">
          <el-row :gutter="24" type="flex" justify="start" align="top">
            <el-col>
              <el-input v-model.trim="provinceList.filterText" size="small" clearable placeholder="输入名称或拼音首拼模糊查询"></el-input>
            </el-col>
          </el-row>
        </div>
        <!-- 左侧-表格 -->
        <el-table ref="provinceTable" :height="tableHeight"
          :data="provinceList.provinceData.filter(data => !provinceList.filterText || data.name.includes(provinceList.filterText) || data.simpleSpelling.includes(provinceList.filterText))"
          size="mini" rowKey="id" v-loading="this.provinceList.loading" element-loading-text="拼命加载中"
          highlight-current-row @current-change="handleProvinceSelectChange">
          <el-table-column type="index" width="50" label="序号"></el-table-column>
          <el-table-column prop="shortName" width="120" label="名称">
          </el-table-column>
          <el-table-column prop="id" width="120" label="编码">
          </el-table-column>
          <el-table-column prop="name" width="120" label="全称" v-if="false">
          </el-table-column>
          <el-table-column
            prop="simpleSpelling" width="180" label="简拼" v-if="false">
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="19">
        <div class="list-title__container">
          <span>行政区划树</span> - <span>{{provinceList.selectedName?provinceList.selectedName:'未选择省(自治区、直辖市)'}}</span>
        </div>
        <!--搜索栏-->
        <div class="list-select__container">
          <el-row :gutter="24" type="flex" justify="start" align="top">
            <el-col :span="6" :xs="12" :sm="8" :md="8" :lg="6">
              <el-input v-model="filters.searchText" size="small" placeholder="输入名称或拼音模糊查询" clearable></el-input>
            </el-col>
            <el-col :span="8" :xs="12" :sm="14" :md="14" :lg="12" class="nopadding">
              <hm-button icon="fa fa-search" label="查询" perms="system:area:list" type="primary" @click="findTreeData()"/>
              <hm-button icon="fa fa-plus" label="新增" perms="system:area:add" type="primary" @click="handleAdd" />
              <el-link type="primary" v-on:click="foldAllNode" v-if="false">折叠全部(未实现-隐藏)</el-link>
              <hm-button icon="fa fa-plus" label="生成json文件" v-if="showCreateJson" perms="system:area:add" type="primary" @click="handleCreate(null)"/>
            </el-col>
          </el-row>
        </div>
        <!-- 右侧-表格 -->
        <el-table ref="areaTable" :height="tableHeight" :data="areaTreeData" stripe size="mini"
          rowKey="id" v-loading="loading" element-loading-text="拼命加载中" lazy :load="loadChildren">
          <el-table-column type="index" width="80" label="序号"></el-table-column>
          <el-table-column prop="id" minWidth="100" label="区划编码">
          </el-table-column>
          <el-table-column prop="name" minWidth="120" label="区划名称">
          </el-table-column>
          <el-table-column prop="shortName" minWidth="120" label="区划简称">
          </el-table-column>
          <el-table-column prop="remark" width="120" label="备注">
          </el-table-column>
          <el-table-column
            fixed="right" header-align="center" align="center" width="250" label="操作">
            <template slot-scope="scope">
              <hm-button icon="fa fa-edit" label="编辑" perms="system:area:update" type="primary" size="mini" @click="handleEdit(scope.row)"/>
              <hm-button icon="fa fa-plus" label="添加下级" perms="system:area:add" type="success" size="mini" @click="handleAdd(scope.row)"/>
              <hm-button icon="fa fa-trash" label="删除" perms="system:area:remove" type="danger" size="mini" @click="handleDelete(scope.row)"/>
              <hm-button icon="fa fa-trash" label="生成json" v-if="showCreateJson" perms="system:area:add" type="success" size="mini" @click="handleCreate(scope.row.id)"/>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  <!-- ------------------------------新增修改界面 begin-------------------------------- -->
    <!--新增编辑界面-->
    <el-dialog :title="this.type==1 ? '新增' : '修改'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" label-width="80px" :rules="dataRule" ref="dataForm" :size="size">
        <el-form-item label="区划编码" prop="id" >
          <el-input v-model="dataForm.id" auto-complete="off" maxlength="12" :disabled="this.type !== 1"
          show-word-limit clearable></el-input>
        </el-form-item>
        <el-form-item label="区划名称" prop="name">
          <el-input v-model="dataForm.name" auto-complete="off" maxlength="50" show-word-limit clearable></el-input>
        </el-form-item>
        <el-form-item label="区划简称" prop="shortName">
          <el-input v-model="dataForm.shortName" auto-complete="off" maxlength="50" show-word-limit clearable></el-input>
        </el-form-item>
        <el-form-item label="上级区划" prop="parentEntireName">
          <el-input v-model="dataForm.parentEntireName" auto-complete="off" maxlength="50" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="上级区划编码" prop="parentId" v-if="false">
          <el-input v-model="dataForm.parentId" auto-complete="off" maxlength="12"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dataForm.remark" auto-complete="off" type="textarea" maxlength="200" show-word-limit clearable></el-input>
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
import TableColumnFilterDialog from '@/views/Core/TableColumnFilterDialog'
import { format } from '@/utils/datetime'
export default {
  components: {
    HmTable,
    HmButton,
    TableColumnFilterDialog
  },
  data () {
    return {
      showCreateJson: false, // 是否显示生成json按钮（开发用）
      tableHeight: null, // 表格高度-动态
      // -----------------左侧列表 begin------------------
      provinceList: {
        filterText: '', // 过滤条件
        loading: false, // 列表是否加载中
        provinceData: [], // 省数据
        selectedID: '',
        selectedName: ''
      },
      // -----------------左侧列表 end------------------
      // -----------------右侧列表 begin------------------
      isFold: false, // 是否折叠所有节点
      areaTreeData: [], // 区划树
      loading: false, // 列表是否加载中
      size: 'small', // 按钮大小
      filters: {
        parentId: '', // 上级区划id
        searchText: '' // 查询条件
      },
      treeRequest: { parentId: null, searchText: null },
      loadNodeMap: new Map(), // 保存懒加载的节点
      areaTree: {
        selectedRow: null,
        treeNode: null,
        resolve: null
      },
      // -----------------右侧列表 end--------------------------

      // -----------------新增编辑 begin------------------
      type: null, // 1 新增 2 修改
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,
      dataRule: {
        id: [
          { required: true, message: '地址编码不能为空', trigger: ['blur', 'change'] },
          { required: true, validator: this.existArea, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '地址名称不能为空', trigger: 'change' }
        ]
      },
      // 新增编辑界面数据
      dataForm: {
        id: '',
        name: '',
        shortName: '',
        parentId: '',
        parentName: '',
        parentEntireName: '',
        remark: ''
      },
      // 修改前的区划信息
      oldArea: {
        id: ''
      }
      // -----------------新增编辑 end------------------
    }
  },
  methods: {
    // ---------------------------------------左侧列表 ↓----------------------------------------
    // 获取所有省数据
    getAllProvince () {
      this.provinceList.loading = true
      this.$api.area.getChildrenByID({'id': '0'}).then((res) => {
        this.provinceList.provinceData = res.data
        this.provinceList.loading = false
      })
    },
    // 省选择改变监听
    handleProvinceSelectChange (row) {
      if (row == null) {
        return
      }
      this.provinceList.selectedID = row.id
      this.provinceList.selectedName = row.name
      // 获取右侧表格数据
      this.findTreeData()
    },
    // ---------------------------------------左侧列表 ↑----------------------------------------
    // ---------------------------------------右侧列表 ↓----------------------------------------
    // 获取行政区划表格树数据
    findTreeData () {
      this.loading = true
      if (this.filters.searchText) {
        // 带过滤条件的直接查询区划树
        this.filters.parentId = this.provinceList.selectedID
        this.$api.area.getChildrenTree(this.filters).then((res) => {
          this.areaTreeData = res.data
          this.markChildren(this.areaTreeData)
          this.loading = false
        })
      } else {
        // 懒加载获取数据（一级数据，直接查询整个树速度慢）
        this.$api.area.getChildrenByID({'id': this.provinceList.selectedID}).then((res) => {
          this.areaTreeData = res.data
          this.markChildren(this.areaTreeData)
          this.loading = false
        })
      }
    },
    // 标记是否有子节点
    markChildren (list) {
      list.forEach(item => {
        item.hasChildren = item.hasChildren === 0 ? null : item.hasChildren
      })
    },
    // 加载下级行政区划（lazy为true时生效）
    loadChildren (row, treeNode, resolve) {
      const pid = row.id
      // 将当前操作的节点等信息起来
      this.loadNodeMap.set(pid, {row, treeNode, resolve})
      // row为点击那一行的数据
      this.$api.area.getChildrenByID({'id': row.id}).then((res) => {
        let list = res.data
        this.markChildren(list)
        // 下一级数据传入resolve
        resolve(list)
      })
    },
    // 折叠所有节点（不起作用 未解决）
    foldAllNode (value) {
      var els = this.$el.getElementsByClassName('el-table__expand-icon el-table__expand-icon--expanded')
      for (var i = 0; i < els.length; i++) {
        els[i].click()
      }
    },
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
    // 删除
    handleDelete (row) {
      this.$confirm('确认删除行政区划【' + row.name + '】吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$api.area.remove({'id': row.id}).then(res => {
          this.findTreeData()
          this.refreshChildren(row.parentId)
          if (res.status === 1) {
            this.$message({ message: '删除成功', type: 'success' })
          } else {
            this.$message({ message: '删除失败,' + res.msg, type: 'error' })
          }
        })
      })
    },
    // 刷新懒加载节点
    refreshChildren: function (pid) {
      console.log(this.loadNodeMap)
      console.log('-------------' + pid + '-----------')
      if (this.loadNodeMap.has(pid)) {
        const {row, treeNode, resolve} = this.loadNodeMap.get(pid)
        console.log(this.loadNodeMap.get(pid))
        console.log(this.$refs.areaTable.store.states.lazyTreeNodeMap)
        // 将父节点置空 重新懒加载
        this.$set(this.$refs.areaTable.store.states.lazyTreeNodeMap, pid, [])
        // 重新懒加载
        this.loadChildren(row, treeNode, resolve)
      }
    },
    /**
     * 生成json文件
     * @param {string} 父级id
     */
    handleCreate: function (id) {
      if (!id) {
        id = '0'
      }
      this.$api.area.createAreaJsonFile({'id': id}).then(res => {
        if (res.status === 1) {
          this.$message({ message: '操作成功', type: 'success' })
        } else {
          this.$message({message: '操作失败, ' + res.msg, type: 'error'})
        }
      })
    },
    // ---------------------------------------右侧列表 ↑----------------------------------------
    // ---------------------------------------新增编辑 ↓----------------------------------------
    // 显示新增界面
    handleAdd: function (parent = null) {
      this.oldArea.id = ''
      this.type = 1
      this.dialogVisible = true
      this.dataForm = {
        id: '',
        name: '',
        shortName: '',
        parentId: parent == null ? '' : parent.id,
        parentName: parent == null ? '' : parent.name,
        parentEntireName: parent == null ? '' : parent.entireName,
        remark: ''
      }
    },
    /**
     * 自定义验证
     * @param {Object} rule 规则对象
     * @param {String} value 值
     * @param {Function} cb 回调函数
     */
    existArea (rule, value, cb) {
      let params = {id: this.dataForm.id}
      let hasCallBack = false
      let len = this.dataForm.id.length
      if (len !== 2 && len !== 4 && len !== 6 && len !== 9 && len !== 12) {
        rule.required ? cb(new Error('编码位数必须是2、4、6、9或12位！')) : cb()
      }
      // 编码修改了则判断是否已存在
      if (this.oldArea.id !== this.dataForm.id) {
        this.$api.area.getArea(params).then(res => {
          if (res) {
            let result = res.data
            if (result) {
              hasCallBack = true
              rule.required ? cb(new Error('编码：' + result.id + '，已被【' + result.name + '】使用！')) : cb()
            }
          }
        })
      }
      // 获取父级行政区划
      this.$api.area.getParent(params).then(res => {
        if (res) {
          let result = res.data
          if (result) {
            this.dataForm.parentId = result.id
            this.dataForm.parentName = result.name
            this.dataForm.parentEntireName = result.entireName
          } else {
            hasCallBack = true
            rule.required ? cb(new Error('不存在上级行政区划信息，请添加！')) : cb()
          }
        }
        if (!hasCallBack) {
          cb()
        }
      })
    },
    // 显示编辑界面
    handleEdit: function (row) {
      this.type = 2
      this.dialogVisible = true
      let params = {id: row.id}
      this.oldArea.id = row.id
      // 获取父级行政区划
      this.$api.area.getArea(params).then(res => {
        if (res) {
          let result = res.data
          if (result) {
            Object.assign(this.dataForm, result)
          } else {
            this.$message({ message: '获取行政区划【' + row.name + '】失败！', type: 'error' })
          }
        }
      })
    },
    // 编辑
    submitForm: function () {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            if (this.type === 1) {
              // 请求服务器
              this.$api.area.add(params).then((res) => {
                this.editLoading = false
                if (res.status === 1) {
                  this.$message({ message: '操作成功', type: 'success' })
                  this.dialogVisible = false
                  this.$refs['dataForm'].resetFields()
                } else {
                  this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                }
                // 获取右侧表格数据
                this.findTreeData()
                this.refreshChildren(params.parentId)
              })
            } else {
              // 请求服务器
              this.$api.area.update(params).then(res => {
                this.editLoading = false
                if (res.status === 1) {
                  this.$message({ message: '操作成功', type: 'success' })
                  this.$refs['dataForm'].resetFields()
                  this.dialogVisible = false
                } else {
                  this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                }
                // 获取右侧表格数据
                this.findTreeData()
                this.refreshChildren(params.parentId)
              })
            }
          })
        }
      })
    }
    // ---------------------------------------新增编辑 ↑----------------------------------------
  },
  mounted () {
    this.getAllProvince()
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
.el-col+.el-col {
  padding-left:0px !important;
}
.clearfix:after {
  content: ".";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}

/* Hides from IE-mac \*/
* html .clearfix {
  height: 1%;
}
/* End hide from IE-mac */
</style>