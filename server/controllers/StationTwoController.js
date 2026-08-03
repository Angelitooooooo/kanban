const { db } = require('../db');

// GET all KanbanQA data, optionally filter by date
const ValidateKanbanBarcode = async (req, res) => {
	try {
		const { barcode } = req.body;
		if(!barcode) {
			return res.status(400).json({ error: 'Barcode value is required.' });
		}
		const result = await db('Kanban_qa')
			.select('*')
			.where('barcode', barcode)
			.first();
			if(result.isValidatedBarcode == 1) {
				return res.status(400).json({ error: 'Barcode is already validated.' });
			}
			else{
				const updated = await db('Kanban_qa')
				.where({ id: result.id })
				.update({ isValidatedBarcode: 1 });
				result.isValidatedBarcode = 1; // Update the result object to reflect the change
				res.status(200).json(result);
			}
		
	} catch (error) {
		console.error('Error validating Kanban Barcode:', error);
		res.status(500).json({ error: 'Failed to validate Kanban Barcode', details: error.message });
		
	}

}

const ValidateKanbanQR = async (req, res) => {
	try {
		const { kanban } = req.body;
		if(!kanban) {
			return res.status(400).json({ error: 'Kanban value is required.' });
		}
		const result = await db('Kanban_qa')
			.select('*')
			.where('qr_kanban', kanban)
			.first();
			if(result.isValidatedQR == 1) {
				return res.status(400).json({ error: 'QR code is already validated.' });
			}else{
				const updated = await db('Kanban_qa')
				.where({ id: result.id })
				.update({ isValidatedQR: 1 });
				res.status(200).json(updated);
			}
	} catch (error) {
		console.error('Error validating Kanban QR:', error);
		res.status(500).json({ error: 'Failed to validate Kanban QR', details: error.message });
	}
}


const GetKanban = async (req, res) => {
	try {
const results = await db('Kanban_qa')
  .select(
    db.raw("DISTINCT TRIM(LEFT(TRIM(qr_kanban), 5)) AS name")
  )
  .whereNotNull('qr_kanban')
  .whereRaw("TRIM(qr_kanban) != ''")
  .whereRaw("qr_kanban NOT LIKE 'FSB%'")
  .whereRaw("qr_kanban NOT LIKE 'FSC%'")
  .whereRaw("qr_kanban NOT LIKE 'RSB%'")
  .whereRaw("qr_kanban NOT LIKE 'RSC%'")
  .whereRaw("TRIM(LEFT(qr_kanban, 5)) != 'RR Cu'")
  .havingRaw("name IS NOT NULL AND name != ''")
  .orderBy('name', 'asc');
		

		// const results = await db('Kanban_qa')
		// 	.select(
		// 		db.raw(
		// 			"DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(qr_kanban, ' ', 3), ' ', -1) AS name"  
		// 		)
		// 	)
		// 	.where(function () {
		// 		this.where('isValidatedQR', 1)
		// 			.orWhere('isValidatedBarcode', 1);
		// 	})
		// 	.whereRaw("qr_kanban REGEXP '^[^ ]+ [^ ]+ [^ ]+ [^ ]+$'")
		// 	.orderBy('name', 'asc');

			res.status(200).json(results);
	} catch (error) {
		console.error('Error fetching all Kanban_qa:', error);
		res.status(500).json({ error: 'Failed to fetch Kanban_qa data', details: error.message });
	}
}


