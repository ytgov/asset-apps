<template>
  <v-sheet class="mx-5 mt-5">
    <v-data-table
      disable-pagination
      :hide-default-footer="true"
      :headers="headers"
      :items="entries"
      item-key="name"
      class="elevation-1"
    >
      <template v-slot:item="{ item }">
        <tr @click="show(item)">
          <td>{{ item.date }}</td>
          <td>{{ item.user_email }}</td>
          <td>{{ item.entry_type }}</td>
          <td>{{ item.description }}</td>
        </tr>
      </template>
    </v-data-table>
    <v-btn color="primary" class="float-right" @click="show({})">
      Add Entry
    </v-btn>
    <HistoryEdit :refreshAssetEditor="refreshAssetEditor" ref="historyEdit" />
  </v-sheet>
</template>

<script>
import HistoryEdit from "./HistoryEdit.vue";
import { ASSET_HISTORY_URL } from "../urls";
import axios from "axios";
export default {
  name: "HistoryList",
  components: {
    HistoryEdit,
  },
  props: {
    refreshAssetEditor: { type: Function },
  },
  data() {
    return {
      entries: [],
      asset_id: "",
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Date",
          align: "start",
          value: "date",
          width: "15%",
          class: "no-wrap",
        },
        { text: "User", value: "user_email", width: "1%" },
        { text: "Type", value: "entry_type", width: "1%" },
        { text: "Notes", value: "description" },
      ];
    },
  },
  mounted() {
    // this.getAssetHistory(this.assetId);
  },
  watch: {
    assetId: function (val) {
      this.getAssetHistory(val);
    },
  },
  methods: {
    getAssetHistory(val) {
      this.asset_id = val;
      axios
        .get(`${ASSET_HISTORY_URL}/${val}`)
        .then((resp) => {
          this.entries = resp.data.data;
        })
        .catch((error) => {
          console.log("ERROR", error);
        });
    },
    show(item) {
      item.asset_id = this.asset_id;
      this.$refs.historyEdit.show(item);
    },
  },
};
</script>