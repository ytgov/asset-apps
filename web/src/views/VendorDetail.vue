<template>
  <div class="">
    <v-breadcrumbs divider="/" large :items="breadcrumbs"></v-breadcrumbs>
    <h1>Vendor: {{ vendor.name }}</h1>
    <hr class="mb-3" />

    <div class="row">
      <div class="col-md-4">
        <v-card class="mt-5 default">
          <v-card-title>Vendor details</v-card-title>
          <v-card-text>
            <v-text-field
              disabled
              v-model="vendor.vendor_id"
              outlined
              dense
              background-color="white"
              label="Vendor ID"
            ></v-text-field>

            <v-text-field
              disabled
              v-model="vendor.name"
              outlined
              dense
              background-color="white"
              label="Vendor Name"
            ></v-text-field>

            <v-select
              v-model="vendor.vendor_community"
              :items="communities"
              :disabled="isSaving"
              outlined
              dense
              background-color="white"
              label="Community"
            ></v-select>
            <v-select
              v-model="vendor.vendor_sector"
              :items="sectors"
              :disabled="isSaving"
              outlined
              dense
              item-text="name"
              item-value="name"
              background-color="white"
              label="Sector"
              @change="sectorChange"
            ></v-select>
            <v-select
              v-model="vendor.vendor_subsector"
              :items="subsectors"
              :disabled="isSaving"
              outlined
              dense
              background-color="white"
              label="Subsector"
            ></v-select>

            <v-btn
              color="primary"
              @click="saveVendor()"
              class="float-right"
              :loading="isSaving"
              ><v-icon class="mr-2">mdi-inbox-arrow-down</v-icon> Save</v-btn
            >
            <div style="clear: both"></div>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-4">
        <v-card class="mt-5 default">
          <v-card-title>Programs</v-card-title>
          <v-card-text>
            <v-data-table
              :items="programs"
              :headers="[{ text: 'Name' }]"
            ></v-data-table>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-4">
        <v-card class="mt-5 default">
          <v-card-title
            >Payments
            <v-spacer></v-spacer>
            <v-chip class="ma-2" color="green" pill dark>
              <v-icon left>mdi-calculator</v-icon>
              {{ totalPayments }}
            </v-chip></v-card-title
          >
          <v-card-text>
            <v-data-table
              :items="payments"
              :headers="[
                { text: 'Date', value: 'display_date' },
                { text: 'Program', value: 'program_name' },
                { text: 'Amount', value: 'display_amount' },
                { text: 'Quest', value: 'matched' },
              ]"
            >
              <template v-slot:item.matched="{ item }">
                <v-checkbox :input-value="item.matched" disabled></v-checkbox>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import axios from "axios";
import { VENDOR_URL, PAYMENT_URL } from "../urls";
import router from "../router";

// @ is an alias to /src

export default {
  name: "Home",
  data: () => ({
    vendorId: "",
    breadcrumbs: [
      { text: "Dashboard", href: "/dashboard" },
      {
        text: "Vendors",
        href: "/vendors",
      },
    ],
    vendor: {},
    payments: [],
    programs: [{ program_name: "YBRP" }],
    communities: ["Whitehorse", "Teslin", "Carcross", "Carmacks"],
    isSaving: null,
    sectors: [],
    subsectors: [],
  }),
  async created() {
    this.vendorId = this.$route.params.id;
    await this.loadSectors();
    this.loadVendor(this.vendorId);
    this.loadPayments(this.vendorId);
  },
  computed: {
    totalPayments: function () {
      let total = this.payments.reduce((t, p) => {
        return t + p.amount;
      }, 0);
      return Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(total);
    },
  },
  methods: {
    loadVendor(id) {
      axios
        .get(`${VENDOR_URL}/${id}`)
        .then((resp) => {
          this.vendor = resp.data.data;

          if (this.vendor.vendor_sector)
            this.sectorChange(this.vendor.vendor_sector);

          this.breadcrumbs.push({
            text: this.vendor.name,
            disabled: true,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },

    loadSectors() {
      axios
        .get(`${VENDOR_URL}/sectors`)
        .then((resp) => {
          this.sectors = resp.data.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    loadPayments(id) {
      axios
        .get(`${PAYMENT_URL}/vendor/${id}`)
        .then((resp) => {
          this.payments = resp.data.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    sectorChange(item) {
      this.subsectors = this.sectors.filter(
        (s) => s.name == item
      )[0].subsectors;
    },

    openVendorDialog() {
      this.addVendorDialogOpen = true;
    },
    closeVendorDialog() {
      this.addVendorDialogOpen = null;
      this.vendorSearchResults = [];
      this.vendorSearchText = "";
    },

    addVendor(vendor) {
      console.log("ADDING ", vendor);

      axios
        .post(VENDOR_URL, { vendor_id: vendor.vendor_id })
        .then((resp) => {
          this.vendorList = resp.data.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    rowClick(item) {
      router.push(`/vendors/${item.vendor_id}`);
    },

    saveVendor() {
      this.isSaving = true;

      let body = {
        community: this.vendor.vendor_community,
        sector: this.vendor.vendor_sector,
        subsector: this.vendor.vendor_subsector,
      };

      axios
        .put(`${VENDOR_URL}/${this.vendorId}`, body)
        .then((resp) => {
          resp.data.data;
          this.isSaving = null;

          this.$refs.notifier.showAPIMessages(resp.data);
        })
        .catch((error) => {
          console.log(error);
          this.isSaving = null;
        });
    },
  },
};
</script>