const getAllKanbanQA = async (req, res) => {
	try {
		const { date } = req.query;
		let query = db('Kanban_qa').select('*');
		if (date) {
			query = query.whereRaw('DATE(created_at) = ?', [date]);
		}
		const results = await query.orderBy('id', 'asc');
		
		// Remove duplicate kanban entries based on last 4 characters
		// const uniqueResults = [];
		// const seenKeys = new Set();
		// for (const item of results) {
		// 	const kanbanKey = item.kanban ? item.kanban.slice(-4) : '';
		// 	if (!seenKeys.has(kanbanKey)) {
		// 		uniqueResults.push(item);
		// 		seenKeys.add(kanbanKey);
		// 	}
		// }
		// // Return id and kanban fields
		// const kanbanList = uniqueResults.map(item => ({ id: item.id, name: item.kanban ? item.kanban.slice(-4) : '' }));


				// const result = Object.values(
				// results.reduce((acc, item) => {
				// 	if (!item.qr_kanban) return acc; 
					
				// 	const match = item.qr_kanban.match(
				// 	/^(.*?)(?:\s(000[1-9]|00[1-3][0-9]|0040))?(?:\s(\d{6}))?$/
				// 	);

				// 	const base = match?.[1]?.trim();
				// 	const date = match?.[3] || null;

				// 	if (!base) return acc;

				// 	const key = `${base}-${date}`;

				// 	if (!acc[key]) {
				// 	acc[key] = item;
				// 	} else {
				// 	// keep latest updated_at
				// 	if (new Date(item.updated_at) > new Date(acc[key].updated_at)) {
				// 		acc[key] = item;
				// 	}
				// 	}

				// 	return acc;
				// }, {})
				// );
				let map = new Map();
				results.forEach(item => {

					
					if (!item.qr_kanban || typeof item.qr_kanban !== 'string') return;

					let match = item.qr_kanban.match(/^(\w+)\s+.*?(\d{8})/);

					if (!match) return;

					let key = `${match[1]} ${match[2]}`;

					if (!map.has(key)) {
						map.set(key, {
						...item,
						qr_kanban: key
						});
					}
				});

				let result = Array.from(map.values());

		const kanbanList = result.map(item => {
			const kanbanSuffix = item.kanban ? item.kanban.slice(-4) : '';

			// get 6-digit date at the end (if exists)
			const dateMatch = item.qr_kanban.match(/(\d{8})$/);
			const date = dateMatch ? dateMatch[1] : '';

			return {
				id: item.id,
				name: date ? `${kanbanSuffix} ${date}` : kanbanSuffix
			};
		});
		res.status(200).json(kanbanList);
	} catch (error) {
		console.error('Error fetching all Kanban_qa:', error);
		res.status(500).json({ error: 'Failed to fetch Kanban_qa data', details: error.message });
	}
};

