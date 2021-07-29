<template>
  <div class="">
    <v-autocomplete
      outlined
      dense
      label="Asset identifier"
      background-color="white"
      placeholder="Start typing to Search"
      item-text= "id"
      :items="items"
      :loading="isLoading"
      :search-input.sync="search"
    ></v-autocomplete>
  </div>
</template>

<script>
import _ from "lodash";
import axios from "axios";
import { TAG_URL } from "../urls";

export default {
  name: "UserEditor",
  computed: {},
  props: ["onSave"],
  data: () => ({
    search: null,
    isLoading: null,
    count: 0,
    items: [],
  }),
  created() {},
  watch: {
    search(val) {
      if (val.trim().length == 0) {
        this.items = [];
        return;
      }

      console.log(val);
      // Items have already been requested
      if (this.isLoading) return;

      this.isLoading = true;

      // Lazily load input items
      axios
        .post(`${TAG_URL}/search`, { keyword: val.trim() })
        .then((resp) => {
          this.items = resp.data.data;
          console.log("ITEMS", this.items)
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.isLoading = false));
    },
  },
  methods: {
    show(item) {
      this.payment = _.clone(item);
      this.drawer = true;
    },
    hide() {
      this.payment = {};
      this.drawer = false;
    },
  },
};
</script>
