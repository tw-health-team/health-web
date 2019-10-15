export default {
  state: {
    appName: 'Health Platform', // 应用名称
    collapse: false, // 导航栏收缩状态
    menuRouteLoaded: false // 菜单和路由是否已经加载
  },
  getters: {
    collapse (state) { // 对应着上面state
      return state.collapse
    }
  },
  mutations: {
    onCollapse (state) { // 改变收缩状态
      state.collapse = !state.collapse
    },
    menuRouteLoaded (state, menuRouteLoaded) { // 改变菜单和路由的加载状态
      state.menuRouteLoaded = menuRouteLoaded
    }
  },
  actions: {
  }
}