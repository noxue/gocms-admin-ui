import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'Dashboard',
    hidden: true,
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index')
    }]
  },

  {
    path: '/article',
    component: Layout,
    redirect: '/article/index',
    name: 'article',
    meta: { title: '文章', icon: 'example' },
    children: [
      {
        path: 'type/add',
        name: 'article-type-add',
        component: () => import('@/views/article-type/edit'),
        meta: { title: '添加分类', icon: 'tree' }
      },
      {
        path: 'type/edit',
        name: 'article-type-edit',
        hidden: true,
        component: () => import('@/views/article-type/edit'),
        meta: { title: '编辑分类', icon: 'tree' }
      },
      {
        path: 'types',
        name: 'article-types',
        component: () => import('@/views/article-type/index'),
        meta: { title: '分类列表', icon: 'tree' }
      },
      {
        path: 'add',
        name: 'article-add',
        component: () => import('@/views/article/edit'),
        meta: { title: '添加文章', icon: 'tree' }
      },
      {
        path: 'index',
        name: 'articles',
        component: () => import('@/views/article/index'),
        meta: { title: '文章列表', icon: 'table' }
      },
      {
        path: 'edit',
        name: 'article-edit',
        hidden: true,
        component: () => import('@/views/article/edit'),
        meta: { title: '添加文章', icon: 'tree' }
      }
    ]
  },
  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
