<template>
  <div class="home">
    <h1>My Tags</h1>
    <p>These are the tags that you have requested.</p>
    <hr />

    <v-data-table
      dense
      class="row-clickable"
      :headers="[
        { text: 'Asset tag', value: 'tag', width: '150px' },
        { text: 'Purchase date', value: 'purchase_date', width: '160px' },
        { text: 'Description', value: 'description' },
        { text: 'Make', value: 'make' },
        { text: 'Model', value: 'model' },
        { text: 'Serial Number', value: 'serial', width: '160px' },
      ]"
      :items="items"
      :loading="loading"
      :options.sync="options"
      :server-items-length="itemCount"
      :footer-props="{ 'items-per-page-options': [10, 30, 100] }"
      @click:row="openEditor"
    >
    </v-data-table>

    <notifications ref="notifier"></notifications>
    <MyTagsAssetEditor ref="editor" :on-save="onSave"></MyTagsAssetEditor>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { cloneDeep } from "lodash";

import http from "@/utils/http-client";
import { ASSET_URL } from "@/urls";

import MyTagsAssetEditor from "@/components/MyTagsAssetEditor";

export default {
  name: "MyTags",
  components: {
    MyTagsAssetEditor,
  },
  computed: {
    ...mapGetters("profile", { currentUserEmail: "email" }),
  },
  data: () => ({
    options: {
      page: 1,
      itemsPerPage: 10,
      sortBy: ["purchase_date"],
      sortDesc: ["asc"],
      groupBy: [],
      groupDesc: [],
      mustSort: false,
      multiSort: false,
    },
    items: [],
    itemCount: 0,
    loading: false,
  }),
  mounted() {
    this.loadProfile().then(() => {
      this.loadMyRequestedTags();
    });
  },
  watch: {
    options: {
      handler() {
        this.loadMyRequestedTags();
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions("profile", ["loadProfile"]),
    loadMyRequestedTags() {
      this.loading = true;

      return http
        .post(`${ASSET_URL}/query`, {
          ...cloneDeep(this.options),
          query: [
            {
              field: "purchase_person",
              operator: "eq",
              value: this.currentUserEmail,
            },
          ],
        })
        .then((resp) => {
          this.itemCount = resp.data.meta.item_count;
          this.items = resp.data.data;
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
          console.log("ERROR", error);
        });
    },

    openEditor(item) {
      this.$refs.editor.show(item);
    },
    onSave(resp) {
      this.$refs.notifier.showAPIMessages(resp.data);
      this.loadMyRequestedTags();
    },
  },
};
</script>
