<template>
  <v-navigation-drawer v-model="drawer" temporary absolute right width="600px">
    <v-list-item>
      <v-list-item-avatar>
        <v-icon>mdi-swap-horizontal-bold</v-icon>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>Transfer</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-sheet class="mx-5 mt-5">
      <div class="row">
        <div class="col-sm-6">
          <v-autocomplete
            dense
            disabled
            outlined
            label="To"
            :items="ownerOptions"
            item-text="display_name"
            item-value="id"
            v-model="item.to_owner_id"
            persistent-hint
            hint="(Mailcode) Name"
          ></v-autocomplete>
        </div>
        <div class="col-sm-6">
          <v-autocomplete
            dense
            disabled
            outlined
            label="From"
            :items="ownerOptions"
            item-text="display_name"
            item-value="id"
            v-model="item.from_owner_id"
            persistent-hint
            hint="(Mailcode) Name"
          ></v-autocomplete>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 mt-0 pt-0">
          <v-divider></v-divider>
        </div>
        <div class="col-sm-6">
          <v-text-field
            dense
            disabled
            outlined
            label="Description"
            hide-details
            v-model="item.description"
          ></v-text-field>
        </div>

        <div class="col-sm-6">
          <v-text-field
            dense
            disabled
            outlined
            label="Departmental tag"
            hide-details
            v-model="assetItemTag"
          ></v-text-field>
        </div>
        <div class="col-sm-3">
          <v-text-field
            dense
            disabled
            outlined
            label="Quantity"
            type="number"
            hide-details
            v-model="item.quantity"
            min="1"
          ></v-text-field>
        </div>
        <div class="col-sm-7">
          <v-select
            dense
            disabled
            outlined
            label="Condition"
            hide-details
            v-model="item.condition"
            :items="assetConditionOptions"
          ></v-select>
        </div>
      </div>
      <v-btn
        class="float-right"
        color="error"
        :loading="loading"
        @click="confirmDelete"
        >Remove</v-btn
      >
      <v-dialog v-model="isShowingDeleteDialog" max-width="400">
        <v-card>
          <v-card-title>Remove Transfer</v-card-title>
          <v-card-text>
            <p>Are you sure you want to permanently remove this transfer record?</p>

            <p class="text-error mb-0"><em>* This action does not change the ownership of any attached asset or its condition.</em></p>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info" @click="cancelDelete">No</v-btn>
            <v-btn color="error" @click="deleteConfirmed">Yes, Remove</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- <v-btn
        @click="save"
        color="primary"
        class="float-right"
        :disabled="loading || !isValid"
        :loading="loading"
        >Save</v-btn
      > -->
    </v-sheet>
  </v-navigation-drawer>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import { mapGetters } from "vuex";

import { OWNER_URL, TRANSFER_URL } from "../../urls";

export default {
  computed: {
    ...mapGetters([
      "assetTypeOptions",
      "assetConditionOptions",
      "mailcodeOptions",
    ]),
    transferDirectionIcon: function () {
      if (this.transferDirection) return "mdi-redo";
      return "mdi-undo";
    },
    transferDirectionName: function () {
      if (this.transferDirection) return "Inbound transfer";
      return "Outbound transfer";
    },
    isValid: function () {
      return true;
    },
  },
  props: ["onSave"],
  data: () => ({
    disposalOptions: ["Recycle", "Sold", "CFS", "Donation", "Destruction"],
    ownerOptions: [],
    drawer: null,
    item: {},
    assetItemTag: null,
    loading: false,
    isShowingDeleteDialog: false,
  }),
  created() {
    this.loadList();
  },
  methods: {
    cancelDelete() {
      this.isShowingDeleteDialog = false;
    },
    confirmDelete() {
      this.isShowingDeleteDialog = true;
    },
    deleteConfirmed() {
      this.isShowingDeleteDialog = false;
      this.remove();
    },
    show(item) {
      this.item = _.clone(item);
      this.assetItemTag = item?.asset_item?.tag;
      this.drawer = true;
    },
    hide() {
      this.item = {};
      this.drawer = false;
    },
    loadList() {
      this.loading = true;
      axios
        .get(OWNER_URL)
        .then((resp) => {
          this.ownerOptions = resp.data.data;
        })
        .catch((error) => {
          console.log("ERROR", error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    save() {
      const body = _.clone(this.item);

      this.loading = true;
      axios
        .put(`${TRANSFER_URL}/${this.item.id}`, body)
        .then((resp) => {
          if (this.onSave) {
            this.onSave(resp);
          }
          this.hide();
        })
        .catch((error) => {
          console.log("ERROR: ", error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    remove() {
      this.loading = true;
      axios
        .delete(`${TRANSFER_URL}/${this.item.id}`)
        .then((resp) => {
          if (this.onSave) {
            this.onSave(resp);
          }
          this.hide();
        })
        .catch((error) => {
          console.log("ERROR: ", error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
