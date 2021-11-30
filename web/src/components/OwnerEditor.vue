<template>
  <v-navigation-drawer v-model="drawer" temporary absolute right width="500px">
    <v-list-item>
      <v-list-item-avatar>
        <v-icon>mdi-account</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>{{ user.name }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-sheet class="mx-5 mt-5">
      <v-form v-model="isValid">
        <v-text-field
          dense
          outlined
          label="Mail code"
          v-model="user.mailcode"
          :rules="requiredRule"
        ></v-text-field>

        <v-text-field
          dense
          outlined
          label="Name"
          multiple
          v-model="user.name"
          :rules="requiredRule"
        ></v-text-field>

        <v-text-field
          dense
          outlined
          label="Department"
          required
          :items="['Active', 'Inactive']"
          v-model="user.department"
          :rules="requiredRule"
        ></v-text-field>

        <v-text-field
          dense
          outlined
          label="Division"
          :items="['Active', 'Inactive']"
          v-model="user.division"
        ></v-text-field>
        <v-text-field
          dense
          outlined
          label="Branch"
          :items="['Active', 'Inactive']"
          v-model="user.branch"
          hide-details
        ></v-text-field>

        <v-btn
          @click="remove"
          color="error"
          :disabled="!user.id"
          >Remove</v-btn
        >
        <v-btn
          @click="saveUser"
          color="primary"
          class="float-right"
          :disabled="!isValid"
          >Save</v-btn
        >

        <hr class="my-3" />

        <p>This unit owns <router-link :to="`/administration/assets?owner=${user.id}`">{{assetCount}} assets</router-link> 
        and <router-link :to="`/administration/transfers?owner=${user.id}`">{{transferCount}} transfers</router-link>.</p>
        <p>This unit is currently managed by:
        <ul>
          <li>Russell Wilson</li>
          <li>Tom Brady</li>
        </ul>
        </p>
      </v-form>
    </v-sheet>
  </v-navigation-drawer>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import store from "../store";
import { OWNER_URL } from "../urls";

export default {
  name: "UserEditor",
  computed: {
    mailcodeOptions: function () {
      return store.getters.mailcodeOptions;
    },
  },
  props: ["onSave"],
  data: () => ({
    search: null,
    isLoading: null,
    count: 0,

    drawer: null,
    user: {},
    requiredRule: [(v) => !!v || "This is required"],
    isValid: false,
    assetCount: 0,
    transferCount: 0,
  }),

  created() {
  },

  methods: {
    show(item) {
      this.user = _.clone(item);
      this.drawer = true;
      this.loadExtraInfo();
    },
    hide() {
      this.user = {};
      this.drawer = false;
    },
    loadExtraInfo() {
      axios.get(`${OWNER_URL}/${this.user.id}`).then((resp) => {
        this.assetCount = resp.data.data.asset_count;
        this.transferCount = resp.data.data.transfer_count;
      });
    },
    saveUser() {
      if (this.user.id) {
        axios
          .put(`${OWNER_URL}/${this.user.id}`, this.user)
          .then((resp) => {
            if (this.onSave) {
              this.onSave(resp);
            }
            this.hide();
          })
          .catch((error) => {
            console.log("ERROR: ", error);
          });
      } else {
        axios
          .post(`${OWNER_URL}`, this.user)
          .then((resp) => {
            if (this.onSave) {
              this.onSave(resp);
            }
            this.hide();
          })
          .catch((error) => {
            console.log("ERROR: ", error);
          });
      }
    },
    remove() {
      if (this.user.id) {
        axios
          .delete(`${OWNER_URL}/${this.user.id}`)
          .then((resp) => {
            if (this.onSave) {
              this.onSave(resp);
            }
            this.hide();
          })
          .catch((error) => {
            console.log("ERROR: ", error);
          });
      }
    },
  },
};
</script>
