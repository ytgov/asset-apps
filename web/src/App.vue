<template>
  <v-app>
    <v-navigation-drawer
      v-bind:app="hasSidebar"
      permanent
      :expand-on-hover="hasSidebarClosable"
      clipped
      color="#f1f1f1"
      v-bind:class="{ 'd-none': !hasSidebar }"
    >
      <v-list dense nav style="" class="mt-4">
        <!-- <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          background-color="#fff"
          label="Search"
          outlined
          dense
          hint="Press enter to search"
        ></v-text-field>
        <v-divider class="mt-0 mb-2"></v-divider> -->
        <v-list-item
          link
          nav
          v-bind:title="section.name"
          v-bind:to="section.url"
          v-for="section in sections"
          v-bind:key="section.name"
        >
          <v-list-item-icon>
            <v-icon>{{ section.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ section.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="#fff"
      flat
      height="70"
      style="left: 0; border-bottom: 3px #f3b228 solid"
    >
      <!-- <v-icon color="#f3b228" class="mr-5">{{ applicationIcon }}</v-icon> -->
      <img src="/yukon.svg" style="margin: -8px 85px 0 0" height="44" />
      <v-toolbar-title>
        <span style="font-weight: 700">{{ applicationName }}</span>

        <v-progress-circular
          :class="loadingClass"
          indeterminate
          color="#f3b228"
          size="20"
          width="2"
          class="ml-4"
        ></v-progress-circular>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <div v-if="isAuthenticated">
        <v-btn color="primary" text class="mr-1" to="/dashboard"
          ><v-icon>mdi-home</v-icon></v-btn
        >
        <v-btn
          color="primary"
          text
          class="mr-1 d-none d-md-inline-flex"
          to="/my-scans"
          >My Scans</v-btn
        >
        <!-- <v-btn color="primary" text class="mr-1" to="/reports">Reports</v-btn> -->

        <!-- <v-menu offset-y class="ml-0">
          <template v-slot:activator="{ on, attrs }">
            <v-btn text color="primary" v-bind="attrs" v-on="on">
              Programs <v-icon>mdi-menu-down</v-icon>
            </v-btn>
          </template>

          <v-list dense style="min-width: 200px">
            <v-list-item to="/program-1">
              <v-list-item-title>Program 1</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu> -->
        <v-divider class="mr-5 d-none d-md-inline" vertical inset></v-divider>

        <span class="d-none d-md-inline">{{ fullName }}</span>

        <v-menu offset-y class="ml-0">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon color="primary" v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list dense style="min-width: 200px">
            <v-list-item class="d-md-none">
              <v-list-item-title>{{ fullName }}</v-list-item-title>
            </v-list-item>

            <v-list-item to="/my-scans" class="d-md-none">
              <v-list-item-icon>
                <v-icon>mdi-camera</v-icon>
              </v-list-item-icon>
              <v-list-item-title>My scans</v-list-item-title>
            </v-list-item>

            <v-list-item to="/profile">
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-title>My profile</v-list-item-title>
            </v-list-item>
            
            <v-list-item to="/my-requested-tags">
              <v-list-item-icon>
                <v-icon>mdi-tag-multiple</v-icon>
              </v-list-item-icon>
              <v-list-item-title>My requested tags</v-list-item-title>
            </v-list-item>

            <v-list-item to="/administration" v-if="showAdmin">
              <v-list-item-icon>
                <v-icon>mdi-cogs</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Administration</v-list-item-title>
            </v-list-item>
            <v-list-item to="/manage" v-if="showManage">
              <v-list-item-icon>
                <v-icon>mdi-dolly</v-icon>
              </v-list-item-icon>
              <v-list-item-title>My assets</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="signOut">
              <v-list-item-icon>
                <v-icon>mdi-exit-run</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Sign out</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <div v-else>
        <router-link to="/sign-in">Sign in</router-link>
      </div>

      <!-- <v-app-bar-nav-icon @click.stop="drawerRight = !drawerRight"></v-app-bar-nav-icon> -->
    </v-app-bar>

    <v-main v-bind:style="{ 'padding-left: 33px !important': !hasSidebar }">
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <v-row>
          <v-col>
            <router-view></router-view>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import router from "./router";
import * as config from "./config";
import { LOGOUT_URL } from "./urls";

export default {
  name: "App",
  computed: {
    ...mapGetters(["isAuthenticated"]),
    ...mapGetters("profile", [
      "fullName",
      "manage_mailcodes",
      "roles",
      "firstName",
    ]),
    showManage() {
      return this.manage_mailcodes.length > 0;
    },
    showAdmin() {
      return this.roles.indexOf("Admin") >= 0;
    },
  },
  data: () => ({
    dialog: false,
    drawer: null,
    drawerRight: null,
    headerShow: false,
    menuShow: false,
    loadingClass: "d-none",
    applicationName: config.applicationName,
    applicationIcon: config.applicationIcon,
    sections: [],
    hasSidebar: false, //config.hasSidebar,
    hasSidebarClosable: config.hasSidebarClosable,
    search: "",
  }),
  created() {
    this.checkAuthentication();
  },
  watch: {
    $route(to) {
      let meta = to.meta || {};

      if (meta.children) {
        this.sections = meta.children;
        this.hasSidebar = true;
      } else {
        this.sections = [];
        this.hasSidebar = false;
      }
    },
    isAuthenticated(value) {
      if (value) {
        this.initialize().then(() => {
          this.loadProfile();
        });
      }
    },
  },
  methods: {
    ...mapActions(["initialize", "checkAuthentication"]),
    ...mapActions("profile", ["loadProfile"]),
    nav: function (location) {
      router.push(location);
      console.log(location);
    },
    toggleHeader: function () {
      this.headerShow = !this.headerShow;
    },
    toggleMenu: function () {
      this.menuShow = !this.menuShow;
    },
    signOut: function () {
      window.location = LOGOUT_URL;
    },
  },
};
</script>
