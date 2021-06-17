<template>
  <div>
    <v-data-table
      :items="payments"
      :headers="[
        { text: 'Date', value: 'display_date' },
        { text: 'Amount', value: 'display_amount' },
        { text: 'Fiscal year', value: 'fiscal_year' },
        { text: 'Invoice Num', value: 'invoice' },
        { text: 'From Quest', value: 'from_quest' },
        { text: 'Notes', value: 'notes' },
      ]"
      @click:row="rowClick"
      ><template v-slot:item.from_quest="{ item }">
        <v-icon v-if="item.from_quest == 1">mdi-check</v-icon>
      </template>
    </v-data-table>

    <v-dialog v-model="showPaymentDialog" persistent max-width="600px">
      <v-container class="pb-3" style="background-color: white">
        <h3>Payment details</h3>

        <div class="row mt-5">
          <div class="col-md-6 py-0">
            <v-text-field
              label="Payment date"
              v-model="selectedItem.display_date"
              dense
              readonly
              outlined
              background-color="white"
            ></v-text-field>
          </div>
          <div class="col-md-6 py-0">
            <v-text-field
              label="GL Account"
              v-model="selectedItem.gl_account"
              dense
              readonly
              outlined
              background-color="white"
            ></v-text-field>
          </div>
          <div class="col-md-4 py-0">
            <v-text-field
              label="Fiscal year"
              v-model="selectedItem.fiscal_year"
              dense
              readonly
              outlined
              background-color="white"
            ></v-text-field>
          </div>
          <div class="col-md-4 py-0">
            <v-text-field
              label="Amount"
              v-model="selectedItem.display_amount"
              dense
              readonly
              outlined
              background-color="white"
            ></v-text-field>
          </div>
          <div class="col-md-4 py-0">
            <v-text-field
              label="Invoice num"
              v-model="selectedItem.invoice_num"
              dense
              readonly
              outlined
              background-color="white"
            ></v-text-field>
          </div>
          <div class="col-md-12 py-0">
            <v-textarea
              v-model="selectedItem.notes"
              dense
              outlined
              background-color="white"
              label="Notes"
            ></v-textarea>
          </div>
        </div>

        <v-btn color="primary" @click="save">Save</v-btn>
        <v-btn
          color="secondary"
          class="float-right"
          @click="showPaymentDialog = null"
          >Close</v-btn
        >
      </v-container>
    </v-dialog>
    
    <notifications ref="payNotifier"></notifications>
  </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import { PAYMENT_URL } from "../urls";

export default {
  name: "Home",
  props: ["payments"],
  data: () => ({
    showPaymentDialog: null,

    selectedItem: {},
    itemNotes: "",
  }),
  methods: {
    rowClick(item) {
      this.selectedItem = _.clone(item);
      this.showPaymentDialog = true;
    },
    save() {
      let body = _.clone(this.selectedItem);

      axios
        .put(`${PAYMENT_URL}/${this.selectedItem.id}`, body)
        .then((resp) => {
          this.$refs.payNotifier.showAPIMessages(resp.data);
          this.showPaymentDialog = null;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