// GET KanbanQA data filtered by date and kanban
const getKanbanQAByDateAndKanban = async (req, res) => {
	try {
		const { date, kanban } = req.query;
		if (!date || !kanban) {
			return res.status(400).json({ error: 'Query parameters date and kanban are required.' });
		}
		let splitKanban = kanban.split(' ');
		const part1 = splitKanban[0]?.trim();
		const part2 = splitKanban[1]?.trim();

		const query = db('Kanban_qa')
		.select('*')
		.whereRaw('DATE(created_at) = ?', [date])
		.andWhere('qr_kanban', 'like', `%${part1}%`);

		if (splitKanban.length > 1 && part2) {
		query.andWhere('qr_kanban', 'like', `%${part2}%`);
		}

		const results = await query
		.where(function () {
			this.where('isValidatedQR', 1)
			.orWhere('isValidatedBarcode', 1);
		})
		.orderBy('id', 'asc');

		const formatted = results.map(item => {
		// remove last 8-digit date first

			const rowNumber = item.qr_kanban.slice(-5).replace("C", "");      // "0002C"

			// extract sequence (0001–0040)
			const seqMatch = rowNumber.match(/\b(000[1-9]|00[1-3][0-9]|0040)\b/);

			let match = item.qr_kanban.match(/^(\w+)\s+.*?(\d{4})\D*$/);

			let result = match ? `${match[1]}  ${match[2]}` : null;

			return {
				columnName: item.kanban
				? item.kanban.startsWith('RSC')
					? item.kanban.slice(0, 3)
					: item.kanban.slice(0, 6)
				: '',

				row: parseInt(seqMatch?.[0] || 0, 10),

				value: item.isValidatedQR == 1 ? result || '' : '',
				barcode: item.isValidatedBarcode == 1 ? item.barcode || '' : '',
				created_at: item.created_at
			};
		});
		res.status(200).json(formatted);
	} catch (error) {
		console.error('Error fetching Kanban_qa by date and kanban:', error);
		res.status(500).json({ error: 'Failed to fetch Kanban_qa data', details: error.message });
	}
};
// PATCH: Update isValidated to 1 for a given Kanban_qa row by id
const updateKanbanQAValidatedQR = async (req, res) => {
	try {
		const { value, date } = req.query;
		if (!value || !date) {
			return res.status(400).json({ error: 'Parameters value and date are required.' });
		}

		const result = await db('Kanban_qa')
			.select(['id', 'isValidatedQR'])
			.whereRaw('DATE(created_at) = ?', [date])
			.andWhere('qr_kanban', 'like', `%${value}%`)
			.first();


		if (!result || !result.id) {
			return res.status(404).json({ error: 'QR code not found on QA.' });
		}
		if(result.isValidatedQR == 1) {
			return res.status(400).json({ error: 'QR code is already validated.' });
		}

		const updated = await db('Kanban_qa')
			.where({ id: result.id })
			.update({ isValidatedQR: 1 });
		if (updated === 0) {
			return res.status(404).json({ error: 'Kanban_qa row not found.' });
		}
		res.status(200).json({ success: true, value, date, id: result.id });
	} catch (error) {
		console.error('Error updating isValidated:', error);
		res.status(500).json({ error: 'Failed to update isValidated', details: error.message });
	}
};

const updateKanbanQAValidatedBarcode = async (req, res) => {
	try {
		const { value, date, kanban } = req.query;
		if (!value || !date || !kanban) {
			return res.status(400).json({ error: 'Parameters value, date, and kanban are required.' });
		}

		let splitKanban = kanban.split(' ');
		const part1 = splitKanban[0]?.trim();
		const part2 = splitKanban[1]?.trim();

		const query = db('Kanban_qa')
		.select(['id', 'isValidatedBarcode'])

		.whereRaw('DATE(created_at) = ?', [date])
		.andWhere('qr_kanban', 'like', `%${part1}%`)
		.andWhere('barcode', 'like', `%${value}%`);


		if (splitKanban.length > 1 && part2) {
		query.andWhere('qr_kanban', 'like', `%${part2}%`);
		}

		const result = await query.first();

		// const result = await db('Kanban_qa')
		// 	.select(['id', 'isValidatedBarcode'])
		// 	.whereRaw('DATE(created_at) = ?', [date])
		// 	.andWhere('barcode', 'like', `%${value}%`)
		// 	.andWhere('qr_kanban', 'like', `%${kanban}%`)
		// 	.first();

		if (!result || !result.id) {
			return res.status(404).json({ error: 'Barcode not found on QA.' });
		}
		if(result.isValidatedBarcode == 1) {
			return res.status(400).json({ error: 'Barcode is already validated.' });
		}
		const updated = await db('Kanban_qa')
			.where({ id: result.id })
			.update({ isValidatedBarcode: 1 });
		if (updated === 0) {
			return res.status(404).json({ error: 'Barcode not found on QA.' });
		}
		res.status(200).json({ success: true, id: result.id });
	} catch (error) {
		console.error('Error updating isValidated:', error);
		res.status(500).json({ error: 'Failed to update isValidated', details: error.message });
	}
};

module.exports = {
	getAllKanbanQA,
	getKanbanQAByDateAndKanban,
	updateKanbanQAValidatedQR,
    updateKanbanQAValidatedBarcode,
	GetKanban,
	ValidateKanbanQR,
	ValidateKanbanBarcode
};







