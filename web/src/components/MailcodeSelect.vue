<template>
  <div class="">
    <v-autocomplete
      outlined
      dense
      label="Mail code"
      loading="isLoading"
      background-color="white"
      item-text="display_name"
      item-value="mailcode"
      :items="items"
      v-model="mailcode"
      @change="change"
    ></v-autocomplete>
  </div>
</template>

<script>
import axios from "axios";
import { MAILCODE_URL } from "../urls";

export default {
  name: "UserEditor",
  props: ["model", "change"],
  data: () => ({
    search: null,
    isLoading: null,
    count: 0,
    items: [],
    selectedItem: {},
    selected: {},

    mailcode: "",
  }),
  created() {
    this.loadCodes();
    this.mailcode = this.model;
  },

  methods: {
    loadCodes() {
      this.isLoading = true;

      axios
        .get(`${MAILCODE_URL}`)
        .then((resp) => {
          this.items = resp.data.data;
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.isLoading = false));
    },
  },
};
</script>
