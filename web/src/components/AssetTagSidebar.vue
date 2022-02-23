<template>
  <v-navigation-drawer v-model="drawer" temporary absolute right width="500px">
    <v-list-item style="background-color: #d8d8d8">
      <v-list-item-avatar>
        <v-icon>mdi-currency-usd</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title
          >Asset details : <strong>{{ asset.value }}</strong></v-list-item-title
        >
      </v-list-item-content>
    </v-list-item>

    <v-sheet class="mx-5 mt-5">
      <div class="row">
        <div class="col-md-12">
          <v-select
            outlined
            dense
            hide-details
            v-model="asset.category"
            :items="['Unknown', 'Desk', 'Chair']"
            label="Asset category"
          ></v-select>
        </div>
        <div class="col-md-6">
          <v-text-field
            outlined
            dense
            v-model="asset.make"
            hide-details
            label="Make / Manufacturer"
          ></v-text-field>
        </div>
        <div class="col-md-6">
          <v-text-field
            outlined
            dense
            v-model="asset.model"
            hide-details
            label="Model"
          ></v-text-field>
        </div>
        <div class="col-md-12">
          <v-text-field
            outlined
            dense
            v-model="asset.serial"
            hide-details
            label="Serial number"
          ></v-text-field>
        </div>
        <div class="col-md-6">
          <v-menu
            v-model="asset.dateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            left
            nudge-top="26"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="asset.date"
                label="Purchase date"
                append-icon="mdi-calendar"
                readonly
                outlined
                dense
                hide-details
                background-color="white"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="asset.date"
              @input="asset.dateMenu = false"
            ></v-date-picker>
          </v-menu>
        </div>
        <div class="col-md-6">
          <v-text-field
            outlined
            dense
            v-model="asset.unit_price"
            hide-details
            label="Unit price"
            v-currency
          ></v-text-field>
        </div>
        <div class="col-md-12">
          <v-select
            outlined
            dense
            v-model="asset.unspsc_coding"
            hide-details
            :items="['Unknown']"
            label="UNSPSC coding"
            v-currency
          ></v-select>
        </div>
      </div>

      <v-btn color="primary" @click="save()">Save</v-btn>

      <v-btn color="secondary" class="float-right" @click="hide()">Close</v-btn>
    </v-sheet>
  </v-navigation-drawer>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import { ASSET_URL } from "../urls";
import { formatDollar } from "../utils/formatters";

export default {
  name: "UserEditor",
  computed: {},
  props: ["onSave"],
  data: () => ({
    isLoading: null,
    drawer: null,
    asset: {},
  }),
  created() {},
  methods: {
    show(item) {
      console.log(item);
      this.asset = _.clone(item);
      this.drawer = true;
      this.asset.unit_price = formatDollar(item.unit_price);
    },
    hide() {
      this.asset = {};
      this.drawer = false;
    },
    save() {
      axios
        .put(`${ASSET_URL}/${this.asset.value}`, this.asset)
        .then((resp) => {
          if (resp.data.errors) {
            console.log(resp.data.errors);
          } else {
            if (this.onSave) {
              this.onSave(resp);
            }
            this.hide();
          }
        })
        .catch((error) => {
          console.log("ERROR: ", error);
        });
    },
  },
};
</script>
