<template>
  <div class="barcode">
    <StreamBarcodeReader
      @decode="onDecode"
      @loaded="onLoaded"
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
    <v-btn color="success" class="mr-4" @click="activeSound"> Submit </v-btn>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import { StreamBarcodeReader } from "vue-barcode-reader";
import { useSound } from "@vueuse/sound";
import dingMP3 from "../assets/sounds/ding.mp3";

export default {
  name: "NewScan",
  components: {
    StreamBarcodeReader,
  },
  data() {
    return {
      entries: [],
      id: null,
    };
  },
  setup() {
    // Sounds
    const dingSound = useSound(dingMP3);
    return { dingSound };
  },
  methods: {
    onDecode(a) {
      if (this.entries.indexOf(a) === -1) {
        this.dingSound.play();
        this.entries.unshift(a);
        this.$refs.notifier.showSuccess("Barcode scanned");
      }
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
