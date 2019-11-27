<template>
  <div class="headbar" :class="$store.state.app.collapse?'position-collapse-left':'position-left'">
    <!-- 导航收缩 -->
    <span class="hamburg">
      <el-menu class="el-menu-demo" background-color="#14889A" text-color="#fff"
        active-text-color="#14889A" mode="horizontal">
        <el-menu-item index="1" @click="onCollapse"><hamburger :isActive="collapse"></hamburger></el-menu-item>
      </el-menu>
    </span>
    <!-- 导航菜单 -->
    <span class="navbar">
      <el-menu :default-active="activeIndex" class="el-menu-demo" background-color="#14889A" text-color="#fff" active-text-color="#ffd04b"
        mode="horizontal" @select="selectNavBar()">
        <el-menu-item index="1" @click="$router.push('/')"><i class="fa fa-home fa-lg"></i>  </el-menu-item>
        <!-- <el-menu-item index="2" @click="openWindow('https://gitee.com/liuge1988/kitty')">项目</el-menu-item>
        <el-menu-item index="3" @click="openWindow('https://gitee.com/liuge1988/kitty/wikis/Home')">文档</el-menu-item>
        <el-menu-item index="4" @click="openWindow('https://www.cnblogs.com/xifengxiaoma/')">博客</el-menu-item> -->
      </el-menu>
    </span>
    <!-- 工具栏 -->
    <span class="toolbar">
      <el-menu class="el-menu-demo" background-color="#14889A" text-color="#14889A" active-text-color="#14889A" mode="horizontal">
        <el-menu-item index="1" v-popover:popover-message v-if="false">
          <!-- 我的私信 -->
          <el-badge :value="5" :max="99" class="badge" type="success">
            <li style="color:#fff;" class="fa fa-envelope-o fa-lg"></li>
          </el-badge>
          <el-popover ref="popover-message" placement="bottom-end" trigger="click">
            <message-panel></message-panel>
          </el-popover>
        </el-menu-item>
        <el-menu-item index="2" v-popover:popover-notice v-if="false">
          <!-- 系统通知 -->
          <el-badge :value="4" :max="99" class="badge" type="success">
            <li style="color:#fff;" class="fa fa-bell-o fa-lg"></li>
          </el-badge>
          <el-popover ref="popover-notice" placement="bottom-end" trigger="click">
            <notice-panel></notice-panel>
          </el-popover>
        </el-menu-item>
        <el-menu-item index="3" v-popover:popover-personal>
          <!-- 用户信息 -->
          <span class="user-info"><img :src="user.avatar" />{{user.name}}</span>
          <el-popover ref="popover-personal" placement="bottom-end" trigger="click" :visible-arrow="false">
            <personal-panel :user="user"></personal-panel>
          </el-popover>
        </el-menu-item>
      </el-menu>
    </span>
  </div>
</template>

<script>
import mock from '@/mock/index'
import {mapState} from 'vuex'
import Hamburger from '@/components/Hamburger'
import Action from '@/components/Toolbar/Action'
import NoticePanel from '@/views/Core/NoticePanel'
import MessagePanel from '@/views/Core/MessagePanel'
import PersonalPanel from '@/views/Core/PersonalPanel'

export default {
  components: {
    Hamburger,
    Action,
    NoticePanel,
    MessagePanel,
    PersonalPanel
  },
  data () {
    return {
      user: {
        name: '',
        avatar: '',
        role: '',
        registeInfo: ''
      },
      activeIndex: '1'
    }
  },
  computed: {
    ...mapState({
      collapse: state => state.app.collapse
    })
  },
  methods: {
    openWindow (url) {
      window.open(url)
    },
    selectNavBar (key, keyPath) {
      console.log(key, keyPath)
    },
    // 折叠导航栏
    onCollapse: function () {
      this.$store.commit('onCollapse')
    }
  },
  mounted () {
    var user = sessionStorage.getItem('user')
    if (user) {
      this.user.name = user
      this.user.avatar = require('@/assets/user.png')
    }
  }
}
</script>

<style scoped lang="scss">
@import "~theme";
.headbar {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1030;
  height: $header-height;
  line-height: $header-height;
  border-color: rgba(180, 190, 190, 0.8);
  border-left-width: 1px;
  border-left-style: solid;
  background: rgb(20, 136, 154);
}
.hamburg, .navbar {
  float: left;
}
.toolbar {
  float: right;
}
.user-info {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  img {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    margin: 10px 0px 10px 10px;
    float: right;
  }
}
.badge {
  line-height: 18px;
}
.position-left {
  left: 200px;
}
.position-collapse-left {
  left: 65px;
}
</style>
