<template>
  <div>
    <admin-sidebar></admin-sidebar>
    <h1>Administration: <small>Manage Owners</small></h1>

    <div class="row">
      <div class="col-md-12">
        <v-card class="mt-5 default">
          <v-card-text>
            <v-row>
              <v-col cols="10">
                <v-text-field
                  v-model="search"
                  dense
                  outlined
                  background-color="white"
                  label="Search"
                  prepend-icon="mdi-magnify"
                ></v-text-field>
              </v-col>

              <v-col>
                <v-btn
                  color="primary"
                  class="my-0"
                  style="width: 100%"
                  @click="addOwner"
                  >Add</v-btn
                >
              </v-col>
            </v-row>

            <v-data-table
              :items="items"
              :search="search"
              
              :headers="[
                { text: 'Mail Code', value: 'mailcode' },
                { text: 'Name', value: 'name' },
                { text: 'Department', value: 'department' },
                { text: 'Division', value: 'division' },
                { text: 'Branch', value: 'branch' },
              ]"
              @click:row="rowClick"
              class="row-clickable"
              :footer-props="{ 'items-per-page-options': [20, 50, 100, -1] }"
            ></v-data-table>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <owner-editor ref="editor" :onSave="saveComplete"></owner-editor>
    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import axios from "axios";
import { OWNER_URL } from "../../urls";
export default {
  name: "Home",
  data: () => ({
    search: "",
    is_loading: false,

    items: [],
    editItem: null,
    toLoad: null,
  }),
  created() {
    this.loadList();

    let sel = this.$route.hash || "";
    sel = sel.replace("#", "");

    if (sel.length > 0) {
      this.toLoad = sel;
    }
  },
  methods: {
    loadList() {
      this.is_loading = true;
      axios
        .get(OWNER_URL)
        .then((resp) => {
          this.items = resp.data.data;
          this.is_loading = false;

          if (this.toLoad) {
            let items = this.items.filter((i) => i.id == parseInt(this.toLoad));

            if (items.length == 1) {
              console.log("ITEM", items[0]);
              this.toLoad = null;
              this.rowClick(items[0]);
            }
          }
        })
        .catch((error) => {
          console.log("ERROR", error);
          this.is_loading = false;
        });
    },

    addOwner() {
      this.$refs.editor.show({ name: "New owner" });
    },

    saveComplete(resp) {
      this.$refs.notifier.showAPIMessages(resp.data);
      this.loadList();
    },

    rowClick(item) {
      this.$refs.editor.show(item);
    },
  },
};
</script>
