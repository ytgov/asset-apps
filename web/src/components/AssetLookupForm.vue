<template>
  <div class="">
    <v-autocomplete
      outlined
      dense
      label="Asset identifier"
      background-color="white"
      placeholder="Start typing to Search"
      item-text="id"
      :items="items"
      :loading="isLoading"
      :search-input.sync="search"
      v-model="selectedItem"
      @change="selectedChanged"
      :no-data-text="selectedHint"
    ></v-autocomplete>
    <div v-if="selected.id">
      <hr />
      <h2 class="mt-4">
        {{ selected.id }} : <small>Water pump - small</small>
      </h2>

      <p>
        <strong>Owner:</strong> Community Services - Wildfire Management<br />
        <strong>Mail code:</strong> C19 - 91790 AKA HWY<br />
        <strong>Category:</strong> Tools<br />
        <strong>Purchased:</strong> January 20, 2020
      </p>
      <div v-if="showActions != 'false'">
        <v-btn small color="secondary" class="my-0 mr-5">More info</v-btn>
        <v-btn small color="secondary" class="my-0">Transfer or dispose</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { TAG_URL } from "../urls";

export default {
  name: "UserEditor",
  props: ["showActions", "doItemSelected"],
  data: () => ({
    search: null,
    isLoading: null,
    count: 0,
    items: [],
    selected: {},
    selectedItem: {},
  }),
  created() {},
  watch: {
    search(val) {
      val = val || "";
      if (val.trim().length == 0) {
        this.items = [];
        return;
      }

      // Items have already been requested
      if (this.isLoading) return;

      this.isLoading = true;

      // Lazily load input items
      axios
        .post(`${TAG_URL}/search`, { keyword: val.trim() })
        .then((resp) => {
          this.items = resp.data.data;
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.isLoading = false));
    },
  },

  computed: {
    selectedHint: function () {
      if (this.search == null || this.search == "")
        return "Enter your search criteria";
      else return "No matches found";
    },
  },

  methods: {
    selectedChanged(item) {
      this.selected = this.items.filter((i) => i.id == item)[0];
      this.search = "";

      if (this.doItemSelected) this.doItemSelected(this.selected);
    },
  },
};
</script>
