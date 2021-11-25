<template>
  <v-autocomplete
    outlined
    dense
    label="Mail code"
    loading="isLoading"
    background-color="white"
    item-text="display_name"
    item-value="mailcode"
    :items="mailcodeOptions"
    v-model="mailcode"
    @change="change"
    hide-details
  ></v-autocomplete>
</template>

<script>
export default {
  name: "UserEditor",
  props: ["model", "change"],
  data: () => ({
    search: null,
    isLoading: null,
    count: 0,
    selectedItem: {},
    selected: {},
    mailcode: "",
    unsubscribe: null,
    mailcodeOptions: [],
  }),
  created() {
    this.mailcode = this.model;
    this.mailcodeOptions = this.$store.state.mailcodeOptions;

    if (this.mailcodeOptions == undefined || this.mailcodeOptions.length == 0) {
      this.unsubscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type === "SET_MAILCODEOPTIONS") {
          this.mailcodeOptions = state.mailcodeOptions;
        } else if (mutation.type === "profile/setProfile") {
          this.mailcode = this.$store.state.profile.mailcode;
        }
      });
    }
  },
  beforeDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  },
};
</script>
