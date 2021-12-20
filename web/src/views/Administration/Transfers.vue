<template>
  <div class="home">
    <admin-sidebar></admin-sidebar>
    <h1>Administration: <small>Transfer</small></h1>

    <div class="row">
      <div class="col-md-12">
        <v-card class="mt-5 default">
          <v-card-text>
            <v-row>
              <v-col cols="10">
                <div class="row">
                  <div class="col-md-6">
                    <v-text-field
                      v-model="search"
                      dense
                      outlined
                      background-color="white"
                      label="Search"
                      prepend-icon="mdi-magnify"
                      @change="loadList(true)"
                      hide-details
                    ></v-text-field>
                  </div>
                  <div class="col-md-6">
                    <v-select
                      v-model="conditions"
                      dense
                      outlined
                      background-color="white"
                      label="Condition"
                      @change="loadList(true)"
                      :items="conditionOptions"
                      hide-details
                      multiple
                      clearable
                    ></v-select>
                  </div>

                  <div class="col-md-6">
                    <v-autocomplete
                      dense
                      outlined
                      background-color="white"
                      label="From"
                      v-model="fromOwners"
                      :items="ownerOptions"
                      item-text="display_name"
                      item-value="id"
                      multiple
                      clearable
                      @change="loadList(true)"
                    >
                    </v-autocomplete>
                  </div>
                  <div class="col-md-6">
                    <v-autocomplete
                      dense
                      outlined
                      background-color="white"
                      label="To"
                      v-model="toOwners"
                      :items="ownerOptions"
                      item-text="display_name"
                      item-value="id"
                      multiple
                      clearable
                      @change="loadList(true)"
                    >
                    </v-autocomplete>
                  </div>
                </div>
              </v-col>

              <v-col>
                <v-btn
                  color="primary"
                  small
                  class="mt-0"
                  style="width: 100%"
                  @click="addInbound"
                  ><v-icon class="mr-3">mdi-redo</v-icon>Inbound
                </v-btn>

                <v-btn
                  color="info"
                  small
                  class="mt-0"
                  style="width: 100%"
                  @click="addOutbound"
                  ><v-icon class="mr-3">mdi-undo</v-icon>Outbound
                </v-btn>

                <v-btn
                  color="warning"
                  small
                  class="my-0"
                  style="width: 100%"
                  @click="addDisposal"
                  ><v-icon class="mr-3">mdi-delete</v-icon>Disposal
                </v-btn>
              </v-col>
            </v-row>

            <v-data-table
              :items="items"
              :search="search"
              :options.sync="options"
              :server-items-length="itemCount"
              :loading="loading"
              :headers="[
                { text: 'Date', value: 'transfer_date' },
                { text: 'Tag', value: 'asset.tag' },
                { text: 'Description', value: 'description' },
                { text: 'From', value: 'from_owner.display_name' },
                { text: 'To', value: 'to_owner.display_name' },
                { text: 'Condition', value: 'condition' },
              ]"
              :footer-props="{ 'items-per-page-options': [10, 30, 100] }"
            ></v-data-table
            ><!--
              @click:row="rowClick"
              class="row-clickable1"-->
          </v-card-text>
        </v-card>
      </div>
    </div>

    <notifications ref="notifier"></notifications>
    <transfer-editor ref="transferEditor" :onSave="loadList"></transfer-editor>
  </div>
</template>

<script>
import axios from "axios";
import { TRANSFER_URL, OWNER_URL } from "../../urls";
import _ from "lodash";

export default {
  name: "Home",
  data: () => ({
    conditionOptions: [
      "Active",
      "Redistribute",
      "Recycle",
      "Sold",
      "CFS",
      "Donation",
      "Destruction",
      "Unknown",
    ],
    search: "",
    loading: false,
    itemCount: 0,
    items: [],
    options: {},
    conditions: [],
    ownerOptions: [],
    fromOwners: [],
    toOwners: [],
  }),
  created() {
    this.loadOwners();

    let fp = this.$route.query.owner;

    if (fp && fp.length > 0) {
      console.log("PF", fp);
      this.fromOwners.push(parseInt(fp));
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

      if (this.search.trim().length > 0)
        body.query.push({
          fields: ["asset_item.tag", "asset_category.description", "asset_transfer.description"],
          operator: "contains",
          value: this.search,
        });

      if (this.fromOwners.length > 0) {
        body.query.push({
          field: "from_owner_id",
          operator: "in",
          value: this.fromOwners.join(","),
        });
      }

      if (this.toOwners.length > 0) {
        body.query.push({
          field: "to_owner_id",
          operator: "in",
          value: this.toOwners.join(","),
        });
      }

      if (this.conditions.length > 0) {
        body.query.push({
          field: "asset_transfer.condition",
          operator: "in",
          value: this.conditions.join(","),
        });
      }

      axios
        .post(TRANSFER_URL, body)
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

    saveComplete(resp) {
      this.$refs.notifier.showAPIMessages(resp.data);
      this.loadList(false);
    },

    rowClick(item) {
      if (item.asset_item_id) {
        console.log("Asset");
      } else if (item.asset_category_id) {
        item.rows = [
          {
            type: item.asset_category_id,
            quantity: item.quantity,
            condition: item.condition,
          },
        ];
      }

      this.$refs.transferEditor.show(item);
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

    addInbound() {
      this.$refs.transferEditor.showInbound({
        to_owner_id: 80,
        rows: [
          {
            quantity: 1,
            type: 1,
            condition: "Redistribute",
            icon: "mdi-inbox-multiple",
          },
        ],
      });
    },
    addOutbound() {
      this.$refs.transferEditor.showOutbound({
        from_owner_id: 80,
        rows: [
          {
            quantity: 1,
            type: 1,
            condition: "Active",
            icon: "mdi-inbox-multiple",
          },
        ],
      });
    },
    addDisposal() {
      this.$refs.transferEditor.showDisposal({
        to_owner_id: 80,
        rows: [
          {
            quantity: 1,
            type: 1,
            condition: "Recycle",
            icon: "mdi-inbox-multiple",
          },
        ],
      });
    },
  },
};
</script>
