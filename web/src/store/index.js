import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import { ASSET_URL, OWNER_URL } from "../urls";

import auth from "./auth";
import profile from "./profile";

Vue.use(Vuex);

export default new Vuex.Store({
  getters: {
    defaultAssetOwner: (state) =>
      state.mailcodeOptions.find((o) => o.default_owner === true),
    mailcodeOptions: (state) => state.mailcodeOptions,
    assetConditionOptions: (state) => state.assetConditionOptions,
    assetTypeOptions: (state) => state.assetTypeOptions,
  },
  state: {
    mailcodeOptions: [],
    assetConditionOptions: [],
    assetTypeOptions: [],
  },
  mutations: {
    setMailcodeOptions(state, value) {
      state.mailcodeOptions = value;
    },
    SET_ASSETCONDITIONOPTIONS(state, value) {
      state.assetConditionOptions = value;
    },
    setAssetTypeOptions(state, value) {
      state.assetTypeOptions = value;
    },
  },
  actions: {
    initialize() {
      console.log("Initializing Store");
      this.dispatch("loadMailcodes");
      this.dispatch("loadAssetConditionOptions");
      this.dispatch("loadAssetTypeOptions");
    },

    loadMailcodes({ commit }) {
      axios.get(`${OWNER_URL}`).then((resp) => {
        commit("setMailcodeOptions", resp.data.data);
      });
    },
    loadAssetConditionOptions({ commit }) {
      // In the future consider loading this from the database.
      commit("SET_ASSETCONDITIONOPTIONS", [
        "Active",
        "Redistribute",
        "Recycle",
        "Sold",
        "CFS",
        "Donation",
        "Destruction",
        "Unknown",
        "REQUEST: Obsolete",
        "REQUEST: Good",
        "REQUEST: Beyond repair",
      ]);
    },
    loadAssetTypeOptions({ commit }) {
      axios.get(`${ASSET_URL}/asset-category`).then((resp) => {
        commit("setAssetTypeOptions", resp.data.data);
      });
    },
  },
  modules: { auth, profile },
});
