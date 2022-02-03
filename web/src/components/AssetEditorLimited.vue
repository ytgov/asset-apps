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

      <v-row>
        <v-col cols="3"
          ><v-btn @click="save" color="primary" class="float-left"
            >Save</v-btn
          ></v-col
        >
        <v-col cols="9"
          ><v-card class="default">
            <v-card-text>
              <h4 class="mt-0 mb-2">Request transfer or disposal of this asset</h4>
              <v-row>
                <v-col cols="7">
                  <v-select
                    :items="['Good', 'Obsolete', 'Beyond repair']"
                    v-model="disposeCondition"
                    label="Condition"
                    dense
                    outlined
                    background-color="white"
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="5">
                  <v-btn
                    @click="transfer"
                    color="warning"
                    class="my-0 float-right"
                  >
                    Request
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-sheet>
  </v-navigation-drawer>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import store from "../store";
import { OWNER_URL, ASSET_URL } from "../urls";
import { formatDollar } from "../utils/formatters";

export default {
  computed: {
    mailcodeOptions: function () {
      return store.getters.mailcodeOptions;
    },
    manageCodes: () => {
      return store.state.profile.manage_mailcodes;
    },
  },
  props: ["onSave"],
  data: () => ({
    ASSET_WAREHOUSE_ID: 80,
    disposalOptions: ["Recycle", "Sale", "To be sold", "CFS", "Donation"],
    ownerOptions: [],
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

    drawer: null,
    item: {},

    hasTag: false,
    action: "Inbound",

    oldOwner: -1,
    oldStatus: -1,
    disposeCondition: "Good",
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
      this.item.purchase_price = formatDollar(this.item.purchase_price);
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
          let rawList = resp.data.data;
          this.ownerOptions = rawList.filter(
            (o) => this.manageCodes.indexOf(o.mailcode) >= 0
          );
          this.is_loading = false;
        })
        .catch((error) => {
          console.log("ERROR", error);
          this.is_loading = false;
        });
    },
    save() {
      axios
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
    transfer() {
      console.log("disposeCondition", this.disposeCondition);

      let body = _.clone(this.item);
      body.condition = this.disposeCondition;

      axios
        .put(`${ASSET_URL}/${this.item.id}/limited/transfer`, body)
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
