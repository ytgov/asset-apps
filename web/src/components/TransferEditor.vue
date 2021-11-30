<template>
  <v-navigation-drawer v-model="drawer" temporary absolute right width="500px">
    <v-list-item>
      <v-list-item-avatar>
        <v-icon>mdi-swap-horizontal-bold</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>Transfer</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-sheet class="mx-5 mt-5">
      <v-row class="mb-3">
        <v-col>
          <v-switch label="Item has tag" v-model="hasTag"></v-switch>
        </v-col>
        <v-col>
          <v-select
            label="Action"
            :items="['Inbound', 'Outbound', 'Disposal']"
            v-model="action"
            outlined
            dense
          >
          </v-select>
        </v-col>
      </v-row>

      <v-text-field
        v-if="hasTag"
        dense
        outlined
        label="Tag"
        v-model="item.asset.tag"
      ></v-text-field>

      <v-autocomplete
        v-if="action != 'Outbound'"
        dense
        outlined
        label="From"
        :items="ownerOptions"
        item-text="display_name"
        item-value="id"
        v-model="item.from_owner_id"
        persistent-hint
        hint="(Mailcode) Name"
        class="mb-2"
      ></v-autocomplete>
      <v-autocomplete
        v-if="action == 'Outbound'"
        dense
        outlined
        label="To"
        :items="ownerOptions"
        item-text="display_name"
        item-value="id"
        v-model="item.to_owner_id"
        persistent-hint
        hint="(Mailcode) Name"
        class="mb-2"
      ></v-autocomplete>

      <v-autocomplete
        v-if="action == 'Disposal'"
        dense
        outlined
        label="Disposal type"
        :items="disposalOptions"
        v-model="item.to_owner_id"
      ></v-autocomplete>

      <div class="row" v-if="!hasTag">
        <div class="col-sm-6">
          <v-select
            dense
            outlined
            :items="['Desk', 'Chair']"
            label="Type of item"
            hide-details
            v-model="item.type"
          ></v-select>
        </div>
        <div class="col-sm-3">
          <v-text-field
            dense
            outlined
            label="Quantity"
            type="number"
            hide-details
            v-model="item.quantity"
            min="1"
          ></v-text-field>
        </div>
        <div class="col-sm-3">
          <v-select
            dense
            outlined
            label="Condition"
            hide-details
            v-model="item.condition"
            :items="conditionOptions"
          ></v-select>
        </div>
      </div>

      <v-btn @click="save" color="primary" class="float-right">Save</v-btn>
      <v-btn @click="save" color="primary" class="float-right"
        >Save and new</v-btn
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

    drawer: null,
    item: {},

    hasTag: false,
    action: "Inbound",
  }),
  created() {
    this.loadList();
  },
  methods: {
    show(item) {
      this.item = _.clone(item);
      this.hasTag = this.item.asset_item_id;
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
