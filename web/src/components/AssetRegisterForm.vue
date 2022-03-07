<template>
  <v-form v-model="isValid">
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
      <v-container class="py-4" style="border: 1px #9e9e9e solid">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="tagCount"
              :rules="tagCountRules"
              hide-details="auto"
              dense
              outlined
              type="number"
              min="1"
              max="50"
              required
            >
              <template #label>
                How many tags do you need? <strong class="red--text">*</strong>
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="12" sm="6">
            <v-menu
              v-model="datePickerMenu"
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
                  append-icon="mdi-calendar"
                  required
                  readonly
                  outlined
                  hide-details="auto"
                  dense
                  background-color="white"
                  v-bind="attrs"
                  v-on="on"
                >
                  <template #label>
                    Purchase date <strong class="red--text">*</strong>
                  </template>
                </v-text-field>
              </template>
              <v-date-picker
                v-model="purchaseDate"
                @input="datePickerMenu = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" sm="12">
            <v-autocomplete
              v-model="sendMailcodeId"
              :items="onlyKnownMailcodeOptions"
              item-text="display_name"
              item-value="id"
              :rules="sendMailcodeIdRules"
              hide-details="auto"
              dense
              outlined
              required
            >
              <template #label>
                What mail code do we send them to?
                <strong class="red--text">*</strong>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="purchasedTypeId"
              :items="assetPurchaseTypeOptions"
              item-text="description"
              item-value="id"
              :rules="assetPurchaseTypeIdRules"
              hide-details="auto"
              dense
              outlined
              required
            >
              <template #label>
                How were these items purchased?
                <strong class="red--text">*</strong>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="orderNumber"
              label="Order number"
              hide-details
              dense
              outlined
            ></v-text-field>
          </v-col>
        </v-row>

        <div class="d-flex justify-end">
          <v-tooltip left :disabled="isValid">
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-btn
                  class="mb-0"
                  color="primary"
                  append-icon=""
                  :disabled="!isValid"
                  @click="createTags"
                >
                  Generate tags
                </v-btn>
              </div>
            </template>
            <span>Please fill in all required fields</span>
          </v-tooltip>
        </div>
      </v-container>
    </v-card>
    <notifications ref="notifier"></notifications>
  </v-form>
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
      datePickerMenu: false,
      orderNumber: null,
      purchaseDate: null,
      purchasedTypeId: null,
      assetPurchaseTypeIdRules: [(v) => !!v || "Purchase type is required"],
      sendMailcodeId: -1,
      sendMailcodeIdRules: [(v) => !!v || "Mailcode is required"],
      tagCount: 1,
      tagCountRules: [
        (v) => !!v || "Must request at least one tag",
        (v) => v > 0 || "Must request at least one tag",
      ],
      isValid: false,
    };
  },
  mounted() {
    this.purchaseDate = new Date().toISOString().slice(0, 10);
  },
  watch: {
    currentUserMailcodeId: {
      handler(value) {
        this.sendMailcodeId = value;
      },
      immediate: true,
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

      Promise.all(assetItemCreationPromises)
        .then(() => {
          this.$refs.notifier.showSuccess("Your tags have been generated.");
          this.$router.push({ name: "MyTags" });
        })
        .catch((error) => {
          console.error(error);
          this.$refs.notifier.showError("Could not generate your tags.");
        });
    },
  },
};
</script>
