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
          :items="mailcodeOptions"
          label="What mail code do we send them to?"
          v-model="sendMailcode"
          item-text="display_name"
          item-value="mailcode"
        ></v-select>

        <v-btn
          small
          color="primary"
          class="mb-0"
          @click="openAdditionalInformationMenu"
          >Add individual item information</v-btn
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
              v-model="purchasedType"
            ></v-select>
          </div>
          <div class="col-sm-6">
            <v-text-field
              v-model="orderNumber"
              label="Order number"
              dense
              outlined
            ></v-text-field>
          </div>
        </div>

        <v-btn color="secondary" class="mb-0 mr-2" small @click="step = 1">
          Back
        </v-btn>

        <v-btn color="primary" class="mb-0" small @click="generateTags">
          Generate tags
        </v-btn>
      </v-stepper-content>
    </v-stepper>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { times } from "lodash";

import { ASSET_URL } from "@/urls";
import http from "@/utils/http-client";

export default {
  name: "UserEditor",
  computed: {
    ...mapGetters(["mailcodeOptions"]),
    ...mapGetters("profile", {
      defaultMailcode: "mailcode",
      currentUserEmail: "email",
    }),
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
    orderNumber: null,
    transferReason: "",
    descriptions: [{ quantity: 1 }],

    menu: null,
    date: null,
    purchasedType: null,
    sendMailcode: "",
  }),
  created() {
    this.sendMailcode = this.defaultMailcode;
    this.date = new Date().toISOString().slice(0, 10);
  },
  methods: {
    openAdditionalInformationMenu() {
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

    generateTags() {
      const sendMailcodeId = this.mailcodeOptions.find(
        ({ mailcode }) => mailcode == this.sendMailcode
      ).id;

      const assetItemCreationPromises = times(this.tagCount, () =>
        http.post(ASSET_URL, {
          asset_item: {
            asset_owner_id: sendMailcodeId,
            purchased_date: this.date,
            purchase_type: this.purchasedType,
            purchase_person: this.currentUserEmail,
            purchase_order_number: this.orderNumber,
          },
        })
      );

      Promise.all([assetItemCreationPromises]).then(() => {
        this.$refs.notifier.showSuccess("Your tags have been generated.");
        this.$router.push("/asset-tags/recent");
      });
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
