<template>
  <v-navigation-drawer v-model="drawer" temporary absolute right width="500px">
    <v-list-item style="background-color: #d8d8d8">
      <v-list-item-avatar>
        <v-icon>mdi-currency-usd</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>Payment details</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-sheet class="mx-5 mt-5">
      <v-text-field
        outlined
        dense
        v-model="payment.vendorid"
        readonly
        label="Vendor"
      ></v-text-field>
      <div class="row">
        <div class="col-md-6">
          <v-text-field
            outlined
            dense
            v-model="payment.invoice_num"
            readonly
            hide-details
            label="Invoice"
          ></v-text-field>
        </div>
        <div class="col-md-6">
          <v-text-field
            outlined
            dense
            v-model="payment.invoice_date"
            readonly
            hide-details
            label="Invoice date"
          ></v-text-field>
        </div>
        <div class="col-md-6">
          <v-text-field
            outlined
            dense
            v-model="payment.eff_date"
            readonly
            hide-details
            label="Amount"
          ></v-text-field>
        </div>
        <div class="col-md-6">
          <v-text-field
            outlined
            dense
            v-model="payment.display_amount"
            readonly
            hide-details
            label="Amount"
          ></v-text-field>
        </div>
        <div class="col-md-6">
          <v-text-field
            outlined
            dense
            v-model="payment.batch_num"
            readonly
            hide-details
            label="Batch"
          ></v-text-field>
        </div>
        <div class="col-md-6">
          <v-text-field
            outlined
            dense
            v-model="payment.fisc_year"
            readonly
            label="Fiscal year"
          ></v-text-field>
        </div>
      </div>

      <v-text-field
        outlined
        dense
        v-model="payment.trans_desc"
        readonly
        label="Description"
      ></v-text-field>

      <v-text-field
        outlined
        dense
        v-model="payment.source"
        readonly
        label="Source"
      ></v-text-field>
    </v-sheet>

    <v-list-item style="background-color: #d8d8d8">
      <v-list-item-avatar>
        <v-icon>mdi-link-variant</v-icon>
      </v-list-item-avatar>
      <v-list-item-content style="back">
        <v-list-item-title style="line-height: 2">
          <v-btn color="info" class="float-right my-0" small>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
          Linked applications
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <div class="mx-5 mt-5" style="font-size: 0.9rem">
      <div v-for="(link, i) of linked" :key="i">
        <div class="row py-2">
          <div class="col-md-10">
            <div class="float-left">{{ link.title }}</div>
            <div class="float-right">{{ link.amount }}</div>
            <div style="clear: both"></div>
          </div>
          <div class="col-md-2 py-0 text-right">
            <v-btn fab color="error" x-small class="my-1" title="Unlink">
              <v-icon>mdi-link-variant-remove</v-icon>
            </v-btn>
          </div>
        </div>
        <v-divider style="clear: both"></v-divider>
      </div>
      <v-btn @click="saveUser" color="primary" class="float-right">Save</v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import { USER_URL, VENDOR_URL } from "../urls";

export default {
  name: "UserEditor",
  computed: {},
  props: ["onSave"],
  data: () => ({
    search: null,
    isLoading: null,
    count: 0,

    drawer: null,
    payment: {},
    linked: [
      { program: "PSLR Phase 1", title: "Michael Johnson", value: "$1,537.50" },
      { program: "PSLR Phase 1", title: "Michael Johnson", value: "$1,537.50" },
      { program: "PSLR Phase 1", title: "Michael Johnson", value: "$1,537.50" },
    ],
    vendorApplications: [],
  }),

  watch: {
    search() {
      // Items have already been loaded
      //if (this.items.length > 0) return;

      // Items have already been requested
      if (this.isLoading) return;

      // Lazily load input items
      //this.items = this.orgLevels.filter((o) => o.name.indexOf(val) >= 0);
    },
  },

  created() {},
  methods: {
    show(item) {
      this.payment = _.clone(item);
      this.drawer = true;

      this.loadVendorApplications();
    },
    hide() {
      this.payment = {};
      this.drawer = false;
    },
    saveUser() {
      axios
        .put(`${USER_URL}/${this.user.email}`, this.payment)
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
    loadVendorApplications() {
      axios
        .get(`${VENDOR_URL}/${this.payment.vendorid}/all-applications`)
        .then((resp) => {
          console.log(resp.data.data);
          this.linked = resp.data.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
