import axios from "axios";
import { PROFILE_URL } from "../urls";

const state = {
    firstName: "",
    lastName: "",
    email: "",
    id: "",
    username: "",
    mailcode: "",
    roles: "",
    manage_mailcodes: "",
};
const getters = {
    firstName: state => state.firstName,
    lastName: state => state.lastName,
    email: state => state.email,
    id: state => state.id,
    username: state => state.username,
    mailcode: state => state.mailcode,
    roles: state => state.roles,
    manage_mailcodes: state => state.manage_mailcodes,
};
const actions = {
    async loadProfile({ commit }) {
        await axios.get(PROFILE_URL)
            .then(resp => {
                commit("setProfile", resp.data.data);
            }).catch(() => {
                commit("clearUser");
            });
    },
};
const mutations = {
    setProfile(state, profile) {
        state.firstName = profile.first_name;
        state.lastName = profile.last_name;
        state.email = profile.email;
        state.status = profile.status;
        state.mailcode = profile.mailcode;
        state.roles = profile.roles;
        state.manage_mailcodes = profile.manage_mailcodes;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};