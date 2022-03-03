import axios from "axios";
import { PROFILE_URL } from "../urls";

const state = {
    email: "",
    firstName: "",
    fullName: "",
    id: "",
    lastName: "",
    mailcode: "",
    mailcodeId: -1,
    manage_mailcodes: [],
    roles: [],
};

const getters = {
    email: (state) => state.email,
    firstName: (state) => state.firstName,
    fullName: (state) => state.fullName,
    id: (state) => state.id,
    lastName: (state) => state.lastName,
    mailcode: (state) => state.mailcode,
    mailcodeId: (state) => state.mailcodeId,
    manage_mailcodes: (state) => state.manage_mailcodes,
    roles: (state) => state.roles,
};
const actions = {
    loadProfile({ commit }) {
        return axios
            .get(PROFILE_URL)
            .then((resp) => {
                commit("setProfile", resp.data.data);
            })
            .catch(() => {
                commit("clearProfile");
            });
    },
};
const mutations = {
    setProfile(state, profile) {
        state.email = profile.email;
        state.firstName = profile.first_name;
        state.fullName = profile.display_name;
        state.lastName = profile.last_name;
        state.mailcode = profile.mailcode;
        state.mailcodeId = profile.mailcodeId;
        state.manage_mailcodes = profile.manage_mailcodes;
        state.roles = profile.roles;
        state.status = profile.status;
    },
    clearProfile(state) {
        Object.assign(state, {
            email: "",
            firstName: "",
            fullName: "",
            id: "",
            lastName: "",
            mailcode: "",
            mailcodeId: -1,
            manage_mailcodes: [],
            roles: [],
        });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
