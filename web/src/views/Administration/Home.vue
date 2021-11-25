<template>
  <div class="home">
    <h1>Administration Home</h1>

    <div class="row">
      <div class="col-md-9">
        <h2>Users</h2>
        <v-card class="mt-5 default">
          <v-card-text>
            <v-text-field
              v-model="search"
              dense
              outlined
              background-color="white"
              label="Search"
              prepend-icon="mdi-magnify"
            ></v-text-field>

            <v-data-table
              :items="users"
              :search="search"
              :headers="[
                { text: 'Name', value: 'display_name' },
                { text: 'Email', value: 'email' },
                { text: 'Roles', value: 'roles' },
                { text: 'Mail Code', value: 'mailcode' },
                { text: 'Mail Code', value: 'manage_mailcodes' },
              ]"
              @click:row="rowClick"
              class="row-clickable"
            ></v-data-table>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-3">Testing</div>
    </div>

    <user-editor ref="userEditor" :onSave="saveComplete"></user-editor>
    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import axios from "axios";
import { USER_URL } from "../../urls";
export default {
  name: "Home",
  data: () => ({
    search: "",
    is_loading: false,
    users: [],
    editUser: null,
  }),
  created() {
    this.loadUserList();
  },
  methods: {
    loadUserList() {
      this.is_loading = true;
      axios
        .get(USER_URL)
        .then((resp) => {
          this.users = resp.data.data;
          this.is_loading = false;
        })
        .catch((error) => {
          console.log("ERROR", error);
          this.is_loading = false;
        });
    },

    saveComplete(resp) {
      this.$refs.notifier.showAPIMessages(resp.data);
      this.loadUserList();
    },

    rowClick(item) {
      this.$refs.userEditor.show(item);
    },
  },
};
</script>
