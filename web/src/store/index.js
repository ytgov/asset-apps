import Vue from "vue";
import Vuex from "vuex";

import http from "@/utils/http-client";
import { ASSET_URL, ASSET_PURCHASE_TYPES_URL, OWNER_URL } from "@/urls";

import auth from "./auth";
import profile from "./profile";

Vue.use(Vuex);

export default new Vuex.Store({
  getters: {
    defaultAssetOwner: (state) =>
      state.mailcodeOptions.find((o) => o.default_owner === true),
    assetConditionOptions: () => [
      "Active",
      "Redistribute",
      "Recycle",
      "Sold",
      "CFS",
      "Donation",
      "Destruction",
      "Unknown",
      "Missing / stolen",
      "REQUEST: Obsolete",
      "REQUEST: Good",
      "REQUEST: Beyond repair",
      "REQUEST: Missing / stolen"
    ],
    assetPurchaseTypeOptions: (state) => state.assetPurchaseTypeOptions,
    mailcodeOptions: (state) => state.mailcodeOptions,
    assetTypeOptions: (state) => state.assetTypeOptions,
  },
  state: {
    mailcodeOptions: [],
    assetPurchaseTypeOptions: [],
    assetTypeOptions: [],
  },
  mutations: {
    setMailcodeOptions(state, value) {
      state.mailcodeOptions = value;
    },
    setAssetPurchaseTypeOptions(state, value) {
      state.assetPurchaseTypeOptions = value;
    },
    setAssetTypeOptions(state, value) {
      state.assetTypeOptions = value;
    },
  },
  actions: {
    initialize() {
      console.log("Initializing Store");
      this.dispatch("loadMailcodes");
      this.dispatch("loadAssetPurchaseTypeOptions");
      this.dispatch("loadAssetTypeOptions");
    },

    loadMailcodes({ commit }) {
      http.get(OWNER_URL).then((resp) => {
        commit("setMailcodeOptions", resp.data.data);
      });
    },
    loadAssetPurchaseTypeOptions({ commit }) {
      http.get(ASSET_PURCHASE_TYPES_URL).then((resp) => {
        commit("setAssetPurchaseTypeOptions", resp.data.data);
      });
    },
    loadAssetTypeOptions({ commit }) {
      http.get(`${ASSET_URL}/asset-category`).then((resp) => {
        commit("setAssetTypeOptions", resp.data.data);
      });
    },
  },
  modules: { auth, profile },
});
