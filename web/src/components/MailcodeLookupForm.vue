<template>
  <div class="">
    <v-autocomplete
      outlined
      dense
      label="Mail code search"
      background-color="white"
      placeholder="Start typing to search"
      item-text="display_name"
      item-value="mailcode"
      :items="items"
      :loading="isLoading"
      :search-input.sync="search"
      v-model="selectedItem"
      @change="selectedChanged"
      :no-data-text="selectedHint"
    ></v-autocomplete>

    <div v-if="selected.mailcode">
      <hr />
      <h2 class="mt-4">
        {{ selected.mailcode }} : <small>{{ selected.description }}</small>
      </h2>

      <p>
        <strong>{{ selected.department }}</strong
        ><br />{{ selected.location }}
      </p>
      <v-btn small color="secondary" class="my-0">View assets</v-btn>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { MAILCODE_URL } from "../urls";

export default {
  name: "MailcodeLookupForm",
  props: ["onSave"],
  data: () => ({
    search: null,
    isLoading: null,
    count: 0,
    items: [],
    selectedItem: {},
    selected: {},
  }),
  created() {},
  watch: {
    search(val) {
      val = val || "";
      if (val.trim().length == 0) {
        this.items = [];

        return "";
      }

      // Items have already been requested
      if (this.isLoading) return;

      this.isLoading = true;

      // Lazily load input items
      axios
        .post(`${MAILCODE_URL}/search`, { keyword: val.trim() })
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
      this.selected = this.items.filter((i) => i.mailcode == item)[0];
      this.search = "";
    },
  },
};
</script>
