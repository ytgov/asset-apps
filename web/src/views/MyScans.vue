<template>
  <div class="home">
    <v-btn color="primary" large outlined class="float-right" to="/scan"
      ><v-icon class="mr-2">mdi-camera</v-icon> New scan</v-btn
    >
    <h1>My Scans</h1>
    <p>
      This application works on both desktop and mobile browsers and can be used
      to scan bar codes. As you scan code, they will be displayed in this
      screen.
    </p>
    <hr />

    <v-data-table
      dense
      :items="scans"
      :headers="[
        { text: 'Date', value: 'date', width: '200px' },
        { text: 'Scanned value', value: 'value' },
        { text: 'Scan action', value: 'reason' },
        { text: 'Actions', value: 'actions', width: '120px' },
      ]"
      sort-by="['date']"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn
          color="primary"
          fab
          x-small
          class="my-1"
          @click="copy(item.value)"
          title="Copy value"
        >
          <v-icon>mdi-content-copy</v-icon>
        </v-btn>
        <!--  <v-btn
          color="primary"
          fab
          x-small
          class="my-1 ml-3"
          @click="lookup(item)"
          title="Lookup"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn> -->

        <v-btn
          color="primary"
          fab
          x-small
          class="my-1 ml-3"
          @click="deleteScan(item)"
          title="Remove scan"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.value="{ item }">
        {{ item.value }} - <router-link to="/">{{ item.device }}</router-link>
      </template>
      <template v-slot:item.reason="{ item }">
        {{ item.reason }}

        <v-btn
          fab
          x-small
          color="primary"
          class="my-1 ml-4"
          title="Execute transfer"
          @click="doExecute(item)"
          v-if="item.reasonAction == 'Execute'"
          ><v-icon>mdi-play</v-icon></v-btn
        >
      </template>
    </v-data-table>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
export default {
  name: "Home",
  data: () => ({
    scans: [
      {
        date: "Sept 6, 2021 @ 12:51:02",
        reason: "Trasfer",
        device: "View asset",
        value: "Y123467",
        reasonAction: "Execute",
      },
      {
        date: "Sept 6, 2021 @ 12:52:24",
        reason: "Trasfer",
        device: "View asset",
        value: "Y123543",
        reasonAction: "Execute",
      },
      {
        date: "Sept 6, 2021 @ 12:57:36",
        reason: "Serial",
        device: "Find match",
        value: "1230928130980921",
        reasonAction: "",
      },
      {
        date: "Sept 6, 2021 @ 12:59:59",
        reason: "Trasfer",
        device: "Find match",
        value: "Y123465",
        reasonAction: "",
      },
    ],
  }),
  async created() {},
  methods: {
    copy(value) {
      navigator.clipboard.writeText(value);
      this.$refs.notifier.showSuccess("Value copied");
    },
    lookup(item) {
      console.log("Looking up ", item);
    },
    deleteScan(item) {
      console.log(item);
      this.scans = this.scans.filter((s) => s.value != item.value);
    },
    doExecute(item) {
      this.scans = this.scans.filter((s) => s.value != item.value);
      this.$refs.notifier.showSuccess("Transfer completed");
    },
  },
};
</script>