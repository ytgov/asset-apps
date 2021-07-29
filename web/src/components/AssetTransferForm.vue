<template>
  <v-sheet class="mx-5 mt-5">
    <h3>Transfer an asset</h3>
    <v-text-field
      outlined
      dense
      readonly
      label="Vendor"
    ></v-text-field>
    <div class="col-md-6">
      <v-text-field
        outlined
        dense
        readonly
        hide-details
        label="Invoice"
      ></v-text-field>
    </div>
  </v-sheet>
</template>

<script>
import _ from "lodash";

export default {
  name: "UserEditor",
  computed: {},
  props: ["onSave"],
  data: () => ({
    search: null,
    isLoading: null,
    count: 0,

  }),
  created() {},
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
