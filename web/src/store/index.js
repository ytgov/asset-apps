import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import { OWNER_URL } from "../urls";

import auth from "./auth";
import profile from "./profile";

Vue.use(Vuex);

export default new Vuex.Store({
  getters: {
    mailcodeOptions: state => state.mailcodeOptions,
  },
  state: {
    mailCodeOptions: []
  },
  mutations: {
    SET_MAILCODEOPTIONS(state, value) {
      state.mailcodeOptions = value;
    }
  },
  actions: {
    initialize() {
      console.log("Initializing Store")
      this.dispatch("loadMailcodes");
    },

    loadMailcodes({ commit }) {
      axios.get(`${OWNER_URL}`)
        .then(resp => { commit("SET_MAILCODEOPTIONS", resp.data.data) });
    }
  },
  modules: { auth, profile }
});
