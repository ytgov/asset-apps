<template>
	<div class="home">
		<admin-sidebar></admin-sidebar>
		<h1>Administration: <small>Reports</small></h1>

		<div class="row">
			<div class="col-md-12">
				<v-card class="mt-5 default">
					<v-card-text>
						<v-row>
							<v-col cols="4">
								<v-select
									v-model="reportType"
									dense
									outlined
									background-color="white"
									label="Report type"
									hide-details
									:items="['Assets', 'Transfers']"
								>
								</v-select>
							</v-col>

							<v-col cols="4" v-if="reportType == 'Transfers'">
								<v-menu
									v-model="startDateMenu"
									:close-on-content-click="false"
									transition="scale-transition"
									left
									nudge-top="26"
									offset-y
									min-width="auto"
								>
									<template v-slot:activator="{ on, attrs }">
										<v-text-field
											v-model="startDate"
											label="Period start date"
											append-icon="mdi-calendar"
											hide-details
											readonly
											outlined
											dense
											background-color="white"
											v-bind="attrs"
											v-on="on"
										></v-text-field>
									</template>
									<v-date-picker
										v-model="startDate"
										@input="startDateMenu = false"
									></v-date-picker> </v-menu
							></v-col>
							<v-col cols="4" v-if="reportType == 'Transfers'">
								<v-menu
									v-model="endDateMenu"
									:close-on-content-click="false"
									transition="scale-transition"
									left
									nudge-top="26"
									offset-y
									min-width="auto"
								>
									<template v-slot:activator="{ on, attrs }">
										<v-text-field
											v-model="endDate"
											label="Period end date"
											append-icon="mdi-calendar"
											readonly
											outlined
											dense
											hide-details
											background-color="white"
											v-bind="attrs"
											v-on="on"
										></v-text-field>
									</template>
									<v-date-picker
										v-model="endDate"
										@input="endDateMenu = false"
									></v-date-picker> </v-menu
							></v-col>
							<v-col v-if="reportType == 'Assets'">
								<v-select
									label="Owner"
									v-model="owners"
									:items="ownerOptions"
									dense
									multiple
									outlined
									background-color="white"
									item-text="display_name"
									item-value="id"
									clearable
									hide-details
								>
								</v-select>
							</v-col>
							<v-col v-if="reportType == 'Assets'">
								<v-select
									dense
									outlined
									background-color="white"
									multiple
									label="Status"
									:items="statusOptions"
									v-model="statuses"
									clearable
									hide-details
								></v-select>
							</v-col>
							<v-col v-if="reportType == 'Transfers'">
								<v-select
									dense
									outlined
									background-color="white"
									multiple
									label="Condition"
									:items="statusOptions"
									v-model="conditions"
									clearable
									hide-details
								></v-select>
							</v-col>
							<v-col v-if="reportType == 'Transfers'">
								<v-autocomplete
									dense
									outlined
									background-color="white"
									multiple
									label="Transfer from"
									:items="ownerOptions"
									v-model="fromOwnerIds"
									item-text="display_name"
									item-value="id"
									clearable
									hide-details
								></v-autocomplete>
							</v-col>
							<v-col v-if="reportType == 'Transfers'">
								<v-autocomplete
									dense
									outlined
									background-color="white"
									multiple
									label="Transfer to"
									:items="ownerOptions"
									v-model="toOwnerIds"
									item-text="display_name"
									item-value="id"
									clearable
									hide-details
								></v-autocomplete>
							</v-col>
							<v-col v-if="reportType == 'Transfers'">
								<v-select
									dense
									outlined
									background-color="white"
									label="TCA"
									:items="['Any', 'Yes', 'No']"
									v-model="tcaStatus"
									required
									hide-details
								></v-select>
							</v-col>
						</v-row>

						<v-btn color="primary" @click="generateClick"
							>Generate report</v-btn
						>
					</v-card-text>
				</v-card>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import { ASSET_URL, OWNER_URL, TRANSFER_URL } from '@/urls';

export default {
	name: 'Home',
	data: () => ({
		reportType: 'Assets',
		startDate: '',
		startDateMenu: null,
		endDate: '',
		endDateMenu: null,

		statuses: ['Active'],
		owners: [],
		ownerOptions: [],

		conditions: [],
		fromOwnerIds: [],
		toOwnerIds: [],
		tcaStatus: 'Any',
	}),
	mounted() {
		this.loadOwners();
		let year = new Date().getFullYear();
		this.startDate = `${year - 1}-04-01`;
		this.endDate = `${year}-03-31`;
	},
	computed: {
		...mapGetters({ statusOptions: 'assetConditionOptions' }),
	},
	watch: {
		options: {
			handler() {
				this.loadList(false);
			},
			deep: true,
		},
	},
	methods: {
		generateClick() {
			console.log(
				`Generating ${this.reportType} report - ${this.startDate} - ${this.endDate}`
			);

			if (this.reportType == 'Assets') {
				let owners = '';

				if (this.owners && this.owners.length > 0)
					owners = this.owners.join(',');

				let statuses = '';

				if (this.statuses && this.statuses.length > 0)
					statuses = this.statuses.join(',');

				window.open(
					`${ASSET_URL}/asset-report-export?owners=${owners}&statuses=${statuses}`
				);
			} else {
				let conditions = '';

				if (this.conditions && this.conditions.length > 0)
					conditions = this.conditions.join(',');

				let fromOwnerIds = '';

				if (this.fromOwnerIds && this.fromOwnerIds.length > 0)
					fromOwnerIds = this.fromOwnerIds.join(',');

				let toOwnerIds = '';

				if (this.toOwnerIds && this.toOwnerIds.length > 0)
					toOwnerIds = this.toOwnerIds.join(',');

				window.open(
					`${TRANSFER_URL}/transfer-report-export?startDate=${this.startDate}&endDate=${this.endDate}&conditions=${conditions}&fromOwnerIds=${fromOwnerIds}&toOwnerIds=${toOwnerIds}&tcaStatus=${this.tcaStatus}`
				);
			}
		},

		loadOwners() {
			axios
				.get(OWNER_URL)
				.then((resp) => {
					this.ownerOptions = resp.data.data;
				})
				.catch((error) => {
					console.log('ERROR', error);
				});
		},
	},
};
</script>
