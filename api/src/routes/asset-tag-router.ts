import express, { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { join } from 'path';
import { unparse, parse } from 'papaparse';
import moment from 'moment';
import _, { isArray, isInteger, isNumber } from 'lodash';

import { ReturnValidationErrors } from '../middleware';
import {
	AssetService,
	AssetTagPrinterService,
	EmailService,
	SortDirection,
	SortStatement,
} from '../services';
import { db, DB_TRUE, APPLICATION_USER } from '../data';
import { AssetItem } from '../data/models';
import { UploadedFile } from 'express-fileupload';

export const assetTagRouter = express.Router();
const assetService = new AssetService(db);
const assetTagPrinterService = new AssetTagPrinterService(db);
const emailService = new EmailService();

const ASSET_TEMPLATE = join(__dirname, '../data/asset_template.csv');

assetTagRouter.post('/', (req: Request, res: Response) => {
	const { assetItem } = req.body;

	return assetService
		.create({
			...assetItem,
			status: 'Active',
			condition: 'Good',
		})
		.then((result) => {
			return res.status(201).json({
				data: result,
				messages: [{ variant: 'success', text: 'Asset created' }],
			});
		})
		.catch((error) => {
			return res.status(422).json({
				messages: [
					{
						variant: 'error',
						text: 'Asset failed to save',
						details: error.message,
					},
				],
			});
		});
});

assetTagRouter.post(
	'/bulk-creation',
	[body('assetItems').isArray({ min: 1 })],
	ReturnValidationErrors,
	(req: Request, res: Response) => {
		const { assetItems } = req.body;

		const assetCreationPromises = assetItems.map(
			async (assetItem: AssetItem) => {
				const newAssetItem = await assetService.create({
					...assetItem,
					status: 'Active',
					condition: 'Good',
				});

				await assetTagPrinterService.createFromAssetItem(newAssetItem);

				return newAssetItem;
			}
		);

		return Promise.all(assetCreationPromises)
			.then(async (assetItemResults: Array<AssetItem>) => {
				const tags = assetItemResults
					.map((assetItem) => assetItem.tag)
					.sort((a: string, b: string) => a.localeCompare(b));

				await emailService.sendTagRequestComplete(req.user, tags);
				await emailService.sendTagRequestNotification(APPLICATION_USER, tags);

				return res.status(201).json({
					data: assetItemResults,
					messages: [{ variant: 'success', text: 'Assets created' }],
				});
			})
			.catch((error: { message: string }) => {
				return res.status(422).json({
					messages: [
						{
							variant: 'error',
							text: 'Assets failed to save',
							details: error.message,
						},
					],
				});
			});
	}
);

assetTagRouter.get('/csv-template', async (req: Request, res: Response) => {
	res.sendFile(ASSET_TEMPLATE);
});

assetTagRouter.post(
	'/csv-import',
	[body('mailcode').notEmpty()],
	ReturnValidationErrors,
	async (req: Request, res: Response) => {
		let { mailcode } = req.body;

		if (!req.files || !req.files.file)
			return res.status(400).send('Missing file');
		let file = req.files.file;
		if (isArray(file)) file = file[0];

		const upload = file as UploadedFile;

		const value = (await new Promise((resolve, reject) => {
			const parsedData = new Array<any>();
			parse(upload.data.toString().trim(), {
				header: true,
				step: (row) => {
					parsedData.push(row);
				},
				complete: () => {
					resolve(parsedData);
				},
				error: (e: any) => {
					console.log('ERROR LOADING CSV', e);
					reject([]);
				},
			});
		})) as any[];

		const errors = value.flatMap((v) => v.errors);

		if (errors && errors.length > 0) {
			return res.status(400).send(errors);
		}

		const trx = await db.transaction();

		const asset_owner_id = await trx('asset_owner').where({ mailcode }).first();
		if (!asset_owner_id) return res.status(400).send('Owner not found');

		const allCategories = await trx('asset_category');

		try {
			for (const row of value) {
				let asset_category_id = null;

				const cat = row.data.CATEGORY;

				if (cat) {
					let catId = parseInt(cat);

					if (isInteger(catId)) {
						asset_category_id = allCategories.find((c) => c.id == catId);
					} else {
						asset_category_id = allCategories.find((c) =>
							c.description.startsWith(cat)
						);
					}
				}

				const assetItem = makeFromCSV(
					row.data,
					asset_owner_id.id,
					asset_category_id?.id
				);

				await trx.insert(assetItem).into('asset_item');
			}

			await trx.commit();
			res.status(200).send(`Successfully loaded ${value.length} assets`);
		} catch (error) {
			console.log('IMPORT ERROR', error);
			await trx.rollback();
			res
				.status(400)
				.send('Data format issue, please use template and validate data entry');
		}
	}
);

assetTagRouter.post(
	'/query',
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

		let results = await assetService.doSearch(
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

assetTagRouter.post(
	'/search',
	[body('keyword').notEmpty()],
	ReturnValidationErrors,
	async (req: Request, res: Response) => {
		let { keyword } = req.body;

		let results = await assetService.doItemSearch(keyword);

		for (let row of results) {
			row.owner = await db('asset_owner')
				.where({ id: row.asset_owner_id })
				.first();

			if (row.purchase_date)
				row.purchase_date = moment(row.purchase_date)
					.utc(true)
					.format('YYYY-MM-DD');

			if (row.dept_tag) row.display = `${row.tag} (${row.dept_tag})`;
			else row.display = `${row.tag} : ${row.description}`;
		}

		return res.json({ data: results });
	}
);

assetTagRouter.put(
	'/:id',
	[param('id').isInt().notEmpty()],
	ReturnValidationErrors,
	async (req: Request, res: Response) => {
		let { id } = req.params;

		let item = await db('asset_item').where({ id }).first();
		const default_owner = await db('asset_owner')
			.where({ default_owner: DB_TRUE })
			.first();

		if (item) {
			let {
				tag,
				dept_tag,
				status,
				condition,
				asset_owner_id,
				un_commodity_code,
				make,
				model,
				comment,
				sold_date,
				asset_category_id,
			} = req.body;
			let {
				serial,
				description,
				purchase_person,
				purchase_price,
				purchase_date,
				purchase_order_number,
				purchase_order_line,
			} = req.body;

			let body = {
				tag,
				dept_tag,
				status,
				condition,
				asset_owner_id,
				un_commodity_code,
				make,
				model,
				serial,
				description,
				purchase_person,
				purchase_price,
				purchase_date,
				purchase_order_number,
				purchase_order_line,
				comment,
				sold_date,
				asset_category_id,
			};

			if (item.asset_owner_id != asset_owner_id) {
				// do a transfer to the new owner
				console.log(
					'Generating a transfer from ' +
						item.asset_owner_id +
						' to ' +
						asset_owner_id
				);

				if (asset_owner_id == default_owner.id) {
					// this is an inbound transfer
					let transfer = {
						asset_item_id: id,
						request_user: req.user.email,
						request_date: new Date(),
						transfer_date: new Date(),
						condition: status,
						from_owner_id: item.asset_owner_id,
						to_owner_id: asset_owner_id,
						quantity: 1,
					};

					await db('asset_transfer').insert(transfer);
				} else {
					let now = moment();
					//this is inbound and outbound
					let transfer1 = {
						asset_item_id: id,
						request_user: req.user.email,
						request_date: now.toDate(),
						transfer_date: now.toDate(),
						condition: status,
						from_owner_id: item.asset_owner_id,
						to_owner_id: default_owner.id,
						quantity: 1,
						asset_category_id,
					};
					await db('asset_transfer').insert(transfer1);

					now = now.add(1, 'second');

					let transfer2 = {
						asset_item_id: id,
						request_user: req.user.email,
						request_date: now.toDate(),
						transfer_date: now.toDate(),
						condition: status,
						from_owner_id: default_owner.id,
						to_owner_id: asset_owner_id,
						quantity: 1,
						asset_category_id,
					};
					await db('asset_transfer').insert(transfer2);
				}
			}

			await db('asset_item').where({ id }).update(body);
			return res.json({
				messages: [{ variant: 'success', text: 'Asset saved' }],
			});
		}

		res.status(404).send();
	}
);

assetTagRouter.put(
	'/:id/limited',
	[param('id').isInt().notEmpty()],
	ReturnValidationErrors,
	async (req: Request, res: Response) => {
		let { id } = req.params;

		let item = await db('asset_item').where({ id }).first();

		if (item) {
			let {
				dept_tag,
				status,
				condition,
				un_commodity_code,
				make,
				model,
				comment,
			} = req.body;
			let {
				serial,
				description,
				purchase_person,
				purchase_price,
				purchase_date,
				purchase_order_number,
				purchase_order_line,
			} = req.body;

			let body = {
				dept_tag,
				status,
				condition,
				un_commodity_code,
				make,
				model,
				serial,
				description,
				purchase_person,
				purchase_price,
				purchase_date,
				purchase_order_number,
				purchase_order_line,
				comment,
			};

			await db('asset_item').where({ id }).update(body);
			return res.json({
				messages: [{ variant: 'success', text: 'Asset saved' }],
			});
		}

		res.status(404).send();
	}
);

assetTagRouter.put(
	'/:id/limited/transfer',
	[param('id').isInt().notEmpty()],
	ReturnValidationErrors,
	async (req: Request, res: Response) => {
		let { id } = req.params;

		let item = await db('asset_item').where({ id }).first();
		const default_owner = await db('asset_owner')
			.where({ default_owner: DB_TRUE })
			.first();

		if (item) {
			let {
				dept_tag,
				status,
				condition,
				asset_owner_id,
				un_commodity_code,
				make,
				model,
				comment,
			} = req.body;
			let {
				serial,
				description,
				purchase_person,
				purchase_price,
				purchase_date,
				purchase_order_number,
				purchase_order_line,
			} = req.body;

			let body = {
				dept_tag,
				status,
				condition,
				asset_owner_id,
				un_commodity_code,
				make,
				model,
				serial,
				description,
				purchase_person,
				purchase_price,
				purchase_date,
				purchase_order_number,
				purchase_order_line,
				comment,
			};

			await db('asset_item').where({ id }).update(body);

			let transfer = {
				asset_item_id: id,
				request_user: req.user.email,
				request_date: new Date(),
				transfer_date: new Date(),
				condition: `REQUEST: ${condition}`,
				from_owner_id: asset_owner_id,
				to_owner_id: default_owner.id,
				quantity: 1,
			};

			await db('asset_transfer').insert(transfer);

			return res.json({
				messages: [{ variant: 'success', text: 'Asset saved' }],
			});
		}

		res.status(404).send();
	}
);

assetTagRouter.get(
	'/asset-report-export',
	async (req: Request, res: Response) => {
		const { owners, statuses } = req.query;

		let query = [];

		if (owners) {
			query.push({ field: 'asset_owner_id', operator: 'in', value: owners });
		}
		if (statuses) {
			query.push({ field: 'status', operator: 'in', value: statuses });
		}

		let searchResults = await assetService.doSearch(
			query,
			[],
			1,
			100000,
			0,
			100000
		);
		let list = searchResults.data;
		let output = new Array();
		let allTypes = await assetService.db('asset_type');
		let allCategories = await assetService.db('asset_category');

		for (let item of list) {
			let type = allTypes.filter((t) => t.id == item.asset_type_id)[0];
			let category = allCategories.filter(
				(t) => t.id == item.asset_category_id
			)[0];

			output.push({
				tag: item.tag,
				status: item.status,
				type: type.description,
				category: category ? category.description : '',
				description: item.description,
				make: item.make,
				model: item.model,
				serial: item.serial,
				purchase_person: item.purchase_person,
				purchase_price: item.purchase_price,
				purchase_date: item.purchase_date,
				owner_mailcode: item.owner.mailcode,
				owner_department: item.owner.department,
				owner_name: item.owner.name,
				dept_tag: item.dept_tag,
			});
		}

		res.set('Content-Type', 'text/csv');
		return res.send(unparse(output));
	}
);

assetTagRouter.get(
	'/asset-category',
	async (req: Request, res: Response, next: NextFunction) => {
		let list = await db('asset_category').catch(next);

		return res.json({ data: list });
	}
);

assetTagRouter.post(
	'/print-tags',
	[body('tags').isArray()],
	ReturnValidationErrors,
	async (req: Request, res: Response) => {
		let currentUser = req.user;
		let { tags } = req.body;

		let printed = 0;

		let toEmail = [];

		for (let tag of tags) {
			await db('asset_tag_print_queue').where({ tag }).delete();

			let {
				asset_id,
				purchase_date,
				description,
				department,
				mailcode,
				purchase_person,
			} = await db('asset_item')
				.join('asset_owner', 'asset_item.asset_owner_id', 'asset_owner.id')
				.where({ tag })
				.select([
					'asset_item.id as asset_id',
					'asset_item.purchase_date',
					'asset_item.description',
					'asset_owner.department',
					'asset_owner.mailcode',
					'asset_item.purchase_person',
				])
				.first();

			if (purchase_date) {
				let toInsert = {
					tag,
					purchase_date,
					description,
					department,
					mailcode,
					print_date: new Date(),
					print_person: currentUser.email,
					purchase_person,
				};
				toEmail.push(toInsert);
				await db('asset_tag_print_queue').insert(toInsert);

				await db('asset_item')
					.where({ id: asset_id })
					.update({ is_printed: true });
				printed++;
			}
		}

		let emailList = `<table cellspacing="0" cellpadding="0" border="0" style='width:100%; border: 1px #323232 solid; border-radius: 3px'>`;
		emailList += `<tr><th>Tag</th><th>Mailcode</th><th>Department</th><th>Purchaser</th><th>Description</th></tr>`;

		if (toEmail.length > 0) {
			for (let item of toEmail) {
				emailList += `<tr><td>${item.tag}</td><td>${item.mailcode}</td><td>${item.department}</td><td>${item.purchase_person}</td><td>${item.description}</td></tr>`;
			}

			emailList = emailList.replace(
				/<td>/g,
				"<td style='border: 1px #323232 solid; text-align:left; padding: 3px'>"
			);
			emailList = emailList.replace(
				/<th>/g,
				"<th style='border: 1px #323232 solid; text-align:left; padding: 3px'>"
			);
			emailList = `${emailList}</table>`;
			emailService.sendTagPrintRequest(
				{ email: 'mail.room@yukon.ca', first_name: 'Mail', last_name: 'Room' },
				emailList
			);
		}

		res.json({
			messages: [
				{
					text: `Sent ${printed} tags to the printer queue`,
					variant: 'success',
				},
			],
		});
	}
);

assetTagRouter.delete('/:id', async (req: Request, res: Response) => {
	let { id } = req.params;

	await db('asset_item').where({ id }).delete();
	await db('asset_transfer').where({ asset_item_id: id }).delete();

	return res.json({
		data: {},
		messages: [{ variant: 'success', text: 'Asset deleted' }],
	});
});

function makeFromCSV(
	item: any,
	asset_owner_id: number,
	asset_category_id: number
) {
	return {
		tag: item.TAG,
		status: 'Active',
		condition: 'Good',
		asset_owner_id,
		make: item['MAKE#'].length == 0 ? null : item['MAKE#'],
		model: item['MODEL#'].length == 0 ? null : item['MODEL#'],
		serial: item['SERIAL#'].length == 0 ? null : item['SERIAL#'],
		description: item['ASSET DESCRIPTION'],
		purchase_price:
			item['PURCHASE PRICE'].length == 0 ? null : item['PURCHASE PRICE'],
		purchase_date:
			item['PURCHASE DATE'].length == 0 ? null : item['PURCHASE DATE'],
		purchase_order_number:
			item['PURCHASE ORDER'].length == 0 ? null : item['PURCHASE ORDER'],
		entry_date: new Date(),
		asset_category_id,
		asset_type_id: -1,
		is_printed: true,
	};
}
