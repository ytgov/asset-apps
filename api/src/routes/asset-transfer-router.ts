import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { EmailService, SortDirection, SortStatement, TransferService } from '../services';
import { ReturnValidationErrors } from '../middleware';
import { pick } from 'lodash';

export const transferRouter = express.Router();
const PAGE_SIZE = 10;

import { db, DB_TRUE } from '../data';
const transferService = new TransferService(db);
const emailService = new EmailService();

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

			await db('asset_transfer').insert(transfer);
		} else {
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

				await db('asset_transfer').insert(transfer);
			}
		}

		await emailService.sendTransferRequest(req.user);

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
		'is_tca'
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

transferRouter.delete(
	'/:id',
	async (req: Request, res: Response) => {
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
	}
);
