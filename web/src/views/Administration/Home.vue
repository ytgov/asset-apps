<template>
  <div class="home">
    <admin-sidebar></admin-sidebar>
    <h1>Administration: <small>Home</small></h1>

    <div class="row">
      <div class="col-md-4">
        <v-card class="mt-5 default">
          <v-card-title>Pending Transfers</v-card-title>
          <v-card-text>
          
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-4">
        <v-card class="mt-5 default">
          <v-card-title>Pending Tag Requests</v-card-title>
          <v-card-text>
          
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-4">
        <v-card class="mt-5 default">
          <v-card-title>Assets to Redistribute</v-card-title>
          <v-card-text>
            
          
          </v-card-text>
        </v-card>
      </div>
    </div>

    <asset-editor ref="editor"></asset-editor>
    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import axios from "axios";
import { ASSET_URL, OWNER_URL } from "../../urls";
import _ from "lodash";
import store from "../../store";

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
      "Unknown",
    ],

    search: "",
    statusFilter: ["Active"],
    loading: false,
    itemCount: 0,
    items: [],
    options: {},
    ownerOptions: [],
    mailcodes: [],
  }),
  created() {
    //this.loadList();
    this.loadOwners()
  },
  computed: {
    mailcodeOptions: function () {
      return store.getters.mailcodeOptions;
    },
  },
  watch: {
    options: {
      handler() {
        this.loadList();
      },
      deep: true,
    },
  },
  methods: {
    loadList() {
      this.loading = true;
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

      if (this.mailcodes.length > 0) {
        body.query.push({
          field: "asset_owner_id",
          operator: "in",
          value: this.mailcodes.join(","),
        });
      }

      axios
        .post(`${ASSET_URL}/query`, body)
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
      this.loadList();
    },

    rowClick(item) {
      this.$refs.editor.show(item);
    },

    mailcodeChange(newValue) {
      console.log("MC SET", newValue);
    },
  },
};
</script>
