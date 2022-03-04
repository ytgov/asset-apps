import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import vuetify from "./plugins/vuetify";
import VueCurrencyInput from 'vue-currency-input'

import Notifications from "./components/Notifications";
import UserEditor from "./components/UserEditor";
import OwnerEditor from "./components/OwnerEditor";
import TransferCreator from "./components/transfers/TransferCreator";
import TransferEditor from "./components/transfers/TransferEditor";
import AssetEditor from "./components/AssetEditor";
import AssetEditorLimited from "./components/AssetEditorLimited";

import AssetRegisterForm from "./components/AssetRegisterForm";
import AssetTransferForm from "./components/AssetTransferForm";
import AssetLookupForm from "./components/AssetLookupForm";
import MailcodeLookupForm from "./components/MailcodeLookupForm";
import MailcodeSelect from "./components/MailcodeSelect";

import AdministrationSidebar from "./components/AdministrationSidebar";

Vue.config.productionTip = false;

axios.defaults.withCredentials = true;

Vue.component("notifications", Notifications);
Vue.component("user-editor", UserEditor);
Vue.component("owner-editor", OwnerEditor);
Vue.component("transfer-creator", TransferCreator);
Vue.component("transfer-editor", TransferEditor);
Vue.component("asset-editor", AssetEditor);
Vue.component("asset-editor-limited", AssetEditorLimited);

Vue.component("asset-register-form", AssetRegisterForm);
Vue.component("asset-transfer-form", AssetTransferForm);
Vue.component("asset-lookup-form", AssetLookupForm);
Vue.component("mailcode-lookup-form", MailcodeLookupForm);
Vue.component("mailcode-select", MailcodeSelect);
Vue.component("admin-sidebar", AdministrationSidebar);

Vue.use(VueCurrencyInput, { globalOptions: { currency: 'USD', locale: 'en' } });

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
