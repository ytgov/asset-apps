<template>
  <div class="">
    <v-stepper
      flat
      v-model="step"
      vertical
      non-linear
      style="border: 1px #9e9e9e solid"
    >
      <v-stepper-step editable step="1" :complete="step > 1">
        Does the item have an asset identifier?
        <small>{{ hasIdentifier }}</small>
      </v-stepper-step>

      <v-stepper-content step="1">
        <v-btn small color="primary" class="my-0" @click="idYesClick()">Yes</v-btn>
        <v-btn small color="secondary" class="my-0 ml-3" @click="idNoClick()"> No </v-btn>
      </v-stepper-content>

      <v-stepper-step step="2">{{ step2Name }}</v-stepper-step>

      <v-stepper-content step="2" :complete="step > 2">
        <div v-if="hasIdentifier == 'Yes'" class="py-2">
          <asset-lookup-form
            showActions="false"
            :doItemSelected="assetSelected"
          ></asset-lookup-form>
          <v-btn
            v-if="assetToTransfer"
            small
            color="primary"
            @click="foundAsset()"
          >
            This looks right
          </v-btn>
          <v-btn
            small
            v-if="assetToTransfer"
            class="ml-2"
            @click="hasIdentifier = 'No'"
            color="secondary"
            >This is not it</v-btn
          >
        </div>

        <div v-if="hasIdentifier != 'Yes'" class="py-2">
          <div class="row" v-for="(desc, i) of descriptions" :key="i">
            <div class="col-sm-8">
              <v-select
                dense
                outlined
                :items="['Desk', 'Chair']"
                label="Describe the asset"
                hide-details
                v-model="desc.type"
              ></v-select>
            </div>
            <div class="col-sm-4">
              <v-text-field
                dense
                outlined
                label="Quantity"
                type="number"
                hide-details
                v-model="desc.quantity"
                min="1"
              ></v-text-field>
            </div>
          </div>

          <v-btn color="primary" class="mb-0" small @click="step = 3"> Continue </v-btn>
          <v-btn
            small
            title="Add another item"
            color="secondary"
            class="ml-2 mb-0"
            @click="descriptions.push({ quantity: 1 })"
            >Add more</v-btn
          >
        </div>
      </v-stepper-content>

      <v-stepper-step step="3">Complete</v-stepper-step>

      <v-stepper-content step="3" :complete="step > 3">
        <v-select
          class="mt-2"
          dense
          outlined
          :items="['W10 - MAB 1st Flr', 'W12 - 9029 Quartz Rd bldg 275']"
          label="What's your mail code?"
        ></v-select>

        <v-select
          class="mt-2"
          rows="2"
          v-model="transferReason"
          dense
          :items="['No good', 'Good']"
          outlined
          label="What condition is this item in?"
          persistent-hint
        ></v-select>

        <v-btn small class="mb-0" color="primary" @click="doComplete()">Complete</v-btn>
      </v-stepper-content>
    </v-stepper>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
export default {
  name: "UserEditor",
  computed: {},
  props: ["onSave"],
  data: () => ({
    step: 1,
    search: null,
    isLoading: null,
    count: 0,
    hasIdentifier: "",
    step2Name: "Tell us about the item(s)",
    assetToTransfer: null,
    transferReason: "",
    descriptions: [{ quantity: 1 }],
  }),
  created() {},
  methods: {
    idYesClick() {
      this.hasIdentifier = "Yes";
      this.step2Name = "Find the item";
      this.step = 2;
    },

    idNoClick() {
      this.hasIdentifier = "No";
      this.step2Name = "Tell us about the item(s)";
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
