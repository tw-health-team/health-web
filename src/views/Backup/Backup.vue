<template>
  <!--备份还原界面-->
  <el-dialog :title="备份还原" width="40%" :visible.sync="backupVisible" :close-on-click-modal="false" :modal=false>
    <el-table :data="tableData" style="width: 100%;font-size:16px;" height="330px" :show-header="showHeader"
        size="mini" v-loading="tableLoading" :element-tableLoading-text="拼命加载中">
      <el-table-column prop="title" label="版本名称" header-align="center" align="center">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
          <template slot-scope="scope">
              <el-button @click="handleRestore(scope.row)" type="primary" size="mini">备份还原</el-button>
              <el-button @click="handleDelete(scope.row)" type="danger" :disabled="scope.row.name=='backup'?true:false" size="mini">删除</el-button>
          </template>
      </el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button size="small"  @click="backupVisible = false">取消</el-button>
      <el-button size="small"  type="primary" @click="handleBackup">备份</el-button>
    </span>
  </el-dialog>
</template>

<script>
import axios from 'axios'
export default {
  data () {
    return {
      tableData: [], // 备份记录
      showHeader: false,
      backupVisible: false,
      tableLoading: false,
      baseUrl: this.global.backupBaseUrl
    }
  },
  methods: {
    // 设置可见性
    setBackupVisible: function (backupVisible) {
      this.backupVisible = backupVisible
    },
    // 查询备份记录
    findRecords: function () {
      this.tableLoading = true
      axios.get(this.baseUrl + '/backup/findRecords').then((res) => {
        res = res.data
        if (res.code === 200) {
          this.tableData = res.data
        } else {
          this.$message({message: '操作失败, ' + res.msg, type: 'error'})
        }
        this.tableLoading = false
      })
    },
    // 数据备份
    handleBackup: function () {
      this.tableLoading = true
      axios.get(this.baseUrl + '/backup/backup').then((res) => {
        res = res.data
        if (res.code === 200) {
          this.$message({ message: '操作成功', type: 'success' })
        } else {
          this.$message({message: '操作失败, ' + res.msg, type: 'error'})
        }
        this.tableLoading = false
        this.findRecords()
      })
    },
    // 数据还原
    handleRestore: function (data) {
      this.tableLoading = true
      axios.get(this.baseUrl + '/backup/restore', {params: { name: data.name }}).then((res) => {
        res = res.data
        if (res.code === 200) {
          this.$message({ message: '操作成功', type: 'success' })
          this.$emit('afterRestore', {})
        } else {
          this.$message({message: '操作失败, ' + res.msg, type: 'error'})
        }
        this.tableLoading = false
      })
    },
    // 删除备份
    handleDelete: function (data) {
      this.tableLoading = true
      axios.get(this.baseUrl + '/backup/delete', {params: { name: data.name }}).then((res) => {
        res = res.data
        if (res.code === 200) {
          this.$message({ message: '操作成功', type: 'success' })
        } else {
          this.$message({message: '操作失败, ' + res.msg, type: 'error'})
        }
        this.findRecords()
        this.tableLoading = false
      })
    }
  },
  mounted () {
    this.findRecords()
  }
}
</script>

<style scoped>

</style>