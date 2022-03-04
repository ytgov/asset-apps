<template>
  <v-dialog width="87%" v-model="dialog">
    <v-card>
      <div>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon>mdi-pipe-wrench</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>New History Entry</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-sheet class="mx-5 mt-5">
          <v-row>
            <v-col cols="4">
              <v-select
                dense
                hide-details
                :items="entryType"
                label="Entry type"
                outlined
                v-model="entry.entry_type"
              ></v-select>
            </v-col>
            <v-col cols="8">
              <v-textarea
                dense
                auto-grow
                outlined
                label="Notes"
                hide-details
                rows="1"
                v-model="entry.description"
              ></v-textarea
            ></v-col>
            <v-col cols="12" class="text-right">
              <v-btn @click="deleteAssetHistoryEntry" color="red">Delete</v-btn>
              <v-btn @click="addAssetHistoryEntry" color="primary" class="ml-3"
                >Save</v-btn
              >
            </v-col>
          </v-row>
        </v-sheet>
      </div>
    </v-card>
  </v-dialog>
</template>
<script>
import { ASSET_HISTORY_URL } from "../urls";
import axios from "axios";
export default {
  name: "HistoryEdit",
  data() {
    return {
      entryType: ["Note", "Description", "Report"],
      entry: {},
      dialog: false,
      asset: {},
    };
  },
  props: {
    refreshAssetEditor: { type: Function },
  },
  computed: {},
  methods: {
    show(item) {
      this.dialog = true;
      this.asset = item;
      this.entry.history_entry_id = item.history_entry_id;
      this.entry.description = item.description;
      this.entry.entry_type = item.entry_type;
    },
    addAssetHistoryEntry() {
      //do a put if there's an id
      axios
        .post(`${ASSET_HISTORY_URL}/${this.asset.asset_id}`, this.entry)
        .then((resp) => {
          this.entries = resp.data.data;
          this.dialog = false;
          this.refreshAssetEditor();
        })
        .catch((error) => {
          console.log("ERROR", error);
        });
    },
    deleteAssetHistoryEntry() {
      //do a put if there's an id
      axios
        .delete(
          `${ASSET_HISTORY_URL}/assetHistoryEntry/${this.entry.history_entry_id}`
        )
        .then(() => {
          this.dialog = false;
          this.refreshAssetEditor();
        })
        .catch((error) => {
          console.log("ERROR", error);
        });
    },
  },
};
</script>