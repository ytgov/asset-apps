<template>
  <div class="home">
    <h1>My Tags</h1>
    <p>
      These are the tags that you have requested. To expand your search to all
      tags attached to your mail code,
      <router-link to="/asset-tags/w10">click here</router-link>.
    </p>
    <hr />

    <v-data-table
      dense
      :items="scans"
      :headers="[
        { text: 'Asset tag', value: 'value', width: '150px' },
        { text: 'Purchase date', value: 'date', width: '160px' },
        { text: 'Make / Model', value: 'make' },
        { text: 'Serial Number', value: 'serial' },
        { text: 'Actions', value: 'actions', width: '120px' },
      ]"
      sort-by="['date']"
      @click:row="openEditor"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn
          color="primary"
          fab
          x-small
          class="my-1"
          @click="transfer(item)"
          title="Transfer"
        >
          <v-icon>mdi-bank-transfer-out</v-icon>
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

        <v-btn color="primary" fab x-small class="my-1 ml-3" title="Dispose">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.value="{ item }">
        <router-link to="#">{{ item.value }}</router-link>
      </template>
    </v-data-table>

    <notifications ref="notifier"></notifications>
    <asset-sidebar ref="editor" :onSave="onSave"></asset-sidebar>
  </div>
</template>

<script>
export default {
  name: "Home",
  data: () => ({
    scans: [
      {
        date: "2021-04-12",
        description: "Water pump - small",
        value: "Y123467",
        serial: "1234567",
        make: "Pumpmaster / Superpump 1000",
        reasonAction: "Execute",
        unit_price: 4343.2,
        category: 'Unknown'
      },
      {
        date: "2021-08-09",
        description: "Water pump - large",
        value: "Y123543",
        make: "Pumpmaster / Superpump 9000",
        reasonAction: "Execute",
        unit_price: 6514,
        category: 'Unknown'
      },
      {
        date: "2021-02-22",
        reason: "Trasfer",
        device: "Find match",
        serial: "9876540",
        value: "Y123465",
        make: "Lenovo / Laptop 123",
        reasonAction: "",
        unit_price: 123120.12,
        category: 'Unknown'
      },
    ],
  }),
  async created() {},
  methods: {
    transfer() {},
    openEditor(item) {
      this.$refs.editor.show(item);
    },
    onSave(resp) {
      console.log("TEING")
      this.$refs.notifier.showAPIMessages(resp.data);
    }
  },
};
</script>
