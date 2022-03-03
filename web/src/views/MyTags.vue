<template>
  <div class="home">
    <h1>My Tags</h1>
    <p>These are the tags that you have requested.</p>
    <hr />

    <v-data-table
      dense
      :items="items"
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
    </v-data-table>

    <notifications ref="notifier"></notifications>
    <asset-sidebar ref="editor" :onSave="onSave"></asset-sidebar>
  </div>
</template>

<script>
import { ASSET_URL } from "../urls";
import axios from "axios";
export default {
  name: "Home",
  data: () => ({
    items: [],
  }),
  async mounted() {
    this.loadList();
  },
  methods: {
    loadList() {
      axios
        .get(`${ASSET_URL}/my-requested-tags`)
        .then((resp) => (this.items = resp.data.dat));
    },

    openEditor(item) {
      this.$refs.editor.show(item);
    },
    onSave(resp) {
      console.log("Save");
      this.$refs.notifier.showAPIMessages(resp.data);
    },
  },
};
</script>
