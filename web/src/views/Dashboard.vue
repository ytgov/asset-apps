<template>
  <div class="home">
    <h1>Asset Management Home</h1>
    <p>
      Asset Management provides assistance to all government departments,
      Agencies, and Corporations in the management, control and disposal of
      publicly owned assets. The Asset Management Warehouse is now located at
      9029 Quartz Road, Supply Services Building 277.
    </p>

    <div class="row">
      <div class="col-md-6">
        <v-card class="mt-5 default">
          <v-card-title
            >Want to transfer or dispose of assets?</v-card-title
          >
          <v-card-text>
            <asset-transfer-form></asset-transfer-form>
          </v-card-text>
        </v-card>

        <v-card class="mt-5 default">
          <v-card-title>Asset Tag Lookup</v-card-title>
          <v-card-text> <asset-lookup-form></asset-lookup-form></v-card-text>
        </v-card>

      </div>
      <div class="col-md-6">
        <v-card class="mt-5 default">
          <v-card-title>Do I need an asset tag?</v-card-title>
          <v-card-text>
            <asset-register-form></asset-register-form
          ></v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Dashboard",
  data: () => ({}),
};
</script>
