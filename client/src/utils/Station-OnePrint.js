import QRCode from 'qrcode';

/**
 * Print Station One labels for a list of items.
 * Each item should have: value, scannedAt, qrThumbnail, printCopies, id
 * @param {Array} items - Array of Station One items to print
 */


export const printStationOneLabels = async (items) => {
	if (!items.length) return;

	// 75mm x 40mm at 96dpi ≈ 284px x 151px
	const labelWindow = window.open('', '_blank', 'width=1500,height=1500');
	if (!labelWindow) return;

	const labelBlocks = [];

	for (const item of items) {
		// Generate QR code from item.qrData
		console.log(item.manufacturingDate, "manufacturingDate"); // Check the QR data format
		let qrImg = '';
		// const d = new Date();
		let formattedFinal =
  new Date(item.manufacturingDate).getFullYear() +
  String(new Date(item.manufacturingDate).getMonth() + 1).padStart(2, '0') +
  String(new Date(item.manufacturingDate).getDate()).padStart(2, '0');
		// const formatted = `${String(new Date(item.manufacturingDate).getMonth()+1).padStart(2,'0')}${String(new Date(item.manufacturingDate).getDate()).padStart(2,'0')}${String(new Date(item.manufacturingDate).getFullYear()).slice(-2)}`;

		let result = item.qrData.split(" ");


		console.log(result, "result"); // ["KCC6", "2024-08-15", "KCC6"]
		let qrDataString = '232';
		if (item.value.startsWith('RR Cushion')) {
			let code = result[1]; // "KCC6"
			let spacesToAdd = Math.max(0, 6 - code.length);
			let indexOne = code + " ".repeat(spacesToAdd);
			qrDataString = `${indexOne}${result[0].replace(/S/g, '/')}  ${formattedFinal}${result[2]}C`;
		} else {
			let code = result[2]; // "KCC6"
			let spacesToAdd = Math.max(0, 6 - code.length);
			let indexOne = code + " ".repeat(spacesToAdd);
			qrDataString = `${indexOne}${result[0].replace(/S/g, '/')}${result[1]}${formattedFinal}${result[3]}C`;
		}

		// let qrDataString = `${indexOne}${result[0].replace(/S/g, '/')}${result[1]}${formatted}${result[3]}C	`;
		console.log(qrDataString , "TEST"); // "KCC6"


		if (item.qrData) {
			// qrImg = await QRCode.toDataURL(String(`${item.qrData} ${formatted}`), {
			qrImg = await QRCode.toDataURL(String(`${qrDataString}`), {
				errorCorrectionLevel: 'H',
				type: 'image/png',
				quality: 0.92,
				margin: 1,
				width: 90 // Slightly larger, but not too big for compactness
			});
		}

		// Extract fields for label
		const labelNumber = item.specification ? String(item.specification).slice(-4) : ''
		const leftBold = "TBPC";
		let rightText =  item.value.startsWith('RR Cushion') ? "R/C" : `${String(item.value).slice(0, 3).replace(/S/g, '/')}  ${item.value.split(" ")[1]}`;
		let mainText = '';

		if (item.value) {
			if (item.value.startsWith('RR Cushion')) {
				mainText = `${item.value.slice(11)} C`;
			} else {
				mainText =`${item.value.slice(7)} C`;
			}
		}
		// .replace("S", "/")
		// Date formatting: YY/MM/DD
		let dateStr = item.manufacturingDate.replace(/-/g, "/");
		// if (item.manufacturingDate) {
		// 	const d = new Date(item.manufacturingDate);
		// 	dateStr = `${String(d.getFullYear()).slice(-2)}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
		// } else {
		// 	const d = new Date();
		// 	dateStr = `${String(d.getFullYear()).slice(-2)}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
		// }

		labelBlocks.push(`
			<div class="station-label-page" style="page-break-after: always; width: 82mm; height: 40mm; margin: 0 auto; font-family:  'Arial Narrow' , Arial, sans-serif; background: #fff; padding: 0 8px">
				<div style="border: 2.2px solid #222; width: 100%; height: 100%; box-sizing: border-box; background: #fff; display: flex; flex-direction: column; justify-content: flex-start;">
					<div style="display: flex; flex-direction: row; align-items: flex-end; height: 16%; border-bottom: 2px solid #222; padding: 0 8px 0 8px;">
						<span style="font-size: 22px; font-weight: 500; color: #222; letter-spacing: 1.5px;">${labelNumber}</span>
					</div>
					<div style="display: flex; flex-direction: row; align-items: flex-start; height: 18%; padding: 0 8px 0 8px;">
						<span style="font-size: 20px; font-weight: 500; color: #111; flex: 1; text-align: left;">${leftBold}</span>
						<span style="font-size: 27px; font-weight: 500; color: #222; flex: 1; font-family: Arial, sans-serif; text-align: center;margin-top: 10px; white-space: pre; margin-right: 30px;">${rightText}</span>
						<span style="font-size: 16px; font-weight: 300; color: #222; flex: 1; text-align: right; margin-right: 12px;">${dateStr}</span>
					</div>
					<div style="display: flex; flex-direction: row; align-items: stretch; height: 66%; width: 100%; padding: 0 0 0 0;">
						<div style="flex: 2.2; display: flex; align-items: center; justify-content: flex-start;">
							<span style="font-size: 40px; color: #181818; font-weight: 540; line-height: 1; margin-left: 16px;"  >${mainText}</span>
						</div>
						<div style="flex: 1; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; padding-left: 0;">
							<img src="${qrImg}" alt="QR" style="width: 70px; height: 70px; border: none; margin-top: 2px; margin-left: -5px; background: #fff; display: block;" />
						</div>
					</div>
				</div>
			</div>
		`);
	}

		labelWindow.document.write(`
			<html>
				<head>
					<title>Station One Print</title>
					<style>
						@media print {
							.station-label-page { page-break-after: always; margin-bottom: 5mm ;}
							body { margin: 0; }
							
						}
						body { background: #fff; margin: 0; }
					</style>
				</head>
				<body>
					${labelBlocks.join('')}
					<script>window.print();</script>
				</body>
			</html>
		`);
		labelWindow.document.close();
	};
