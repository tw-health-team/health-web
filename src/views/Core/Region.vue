<template>
<el-cascader v-model="address" :options="option" size="small"
            @change="changeHandle"
            filterable clearable></el-cascader>
</template>

<script>
import { addressData } from '@/utils/global'
export default {
  name: 'Region',
  components: {
  },
  props: {
    changeHandle: {
      type: Function,
      default: null
    }
  },
  data () {
    return {
      address: [],
      option: addressData
    }
  },
  methods: {
    async test () {
      console.log('-----------------test--------------')
    }
  },
  computed: {
  },
  created () {
    this.test()
  },
  mounted () {
  },
  watch: {
  }
}
</script>

<style scoped lang="scss">
</style>