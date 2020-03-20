<template>
  <div class="page-container">
    <div ref="titleDiv" class="list-title__container">
      <span>菜单树</span>
    </div>
    <!--搜索栏-->
    <div ref="searchDiv" class="list-select__container">
      <el-row :gutter="24" type="flex" justify="start" align="top">
        <el-col :span="6" :xs="12" :sm="8" :md="8" :lg="6">
          <el-input v-model.trim="filters.name" size="small" placeholder="请输入名称模糊查询" clearable></el-input>
        </el-col>
        <el-col :span="8" :xs="12" :sm="10" :md="8" :lg="6" class="nopadding">
          <hm-button icon="fa fa-search" label="查询" perms="system:resource:list" type="primary" @click="findTreeData(null)"/>
          <hm-button icon="fa fa-plus" label="新增" perms="system:resource:add" type="primary" @click="handleAdd"/>
          <el-switch v-model="isFold" @change="expandOrFoldAllNode"></el-switch>
        </el-col>
      </el-row>
    </div>
    <!--表格栏-->
    <div class="list-table__container">
      <!--表格树内容栏-->
      <el-table ref="resourceTable" :data="tableTreeData" :height="tableHeight"
        stripe size="mini" style="width: 100%;" rowKey="id" v-loading="loading" element-loading-text="拼命加载中" default-expand-all>
        <el-table-column
          prop="name" header-align="center" treeKey="id" width="200" label="名称">
        </el-table-column>
        <el-table-column header-align="center" align="center" width="120" label="图标">
          <template slot-scope="scope">
            <i :class="scope.row.icon || ''"></i>
          </template>
        </el-table-column>
        <el-table-column prop="type" header-align="center" align="center" width="150" label="类型">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type === 0" size="small">目录</el-tag>
            <el-tag v-else-if="scope.row.type === 1" size="small" type="success">菜单</el-tag>
            <el-tag v-else-if="scope.row.type === 2" size="small" type="info">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="url" header-align="center" align="center"
          :show-overflow-tooltip="true" label="菜单URL">
        </el-table-column>
        <el-table-column
          prop="permission" header-align="center" align="center"
          :show-overflow-tooltip="true" label="授权标识">
        </el-table-column>
        <el-table-column
          prop="sort" header-align="center" align="center" width="60" label="排序">
        </el-table-column>
        <el-table-column
          fixed="right" header-align="center" align="center" width="250" label="操作">
          <template slot-scope="scope">
            <hm-button icon="fa fa-edit" label="编辑" perms="system:resource:update" type="primary" size="mini" @click="handleEdit(scope.row)"/>
            <hm-button icon="fa fa-trash" label="删除" perms="system:resource:remove" type="danger" size="mini" @click="handleDelete(scope.row)"/>
            <hm-button icon="fa fa-plus" label="添加下级" v-if="scope.row.type!==2" perms="system:resource:add" type="success" size="mini" @click="handleAdd(scope.row)"/>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 新增修改界面 -->
    <el-dialog :title="!dataForm.id ? '新增' : '修改'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="submitForm()"
        label-width="80px" :size="size" style="text-align:left;">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="dataForm.type">
            <el-radio v-for="(type, index) in menuTypeList" :label="index" :key="index">{{ type }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="menuTypeList[dataForm.type] + '名称'" prop="name">
          <el-input v-model="dataForm.name" :placeholder="menuTypeList[dataForm.type] + '名称'"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单" prop="parentName">
            <popup-tree-input
              :data="popupTreeData" :props="popupTreeProps" :prop="dataForm.parentName==null||dataForm.parentName==''?'顶级菜单':dataForm.parentName"
              :nodeKey="''+dataForm.parentId" :currentChangeHandle="handleTreeSelectChange" :expand-on-click-node="false">
            </popup-tree-input>
        </el-form-item>
        <el-form-item v-if="dataForm.type !== 0" label="授权标识" prop="permission">
          <el-input v-model="dataForm.permission" placeholder="如: system:user:list,system:user:add, system:user:update, system:user:remove"></el-input>
        </el-form-item>
        <el-form-item v-if="dataForm.type === 1" label="菜单路由" prop="url">
          <el-row>
            <el-col :span="22">
                <el-input v-model="dataForm.url" placeholder="菜单路由"></el-input>
            </el-col>
            <el-col :span="2" class="icon-list__tips">
                <el-tooltip placement="top" effect="light" style="padding: 10px;">
                  <div slot="content">
                    <p>URL格式：</p>
                    <p>1.常规业务开发的功能URL，如用户管理，Views目录下页面路径为 /System/User, 此处填写 /system/user。</p>
                    <p>2.嵌套外部网页，如通过菜单打开百度网页，此处填写 http://www.baidu.com，http:// 不可省略。</p>
                    <p>示例：用户管理：/system/user 嵌套百度：http://www.baidu.com 嵌套网页：http://127.0.0.1:8000</p></div>
                  <i class="el-icon-warning"></i>
                </el-tooltip>
            </el-col>
          </el-row>
        </el-form-item>
        <!-- <div class="form-item-wrap">
          <el-form-item label="所属平台" prop="systemId">
            <el-select v-model="dataForm.systemId" placeholder="请选择"
                style="width: 100%;">
              <el-option v-for="(dict,index) in this.getSystemType" :key="index"
                :label="dict.itemName" :value="dict.itemValue">
              </el-option>
            </el-select>
          </el-form-item>
        </div> -->
        <el-form-item v-if="dataForm.type !== 2" label="排序编号" prop="sort">
          <el-input-number v-model="dataForm.sort" :min="0" label="排序编号"></el-input-number>
        </el-form-item>
        <el-form-item v-if="dataForm.type !== 2" label="菜单图标" prop="icon">
          <el-row>
            <el-col :span="22">
              <!-- <el-popover
                ref="iconListPopover"
                placement="bottom-start"
                trigger="click"
                popper-class="mod-menu__icon-popover">
                <div class="mod-menu__icon-list">
                  <el-button
                    v-for="(item, index) in dataForm.iconList"
                    :key="index"
                    @click="iconActiveHandle(item)"
                    :class="{ 'is-active': item === dataForm.icon }">
                    <icon-svg :name="item"></icon-svg>
                  </el-button>
                </div>
              </el-popover> -->
              <el-input v-model="dataForm.icon" v-popover:iconListPopover :readonly="false" placeholder="菜单图标名称（如：fa fa-home fa-lg）" class="icon-list__input"></el-input>
            </el-col>
            <el-col :span="2" class="icon-list__tips">
              <fa-icon-tooltip />
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :size="size"  @click="dialogVisible = false">取消</el-button>
        <el-button :size="size"  type="primary" @click="submitForm()">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import HmButton from '@/views/Core/HmButton'
import TableTreeColumn from '@/views/Core/TableTreeColumn'
import PopupTreeInput from '@/components/PopupTreeInput'
import FaIconTooltip from '@/components/FaIconTooltip'
import { mapState, mapGetters } from 'vuex'
export default {
  components: {
    PopupTreeInput,
    HmButton,
    TableTreeColumn,
    FaIconTooltip
  },
  data () {
    return {
      isFold: true, // 是否折叠所有节点
      size: 'small',
      loading: false,
      filters: {
        name: ''
      },
      tableHeight: null,
      tableTreeData: [],
      dialogVisible: false,
      menuTypeList: ['目录', '菜单', '按钮'],
      dataForm: {
        id: 0,
        type: 1,
        name: '',
        parentId: 0,
        parentName: '',
        url: '',
        permission: '',
        sort: 0,
        icon: '',
        iconList: [],
        systemId: ''
      },
      dataRule: {
        name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
        url: [{ required: true, message: '菜单路由不能为空', trigger: 'blur' }]
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
    ...mapState('dict', [
      'dicProps'
    ]),
    ...mapGetters('dict', {
      getDic: 'getDic'
    }),
    getSystemType () {
      return this.getDic('systemType')
    }
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
      // 遍历table数据
      this.tableTreeData.map(item => {
        // 展开或收缩table行
        this.expandOrFoldTableRow(this.$refs.resourceTable, item, value)
      })
    },
    // 获取数据
    findTreeData: function () {
      this.loading = true
      // this.$api.menu.findResourceTree().then(res => {
      //   this.tableTreeData = res.data
      //   this.popupTreeData = this.getParentMenuTree(res.data)
      //   this.loading = false
      // })
      let data = {searchText: this.filters.name}
      this.$api.menu.findTreeBySearchText(data).then(res => {
        this.tableTreeData = res.data
        this.loading = false
        // 查询全部时
        if (this.filters.name === '') {
          // 获取上级菜单树
          this.popupTreeData = this.getParentMenuTree(this.tableTreeData)
        }
      })
    },
    // 获取上级菜单树
    getParentMenuTree: function (treeData) {
      // 实现数组深拷贝
      let resourceTree = JSON.parse(JSON.stringify(treeData))
      // 排除按钮
      let menuTree = this.removeButton(resourceTree)
      let parent = {
        parentId: 0,
        name: '顶级菜单',
        children: menuTree
      }
      return [parent]
    },
    // 删除按钮
    removeButton: function (arr) {
      if (arr.length) {
        for (let i in arr) {
          if (arr[i].children.length && arr[i].children[0].type !== 2) {
            this.removeButton(arr[i].children)
          } else {
            // 子级如果type = 2 即按钮则删除
            delete arr[i].children
          }
        }
      }
      return arr
    },
    fetchDics () {
      /**
       * 请求字典数据
       */
      if (!this.getDictByType) {
        // 获取菜单字典
        this.dicProps.resource.forEach(prop => {
          this.$store.dispatch('dict/getDictByType', prop)
        })
      }
    },
    // 显示新增界面
    handleAdd: function (parent = null) {
      this.type = 1
      this.dialogVisible = true
      this.dataForm = {
        id: 0,
        type: parent.type === 1 ? 2 : 1,
        typeList: ['目录', '菜单', '按钮'],
        name: '',
        parentId: parent == null ? 0 : parent.id,
        parentName: parent == null ? '' : parent.name,
        url: '',
        permission: '',
        sort: 0,
        icon: '',
        iconList: [],
        systemId: ''
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
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.$api.menu.remove({ id: row.id }).then(res => {
          this.findTreeData()
          if (res.status === 1) {
            this.$message({ message: '删除成功', type: 'success' })
          } else {
            this.$message({ message: '删除失败,' + res.msg, type: 'error' })
          }
        })
      })
    },
    // 获取删除的包含子菜单的id列表
    getDeleteIds (ids, row) {
      ids.push({ id: row.id })
      if (row.children != null) {
        for (let i = 0, len = row.children.length; i < len; i++) {
          this.getDeleteIds(ids, row.children[i])
        }
      }
      return ids
    },
    // 菜单树选中
    handleTreeSelectChange (data, node) {
      this.dataForm.parentId = data.id
      this.dataForm.parentName = data.name
    },
    // 图标选中
    iconActiveHandle (iconName) {
      this.dataForm.icon = iconName
    },
    // 表单提交
    submitForm () {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            if (this.type === 1) {
              this.$api.menu.add(params).then(res => {
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
                this.findTreeData()
              })
            } else {
              this.$api.menu.update(this.dataForm, params).then(res => {
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
                this.findTreeData()
              })
            }
          })
        }
      })
    }
  },
  mounted () {
    this.findTreeData()
    this.fetchDics()
    let headerBarHeight = this.$global.headerHeight
    let tabHeight = this.$global.tabHeight
    let spaceHeight = this.$global.spaceHeight
    let searchHeight = this.$refs.searchDiv.offsetHeight
    let titleHeight = this.$refs.titleDiv.offsetHeight
    // window.innerHeight:浏览器的可用高度
    this.tableHeight = window.innerHeight - headerBarHeight - tabHeight - spaceHeight - searchHeight - titleHeight
    // 赋值vue的this
    const that = this
    // window.onresize中的this指向的是window，不是指向vue
    window.onresize = () => {
      return (() => {
        that.tableHeight = window.innerHeight - headerBarHeight - tabHeight - spaceHeight - searchHeight - titleHeight
      })()
    }
  },
  watch: {
    tableHeight (val) {
      this.tableHeight = val
    },
    // 深度监听，可监听到对象、数组的变化
    filters: {
      handler (val, oldVal) {

      },
      deep: true // true 深度监听
    }
  }
}
</script>

<style scoped lang="scss">
  @import "@/assets/css/detail.scss";
  @import "~theme";
</style>