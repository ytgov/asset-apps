import express, { Request, Response } from 'express';
import { body, query } from 'express-validator';
import {
	AssetService,
	EmailService,
	SortDirection,
	SortStatement,
	TransferService,
} from '../services';
import { ReturnValidationErrors } from '../middleware';
import { pick } from 'lodash';
import { unparse } from 'papaparse';

export const transferRouter = express.Router();
const PAGE_SIZE = 10;

import { APPLICATION_USER, db, DB_TRUE } from '../data';
const transferService = new TransferService(db);
const emailService = new EmailService();
const assetService = new AssetService(db);

transferRouter.get(
	'/transfer-report-export',
	[query('startDate').isDate(), query('endDate').isDate()],
	ReturnValidationErrors,
	async (req: Request, res: Response) => {
		const {
			startDate,
			endDate,
			conditions,
			fromOwnerIds,
			toOwnerIds,
			tcaStatus,
		} = req.query;

		let query = [
			{ field: 'transfer_date', operator: 'gt', value: startDate },
			{ field: 'transfer_date', operator: 'lt', value: endDate },
		];

		if (conditions) {
			query.push({
				field: 'asset_transfer.condition',
				operator: 'in',
				value: conditions,
			});
		}
		if (fromOwnerIds) {
			query.push({
				field: 'from_owner_id',
				operator: 'in',
				value: fromOwnerIds,
			});
		}
		if (toOwnerIds) {
			query.push({ field: 'to_owner_id', operator: 'in', value: toOwnerIds });
		}
		if (tcaStatus && tcaStatus != 'Any') {
			query.push({
				field: 'is_tca',
				operator: 'eq',
				value: tcaStatus == 'Yes' ? '1' : '0',
			});
		}

		let searchResults = await transferService.doSearch(
			query,
			[],
			1,
			100000,
			0,
			100000,
			false
		);
		let list = searchResults.data;
		let output = new Array();

		let allCategories = await assetService.db('asset_category');

		for (let item of list) {
			let direction = 'Unknown';

			if (item.from_owner.default_owner) direction = 'Outbound';
			if (item.to_owner.default_owner) direction = 'Inbound';

			const disposalStatus = [
				'Recycled',
				'Sold',
				'CFS',
				'Donation',
				'Destruction',
				'Missing / stolen',
			];

			if (disposalStatus.indexOf(item.condition) >= 0) direction = 'Disposal';

			let tag = '';
			let purchase_price = '';
			let purchase_date = '';
			let dept_tag = '';

			let category = allCategories.filter(
				(t) => t.id == item.asset_category_id
			)[0];

			if (item.asset_item_id) {
				let asset = await assetService.getById(item.asset_item_id);

				if (asset) {
					tag = asset.tag;
					purchase_price = asset.purchase_price;
					purchase_date = asset.purchase_date;
					dept_tag = asset.dept_tag;
				}
			} else if (item.asset_item) {
				dept_tag = item.asset_item.tag;
			}

			output.push({
				category: tag.length > 0 ? 'Tagged' : 'Non-Tagged',
				direction,
				description: item.description,
				asset_category: category ? category.description : '',
				status: item.condition,
				quantity: item.quantity,
				request_date: item.request_date,
				from_owner_id: item.from_owner_id,
				from_mailcode: item.from_owner.mailcode,
				from_department: item.from_owner.department,
				to_owner_id: item.to_owner_id,
				to_mailcode: item.to_owner.mailcode,
				to_department: item.to_owner.department,
				tag,
				dept_tag,
				purchase_price,
				requested_by: item.request_user,
				is_tca: item.is_tca,
				purchase_date,
			});
		}

		res.set('Content-Type', 'text/csv');
		return res.send(unparse(output));
	}
);

