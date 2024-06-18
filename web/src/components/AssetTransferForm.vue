<template>
	<v-form v-model="isValid">
		<v-stepper
			flat
			v-model="step"
			vertical
			non-linear
			style="border: 1px #9e9e9e solid"
		>
			<v-stepper-step editable step="1" :complete="step > 1">
				Does the item have a Yukon Government asset tag?
				<small>{{ hasIdentifier }}</small>
			</v-stepper-step>

			<v-stepper-content step="1">
				<v-btn small color="primary" class="my-0" @click="idYesClick()"
					>Yes</v-btn
				>
				<v-btn small color="secondary" class="my-0 ml-3" @click="idNoClick()">
					No
				</v-btn>
			</v-stepper-content>

			<v-stepper-step step="2">{{ step2Name }}</v-stepper-step>

			<v-stepper-content step="2" :complete="step > 2">
				<div v-if="hasIdentifier == 'Yes'" class="py-2">
					<a @click="idNoClick">Click here</a> if you don't find the item to add
					an inventory number
					<asset-lookup-form
						class="mt-1"
						showActions="false"
						:doItemSelected="assetSelected"
					></asset-lookup-form>
					<v-btn
						v-if="assetToTransfer"
						small
						color="primary"
						@click="foundAsset()"
					>
						This looks right
					</v-btn>
					<v-btn
						small
						v-if="assetToTransfer"
						class="ml-2"
						@click="hasIdentifier = 'No'"
						color="secondary"
						>This is not it</v-btn
					>
				</div>

				<div v-if="hasIdentifier != 'Yes'" class="py-2">
					<div class="row" v-for="(desc, i) of descriptions" :key="i">
						<div class="col-sm-8">
							<v-select
								dense
								outlined
								:items="assetTypeOptions"
								item-text="description"
								item-value="id"
								label="Type of item"
								hide-details
								v-model="desc.type"
							></v-select>
						</div>
						<div class="col-sm-4">
							<v-text-field
								dense
								outlined
								label="Quantity"
								type="number"
								hide-details
								v-model="desc.quantity"
								min="1"
							></v-text-field>
						</div>
						<div class="col-sm-8">
							<v-text-field
								dense
								outlined
								label="Inventory number"
								v-model="desc.dept_tag"
								persistent-hint
								hint="* Optional"
							></v-text-field>
						</div>
						<div class="col-sm-4">
							<v-select
								dense
								outlined
								label="Condition"
								hide-details
								v-model="desc.condition"
								:items="conditionOptions"
							></v-select>
						</div>
						<div class="col-sm-12">
							<hr />
						</div>
					</div>
					<v-btn
						small
						title="Add another item"
						color="secondary"
						class="mb-0"
						@click="
							descriptions.push({ quantity: 1, condition: 'Good', type: 1 })
						"
						><v-icon>mdi-plus</v-icon> Add</v-btn
					>

					<v-btn
						color="primary"
						class="mb-0 float-right"
						small
						@click="step = 3"
					>
						Continue
					</v-btn>
				</div>
			</v-stepper-content>

			<v-stepper-step step="3">Complete</v-stepper-step>

			<v-stepper-content step="3" :complete="step > 3">
				<v-autocomplete
					class="mt-2"
					dense
					outlined
					required
					:items="onlyKnownMailcodeOptions"
					label="What's your mail code?"
					item-text="display_name"
					item-value="id"
					v-model="fromOwnerId"
					:rules="mailcodeRules"
				></v-autocomplete>

				<v-select
					v-if="hasIdentifier == 'Yes'"
					:items="conditionOptions"
					v-model="transferReason"
					required
					class="mt-2"
					rows="2"
					dense
					outlined
					label="What condition is this item in?"
					persistent-hint
				></v-select>

				<v-checkbox
					v-model="approvalReceived"
					:rules="approvalReceivedRules"
					dense
					hide-details
					required
					label="My director approved this transfer/disposal"
				>
				</v-checkbox>
				<v-checkbox
					v-model="likelyTCA"
					dense
					hide-details
					required
					label="The purchase price of this item was likely over $10,000 (TCA)"
				>
				</v-checkbox>

				<p class="mt-3">
					Deputy Minister approval may be required if asset value is over
					<strong>$10,000</strong>
				</p>
				<div class="d-flex">
					<v-tooltip bottom :disabled="isValid">
						<template v-slot:activator="{ on }">
							<div v-on="on">
								<v-row>
									<v-col cols="3">
										<v-btn
											small
											class="mb-0"
											color="primary"
											:disabled="!isValid || formIsValid != true"
											@click="doComplete"
											>Complete</v-btn
										>
									</v-col>
									<v-col cols="9" class="pt-7" style="vertical-align: middle">
										<em>*You will receive an email shortly with next step</em>
									</v-col>
								</v-row>
							</div>
						</template>
						<span>Please fill in all required fields</span>
					</v-tooltip>
				</div>
			</v-stepper-content>
		</v-stepper>

		<notifications ref="notifier"></notifications>
	</v-form>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import { isEmpty, isNull } from 'lodash';

