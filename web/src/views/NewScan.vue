<template>
  <div class="barcode">
    <div>
      <div v-if="loading">
        <v-progress-circular
          :size="50"
          color="#f3b228"
          indeterminate
        ></v-progress-circular>
      </div>
      <StreamBarcodeReader
        @decode="onDecode"
        @loaded="onLoaded"
        style="max-width: 640px"
      ></StreamBarcodeReader>
    </div>
    <div v-if="!loading">
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
      loading: true,
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
      this.loading = false;
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
