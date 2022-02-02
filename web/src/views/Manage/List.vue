<template>
  <div class="hello">
    <h1>
      My assets <small v-if="manageNames">: {{ manageNames }}</small>
    </h1>

    <div v-if="!isManager">
      You currently aren't set with permissions to allow you to manage assets.
    </div>
    <div v-if="isManager">
      <v-card class="mt-5 default">
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="search"
                dense
                outlined
                background-color="white"
                label="Search"
                prepend-icon="mdi-magnify"
                @change="loadList(true)"
                hint="Enter a tag, make, model, serial or description and press Enter"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                dense
                outlined
                background-color="white"
                multiple
                label="Status"
                :items="statusOptions"
                v-model="statusFilter"
                clearable
                @change="loadList(true)"
              ></v-select>
            </v-col>
          </v-row>

          <v-data-table
            :items="items"
            :search="search"
            :options.sync="options"
            :server-items-length="itemCount"
            :loading="loading"
            :headers="[
              { text: 'Tag', value: 'tag' },
              { text: 'Status', value: 'status' },
              { text: 'Description', value: 'description' },
              { text: 'Make', value: 'make' },
              { text: 'Model', value: 'model' },
              { text: 'Owner', value: 'owner.name' },
            ]"
            @click:row="rowClick"
            class="row-clickable"
            :footer-props="{ 'items-per-page-options': [10, 30, 100] }"
          ></v-data-table>
        </v-card-text>
      </v-card>
    </div>

    
    <asset-editor ref="editor" :onSave="saveComplete"></asset-editor>
    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import store from "../../store";
import _ from "lodash";
import axios from "axios";
import { ASSET_URL } from "../../urls";

export default {
  name: "Login",
  computed: {
    manageCodes: () => {
      return store.state.profile.manage_mailcodes;
    },
    owners: () => {
      return store.state.mailcodeOptions;
    },
  },
  data: () => ({
    isManager: false,
    manageNames: "",
    toManage: [],
    items: [],
    options: {},
    search: "",
    statusFilter: ["Active"],
    itemCount: 0,
    loading: false,

    statusOptions: [
      "Active",
      "Recycled",
      "Redistribute",
      "CFS",
      "Sold",
      "To be sold",
      "Donation",
      "Retired",
      "Unknown",
    ],
  }),
  watch: {
    options: {
      handler() {
        this.loadList(false);
      },
      deep: true,
    },
  },
  async created() {
    await store.dispatch("checkAuthentication");
    await store.dispatch("profile/loadProfile");

    if (this.manageCodes && this.manageCodes.length > 0) {
      this.isManager = true;

      this.toManage = this.owners.filter(
        (o) => this.manageCodes.indexOf(o.mailcode) >= 0
      );

      this.manageNames = this.toManage.map((c) => c.mailcode).join(", ");
    }
  },
  methods: {
    loadList(resetPage) {
      this.loading = true;

      if (resetPage) this.options.page = 1;

      let body = _.clone(this.options);
      body.query = [];

      if (this.search.trim().length > 0) {
        body.query.push({
          fields: ["tag", "description", "make", "model", "serial"],
          operator: "contains",
          value: this.search,
        });
      }

      if (this.statusFilter.length > 0) {
        body.query.push({
          field: "status",
          operator: "in",
          value: this.statusFilter.join(","),
        });
      }

      body.query.push({
        field: "asset_owner_id",
        operator: "in",
        value: this.toManage.map((o) => o.id).join(","),
      });

      axios
        .post(ASSET_URL, body)
        .then((resp) => {
          this.items = resp.data.data;
          this.itemCount = resp.data.meta.item_count;
          this.loading = false;
        })
        .catch((error) => {
          console.log("ERROR", error);
          this.loading = false;
        });
    },
    rowClick(item) {
      this.$refs.editor.show(item);
    },
    saveComplete() {}
  },
};
</script>
