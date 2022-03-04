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

    <v-card class="white" outlined>
      <v-container class="py-4">
        <v-row>
          <v-col cols="4">
            <v-text-field
              label="How many tags do you need?"
              dense
              outlined
              hide-details
              type="number"
              min="1"
              max="50"
              v-model="tagCount"
            ></v-text-field>
          </v-col>

          <v-col cols="8">
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
                  v-model="purchaseDate"
                  label="Purchase date"
                  append-icon="mdi-calendar"
                  readonly
                  outlined
                  hide-details
                  dense
                  background-color="white"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="purchaseDate"
                @input="menu = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-autocomplete
              dense
              outlined
              hide-details
              :items="onlyKnownMailcodeOptions"
              label="What mail code do we send them to?"
              v-model="sendMailcodeId"
              item-text="display_name"
              item-value="id"
            ></v-autocomplete>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="8">
            <v-select
              dense
              outlined
              hide-details
              :items="assetPurchaseTypeOptions"
              item-text="description"
              item-value="id"
              label="How were these items purchased?"
              v-model="purchasedTypeId"
            ></v-select>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="orderNumber"
              label="Order number"
              dense
              outlined
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <div class="d-flex justify-end">
          <v-btn class="mb-0" color="primary" @click="createTags">
            Generate tags
          </v-btn>
        </div>
      </v-container>
    </v-card>
    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { times } from "lodash";

import { ASSET_URL } from "@/urls";
import http from "@/utils/http-client";

const UNSPECIFIED_ASSET_TYPE = -1;

export default {
  name: "AssetRegisterForm",
  computed: {
    ...mapGetters(["mailcodeOptions", "assetPurchaseTypeOptions"]),
    ...mapGetters("profile", {
      currentUserMailcodeId: "mailcodeId",
      currentUserEmail: "email",
    }),
    onlyKnownMailcodeOptions() {
      return this.mailcodeOptions.filter(
        ({ mailcode }) => mailcode != "Unknown"
      );
    },
  },
  props: ["onSave"],
  data() {
    return {
      assetTypeId: null,
      menu: null,
      orderNumber: null,
      purchaseDate: null,
      purchasedTypeId: null,
      sendMailcodeId: -1,
      tagCount: 1,
    };
  },
  mounted() {
    this.purchaseDate = new Date().toISOString().slice(0, 10);
  },
  watch: {
    currentUserMailcodeId(value) {
      this.sendMailcodeId = value;
    },
  },
  methods: {
    createTags() {
      const assetItemCreationPromises = times(this.tagCount, () =>
        http.post(ASSET_URL, {
          assetItem: {
            asset_owner_id: this.sendMailcodeId,
            asset_type_id: UNSPECIFIED_ASSET_TYPE,
            purchase_date: this.purchaseDate,
            purchase_type_id: this.purchasedTypeId,
            purchase_person: this.currentUserEmail,
            purchase_order_number: this.orderNumber,
          },
        })
      );

      Promise.all(assetItemCreationPromises).then(() => {
        this.$refs.notifier.showSuccess("Your tags have been generated.");
        this.$router.push({ name: "MyTags" });
      });
    },
  },
};
</script>
