<template>
  <div class="container">
      <!-- 导航菜单栏 -->
      <NavBar></NavBar>
      <!-- 头部区域 -->
      <HeadBar></HeadBar>
      <!-- 主内容区域 -->
      <MainContent></MainContent>
  </div>
</template>

<script>
import HeadBar from './HeadBar/HeadBar'
import NavBar from './NavBar/NavBar'
import MainContent from './MainContent/MainContent'
export default {
  components: {
    HeadBar,
    NavBar,
    MainContent
  }
}
</script>

<style scoped lang="scss">
@import "~theme";
  .container {
    // position:absolute;
    // top: 0px;
    // left: 0px;
    // right: 0px;
    // background: #4b5f6e;
    width: 100%;
    height: 100%;
    background-color: $white-background;
  }
</style>
