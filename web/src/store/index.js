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
    assetTypeOptions: (state) => state.assetTypeOptions,
  },
  state: {
    mailcodeOptions: [],
    assetTypeOptions: [],
  },
  mutations: {
    setMailcodeOptions(state, value) {
      state.mailcodeOptions = value;
    },
    setAssetTypeOptions(state, value) {
      state.assetTypeOptions = value;
    },
  },
  actions: {
    initialize() {
      console.log("Initializing Store");
      this.dispatch("loadMailcodes");
      this.dispatch("loadAssetTypeOptions");
    },

    loadMailcodes({ commit }) {
      axios.get(`${OWNER_URL}`).then((resp) => {
        commit("setMailcodeOptions", resp.data.data);
      });
    },
    loadAssetTypeOptions({ commit }) {
      axios.get(`${ASSET_URL}/asset-category`).then((resp) => {
        commit("setAssetTypeOptions", resp.data.data);
      });
    },
  },
  modules: { auth, profile },
});
