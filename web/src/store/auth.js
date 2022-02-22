import axios from "axios";

import { AUTH_CHECK_URL, LOGOUT_URL } from "../urls";

const state = {
    isAuthenticated: false,
};
const getters = {
    isAuthenticated: (state) => state.isAuthenticated,
};
const actions = {
    async checkAuthentication({ commit }) {
        await axios
            .get(AUTH_CHECK_URL)
            .then((resp) => {
                commit("setIsAuthenticated", resp.data.data);
            })
            .catch(() => {
                commit("setIsAuthenticated", false);
                commit("clearProfile");
            });
    },
    async signOut({ commit }) {
        await axios
            .get(LOGOUT_URL)
            .then(() => {
                commit("clearProfile");
            })
            .catch((error) => {
                console.error(error);
            });
    },
};
const mutations = {
    setIsAuthenticated(state, value) {
        state.isAuthenticated = value;
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
};
