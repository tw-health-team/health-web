
<!--
 * @Description:
 * @Author: tangwei
 * @Date: 2019-09-01 14:37:36
 -->
<template>
  <el-form :model="loginForm" :rules="fieldRules" ref="loginForm" label-position="left" label-width="0px" class="login-container">
    <h3 class="title">系统登录</h3>
    <el-form-item prop="account">
      <el-input type="text" v-model="loginForm.account" auto-complete="off" placeholder="账号"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" v-model="loginForm.password" auto-complete="off" placeholder="密码"></el-input>
    </el-form-item>
    <!-- <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox> -->
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:47%;" @click.native.prevent="reset">重 置</el-button>
      <el-button type="primary" style="width:47%;" @click.native.prevent="login" :loading="logining">登 录</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import Cookies from 'js-cookie'
import router from '@/router'
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'Login',
  data () {
    return {
      logining: false,
      loginForm: {
        account: 'admin',
        password: '123456'
      },
      fieldRules: {
        account: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      checked: true
    }
  },
  methods: {
    ...mapMutations({
      updateUserInfo: 'updateUserInfo'
    }),
    login () {
      let userInfo = {username: this.loginForm.account, password: this.loginForm.password}
      this.$api.login.login(userInfo).then((res) => {
        if (res.status > 0) {
          // 放置token到Cookie
          Cookies.set('token', res.data)
          // 保存用户到本地会话
          sessionStorage.setItem('user', userInfo.username)
          // // 登录成功，跳转到主页
          router.push('/')
          // 缓存用户信息
          this.cacheUserInfo()
        } else {
          this.$message({message: res.msg, type: 'error'})
        }
      })
    },
    /**
     * 缓存用户信息
     */
    cacheUserInfo () {
      let param = {username: this.loginForm.account}
      this.$api.user.getUserInfo(param).then((res) => {
        if (res.status > 0) {
          // 缓存用户信息
          this.updateUserInfo(res.data)
        } else {
          this.$message({message: res.msg, type: 'error'})
        }
      })
    },
    reset () {
      this.$refs.loginForm.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
  .login-container {
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    .title {
      margin: 0px auto 40px auto;
      text-align: center;
      color: #505458;
    }
    .remember {
      margin: 0px 0px 35px 0px;
    }
  }
</style>
