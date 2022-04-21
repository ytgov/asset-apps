<template>
	<div class="home">
		<admin-sidebar></admin-sidebar>
		<h1>Administration: <small>Tags</small></h1>

		<v-data-table
			dense
			class="row-clickable"
			:headers="[
				{ text: 'Asset tag', value: 'tag', width: '150px' },
				{ text: 'Purchase date', value: 'purchase_date', width: '160px' },
				{ text: 'Description', value: 'description' },
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
				<a :href="'mailto:' + item.purchase_person" @click.stop="ignore">{{
					item.purchase_person
				}}</a>
			</template>
		</v-data-table>

		<v-btn color="primary" @click="printSelected">Print selected</v-btn>

		<notifications ref="notifier"></notifications>
		<MyTagsAssetEditor ref="editor" :on-save="onSave"></MyTagsAssetEditor>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { cloneDeep } from 'lodash';

import http from '@/utils/http-client';
import { ASSET_URL } from '@/urls';

import MyTagsAssetEditor from '@/components/MyTagsAssetEditor';

export default {
	name: 'MyTags',
	components: {
		MyTagsAssetEditor,
	},
	computed: {
		...mapGetters('profile', { currentUserEmail: 'email' }),
	},
	data: () => ({
		options: {
			page: 1,
			itemsPerPage: 10,
			sortBy: ['purchase_date'],
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
	}),
	mounted() {
		this.loadProfile().then(() => {
			this.loadMyRequestedTags();
		});
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
		...mapActions('profile', ['loadProfile']),
		loadMyRequestedTags() {
			this.loading = true;

			return http
				.post(`${ASSET_URL}/query`, {
					...cloneDeep(this.options),
					query: [
						{
							/* field: "purchase_person",
              operator: "eq",
              value: this.currentUserEmail, */
						},
					],
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

			this.$refs.notifier.showSuccess(
				`${tags.join(', ')} sent to the printer queue (not really)`
			);
		},
		ignore() {
      console.log("HERE")
    },
	},
};
</script>
