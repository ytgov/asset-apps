<template>
  <v-navigation-drawer v-model="drawer" temporary absolute right width="700px">
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
        <div class="col-md-4">
          <v-select
            label="Action"
            :items="['Inbound', 'Outbound', 'Disposal']"
            v-model="action"
            outlined
            dense
          >
          </v-select>
        </div>
        <div class="col-md-8">
          <v-autocomplete
            v-if="action != 'Outbound'"
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

          <v-autocomplete
            v-if="action == 'Outbound'"
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
      </div>
      <div class="row" v-for="(row, idx) of item.rows" :key="idx">
        <div class="col-sm-1">
          <v-btn icon color="primary" @click="changeType(row)" class="my-0"
            ><v-icon>{{ row.icon }}</v-icon></v-btn
          >
        </div>

        <div class="col-sm-4">
          <v-autocomplete
            dense
            outlined
            :items="assetTypeOptions"
            item-text="description"
            item-value="id"
            label="Type of item"
            hide-details
            v-model="row.type"
            v-if="row.icon != 'mdi-tag'"
          ></v-autocomplete>
          <v-text-field
            dense
            outlined
            label="Departmental tag"
            hide-details
            v-model="row.tag"
            v-if="row.icon == 'mdi-tag'"
          ></v-text-field>
        </div>
        <div class="col-sm-2">
          <v-text-field
            dense
            outlined
            label="Quantity"
            type="number"
            hide-details
            v-model="row.quantity"
            min="1"
          ></v-text-field>
        </div>
        <div class="col-sm-3" v-if="action != 'Outbound'">
          <v-select
            v-if="action != 'Disposal'"
            dense
            outlined
            label="Condition"
            hide-details
            v-model="row.condition"
            :items="conditionOptions"
          ></v-select>

          <v-autocomplete
            v-if="action == 'Disposal'"
            dense
            outlined
            label="Disposal type"
            :items="disposalOptions"
            v-model="row.condition"
            hide-details
          ></v-autocomplete>
        </div>
        <div class="col-md-2 text-right" v-if="isNew">
          <v-btn @click="addRow" fab x-small color="info" class="my-0 mr-2">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn
            @click="removeRow(idx)"
            fab
            x-small
            color="warning"
            class="my-0"
          >
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </div>
      </div>

      <v-btn
        @click="save"
        color="primary"
        class="float-right"
        :disabled="!isValid"
        >Save</v-btn
      >
      <!-- <v-btn @click="save" color="primary" class="float-right"
        >Save and new</v-btn
      > -->
    </v-sheet>
  </v-navigation-drawer>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import store from "../store";
import { OWNER_URL, TRANSFER_URL } from "../urls";

export default {
  computed: {
    mailcodeOptions: function () {
      return store.getters.mailcodeOptions;
    },
    assetTypeOptions: function () {
      return store.getters.assetTypeOptions;
    },
    transferDirectionIcon: function () {
      if (this.transferDirection) return "mdi-redo";
      return "mdi-undo";
    },
    transferDirectionName: function () {
      if (this.transferDirection) return "Inbound transfer";
      return "Outbound transfer";
    },
    isValid: function () {
      for (let row of this.item.rows) {
        if (row.icon != "mdi-tag" && !row.type) return false;

        if (row.icon == "mdi-tag" && !row.tag) return false;
      }

      if (this.action == "Inbound" && this.item.from_owner_id) return true;
      else if (this.action == "Outbound" && this.item.to_owner_id) return true;
      else if (this.action == "Disposal" && this.item.from_owner_id)
        return true;

      return false;
    },
  },
  props: ["onSave"],
  data: () => ({
    disposalOptions: ["Recycle", "Sold", "CFS", "Donation", "Destruction"],
    conditionOptions: [
      "Redistribute",
      "Recycle",
      "Sold",
      "CFS",
      "Donation",
      "Destruction",
    ],
    ownerOptions: [],

    drawer: null,
    item: { rows: [] },
    isNew: false,

    action: "Inbound",

    tIcon: "mdi-inbox-multiple",
  }),
  created() {
    this.loadList();
  },
  methods: {
    show(item) {
      this.item = _.clone(item);
      this.drawer = true;
      this.isNew = false;
    },
    showInbound(item) {
      this.item = _.clone(item);
      this.action = "Inbound";
      this.isNew = true;
      this.drawer = true;
    },
    showOutbound(item) {
      this.item = _.clone(item);
      this.action = "Outbound";
      this.isNew = true;
      this.drawer = true;
    },
    showDisposal(item) {
      this.item = _.clone(item);
      this.action = "Disposal";
      this.isNew = true;
      this.drawer = true;
    },
    hide() {
      this.item = {};
      this.drawer = false;
    },

    addRow() {
      let lastRow = this.item.rows[this.item.rows.length - 1];

      if (lastRow)
        this.item.rows.push({
          condition: lastRow.condition,
          quantity: 1,
          icon: lastRow.icon,
        });
    },
    removeRow(idx) {
      if (this.item.rows.length > 1) this.item.rows.splice(idx, 1);
    },

    changeType(row) {
      if (row.icon == "mdi-tag") {
        row.icon = "mdi-inbox-multiple";
      } else {
        row.icon = "mdi-tag";
      }
    },

    loadList() {
      this.is_loading = true;
      axios
        .get(OWNER_URL)
        .then((resp) => {
          this.ownerOptions = resp.data.data;
          this.is_loading = false;
        })
        .catch((error) => {
          console.log("ERROR", error);
          this.is_loading = false;
        });
    },
    save() {
      let body = _.clone(this.item);
      body.action = this.action;

      body.rows.forEach((row) => {
        row.quantity = parseInt(row.quantity || 1);

        if (row.icon == "mdi-tag") row.type = null;
        else row.tag = null;
      });

      if (this.item.id) {
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
          });
      } else {
        axios.post(`${TRANSFER_URL}/transfer`, body).then((resp) => {
          console.log(resp);
          this.onSave(resp);

          if (this.action == "Inbound") {
            this.item.from_owner_id = null;
            this.item.rows = [
              {
                quantity: 1,
                condition: "Redistribute",
                type: 1,
                icon: "mdi-inbox-multiple",
              },
            ];
          }
          if (this.action == "Outbound") {
            this.item.to_owner_id = null;
            this.item.rows = [
              {
                quantity: 1,
                condition: "Active",
                type: 1,
                icon: "mdi-inbox-multiple",
              },
            ];
          }
        });
      }
    },
  },
};
</script>
