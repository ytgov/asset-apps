<template>
  <div class="home">
    <admin-sidebar></admin-sidebar>
    <h1>Administration: <small>Home</small></h1>

    <div class="row">
      <div class="col-md-12">
        <v-card class="mt-5 default">
          <v-card-text>
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

            <v-row>
              <v-col>
                <v-autocomplete
                  dense
                  outlined
                  background-color="white"
                  label="Owner"
                  v-model="owners"
                  :items="ownerOptions"
                  item-text="display_name"
                  item-value="id"
                  multiple
                  clearable
                  @change="loadList(true)"
                >
                </v-autocomplete>
              </v-col>
              <v-col>
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
              <v-col></v-col>
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
    </div>

    <asset-editor ref="editor" :onSave="saveComplete"></asset-editor>
    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import axios from "axios";
import { ASSET_URL, OWNER_URL } from "../../urls";
import _ from "lodash";

export default {
  name: "Home",
  data: () => ({
    statusOptions: [
      "Active",
      "Recycled",
      "Redistribute",
      "CFS",
      "Sold",
      "To be sold",
      "Retired",
      "Unknown",
    ],

    search: "",
    statusFilter: ["Active"],
    loading: false,
    itemCount: 0,
    items: [],
    options: {},
    ownerOptions: [],
    owners: [],
  }),
  created() {
    this.loadOwners();

    let ownerParam = this.$route.query.owner;

    if (ownerParam && ownerParam.length > 0) {
      this.owners = [parseInt(ownerParam)];
    }
  },
  computed: {},
  watch: {
    options: {
      handler() {
        this.loadList(false);
      },
      deep: true,
    },
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

      if (this.owners.length > 0) {
        body.query.push({
          field: "asset_owner_id",
          operator: "in",
          value: this.owners.join(","),
        });
      }

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

    loadOwners() {
      axios
        .get(OWNER_URL)
        .then((resp) => {
          this.ownerOptions = resp.data.data;
        })
        .catch((error) => {
          console.log("ERROR", error);
        });
    },

    saveComplete(resp) {
      this.$refs.notifier.showAPIMessages(resp.data);
      this.loadList(false);
    },

    rowClick(item) {
      this.$refs.editor.show(item);
    },
  },
};
</script>
