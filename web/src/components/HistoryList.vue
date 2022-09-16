<template>
	<v-navigation-drawer v-model="drawer" temporary absolute right width="60%">
		<v-list-item>
			<v-list-item-avatar>
				<v-icon>mdi-dolly</v-icon>
			</v-list-item-avatar>

			<v-list-item-content>
				<v-list-item-title>Asset</v-list-item-title>
			</v-list-item-content>
		</v-list-item>
		<v-divider></v-divider>
		<v-sheet class="mx-5 mt-5">
			<!-- <v-data-table
				disable-pagination
				:hide-default-footer="true"
				:headers="headers"
				:items="entries"
				item-key="name"
				class="elevation-1"
			>
				<template v-slot:item="{ item }">
					<tr @click="show(item)">
						<td>{{ item.date }}</td>
						<td>{{ item.user_email }}</td>
						<td>{{ item.entry_type }}</td>
						<td>{{ item.description }}</td>
					</tr>
				</template>
			</v-data-table>
			<v-btn color="primary" class="float-right" @click="show({})">
				Add Entry
			</v-btn>
			<HistoryEdit :refreshAssetEditor="refreshAssetEditor" ref="historyEdit" /> -->
		</v-sheet>
	</v-navigation-drawer>
</template>

<script>
// import HistoryEdit from './HistoryEdit.vue';
import { ASSET_HISTORY_URL } from '../urls';
import axios from 'axios';
import _ from 'lodash';
export default {
	name: 'HistoryList',
	components: {
		// HistoryEdit,
	},
	props: {
		// refreshAssetEditor: { type: Function },
	},
	data() {
		return {
			drawer: null,
			item: {},
		};
		// return {
		// 	entries: [],
		// 	asset_id: '',
		// };
	},
	computed: {
		// headers() {
		// 	return [
		// 		{
		// 			text: 'Date',
		// 			align: 'start',
		// 			value: 'date',
		// 			width: '15%',
		// 			class: 'no-wrap',
		// 		},
		// 		{ text: 'User', value: 'user_email', width: '1%' },
		// 		{ text: 'Type', value: 'entry_type', width: '1%' },
		// 		{ text: 'Notes', value: 'description' },
		// 	];
		// },
	},
	mounted() {
		// this.getAssetHistory(this.assetId);
	},
	watch: {
		// assetId: function (val) {
		// 	this.getAssetHistory(val);
		// },
	},
	methods: {
		show(item) {
			this.item = _.clone(item);
			this.drawer = true;
			console.log(this.item);
			this.getAssetHistory(this.item.id);
		},
		getAssetHistory(assetId) {
			axios
				.get(`${ASSET_HISTORY_URL}/${assetId}`)
				.then((resp) => {
					console.log('resp: ', resp.data.data);
				})
				.catch((error) => {
					console.log('ERROR', error);
				});
		},
		// show(item) {
		// 	item.asset_id = this.asset_id;
		// 	this.$refs.historyEdit.show(item);
		// },
	},
};
</script>