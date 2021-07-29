<template>
  <div class="home">
    <h1>Asset Management Home</h1>

    <div class="row">
      <div class="col-md-6">
        <v-card class="mt-5 default">
          <v-card-title>I want to transfer an Asset</v-card-title>
          <v-card-text>
            <asset-transfer-form></asset-transfer-form>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card class="mt-5 default">
          <v-card-title>Asset Tag Lookup</v-card-title>
          <v-card-text>
            <asset-lookup-form></asset-lookup-form
          ></v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card class="mt-5 default">
          <v-card-title>Request an Asset Tag</v-card-title>
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
  name: "Home",
  data: () => ({}),
};
</script>
