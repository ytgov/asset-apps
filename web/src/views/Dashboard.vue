<template>
  <div class="home">
    <h1>Dashboard</h1>

    <v-card class="mt-5" color="#fff2d5">
      <v-card-title>Card with info</v-card-title>
      <v-card-text>This is the body of the text</v-card-text>
    </v-card>

    <div class="row mt-5">
      <div class="col-md-6">
        <v-card class="mt-5" color="#fff2d5" to="/yukon-business-relief-program-1">
          <v-card-title>Yukon Business Relief Program : Phase 1</v-card-title>
          <v-card-text>This is the body of the text</v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card class="mt-5" color="#fff2d5" to="/yukon-business-relief-program-2">
          <v-card-title>Yukon Business Relief Program : Phase 2</v-card-title>
          <v-card-text>This is the body of the text</v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card class="mt-5" color="#fff2d5" to="/paid-sick-leave/phase-1">
          <v-card-title>Paid Sick Leave</v-card-title>
          <v-card-text>This is the body of the text</v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card class="mt-5" color="#fff2d5" to="/essential-workers-income-support/phase-1">
          <v-card-title>Essential Workers Income Support Program</v-card-title>
          <v-card-text>This is the body of the text</v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card class="mt-5" color="#fff2d5" to="/temporary-support-for-canceled-events">
          <v-card-title>Temporary Support for Canceled Events</v-card-title>
          <v-card-text>This is the body of the text</v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  data: () => ({})
};
</script>
