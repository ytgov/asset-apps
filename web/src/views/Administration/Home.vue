<template>
  <div class="home">
    <admin-sidebar></admin-sidebar>
    <h1>Administration: <small>Home</small></h1>

    <div class="row">
      <div class="col-md-12">
        <v-card class="mt-5 default">
          <v-card-text> </v-card-text>
        </v-card>
      </div>
    </div>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
/* import axios from "axios";
import { USER_URL } from "../../urls"; */
export default {
  name: "Home",
  data: () => ({}),
  created() {},
  methods: {},
};
</script>
