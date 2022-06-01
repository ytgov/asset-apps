<template>
	<div class="home">
		<admin-sidebar></admin-sidebar>
		<h1>Administration: <small>Transfers</small></h1>

		<div class="row">
			<div class="col-md-12">
				<v-card class="mt-5 default">
					<v-card-text>
						<v-row>
							<v-col cols="10">
								<div class="row">
									<div class="col-md-6">
										<v-text-field
											v-model="search"
											dense
											outlined
											background-color="white"
											label="Search"
											prepend-icon="mdi-magnify"
											@change="loadList(true)"
											hide-details
										></v-text-field>
									</div>
									<div class="col-md-6">
										<v-select
											v-model="conditions"
											dense
											outlined
											background-color="white"
											label="Condition"
											@change="loadList(true)"
											:items="assetConditionOptions"
											hide-details
											multiple
											clearable
										></v-select>
									</div>

									<div class="col-md-6">
										<v-autocomplete
											dense
											outlined
											background-color="white"
											label="From"
											v-model="fromOwners"
											:items="ownerOptions"
											item-text="display_name"
											item-value="id"
											multiple
											clearable
											@change="loadList(true)"
										>
										</v-autocomplete>
									</div>
									<div class="col-md-6">
										<v-autocomplete
											dense
											outlined
											background-color="white"
											label="To"
											v-model="toOwners"
											:items="ownerOptions"
											item-text="display_name"
											item-value="id"
											multiple
											clearable
											@change="loadList(true)"
										>
										</v-autocomplete>
									</div>
								</div>
							</v-col>

							<v-col>
								<v-btn
									color="primary"
									small
									class="mt-0"
									style="width: 100%"
									@click="addInbound"
									><v-icon class="mr-3">mdi-redo</v-icon>Inbound
								</v-btn>

								<v-btn
									color="info"
									small
									class="mt-0"
									style="width: 100%"
									@click="addOutbound"
									><v-icon class="mr-3">mdi-undo</v-icon>Outbound
								</v-btn>

								<v-btn
									color="warning"
									small
									class="my-0"
									style="width: 100%"
									@click="addDisposal"
									><v-icon class="mr-3">mdi-delete</v-icon>Disposal
								</v-btn>
							</v-col>
						</v-row>

						<v-data-table
							:items="items"
							:search="search"
							:options.sync="options"
							:server-items-length="itemCount"
							:loading="loading"
							:headers="[
								{ text: 'Date', value: 'transfer_date', width: '120px' },
								{ text: 'Tag', value: 'asset_item.tag' },
								{ text: 'Description', value: 'description' },
								{ text: 'From', value: 'from_owner.display_name' },
								{ text: 'To', value: 'to_owner.display_name' },
								{ text: 'Condition', value: 'condition' },
								{ text: 'Requester', value: 'request_user' },
								{ text: 'TCA', value: 'is_tca' },
							]"
							@click:row="rowClick"
							class="row-clickable"
							:footer-props="{ 'items-per-page-options': [10, 30, 100] }"
						>
							<template v-slot:item.request_user="{ item }">
								<a :href="'mailto:' + item.request_user" @click.stop="ignore">{{
									item.request_user
								}}</a>
							</template>
							<template v-slot:item.is_tca="{ item }">
								{{ item.is_tca ? 'Yes' : 'No' }}
							</template>
						</v-data-table>
					</v-card-text>
				</v-card>
			</div>
		</div>

		<transfer-creator
			ref="transferCreator"
			:onSave="saveComplete"
		></transfer-creator>
		<transfer-editor
			ref="transferEditor"
			:onSave="saveComplete"
		></transfer-editor>
		<notifications ref="notifier"></notifications>
	</div>
</template>

<script>
import axios from 'axios';
import _ from 'lodash';
import { mapGetters } from 'vuex';

import { TRANSFER_URL, OWNER_URL } from '../../urls';

export default {
	name: 'Transfers',
	data: () => ({
		search: '',
		loading: false,
		itemCount: 0,
		items: [],
		options: {},
		conditions: [],
		ownerOptions: [],
		fromOwners: [],
		toOwners: [],
	}),
	created() {
		this.loadOwners();

		let fp = this.$route.query.owner;

		if (fp && fp.length > 0) {
			console.log('PF', fp);
			this.fromOwners.push(parseInt(fp));
		}
	},
	computed: {
		...mapGetters(['assetConditionOptions', 'defaultAssetOwner']),
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
		loadList(resetPage) {
			this.loading = true;

			if (resetPage) this.options.page = 1;

			let body = _.clone(this.options);

			body.query = [];

			if (this.search.trim().length > 0)
				body.query.push({
					fields: [
						'asset_item.tag',
						'asset_category.description',
						'asset_transfer.description',
					],
					operator: 'contains',
					value: this.search,
				});

			if (this.fromOwners.length > 0) {
				body.query.push({
					field: 'from_owner_id',
					operator: 'in',
					value: this.fromOwners.join(','),
				});
			}

			if (this.toOwners.length > 0) {
				body.query.push({
					field: 'to_owner_id',
					operator: 'in',
					value: this.toOwners.join(','),
				});
			}

			if (this.conditions.length > 0) {
				body.query.push({
					field: 'asset_transfer.condition',
					operator: 'in',
					value: this.conditions.join(','),
				});
			}

			axios
				.post(TRANSFER_URL, body)
				.then((resp) => {
					this.items = resp.data.data;
					this.itemCount = resp.data.meta.item_count;
					this.loading = false;
				})
				.catch((error) => {
					console.log('ERROR', error);
					this.loading = false;
				});
		},

		saveComplete(resp) {
			this.$refs.notifier.showAPIMessages(resp.data);
			this.loadList(false);
		},

		rowClick(item) {
			this.$refs.transferEditor.show(item);
		},

		ignore() {},

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

		addInbound() {
			this.$refs.transferCreator.showInbound({
				to_owner_id: this.defaultAssetOwner.id,
				rows: [
					{
						quantity: 1,
						type: 1,
						condition: 'Redistribute',
						icon: 'mdi-inbox-multiple',
					},
				],
			});
		},
		addOutbound() {
			this.$refs.transferCreator.showOutbound({
				from_owner_id: this.defaultAssetOwner.id,
				rows: [
					{
						quantity: 1,
						type: 1,
						condition: 'Active',
						icon: 'mdi-inbox-multiple',
					},
				],
			});
		},
		addDisposal() {
			this.$refs.transferCreator.showDisposal({
				to_owner_id: this.defaultAssetOwner.id,
				rows: [
					{
						quantity: 1,
						type: 1,
						condition: 'Recycle',
						icon: 'mdi-inbox-multiple',
					},
				],
			});
		},
	},
};
</script>
