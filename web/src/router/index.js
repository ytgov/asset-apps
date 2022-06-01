import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Dashboard from '../views/Dashboard.vue';
import NotFound from '../views/NotFound.vue';
import Login from '../views/Login';
import LoginComplete from '../views/LoginComplete';
import Profile from '../views/Profile';

import AdministrationHome from '../views/Administration/Home';
import AdministrationUsers from '../views/Administration/Users';
import AdministrationOwners from '../views/Administration/Owners';
import AdministrationTransfers from '../views/Administration/Transfers';
import AdministrationAssets from '../views/Administration/Assets';
import AdministrationTags from '../views/Administration/Tags';
import AdministrationReports from '../views/Administration/Reports';

import ManageList from '../views/Manage/List';

import MyScans from '../views/MyScans.vue';
import MyTags from '../views/MyTags.vue';
import NewScan from '../views/NewScan.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/my-scans",
    name: "MyScans",
    component: MyScans,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/my-requested-tags",
    name: "MyTags",
    component: MyTags,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/scan",
    name: "NewScan",
    component: NewScan,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/sign-in",
    name: "Login",
    component: Login,
  },
  {
    path: "/login-complete",
    name: "LoginComplete",
    component: LoginComplete,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/administration",
    name: "AdministrationHome",
    component: AdministrationHome,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/administration/users",
    name: "AdminUsers",
    component: AdministrationUsers,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/administration/owners",
    name: "AdministrationOwners",
    component: AdministrationOwners,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/administration/transfers",
    name: "AdministrationTransfers",
    component: AdministrationTransfers,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/administration/assets",
    name: "AdministrationAssets",
    component: AdministrationAssets,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/administration/tags",
    name: "AdministrationTags",
    component: AdministrationTags,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/administration/reports",
    name: "AdministrationReports",
    component: AdministrationReports,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/manage",
    name: "ManageList",
    component: ManageList,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "*",
    name: "Not Found",
    component: NotFound,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

import store from '../store';

router.beforeEach(async (to, from, next) => {
	var requiresAuth = to.meta.requiresAuth || false;

	if (!requiresAuth) {
		return next();
	}

	await store.dispatch('checkAuthentication');
	var isAuthenticated = store.getters.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    console.log("You aren't authenticatd, redirecting to sign-in");
    next("/sign-in");
    return;
  }

	return next();
});

export default router;
