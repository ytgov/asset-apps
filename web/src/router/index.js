import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Dashboard from "../views/Dashboard.vue";
import NotFound from "../views/NotFound.vue";
import Login from "../views/Login";
import LoginComplete from "../views/LoginComplete";
import Profile from "../views/Profile";

import Administration from "../views/Administration";


import VendorList from "../views/VendorList";
import VendorDetail from "../views/VendorDetail";

Vue.use(VueRouter);

const p1_children = [
  {
    name: "Child Nav 1",
    url: "/nav-1",
    icon: "mdi-calendar-check"
  },
]
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/sign-in",
    name: "Login",
    component: Login
  },
  {
    path: "/login-complete",
    name: "LoginComplete",
    component: LoginComplete
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/vendors",
    name: "Vendors",
    component: VendorList,
    meta: {
      requiresAuth: true,
      chilren: p1_children
    }
  },
  {
    path: "/vendors/:id",
    name: "VendorDetail",
    component: VendorDetail,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: "/administration",
    name: "Administration",
    component: Administration,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: "*",
    name: "Not Found",
    component: NotFound
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

import store from "../store";

router.beforeEach(async (to, from, next) => {
  var requiresAuth = to.meta.requiresAuth || false;

  if (!requiresAuth) {
    return next();
  }

  await store.dispatch("checkAuthentication");
  var isAuthenticated = store.getters.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    console.log("You aren't authenticatd, redirecting to sign-in")
    next("/sign-in");
    return;
  }

  return next();
});

export default router;
