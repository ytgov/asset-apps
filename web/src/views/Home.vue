<template>
  <div class="home">
    <h1>{{ title }}</h1>
    <hr />
    <h3 class="mt-5">
      This application is only available to those who have been previously
      authorized .
    </h3>
    <p>
      To Sign in
      <router-link to="/sign-in">sign in</router-link> to see more things.
    </p>
  </div>
</template>

<script>
import * as config from "../config";
//import router from "../router";
import store from "../store";

export default {
  name: "Home",
  data: () => ({
    title: `Welcome to ${config.applicationName}`,
  }),
  async created() {
    await store.dispatch("checkAuthentication");
    //var isAuth = store.getters.isAuthenticated;

    //if (isAuth) router.push("/dashboard");
    //else router.push("/sign-in");
  },
  methods: {},
};
</script>
