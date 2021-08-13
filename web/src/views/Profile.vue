<template>
  <div>
    <h1>My Profile</h1>
    <p>** This information is all read-only</p>

    <div class="row">
      <div class="col-md-6 mb-3">
        <v-text-field
          v-model="firstName"
          dense
          outlined
          label="First name"
          readonly
          hide-details
        ></v-text-field>
      </div>
      <div class="col-md-6 mb-3">
        <v-text-field
          v-model="lastName"
          dense
          outlined
          label="Last name"
          readonly
          hide-details
        ></v-text-field>
      </div>

      <div class="col-md-6 mb-3">
        <v-text-field
          v-model="email"
          dense
          outlined
          label="Email"
          readonly
          hide-details
        ></v-text-field>
      </div>
      <div class="col-md-6 mb-3">
        <mailcode-select
          :model="mailcode"
          :change="mailcodeChange"
        ></mailcode-select>
      </div>
    </div>
    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import { mapState } from "vuex";
import store from "../store";
import axios from "axios";
import { USER_URL } from "../urls";

export default {
  name: "Profile",
  computed: {
    ...mapState("profile", [
      "firstName",
      "lastName",
      "username",
      "email",
      "teams",
      "mailcode",
    ]),
  },
  data: () => ({}),
  async created() {
    await store.dispatch("profile/loadProfile");
    console.log("current = ", this.mailcode)
  },
  methods: {
    mailcodeChange(newValue) {
      axios
        .put(`${USER_URL}/${this.email}/mailcode`, {
          mailcode: newValue,
        })
        .then((resp) => {
          this.$refs.notifier.showAPIMessages(resp.data);
          store.dispatch("profile/loadProfile");
        })
        .catch();
    },
  },
};
</script>
