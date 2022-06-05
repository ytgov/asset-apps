<template>
	<div class="home">
		<admin-sidebar></admin-sidebar>
		<h1>Administration: <small>Tags</small></h1>

		<div class="row">
			<div class="col-md-12">
				<v-card class="mt-5 default">
					<v-card-text>
						<v-text-field
							v-model="search"
							dense
							outlined
							background-color="white"
							label="Search"
							prepend-icon="mdi-magnify"
							@change="loadMyRequestedTags()"
							hint="Enter a tag, make, model, serial or description and press Enter"
						></v-text-field>

						<v-data-table
							class="row-clickable"
							:headers="[
								{ text: 'Asset tag', value: 'tag', width: '150px' },
								{
									text: 'Purchase date',
									value: 'purchase_date',
									width: '160px',
								},
								{ text: 'Description', value: 'description' },
								{ text: 'Mailcode', value: 'owner.mailcode' },
								{ text: 'Department', value: 'owner.department' },
								{ text: 'Purchaser', value: 'purchase_person' },
							]"
							:items="items"
							:loading="loading"
							:options.sync="options"
							:server-items-length="itemCount"
							:footer-props="{ 'items-per-page-options': [10, 30, 100] }"
							show-select
							v-model="selected"
							@click:row="openEditor"
						>
							<template v-slot:item.purchase_person="{ item }">
								<a
									:href="'mailto:' + item.purchase_person"
									@click.stop="ignore"
									>{{ item.purchase_person }}</a
								>
							</template>
						</v-data-table>
					</v-card-text>
				</v-card>
			</div>
		</div>

		<v-btn
			color="primary"
			@click="printSelected"
			:disabled="selected.length == 0"
			>Print selected</v-btn
		>

		<notifications ref="notifier"></notifications>
		<MyTagsAssetEditor ref="editor" :on-save="onSave"></MyTagsAssetEditor>
	</div>
</template>

<script>
import { cloneDeep } from 'lodash';

import http from '@/utils/http-client';
import { ASSET_URL } from '@/urls';

import MyTagsAssetEditor from '@/components/MyTagsAssetEditor';
import axios from 'axios';

export default {
	name: 'MyTags',
	components: {
		MyTagsAssetEditor,
	},
	computed: {},
	data: () => ({
		options: {
			page: 1,
			itemsPerPage: 10,
			sortBy: ['tag'],
			sortDesc: [false],
			groupBy: [],
			groupDesc: [],
			mustSort: false,
			multiSort: false,
		},
		items: [],
		itemCount: 0,
		loading: false,
		selected: [],
		search: '',
	}),
	mounted() {
		this.loadMyRequestedTags();
	},
	watch: {
		options: {
			handler() {
				this.loadMyRequestedTags();
			},
			deep: true,
		},
	},
	methods: {
		loadMyRequestedTags() {
			this.loading = true;

			let query = [
				{
					field: 'status',
					operator: 'eq',
					value: 'Active',
				},
			];

			if (this.search.trim().length > 0) {
				query.push({
					fields: ['tag', 'description', 'make', 'model', 'serial'],
					operator: 'contains',
					value: this.search,
				});
			}

			return http
				.post(`${ASSET_URL}/query`, {
					...cloneDeep(this.options),
					query,
				})
				.then((resp) => {
					this.itemCount = resp.data.meta.item_count;
					this.items = resp.data.data;
					this.loading = false;
				})
				.catch((error) => {
					this.loading = false;
					console.log('ERROR', error);
				});
		},

		openEditor(item) {
			this.$refs.editor.show(item);
		},
		onSave(resp) {
			this.$refs.notifier.showAPIMessages(resp.data);
			this.loadMyRequestedTags();
		},
		printSelected() {
			if (this.selected.length == 0) return;

			let tags = this.selected.map((i) => i.tag);

			axios
				.post(`${ASSET_URL}/print-tags`, { tags })
				.then((resp) => {
					this.$refs.notifier.showAPIMessages(resp.data);
					/* this.$refs.notifier.showSuccess(
						`${tags.join(', ')} sent to the printer queue (not really)`
					); */
				})
				.catch((err) => {
					console.log(err);
				});
		},
		ignore() {},
	},
};
</script>
