<template>
  <div class="page-container">
    <div ref="titleDiv" class="list-title__container">
      <span>机构树</span>
    </div>
    <!--搜索栏-->
    <div ref="searchDiv" class="list-select__container">
      <el-row :gutter="24" type="flex" justify="start" align="top">
        <el-col :span="6" :xs="12" :sm="8" :md="8" :lg="6">
          <el-input v-model.trim="filters.name" size="small" clearable placeholder="请输入机构名称、简称或拼音首拼模糊查询"></el-input>
        </el-col>
        <el-col :span="8" :xs="12" :sm="10" :md="8" :lg="6" class="nopadding">
          <hm-button icon="fa fa-search" label="查询" perms="system:organ:list" type="primary" @click="findTreeData(null)"/>
          <hm-button icon="fa fa-plus" label="增加" perms="system:organ:add" type="primary" @click="handleAdd(null)"/>
          <el-switch v-model="isFold" @change="expandOrFoldAllNode"></el-switch>
        </el-col>
      </el-row>
    </div>
    <!--表格栏-->
    <div class="list-table__container">
      <el-table ref="organTable" :data="tableTreeData" :height="tableHeight" stripe size="mini"
        rowKey="id" v-loading="loading" element-loading-text="拼命加载中">
        <el-table-column
          prop="name" header-align="center" treeKey="id" width="350" label="名称">
        </el-table-column>
        <el-table-column
          prop="parentName" header-align="center" align="center" width="120" label="上级机构">
        </el-table-column>
        <el-table-column
          prop="id" header-align="center" align="center" label="机构编码">
        </el-table-column>
        <el-table-column
          prop="levelName" header-align="center" align="center" label="机构级别">
        </el-table-column>
        <el-table-column
          prop="classificationName" header-align="center" align="center" label="机构类别">
        </el-table-column>
        <el-table-column
          fixed="right" header-align="center" align="left" width="250" label="操作">
          <template slot-scope="scope">
            <hm-button icon="fa fa-edit" label="编辑" perms="system:organ:update" type="primary" size="mini" @click="handleEdit(scope.row)"/>
            <hm-button icon="fa fa-plus" label="添加下级" perms="system:organ:add" type="success" size="mini" @click="handleAdd(scope.row)"/>
            <hm-button icon="fa fa-trash" label="删除" perms="system:organ:remove" type="danger" size="mini" @click="handleDelete(scope.row)"/>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- ------------------------------新增修改界面 begin-------------------------------- -->
    <el-dialog :title="!dataForm.id ? '新增' : '修改'" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="submitForm()"
        label-width="80px" :size="size" style="text-align:left;">
        <div class="form-item-wrap">
          <el-form-item label="机构编码" prop="id">
            <el-input v-model="dataForm.id" placeholder="机构编码" :disabled="this.type !== 1" maxlength="15"></el-input>
          </el-form-item>
          <el-form-item label="机构简称" prop="shortName">
            <el-input v-model="dataForm.shortName" placeholder="机构简称" maxlength="20" clearable></el-input>
          </el-form-item>
        </div>
        <el-form-item label="机构名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="机构名称" maxlength="50" show-word-limit clearable></el-input>
        </el-form-item>
        <el-form-item label="上级机构" prop="parentName">
          <!-- <popup-tree-input
            :data="popupTreeData" :props="popupTreeProps" :prop="dataForm.parentName==null?'顶级机构':dataForm.parentName"
            :nodeKey="''+dataForm.parentId" :currentChangeHandle="handleTreeSelectChange">
          </popup-tree-input> -->
          <OrganTreeInput :organName="dataForm.parentName" :organId="dataForm.parentId" :currentChangeHandle="handleTreeSelectChange">
          </OrganTreeInput>
        </el-form-item>
        <!-- <div class="form-item-wrap">
          <el-form-item label="上级机构" prop="parentName">
            <popup-tree-input
              :data="popupTreeData" :props="popupTreeProps" :prop="dataForm.parentName==null?'顶级机构':dataForm.parentName"
              :nodeKey="''+dataForm.parentId" :currentChangeHandle="handleTreeSelectChange">
            </popup-tree-input>
          </el-form-item>
          <el-form-item label="统一社会信用代码" prop="socialCreditCode">
            <el-input v-model="dataForm.socialCreditCode" placeholder="统一社会信用代码" maxlength="18" show-word-limit clearable></el-input>
          </el-form-item>
        </div> -->
        <div class="form-item-wrap">
          <el-form-item label="机构类别" prop="classificationCode">
            <el-select v-model="dataForm.classificationCode" placeholder="请选择"
                style="width: 100%;">
              <el-option v-for="(dict,index) in this.getClassification" :key="index"
                :label="dict.itemName" :value="dict.itemValue">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="机构级别" prop="levelCode">
            <el-select v-model="dataForm.levelCode" placeholder="请选择"
                style="width: 100%;">
              <el-option v-for="(dict,index) in this.getLevel" :key="index"
                :label="dict.itemName" :value="dict.itemValue">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="dataForm.phone" placeholder="联系电话" maxlength="20" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="机构地址" prop="address">
          <el-input v-model="dataForm.address" placeholder="机构地址" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="所属辖区" prop="location">
          <v-region v-model="location" type="group" :town="true" :committee="true" @values="regionChange"></v-region>
        </el-form-item>
        <el-form-item label="排序编号" prop="orderNum">
          <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="1" label="排序编号"></el-input-number>
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
import Vue from 'vue'
import HmButton from '@/views/Core/HmButton'
import TableTreeColumn from '@/views/Core/TableTreeColumn'
// import PopupTreeInput from '@/components/PopupTreeInput'
import OrganTreeInput from '@/views/Core/OrganTreeInput'
import FaIconTooltip from '@/components/FaIconTooltip'
import { format } from '@/utils/datetime'
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    // PopupTreeInput,
    OrganTreeInput,
    HmButton,
    TableTreeColumn,
    FaIconTooltip
  },
  data () {
    return {
      isFold: false, // 是否折叠所有节点
      size: 'small',
      loading: false,
      filters: {
        name: ''
      },
      tableHeight: null,
      tableTreeData: [],
      dialogVisible: false,
      dataForm: {
        id: '',
        name: '',
        shortName: '',
        parentId: '0',
        parentName: '',
        orderNum: 0,
        classificationCode: '',
        levelCode: '',
        phone: '',
        address: '',
        locationProvinceCode: '',
        locationProvinceName: '',
        locationCityCode: '',
        locationCityName: '',
        locationDistrictCode: '',
        locationDistrictName: '',
        locationTownCode: '',
        locationTownName: '',
        locationCommitteeCode: '',
        locationCommitteeName: '',
        remarks: ''
      },
      // 所属辖区
      location: {
        province: '',
        city: '',
        area: '',
        town: '',
        committee: ''
      },
      dataRule: {
        id: [
          { required: true, message: '机构编码不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '机构名称不能为空', trigger: 'blur' }
        ],
        parentId: [
          { required: true, message: '上级机构不能为空', trigger: 'change' }
        ],
        classificationCode: [
          { required: true, message: '机构类别不能为空', trigger: 'change' }
        ],
        levelCode: [
          { required: true, message: '机构级别不能为空', trigger: 'change' }
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
    ...mapState({
      userInfo: state => state.userInfo
    }),
    ...mapState('dict', [
      'dicProps'
    ]),
    ...mapGetters('dict', {
      getDic: 'getDic'
    }),
    getLevel () {
      return this.getDic('level')
    },
    getClassification () {
      return this.getDic('classification')
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
        this.expandOrFoldTableRow(this.$refs.organTable, item, value)
        // this.$refs.organTable.toggleRowExpansion(item)
      })
    },
    fetchDics () {
      console.log('当前登录用户所属机构：' + this.userInfo.organName)
      /**
       * 请求字典数据
       */
      if (!this.getDictByType) {
        // 获取机构字典
        this.dicProps.organ.forEach(prop => {
          this.$store.dispatch('dict/getDictByType', prop)
        })
      }
    },
    // 获取数据
    findTreeData: function () {
      this.loading = true
      let params = {name: this.filters.name}
      this.$api.organ.list(params).then((res) => {
        this.tableTreeData = res.data
        this.popupTreeData = this.getParentMenuTree(res.data)
        this.loading = false
      })
    },
    // 获取上级机构树
    getParentMenuTree: function (tableTreeData) {
      let parent = {
        parentId: '0',
        name: '顶级菜单',
        children: tableTreeData
      }
      return [parent]
    },
    // 显示新增界面
    handleAdd: function (parent = null) {
      this.type = 1
      this.dialogVisible = true
      // 重置页面数据
      this.dataForm = {
        id: '',
        name: '',
        shortName: '',
        parentId: parent == null ? '0' : parent.id,
        parentName: parent == null ? '' : parent.name,
        orderNum: 0,
        classificationCode: '',
        levelCode: '',
        phone: '',
        address: '',
        locationProvinceCode: '',
        locationProvinceName: '',
        locationCityCode: '',
        locationCityName: '',
        locationDistrictCode: '',
        locationDistrictName: '',
        locationTownCode: '',
        locationTownName: '',
        locationCommitteeCode: '',
        locationCommitteeName: '',
        remarks: ''
      }
      // 重置所属辖区
      this.location = {
        province: '',
        city: '',
        area: '',
        town: '',
        committee: ''
      }
    },
    // 显示编辑界面
    handleEdit: function (row) {
      this.type = 2
      this.dialogVisible = true
      Object.assign(this.dataForm, row)
      // 赋值所属辖区数据
      this.location.province = row.locationProvinceCode
      this.location.city = row.locationCityCode
      this.location.area = row.locationDistrictCode
      this.location.town = row.locationTownCode
      this.location.committee = row.locationCommitteeCode
    },
    // 删除
    handleDelete (row) {
      let msg = '确认删除选中机构吗？'
      if (row.children != null && row.children.length > 0) {
        msg = '确定删除该机构及其下级机构吗？'
      }
      this.$confirm(msg, '提示', {
        type: 'warning'
      }).then(() => {
        let params = this.getDeleteIds([], row)
        this.$api.organ.batchDelete(params).then(res => {
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
    // 机构树选中
    handleTreeSelectChange (data, node) {
      this.dataForm.parentId = data.id
      this.dataForm.parentName = data.name
    },
    /**
     * 行政区划回调时间
     * @param {object}
     * @return: { province: { key:'', value:'' },
                  city: { key:'', value:'' },
                  area: { key:'', value:'' },
                  town: { key:'', value:'' }},
                  committee: { key:'', value:'' }}
     */
    regionChange (data) {
      if (data) {
        // console.log(data)
        if (data.province) {
          this.dataForm.locationProvinceCode = data.province.key
          this.dataForm.locationProvinceName = data.province.value
        }
        if (data.city) {
          this.dataForm.locationCityCode = data.city.key
          this.dataForm.locationCityName = data.city.value
        }
        if (data.area) {
          this.dataForm.locationDistrictCode = data.area.key
          this.dataForm.locationDistrictName = data.area.value
        }
        if (data.town) {
          this.dataForm.locationTownCode = data.town.key
          this.dataForm.locationTownName = data.town.value
        }
        if (data.committee) {
          this.dataForm.locationCommitteeCode = data.committee.key
          this.dataForm.locationCommitteeName = data.committee.value
        }
      }
    },
    // 表单提交
    submitForm () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true
            let params = Object.assign({}, this.dataForm)
            if (this.type === 1) {
              this.$api.organ.add(params).then(res => {
                this.editLoading = false
                if (res.status === 1) {
                  this.$message({ message: '操作成功', type: 'success' })
                  this.$refs['dataForm'].resetFields()
                  this.dialogVisible = false
                } else {
                  this.$message({ message: '操作失败, ' + res.msg, type: 'error' })
                }
                this.findTreeData()
              })
            } else {
              this.$api.organ.update(this.dataForm, params).then(res => {
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
    },
    // 时间格式化
    dateFormat: function (row, column, cellValue, index) {
      return format(row[column.property])
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
    }
  }
}
</script>

<style scoped lang="scss">
  @import "@/assets/css/detail.scss";
  @import "~theme";

</style>