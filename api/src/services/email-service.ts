import fs from 'fs';
import path from 'path';

import nodemailer, { Transporter, TransportOptions } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';

import {
	MAIL_CONFIG,
	MAIL_FROM,
	FRONTEND_URL,
	APPLICATION_NAME,
} from '../config';
import { SimpleUser } from '../data/models';
const BASE_TEMPLATE = '../templates/base.html';
const TAG_REQUEST_NOTIFY_TEMPLATE = '../templates/tag_request_notify.html';
const TAG_REQUEST_COMPLETE_TEMPLATE = '../templates/tag_request_complete.html';
const TRANSFER_REQUEST_TEMPLATE = '../templates/transfer_request.html';
const TAG_PRINT_REQUEST_TEMPLATE = '../templates/tag_print_request.html';
const TRANSFER_REQUEST_NOTIFY_TEMPLATE =
	'../templates/transfer_request_notify.html';

export class EmailService {
	readonly transport: Transporter;

	constructor() {
		this.transport = nodemailer.createTransport(
			MAIL_CONFIG as TransportOptions
		);
		this.transport
			.verify()
			.then((response) => {
				console.log('Mailer config is valid.');
			})
			.catch((error) => {
				console.log('Mailer config is not valid.');
				console.log(error);
			});
	}

	async sendTransferRequest(user: SimpleUser, items: string): Promise<any> {
		let templatePath = path.join(__dirname, TRANSFER_REQUEST_TEMPLATE);
		let content = fs.readFileSync(templatePath).toString();
		let fullName = `${user.first_name} ${user.last_name}`;

		content = content.replace(/``CONTENT``/g, items);

		return this.sendEmail(
			fullName,
			user.email,
			'Request to transfer or dispose of assets',
			content
		);
	}

	async sendTransferRequestNotify(
		user: SimpleUser,
		requester: SimpleUser,
		items: string,
		mailcode: string
	): Promise<any> {
		let templatePath = path.join(__dirname, TRANSFER_REQUEST_NOTIFY_TEMPLATE);
		let content = fs.readFileSync(templatePath).toString();
		let fullName = `${user.first_name} ${user.last_name}`;

		content = content.replace(
			/``REQUEST``/g,
			`${requester.email} at ${mailcode}`
		);
		content = content.replace(/``CONTENT``/g, items);

		return this.sendEmail(
			fullName,
			user.email,
			'New Request for transfer or disposal',
			content
		);
	}

	async sendTagPrintRequest(
		user: SimpleUser,
		tagContent: string
	): Promise<any> {
		let templatePath = path.join(__dirname, TAG_PRINT_REQUEST_TEMPLATE);
		let content = fs.readFileSync(templatePath).toString();
		let fullName = `${user.first_name} ${user.last_name}`;

		content = content.replace(/``TAG_LIST``/g, tagContent);

		return this.sendEmail(
			fullName,
			user.email,
			'Asset Tag Print Request',
			content
		);
	}

	async sendTagRequestNotification(
		user: SimpleUser,
		tags: string[]
	): Promise<any> {
		let templatePath = path.join(__dirname, TAG_REQUEST_NOTIFY_TEMPLATE);
		let content = fs.readFileSync(templatePath).toString();
		let fullName = `${user.first_name} ${user.last_name}`;

		// list tags in an email so they know which ones to print out
		let tagList = tags.join(', ');
		content = content.replace(/``TAG_LIST``/g, tagList);

		return this.sendEmail(
			fullName,
			user.email,
			'New Asset Tags Request',
			content
		);
	}

	async sendTagRequestComplete(user: SimpleUser, tags: string[]): Promise<any> {
		let templatePath = path.join(__dirname, TAG_REQUEST_COMPLETE_TEMPLATE);
		let content = fs.readFileSync(templatePath).toString();
		let fullName = `${user.first_name} ${user.last_name}`;

		// list tags out
		// this should contain a link to the /my-requested-tags
		let tagList = tags.join(', ');
		content = content.replace(/``TAG_LIST``/g, tagList);
		content = content.replace(
			/``TAG_EDIT_URL``/g,
			`${FRONTEND_URL}/my-requested-tags`
		);

		return this.sendEmail(
			fullName,
			user.email,
			'Your Asset Tag Request',
			content
		);
	}

	async sendEmail(
		toName: string,
		toEmail: string,
		subject: string,
		customContent: string
	): Promise<any> {
		let basePath = path.join(__dirname, BASE_TEMPLATE);
		let baseContent = fs.readFileSync(basePath).toString();

		baseContent = baseContent.replace(/``CUSTOM_CONTENT``/, customContent);
		baseContent = baseContent.replace(/``APPLICATION_URL``/g, FRONTEND_URL);
		baseContent = baseContent.replace(
			/``APPLICATION_NAME``/g,
			APPLICATION_NAME
		);
		baseContent = baseContent.replace(/``TO_NAME``/g, toName);
		baseContent = baseContent.replace(/``TO_EMAIL``/g, toEmail);

		let message: MailOptions = {
			from: MAIL_FROM,
			to: `"${toName}" <${toEmail}>`,
			subject: `${subject} : ${APPLICATION_NAME}`,
			html: baseContent,
		};

		if (toEmail.length == 0) {
			console.log(
				'Not sending email to ' + toName + ' without an email address'
			);
			return null;
		}

		return this.transport.sendMail(message);
	}
}
