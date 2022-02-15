<template>
  <v-navigation-drawer v-model="drawer" temporary absolute right width="700px">
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
      <div class="row">
        <div class="col-sm-6">
          <v-autocomplete
            dense
            outlined
            label="To"
            :items="ownerOptions"
            item-text="display_name"
            item-value="id"
            v-model="item.to_owner_id"
            persistent-hint
            hint="(Mailcode) Name"
          ></v-autocomplete>
        </div>
        <div class="col-sm-6">
          <v-autocomplete
            dense
            outlined
            label="From"
            :items="ownerOptions"
            item-text="display_name"
            item-value="id"
            v-model="item.from_owner_id"
            persistent-hint
            hint="(Mailcode) Name"
          ></v-autocomplete>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 mt-0 pt-0">
          <v-divider></v-divider>
        </div>
        <div class="col-sm-6">
          <v-text-field
            dense
            outlined
            label="Description"
            hide-details
            v-model="item.description"
          ></v-text-field>
        </div>

        <div class="col-sm-6">
          <v-text-field
            dense
            outlined
            label="Departmental tag"
            hide-details
            v-model="item.asset_item.tag"
          ></v-text-field>
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
        <div class="col-sm-7">
          <v-select
            dense
            outlined
            label="Condition"
            hide-details
            v-model="item.condition"
            :items="assetConditionOptions"
          ></v-select>
        </div>
      </div>

      <div class="row">
        <pre>{{ item }}</pre>
      </div>

      <v-btn @click="remove" color="error" :disabled="!item.id">Remove</v-btn>
      <v-btn
        @click="save"
        color="primary"
        class="float-right"
        :disabled="!isValid"
        >Save</v-btn
      >
    </v-sheet>
  </v-navigation-drawer>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import { mapGetters } from "vuex";

import { OWNER_URL, TRANSFER_URL } from "../../urls";

export default {
  computed: {
    ...mapGetters([
      "assetTypeOptions",
      "assetConditionOptions",
      "mailcodeOptions",
    ]),
    transferDirectionIcon: function () {
      if (this.transferDirection) return "mdi-redo";
      return "mdi-undo";
    },
    transferDirectionName: function () {
      if (this.transferDirection) return "Inbound transfer";
      return "Outbound transfer";
    },
    isValid: function () {
      return true;
    },
  },
  props: ["onSave"],
  data: () => ({
    disposalOptions: ["Recycle", "Sold", "CFS", "Donation", "Destruction"],
    ownerOptions: [],
    drawer: null,
    item: { asset_item: {} },
  }),
  created() {
    this.loadList();
  },
  methods: {
    show(item) {
      this.item = { asset_item: {}, ..._.cloneDeep(item) };
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
      let body = _.clone(this.item);
      axios
        .put(`${TRANSFER_URL}/${this.item.id}`, body)
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
    remove() {
      axios
        .delete(`${TRANSFER_URL}/${this.item.id}`)
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