transferRouter.post(
	'/',
	[body('page').isInt().default(1), body('itemsPerPage').isInt().default(10)],
	async (req: Request, res: Response) => {
		let { query, sortBy, sortDesc, page, itemsPerPage } = req.body;
		let sort = new Array<SortStatement>();

		sortBy.forEach((s: string, i: number) => {
			sort.push({
				field: s,
				direction: sortDesc[i]
					? SortDirection.ASCENDING
					: SortDirection.DESCENDING,
			});
		});

		let skip = (page - 1) * itemsPerPage;
		let take = itemsPerPage;

		let results = await transferService.doSearch(
			query,
			sort,
			page,
			itemsPerPage,
			skip,
			take
		);

		return res.json(results);
	}
);

transferRouter.post('/transfer', async (req: Request, res: Response) => {
	let { from_owner_id, to_owner_id, rows, action } = req.body;

	for (let row of rows) {
		let transfer = {
			asset_category_id: row.type,
			request_user: req.user.email,
			request_date: new Date(),
			transfer_date: new Date(),
			condition: row.condition,
			from_owner_id,
			to_owner_id,
			quantity: row.quantity,
			description: row.tag,
		};

		await db('asset_transfer').insert(transfer);
	}

	return res.json({
		messages: [{ variant: 'success', text: 'Transfer saved' }],
	});
});

transferRouter.post(
	'/transfer-request',
	async (req: Request, res: Response) => {
		let { asset, fromOwnerId, rows, condition, likelyTCA } = req.body;
		const default_owner = await db('asset_owner')
			.where({ default_owner: DB_TRUE })
			.first();

		let owner = await db('asset_owner').where({ id: fromOwnerId }).first();
		let items = '';

		if (asset) {
			let transfer = {
				asset_item_id: asset.id,
				request_user: req.user.email,
				request_date: new Date(),
				transfer_date: new Date(),
				condition: `REQUEST: ${condition}`,
				from_owner_id: fromOwnerId,
				to_owner_id: default_owner.id,
				quantity: 1,
				is_tca: likelyTCA,
			};
			items = `<li>Asset: ${asset.tag} - ${asset.description}</li>`;

			await db('asset_transfer').insert(transfer);
		} else {
			let categories = await db('asset_category');

			for (let row of rows) {
				let transfer = {
					asset_category_id: row.type,
					request_user: req.user.email,
					request_date: new Date(),
					transfer_date: new Date(),
					condition: `REQUEST: ${row.condition}`,
					from_owner_id: fromOwnerId,
					to_owner_id: default_owner.id,
					quantity: row.quantity,
					description: row.dept_tag,
					is_tca: likelyTCA,
				};
				let category = categories.filter((c) => c.id == row.type)[0];

				items += `<li>${category.description} (${row.quantity})</li>`;

				await db('asset_transfer').insert(transfer);
			}
		}

		await emailService.sendTransferRequest(req.user, items);
		await emailService.sendTransferRequestNotify(
			APPLICATION_USER,
			req.user,
			items,
			owner.mailcode
		);

		return res.json({
			messages: [{ variant: 'success', text: 'Transfer saved' }],
		});
	}
);

transferRouter.patch('/:id', (req: Request, res: Response) => {
	const id = parseInt(req.params.id);

	const attributes = pick(req.body, [
		'asset_category_id',
		'condition',
		'from_owner_id',
		'quantity',
		'to_owner_id',
		'is_tca',
		'is_contacted',
	]);

	return transferService
		.update(id, attributes)
		.then(() =>
			res.json({
				data: {},
				messages: [{ variant: 'success', text: 'Transfer saved' }],
			})
		)
		.catch((error) =>
			res.status(422).json({
				messages: [
					{
						variant: 'error',
						text: 'Failed to update transfer',
						details: error.message,
					},
				],
			})
		);
});

transferRouter.delete('/:id', async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);

	return transferService
		.delete(id)
		.then(() =>
			res.json({
				data: {},
				messages: [{ variant: 'success', text: 'Transfer removed' }],
			})
		)
		.catch((error) =>
			res.status(422).json({
				messages: [
					{
						variant: 'error',
						text: 'Failed to remove transfer',
						details: error.message,
					},
				],
			})
		);
});
