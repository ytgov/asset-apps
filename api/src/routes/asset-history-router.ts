import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { ReturnValidationErrors } from '../middleware';
import _ from 'lodash';
import moment from 'moment';

export const assetHistoryRouter = express.Router();

import { db } from '../data';

assetHistoryRouter.get('/:id', async (req: Request, res: Response) => {
	try {
		let list = await db({ aH: 'asset_history' })
			.select(
				'ah.asset_id',
				'ah.date',
				'ah.description',
				'ah.user_email',
				{ history_entry_id: 'ah.id' },
				'aht.entry_type'
			)
			.orderBy('date')
			.where('asset_id', '=', req.params.id)
			.leftJoin({ aht: 'asset_history_type' }, 'aH.entry_type_id', 'aht.id');
		for (let item of list) {
			item.date = moment(item.date).utc(true).format('YYYY-MM-DD h:mm:ss a');
		}
		return res.json({ data: list });
	} catch (error: any) {
		console.log(error);
		res.status(500).json('Internal Server Error');
	}
});

assetHistoryRouter.post(
	'/:id',
	ReturnValidationErrors,
	async (req: Request, res: Response) => {
		let asset_id = req.params.id;
		let { entry_type_id, description } = req.body;
		let user_email = req.user.email;
		let date = new Date();

		let body = {
			asset_id,
			user_email,
			entry_type_id,
			description,
			date,
		};

		body.entry_type_id = 1;

		let list = await db('asset_history').insert(body);

		return res.json({
			data: list,
			messages: [{ text: 'Entry saved', variant: 'success' }],
		});
	}
);

assetHistoryRouter.delete(
	'/assetHistoryEntry/:id',
	async (req: Request, res: Response) => {
		try {
			await db('asset_history').where('id', '=', req.params.id).delete();

			res.status(200).json('Success');
		} catch (error: any) {
			console.log(error);
			res.status(500).json('Internal Server Error');
		}
	}
);
