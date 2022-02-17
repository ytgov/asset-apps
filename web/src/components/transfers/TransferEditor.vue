<template>
  <v-navigation-drawer v-model="drawer" temporary app right width="700px">
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
        <template v-if="hasAssetCategory">
          <div class="col-sm-6">
            <v-autocomplete
              dense
              outlined
              :items="assetTypeOptions"
              item-text="description"
              item-value="id"
              label="Type of item"
              hide-details
              v-model="item.asset_category_id"
            ></v-autocomplete>
          </div>
        </template>
        <template v-else>
          <div class="col-sm-6">
            <v-text-field
              dense
              outlined
              label="Description"
              hide-details
              disabled
              v-model="assetItem.description"
            ></v-text-field>
          </div>

          <div class="col-sm-6">
            <v-text-field
              dense
              outlined
              label="Departmental tag"
              hide-details
              disabled
              v-model="assetItem.tag"
            ></v-text-field>
          </div>
        </template>
        <div class="col-sm-3">
          <v-text-field
            dense
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
            outlined
            label="Condition"
            hide-details
            v-model="item.condition"
            :items="assetConditionOptions"
          ></v-select>
        </div>
      </div>

      <v-btn color="error" :loading="loading" @click="confirmDelete"
        >Remove</v-btn
      >
      <v-btn
        color="primary"
        class="float-right"
        :loading="loading"
        @click="save"
        >Save</v-btn
      >

      <v-dialog v-model="isShowingDeleteDialog" max-width="290">
        <v-card>
          <v-card-title> Confirm Deletion </v-card-title>
          <v-card-text>
            Are you sure you want to delete this transfer?
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info" @click="cancelDelete">Cancel</v-btn>
            <v-btn color="error" @click="deleteConfirmed"> Delete </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-sheet>
  </v-navigation-drawer>
</template>

<script>
import axios from "axios";
import { isNil, clone } from "lodash";
import { mapGetters } from "vuex";

import { OWNER_URL, TRANSFER_URL } from "../../urls";

export default {
  computed: {
    ...mapGetters(["assetTypeOptions", "assetConditionOptions"]),
    hasAssetCategory() {
      return !isNil(this.item.asset_category_id);
    },
  },
  props: ["onSave"],
  data: () => ({
    ownerOptions: [],
    drawer: null,
    item: {},
    assetItem: {},
    assetCategory: {},
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
      this.item = clone(item);
      this.assetItem = clone(item.asset_item);
      this.assetCategory = clone(item.asset_category);
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
      const {
        id,
        asset_category_id,
        condition,
        from_owner_id,
        quantity,
        to_owner_id,
      } = this.item;

      this.loading = true;
      axios
        .patch(`${TRANSFER_URL}/${id}`, {
          asset_category_id,
          condition,
          from_owner_id,
          quantity,
          to_owner_id,
        })
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
