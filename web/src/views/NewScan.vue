<template>
  <div class="barcode">
    <h1>New scans</h1>
    <p>
      When you scan codes, they will automatically save and become available on
      the <router-link to="/my-scans">My Scans</router-link> page where you can
      view the asset or search if a match isn't found.
    </p>

    <StreamBarcodeReader
      @decode="onDecode"
      @loaded="onLoaded"
    ></StreamBarcodeReader>

    <h2>Scanned Codes</h2>

    <ol class="mt-4">
      <li v-for="(entry, counter) in entries" :key="counter">{{ entry }}</li>
    </ol>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import axios from "axios";
import { StreamBarcodeReader } from "vue-barcode-reader";
import { useSound } from "@vueuse/sound";
import dingMP3 from "../assets/sounds/ding.mp3";
import { SCAN_URL } from "../urls";

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

        axios.post(`${SCAN_URL}`, { value: a }).then((resp) => {
          console.log(resp);
        });
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
