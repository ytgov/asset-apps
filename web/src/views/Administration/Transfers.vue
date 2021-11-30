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
                <v-text-field
                  v-model="search"
                  dense
                  outlined
                  background-color="white"
                  label="Search"
                  prepend-icon="mdi-magnify"
                ></v-text-field>
                <v-autocomplete
                  dense
                  outlined
                  background-color="white"
                  label="Mail code(s) to manage"
                  v-model="mailcodes"
                  :items="mailcodeOptions"
                  item-text="display_name"
                  item-value="mailcode"
                  multiple
                  clearable
                  @change="loadList"
                >
                </v-autocomplete>
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
                { text: 'Tag', value: 'asset.tag' },
                { text: 'From', value: 'from_owner.mailcode' },
                { text: 'To', value: 'to_owner.mailcode' },
                {text: 'Date', value: 'transfer_date'},
              ]"
              @click:row="rowClick"
              class="row-clickable"
              :footer-props="{ 'items-per-page-options': [10, 30, 100] }"
            ></v-data-table>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <notifications ref="notifier"></notifications>
    <transfer-editor ref="transferEditor"></transfer-editor>
  </div>
</template>

<script>
import axios from "axios";
import { TRANSFER_URL } from "../../urls";
import _ from "lodash";
import store from "../../store";

export default {
  name: "Home",
  data: () => ({
    search: "",
    loading: false,
    itemCount: 0,
    items: [],
    options: {},
    ownerOptions: [],
    mailcodes: [],
  }),
  created() {
    //this.loadList();
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
      body.query = [
        { field: "name", operator: "contains", value: this.search },
        { field: "locationDesc", operator: "contains", value: this.search },
      ];

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
      this.loadList();
    },

    rowClick(item) {
      this.$refs.transferEditor.show(item);
    },

    mailcodeChange(newValue) {
      console.log("MC SET", newValue);
    },

    addInbound() {
      this.$refs.transferEditor.showInbound({ asset: {} });
    },
    addOutbound() {
      this.$refs.transferEditor.showOutbound({ asset: {} });
    },
    addDisposal() {
      this.$refs.transferEditor.showDisposal({ asset: {} });
    },
  },
};
</script>
