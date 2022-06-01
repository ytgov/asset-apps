<template>
	<div class="home">
		<admin-sidebar></admin-sidebar>
		<h1>Administration: <small>Reports</small></h1>

		<div class="row">
			<div class="col-md-12">
				<v-card class="mt-5 default">
					<v-card-text>
						<v-select
							v-model="reportType"
							dense
							outlined
							background-color="white"
							label="Report type"
							:items="['Assets', 'Transfers']"
						>
						</v-select>
						<v-row>
							<v-col>
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
							<v-col>
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
						</v-row>
					</v-card-text>
				</v-card>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Home',
	data: () => ({
		reportType: 'Assets',
		startDate: '',
		startDateMenu: null,
		endDate: '',
		endDateMenu: null,
	}),
	created() {
		let year = new Date().getFullYear();
		console.log(year);
		this.startDate = `${year - 1}-04-01`;
		this.endDate = `${year}-03-31`;
	},
	computed: {},
	watch: {
		options: {
			handler() {
				this.loadList(false);
			},
			deep: true,
		},
	},
	methods: {},
};
</script>
