<template>
  <v-card class="default info-card mb-5">
    <v-card-subtitle>Vendor</v-card-subtitle>
    <v-card-title
      >{{ vendor.name }}
      <v-spacer></v-spacer>
      <v-btn
        class="my-0"
        text
        icon
        color="blue"
        :to="'/vendors/' + vendor.vendor_id"
      >
        <v-icon>mdi-open-in-new</v-icon></v-btn
      >
    </v-card-title>
    <v-card-text>
      <v-text-field
        append-icon="mdi-lock"
        label="Vendor community"
        v-model="vendor.vendor_community"
        readonly
        dense
        outlined
        background-color="white"
      ></v-text-field>
      <v-text-field
        append-icon="mdi-lock"
        label="Vendor sector"
        v-model="vendor.vendor_sector"
        readonly
        dense
        outlined
        background-color="white"
      ></v-text-field>
      <v-text-field
        append-icon="mdi-lock"
        label="Vendor subsector"
        v-model="vendor.vendor_subsector"
        readonly
        dense
        outlined
        background-color="white"
      ></v-text-field>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "VendorInfoCard",
  props: ["vendor"],
  data: () => ({}),
  methods: {},
};
</script>
