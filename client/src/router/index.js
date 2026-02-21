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
    },
    {
    path: '/users',
    name: 'users',
    component: () => import(/* webpackChunkName: "users" */ '../views/UserView.vue'),
    meta: { requiresAdmin: true }
    },
    {
    path: '/station-one',
    name: 'station-one',
    component: () => import(/* webpackChunkName: "station-one" */ '../views/StationOneView.vue')
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
  const isAdmin = store.state.user?.isAdmin;
  const station = parseInt(store.state.user?.station);

  // If not authenticated, redirect to login (unless already on it)
  if (!isAuth) {
    if (to.path === '/login') {
      next();
    } else {
      next('/login');
    }
    return;
  }

  // Prevent redirect from login if already logged in
  if (to.path === '/login') {
    // Determine where to send authenticated user
    if (station === 1) {
      next('/station-one');
    } else if (station === 2) {
      next('/kanban');
    } else if (isAdmin === 1) {
      next('/admin');
    } else {
      next('/');
    }
    return;
  }

  // User is authenticated - enforce station/admin routes
  if (station === 1 && to.path !== '/station-one') {
    next('/station-one');
    return;
  } else if (station === 2 && to.path !== '/kanban') {
    next('/kanban');
    return;
  }

  // Allow access to other routes
  next();
});

export default router