import { TRANSFER_URL } from '@/urls';

export default {
	name: 'AssetTransferForm',
	computed: {
		...mapGetters(['assetTypeOptions', 'mailcodeOptions']),
		...mapGetters('profile', {
			currentUserMailcodeId: 'mailcodeId',
		}),
		onlyKnownMailcodeOptions() {
			return this.mailcodeOptions.filter(
				({ mailcode }) => mailcode != 'Unknown'
			);
		},
		formIsValid() {
			if (this.hasIdentifier == 'No') {
				return this.fromOwnerId && this.approvalReceived;
			} else if (this.hasIdentifier == 'Yes') {
				return (
					!isNull(this.fromOwnerId) &&
					this.approvalReceived == true &&
					!isEmpty(this.transferReason)
				);
			}
			return false;
		},
	},
	props: ['onSave'],
	data: () => ({
		approvalReceived: false,
		approvalReceivedRules: [(v) => !!v || 'Approval confirmation is required'],
		mailcodeRules: [(v) => !!v || 'Mail code is required'],
		step: 1,
		search: null,
		isLoading: null,
		isValid: false,
		count: 0,
		hasIdentifier: '',
		step2Name: 'Tell us about the item(s)',
		assetToTransfer: null,
		transferReason: '',
		descriptions: [{ quantity: 1, condition: 'Good', type: 1 }],
		conditionOptions: ['Good', 'Obsolete', 'Beyond repair', 'Missing / stolen'],
		fromOwnerId: null,
		likelyTCA: false,
	}),
	watch: {
		currentUserMailcodeId(value) {
			this.fromOwnerId = value;
		},
	},
	methods: {
		idYesClick() {
			this.hasIdentifier = 'Yes';
			this.step2Name = 'Find the item';
			this.step = 2;
		},

		idNoClick() {
			this.hasIdentifier = 'No';
			this.step2Name = 'Tell us about the item(s)';
			this.step = 2;
		},

		assetSelected(asset) {
			this.assetToTransfer = asset;
		},

		foundAsset() {
			if (this.assetToTransfer) {
				this.step = 3;
			}
		},

		doComplete() {
			let body = {
				asset: this.assetToTransfer,
				rows: this.descriptions,
				fromOwnerId: this.fromOwnerId,
				condition: this.transferReason,
				likelyTCA: this.likelyTCA,
			};

			axios.post(`${TRANSFER_URL}/transfer-request`, body).then(() => {
				this.$refs.notifier.showSuccess('Your transfer has been submitted');
				this.resetForm();
			});
		},

		resetForm() {
			this.hasIdentifier = '';
			this.step = 1;
			this.step2Name = 'Tell us about the item(s)';
			this.assetToTransfer = null;
			this.transferReason = '';
			this.approvalReceived = false;
			this.likelyTCA = false;
		},
	},
};
</script>
