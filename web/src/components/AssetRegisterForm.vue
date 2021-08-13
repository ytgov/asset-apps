<template>
  <div class="">
    <v-alert color="warning" border="left" outlined backround-color="#fffffdd">
      <h4 class="mb-2">YG assets valued over $1000 must have an asset tag</h4>
      <p class="mb-0">
        When you receive an your items such as furniture, equipment, tools etc…
        you must request an asset tag so that we can maintain YG's asset
        inventory.
      </p></v-alert
    >

    <h4>Requesting asset tags is a simple two step process:</h4>
    <ol class="mb-4 mt-2">
      <li>Tell us how many tags you need and we will send them to you</li>
      <li>
        Add identifying information to each tag, some now and some later is okay
      </li>
    </ol>

    <v-stepper
      flat
      v-model="step"
      vertical
      non-linear
      style="border: 1px #9e9e9e solid"
    >
      <v-stepper-step step="1" :complete="step > 1">
        Let's get started
      </v-stepper-step>

      <v-stepper-content step="1">
        <div class="row">
          <div class="col-sm-4 pt-4">
            <v-text-field
              label="How many tags do you need?"
              dense
              outlined
              type="number"
              min="1"
              max="50"
              v-model="tagCount"
            ></v-text-field>
          </div>

          <div class="col-sm-8 pt-4">
            <v-menu
              v-model="menu"
              :close-on-content-click="false"
              transition="scale-transition"
              left
              nudge-top="26"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="date"
                  label="Purchase date"
                  append-icon="mdi-calendar"
                  readonly
                  outlined
                  dense
                  background-color="white"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="date"
                @input="menu = false"
              ></v-date-picker>
            </v-menu>
          </div>
        </div>

        <v-select
          dense
          outlined
          hide-details
          :items="mailcodes"
          label="What mail code do we send them to?"
          v-model="sendMailcode"
          item-text="display_name"
          item-value="mailcode"
        ></v-select>

        <v-btn small color="primary" class="mb-0" @click="step1Click()"
          >Generate tags</v-btn
        >
      </v-stepper-content>

      <v-stepper-step step="2">Tell us about the item(s)</v-stepper-step>

      <v-stepper-content step="2" :complete="step > 2">
        <div class="row pt-1">
          <div class="col-sm-6">
            <v-select
              dense
              outlined
              :items="[
                'Purchase Order',
                'RFP',
                'Contract',
                'Credit Card',
                'Undefined',
              ]"
              label="How were these items purchased?"
              v-model="purchased"
            ></v-select>
          </div>
          <div class="col-sm-6">
            <v-text-field label="Order number" dense outlined></v-text-field>
          </div>
        </div>

        <v-btn color="secondary" class="mb-0 mr-2" small @click="step = 1">
          Back
        </v-btn>

        <v-btn color="primary" class="mb-0" small @click="finish()">
          Add individual item information
        </v-btn>
      </v-stepper-content>
    </v-stepper>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import router from "../router";
import { mapState } from "vuex";
import axios from "axios";
import { MAILCODE_URL } from "../urls";

export default {
  name: "UserEditor",
  computed: {
    ...mapState("profile", ["mailcode"]),
  },
  props: ["onSave"],
  data: () => ({
    step: 1,

    tagCount: 1,

    search: null,
    isLoading: null,
    count: 0,
    hasIdentifier: "",
    step2Name: "Tell us about the item(s)",
    assetToTransfer: null,
    transferReason: "",
    descriptions: [{ quantity: 1 }],

    mailcodes: [],

    menu: null,
    date: null,
    purchased: null,
    sendMailcode: "",
  }),
  created() {
    this.sendMailcode = this.mailcode;

    axios.get(`${MAILCODE_URL}`).then((resp) => {
      this.mailcodes = resp.data.data;
    });

    this.date = new Date().toISOString().slice(0, 10)
  },
  methods: {
    step1Click() {
      this.descriptions = new Array();

      for (let i = 0; i < this.tagCount && i < 50; i++) {
        this.descriptions.push({});
      }

      this.step = 2;
    },

    assetSelected(asset) {
      this.assetToTransfer = asset;
    },

    foundAsset() {
      if (this.assetToTransfer) {
        this.step = 3;
      }
    },

    doComplete() {
      this.$refs.notifier.showSuccess("Your transfer has been submitted");
      this.resetForm();
    },

    finish() {
      router.push("/asset-tags/recent");
    },

    resetForm() {
      this.hasIdentifier = "";
      this.step = 1;
      this.step2Name = "Tell us about the item(s)";
      this.assetToTransfer = null;
      this.transferReason = "";
    },
  },
};
</script>
