<template>
  <v-navigation-drawer v-model="drawer" temporary absolute right width="600px">
    <v-list-item>
      <v-list-item-avatar>
        <v-icon>mdi-dolly</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>Asset</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-sheet class="mx-5 mt-5">
      <v-row>
        <v-col cols="6">
          <v-text-field
            dense
            outlined
            label="Tag"
            v-model="item.tag"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            dense
            outlined
            label="Departmental tag"
            v-model="item.dept_tag"
            hide-details
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-autocomplete
            dense
            outlined
            v-model="item.asset_owner_id"
            rows="3"
            label="Owner"
            :items="ownerOptions"
            item-text="display_name"
            item-value="id"
            hide-details
          ></v-autocomplete>
        </v-col>
        <v-col cols="12">
          <v-textarea
            dense
            outlined
            v-model="item.description"
            rows="3"
            label="Description"
            hide-details
          ></v-textarea>
        </v-col>
        <v-col cols="6">
          <v-text-field
            dense
            outlined
            v-model="item.make"
            label="Make"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            dense
            outlined
            v-model="item.model"
            label="Model"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field
            dense
            outlined
            v-model="item.serial"
            label="Serial number"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            dense
            outlined
            v-model="item.purchase_date"
            label="Purchase date"
            hide-details
          ></v-text-field
        ></v-col>
        <v-col cols="6">
          <v-text-field
            dense
            outlined
            v-model="item.purchase_price"
            label="Purchase price"
            hide-details
          ></v-text-field
        ></v-col>
        <v-col cols="6">
          <v-text-field
            dense
            outlined
            v-model="item.purchase_person"
            label="Purchaser"
            hide-details
          ></v-text-field
        ></v-col>
        <v-col cols="6">
          <v-text-field
            dense
            outlined
            v-model="item.purchase_order_number"
            label="Purchase order"
            hide-details
          ></v-text-field
        ></v-col>
        <v-col cols="6">
          <v-text-field
            dense
            outlined
            v-model="item.purchase_order_line"
            label="Purchase order line"
            hide-details
          ></v-text-field
        ></v-col>

        <v-col cols="6">
          <v-select
            dense
            outlined
            v-model="item.status"
            :items="statusOptions"
            label="Status"
            hide-details
          ></v-select>
        </v-col>
      </v-row>

      <v-btn @click="save" color="primary" class="float-left">Save</v-btn>
      <v-btn @click="save" color="warning" class="float-right ml-3"
        >Dispose</v-btn
      >
      <v-btn @click="save" color="secondary" class="float-right"
        >Transfer</v-btn
      >
    </v-sheet>
  </v-navigation-drawer>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import store from "../store";
import { OWNER_URL, USER_URL } from "../urls";

export default {
  computed: {
    mailcodeOptions: function () {
      return store.getters.mailcodeOptions;
    },
    transferDirectionIcon: function () {
      if (this.transferDirection) return "mdi-redo";
      return "mdi-undo";
    },
    transferDirectionName: function () {
      if (this.transferDirection) return "Inbound transfer";
      return "Outbound transfer";
    },
  },
  props: ["onSave"],
  data: () => ({
    disposalOptions: ["Recycle", "Sale", "To be sold", "CFS"],
    ownerOptions: [],
    statusOptions: [
      "Active",
      "Recycled",
      "Redistribute",
      "CFS",
      "Sold",
      "To be sold",
      "Unknown",
    ],

    drawer: null,
    item: {},

    hasTag: false,
    action: "Inbound",

    oldOwner: -1,
    oldStatus: -1,

  }),
  created() {
    this.loadList();
  },
  methods: {
    show(item) {
      this.item = _.clone(item);
      this.hasTag = this.item.asset_item_id;
      this.oldOwner = this.item.asset_owner_id;
      this.oldStatus = this.item.status;
      this.drawer = true;
    },
    showInbound(item) {
      this.item = _.clone(item);
      this.action = "Inbound";
      this.hasTag = this.item.asset_item_id;
      this.drawer = true;
    },
    showOutbound(item) {
      this.item = _.clone(item);
      this.action = "Outbound";
      this.hasTag = this.item.asset_item_id;
      this.drawer = true;
    },
    showDisposal(item) {
      this.item = _.clone(item);
      this.action = "Disposal";

      this.hasTag = this.item.asset_item_id;
      this.drawer = true;
    },
    hide() {
      this.item = {};
      this.drawer = false;
    },
    loadList() {
      this.is_loading = true;
      axios
        .get(OWNER_URL)
        .then((resp) => {
          this.ownerOptions = resp.data.data;
          this.is_loading = false;
        })
        .catch((error) => {
          console.log("ERROR", error);
          this.is_loading = false;
        });
    },
    save() {
      axios
        .put(`${USER_URL}/${this.item.id}`, this.item)
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