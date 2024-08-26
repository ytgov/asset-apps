<template>
	<v-dialog v-model="dialogVisible" max-width="400">
		<v-card>
			<v-card-title>Bulk Import</v-card-title>
			<v-card-text>
				<p>
					Use the form below to import new assets from a properly formatted CSV
					file. Adherence to the template is required or the upload will be
					rejected.
				</p>
				<v-btn color="info" small @click="downloadTemplateClick">
					<v-icon class="mr-2">mdi-download</v-icon> Download template
				</v-btn>
				<v-select
					label="Owner"
					v-model="ownerId"
					:items="ownerOptions"
					outlined
					dense
				></v-select>

				<v-file-input
					label="CSV file"
					v-model="file"
					prepend-icon=""
					prepend-inner-icon="mdi-attachment"
					outlined
					dense
					accept="text/csv"
				></v-file-input>

				<v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>
				<v-alert v-if="successMessage" type="success">{{
					successMessage
				}}</v-alert>
			</v-card-text>
			<v-divider></v-divider>

			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="info" :disabled="!isValid" @click="importClick"
					>Import</v-btn
				>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
<script>
import axios from 'axios';
import store from '@/store';
import { isString, isEmpty, isNil } from 'lodash';
import { ASSET_URL } from '../urls';

export default {
	data: () => ({
		dialogVisible: false,

		ownerId: '',
		file: null,
		errorMessage: null,
		successMessage: null,
	}),
	computed: {
		manageCodes: () => {
			return store.state.profile.manage_mailcodes;
		},
		ownerOptions() {
			if (this.manageCodes && isString(this.manageCodes))
				return this.manageCodes.split(',');

			return [];
		},
		isValid() {
			return !(isEmpty(this.ownerId) || isNil(this.file));
		},
	},
	methods: {
		show() {
			this.ownerId = null;
			this.file = null;
			this.dialogVisible = true;
		},
		downloadTemplateClick() {
			console.log('DOWNLOAD TEMP');
			window.open(`${ASSET_URL}/csv-template`);
		},
		importClick() {
			this.errorMessage = null;
			this.successMessage = null;

			const form = new FormData();
			form.append('file', this.file);
			form.append('mailcode', this.ownerId);

			axios
				.post(`${ASSET_URL}/csv-import`, form)
				.then((resp) => {
					console.log('resp: ', resp.data);
					this.successMessage = resp.data;
				})
				.catch((error) => {
					console.log('ERROR', error.response);
					this.errorMessage = error.response.data;
				});
		},
	},
};
</script>
