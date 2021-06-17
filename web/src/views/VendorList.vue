<template>
  <div class="">
    <v-breadcrumbs divider="/" large :items="breadcrumbs"></v-breadcrumbs>

    <v-btn color="primary" class="float-right mt-0" @click="openVendorDialog()"
      ><v-icon>mdi-plus</v-icon> Add Vendor</v-btn
    >
    <h1>Vendors</h1>
    <hr class="mb-3" />

    <v-data-table
      :items="vendorList"
      :loading="listLoading"
      :search="search"
      :headers="[
        { text: 'Vendor Id', value: 'vendor_id' },
        { text: 'Name', value: 'name' },
        { text: 'Community', value: 'vendor_community' },
        { text: 'Sector', value: 'vendor_sector' },
        { text: 'Subsector', value: 'vendor_subsector' },
        { text: 'Payments', value: 'payments' },
      ]"
      dense
      @click:row="rowClick"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          label="Search"
          class="mx-4"
        ></v-text-field>
      </template>
    </v-data-table>

    <v-dialog v-model="addVendorDialogOpen" persistent max-width="600px">
      <v-container class="pb-3" style="background-color: white">
        <h2>Add Vendor</h2>
        <hr class="mb-4" />

        <v-text-field
          v-model="vendorSearchText"
          dense
          outlined
          append-icon="mdi-magnify"
          @click:append="doVendorSearch()"
          label="Vendor Id or Name"
          hint="Enter text and hit the search button"
        >
        </v-text-field>

        <v-data-table
          :items="vendorSearchResults"
          :headers="vendorSearchHeaders"
        >
          <template v-slot:item.vendor_id="{ item }"
            ><v-btn fab x-small color="primary" @click="addVendor(item)"
              ><v-icon>mdi-plus</v-icon></v-btn
            >
            {{ item.vendor_id }}
          </template>
        </v-data-table>

        <v-btn color="secondary" class="" @click="closeVendorDialog()"
          >Close</v-btn
        >
      </v-container>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { VENDOR_URL } from "../urls";
import router from "../router";

// @ is an alias to /src

export default {
  name: "Home",
  data: () => ({
    listLoading: null,
    breadcrumbs: [
      { text: "Dashboard", href: "/dashboard" },
      {
        text: "Vendors",
        disabled: true
      },
    ],
    search: "",
    vendorList: [],
    addVendorDialogOpen: null,

    vendorSearchText: "",
    vendorSearchResults: [],
    vendorSearchHeaders: [
      { text: "Vendor Id", value: "vendor_id" },
      { text: "Name", value: "name" },
      { text: "Community", value: "community" },
    ],
  }),
  async created() {
    this.loadVendors();
  },
  methods: {
    loadVendors() {
      this.listLoading = true;
      axios
        .get(VENDOR_URL)
        .then((resp) => {
          this.vendorList = resp.data.data;
          this.listLoading = null;
        })
        .catch((error) => {
          console.log(error);
          this.listLoading = null;
        });
    },

    openVendorDialog() {
      this.addVendorDialogOpen = true;
    },
    closeVendorDialog() {
      this.addVendorDialogOpen = null;
      this.vendorSearchResults = [];
      this.vendorSearchText = "";
    },
    doVendorSearch() {
      this.vendorSearchText = this.vendorSearchText.trim();

      if (this.vendorSearchText.length < 2) {
        return;
      }

      axios
        .post(`${VENDOR_URL}/search`, { term: this.vendorSearchText })
        .then((data) => {
          this.vendorSearchResults = data.data.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    addVendor(vendor) {
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
  },
};
</script>
