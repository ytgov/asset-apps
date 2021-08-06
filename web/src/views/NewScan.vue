<template>
  <div class="barcode">
    <StreamBarcodeReader
      @decode="(a, b, c) => onDecode(a, b, c)"
      @loaded="() => onLoaded()"
    ></StreamBarcodeReader>
    <v-list subheader>
      <v-subheader>Scanned Codes</v-subheader>
      <v-list-item v-for="(entry, counter) in entries" :key="counter">
        <v-list-item-content>
          <v-list-item-title v-text="entry"></v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-icon @click="deleteEntry(counter)" style="float: right">
            mdi-minus-circle
          </v-icon>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
    <v-btn color="success" class="mr-4" @click="submit" > Submit </v-btn>
  </div>
</template>

<script>
import { StreamBarcodeReader } from "vue-barcode-reader";

export default {
  name: "HelloWorld",
  components: {
    StreamBarcodeReader,
  },
  data() {
    return {
      text: "",
      entries: [],
      id: null,
    };
  },
  props: {
    msg: String,
  },
  methods: {
    onDecode(a, b, c) {
      console.log(a, b, c);
      this.entries.indexOf(a) === -1
        ? this.entries.push(a)
        : console.log("Already present");
    },
    onLoaded() {
      console.log("load");
    },
    deleteEntry(counter) {
      this.entries.splice(counter, 1);
    },
    submit() {
      console.log("submitting: ", this.entries);
    },
  },
};
</script>
<style scoped>
</style>
