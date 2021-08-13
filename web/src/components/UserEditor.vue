<template>
  <v-navigation-drawer v-model="drawer" temporary absolute right width="500px">
    <v-list-item>
      <v-list-item-avatar>
        <v-icon>mdi-account</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title
          >{{ user.display_name }}
          <!-- <v-btn color="primary" x-small class="float-right" fab @click="hide"
            ><v-icon>mdi-close</v-icon></v-btn
          > --></v-list-item-title
        >
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-sheet class="mx-5 mt-5">
      <v-select
        dense
        outlined
        label="Roles"
        multiple
        :items="roleOptions"
        v-model="user.roles"
      ></v-select>

      <v-select
        dense
        outlined
        label="Status"
        :items="['Active', 'Inactive']"
        v-model="user.status"
      ></v-select>

      <v-btn @click="saveUser" color="primary" class="float-right"
        >Save</v-btn
      ></v-sheet
    >
  </v-navigation-drawer>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import { USER_URL } from "../urls";

export default {
  name: "UserEditor",
  computed: {},
  props: ["onSave"],
  data: () => ({
    roleOptions: ["Admin", "Warehouse"],
    search: null,
    isLoading: null,
    count: 0,

    drawer: null,
    user: {},
  }),

  watch: {
    search() {
      // Items have already been loaded
      //if (this.items.length > 0) return;

      // Items have already been requested
      if (this.isLoading) return;

      // Lazily load input items
      //this.items = this.orgLevels.filter((o) => o.name.indexOf(val) >= 0);
    },
  },

  created() {},
  methods: {
    show(item) {
      this.user = _.clone(item);
      this.drawer = true;
    },
    hide() {
      this.user = {};
      this.drawer = false;
    },
    saveUser() {
      axios
        .put(`${USER_URL}/${this.user.email}`, this.user)
        .then((resp) => {
          if (this.onSave) {
            this.onSave(resp);
          }
          this.hide();
        })
        .catch((error) => {
          console.log("ERROR: ", error);
        });
    },
  },
};
</script>
