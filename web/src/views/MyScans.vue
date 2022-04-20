<template>
  <div class="home">
    <div class="row">
      <div class="col-md-10">
        <h1>My Scans</h1>
        <p>
          This application works on both desktop and mobile browsers and can be
          used to scan bar codes. As you scan code, they will be displayed in
          this screen.
        </p>
      </div>
      <div class="col-md-2">
        <v-btn
          color="primary"
          style="width: 100%"
          large
          outlined
          class="float-right"
          to="/scan"
          ><v-icon class="mr-2">mdi-camera</v-icon> New scan</v-btn
        >
      </div>
    </div>

    <v-data-table
      dense
      :items="scans"
      :headers="[
        { text: 'Date', value: 'scan_date', width: '200px' },
        { text: 'Scanned value', value: 'description' },
        { text: 'Scan actions', value: 'actions', width: '120px' },
      ]"
      sort-by="['date']"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn
          color="primary"
          fab
          x-small
          class="my-1"
          @click="copy(item.scan_value)"
          title="Copy value"
        >
          <v-icon>mdi-content-copy</v-icon>
        </v-btn>
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
      <template v-slot:item.description="{ item }">
        <v-btn
          fab
          x-small
          color="primary"
          class="my-1 mr-3"
          title="View asset"
          @click="openAsset(item.asset)"
          v-if="item.asset && item.asset.id"
        >
          <v-icon>mdi-dolly</v-icon>
        </v-btn>

        <v-btn
          fab
          x-small
          color="primary"
          class="my-1 mr-3"
          title="Find possible matches"
          @click="lookup(item.scan_value)"
          v-if="!(item.asset && item.asset.id)"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        {{ item.description }}
      </template>
    </v-data-table>

    <asset-editor ref="editor" :onSave="loadScans"></asset-editor>
    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import axios from "axios";
import { SCAN_URL } from "../urls";
export default {
  name: "Home",
  data: () => ({
    scans: [],
  }),
  async created() {
    this.loadScans();
  },
  methods: {
    loadScans() {
      axios.get(`${SCAN_URL}`).then((resp) => {
        this.scans = resp.data.data;
      });
    },
    copy(value) {
      navigator.clipboard.writeText(value);
      this.$refs.notifier.showSuccess(`'${value}' copied to your clipboard`);
    },
    lookup(item) {
      console.log("Looking up ", item);
      this.$router.push("/administration/assets?search=" + item);
    },
    deleteScan(item) {
      axios.delete(`${SCAN_URL}/${item.id}`).then(() => {
        this.loadScans();
      });
    },
    openAsset(item) {
      this.$refs.editor.show(item);
    },
  },
};
</script>
