import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import vuetify from "./plugins/vuetify";
import VueCurrencyInput from 'vue-currency-input'

import Notifications from "./components/Notifications";
import UserEditor from "./components/UserEditor";

import AssetRegisterForm from "./components/AssetRegisterForm";
import AssetTransferForm from "./components/AssetTransferForm";
import AssetLookupForm from "./components/AssetLookupForm";
import MailcodeLookupForm from "./components/MailcodeLookupForm";

Vue.config.productionTip = false;

axios.defaults.withCredentials = true;

Vue.component("notifications", Notifications);
Vue.component("user-editor", UserEditor);

Vue.component("asset-register-form", AssetRegisterForm);
Vue.component("asset-transfer-form", AssetTransferForm);
Vue.component("asset-lookup-form", AssetLookupForm);
Vue.component("mailcode-lookup-form", MailcodeLookupForm);

Vue.use(VueCurrencyInput, { globalOptions: { currency: 'USD', locale: 'en' } });

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
