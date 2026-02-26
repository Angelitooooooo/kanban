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
		let qrImg = '';
		if (item.qrData) {
			qrImg = await QRCode.toDataURL(String(item.qrData), {
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
		const rightText =  item.specification ? String(item.specification).slice(0, 6) : ''
		let mainText = '';
		if (item.value) {
			if (item.value.startsWith('RR Cushion')) {
				mainText = item.value.slice(11);
			} else {
				mainText =`${item.value.slice(7)} C`;
			}
		}
		// Date formatting: YY/MM/DD
		let dateStr = '';
		if (item.manufacturingDate) {
			const d = new Date(item.manufacturingDate);
			dateStr = `${String(d.getFullYear()).slice(-2)}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
		} else {
			const d = new Date();
			dateStr = `${String(d.getFullYear()).slice(-2)}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
		}

		labelBlocks.push(`
			<div class="station-label-page" style="page-break-after: always; width: 75mm; height: 40mm; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; background: #fff;">
				<div style="border: 2.2px solid #222; width: 100%; height: 100%; box-sizing: border-box; background: #fff; display: flex; flex-direction: column; justify-content: flex-start;">
					<div style="display: flex; flex-direction: row; align-items: flex-end; height: 16%; border-bottom: 2px solid #222; padding: 0 8px 0 8px;">
						<span style="font-size: 22px; font-weight: 700; color: #222; letter-spacing: 1.5px;">${labelNumber}</span>
					</div>
					<div style="display: flex; flex-direction: row; align-items: flex-end; height: 18%; padding: 0 8px 0 8px;">
						<span style="font-size: 22px; font-weight: 700; color: #111; flex: 1; text-align: left;">${leftBold}</span>
						<span style="font-size: 22px; font-weight: 700; color: #222; flex: 1; text-align: center;">${rightText}</span>
						<span style="font-size: 16px; font-weight: 500; color: #222; flex: 1; text-align: right;">${dateStr}</span>
					</div>
					<div style="display: flex; flex-direction: row; align-items: stretch; height: 66%; width: 100%; padding: 0 0 0 0;">
						<div style="flex: 2.2; display: flex; align-items: center; justify-content: flex-start;">
							<span style="font-size: 40px; font-weight: 800; color: #181818; letter-spacing: 2px; line-height: 1; margin-left: 16px;">${mainText}</span>
						</div>
						<div style="flex: 1; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; padding-left: 0;">
							<img src="${qrImg}" alt="QR" style="width: 90px; height: 90px; border: none; margin-top: 2px; margin-left: -16px; background: #fff; display: block;" />
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
							.station-label-page { page-break-after: always; }
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
