<!--
 * @Description:
 * @Author: tangwei
 * @Date: 2019-09-17 19:13:16
 -->
<template>
  <div>
    <el-popover ref="popover" :placement="placement" trigger="click">
      <el-tree
        :data="data"
        :props="props"
        node-key="nodeKey"
        ref="popupTree"
        @current-change="currentChangeHandle"
        :default-expand-all="true"
        :highlight-current="true"
        :expand-on-click-node="expandOnClickNode">
      </el-tree>
    </el-popover>
    <el-input v-model="prop" v-popover:popover :readonly="true" :placeholder="placeholder" style="cursor:pointer;"></el-input>
  </div>
</template>

<script>
export default {
  name: 'PopupTreeInput',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    props: {
      type: Object,
      default: () => {}
    },
    prop: {
      type: String,
      default: ''
    },
    nodeKey: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '点击选择内容'
    },
    placement: {
      type: String,
      default: 'right-start'
    },
    currentChangeHandle: {
      type: Function,
      default: null
    },
    expandOnClickNode: { // 是否在点击节点的时候展开或者收缩节点
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>

</style>
