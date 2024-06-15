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
            readonly
            append-icon="mdi-lock"
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
            readonly
            append-icon="mdi-lock"
            rows="3"
            label="Owner"
            :items="mailcodeOptions"
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
            v-currency
          ></v-text-field
        ></v-col>
        <v-col cols="6">
          <v-text-field
            dense
            outlined
            v-model="item.purchase_person"
            label="Purchaser"
            hide-details
            readonly
            append-icon="mdi-lock"
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
            readonly
            append-icon="mdi-lock"
          ></v-select>
        </v-col>
      </v-row>

      <v-btn @click="save" color="primary" class="float-right">Save</v-btn>
    </v-sheet>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters } from "vuex";
import { cloneDeep } from "lodash";

import http from "@/utils/http-client";
import { ASSET_URL } from "../urls";
import { formatDollar } from "../utils/formatters";

export default {
  name: "AssetEditorSuperLimited",
  computed: {
    ...mapGetters(["mailcodeOptions"]),
  },
  props: ["onSave"],
  data: () => ({
    disposalOptions: ["Recycled", "Sale", "To be sold", "CFS", "Donation"],
    ownerOptions: [],
    statusOptions: [
      "Active",
      "Recycled",
      "CFS",
      "Sold",
      "To be sold",
      "Donation",
      "Retired",
      "Unknown",
    ],

    drawer: null,
    item: {},

    hasTag: false,
    action: "Inbound",

    oldOwner: -1,
    oldStatus: -1,
    disposeCondition: "Good",
  }),
  methods: {
    show(newItem) {
      this.item = cloneDeep(newItem);

      this.hasTag = this.item.asset_item_id;
      this.oldOwner = this.item.asset_owner_id;
      this.oldStatus = this.item.status;
      this.item.purchase_price = formatDollar(this.item.purchase_price);
      this.drawer = true;
    },
    hide() {
      this.item = {};
      this.drawer = false;
    },
    save() {
      http
        .put(`${ASSET_URL}/${this.item.id}/limited`, this.item)
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
