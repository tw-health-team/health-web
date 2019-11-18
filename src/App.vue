<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
@import './style/index';
html,
body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  // 字体抗锯齿渲染,字体更清晰
  -webkit-font-smoothing: antialiased; /*chrome、safari*/
  -moz-osx-font-smoothing: grayscale; /*firefox*/
}
html,
body,
#app {
  width: 100vw;
  min-width: 1024px;
  height: 100vh;
  // min-height: 768px;
  overflow: hidden;
}
</style>
