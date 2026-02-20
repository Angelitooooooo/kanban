import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
      {
    path: '/login',
    name: 'login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "kanban" */ '../views/LoginView.vue')
    },
    {
    path: '/kanban1',
    name: 'kanban1',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "kanban" */ '../views/KanbanView.vue')
    },
   {
    path: '/kanban',
    name: 'kanban',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "kanban" */ '../views/KanbanVuetifyView.vue')
    },
       {
    path: '/scanner',
    name: 'scanner',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "scanner" */ '../views/ScannerView.vue')
    },
    {
    path: '/admin',
    name: 'admin',
    component: () => import(/* webpackChunkName: "admin" */ '../views/AdminView.vue'),
    meta: { requiresAdmin: true }
    }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})


import store from '../store'

// Prevent logged-in users from accessing /login
// Check admin routes
router.beforeEach((to, from, next) => {
  const isAuth = store.getters.isAuthenticated;
  const isAdmin = store.getters.isAdmin;

  // If trying to access admin route without being admin
  if (to.meta.requiresAdmin && !isAdmin) {
    next('/kanban');
    return;
  }

  // Prevent logged-in users from accessing /login
  if (to.path === '/login' && isAuth) {
    if (isAdmin) {
      next('/admin');
    } else {
      next('/kanban');
    }
  } else if (to.path !== '/login' && !isAuth) {
    next('/login');
  } else {
    next();
  }
});

export default router
