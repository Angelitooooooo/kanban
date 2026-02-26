<template>
	<v-container fluid class="pa-4 station-one-page">
		<input
			ref="hiddenScannerInput"
			v-model="scanInput"
			type="text"
			class="hidden-scanner-input"
			@keyup.enter="submitScan"
			@keyup.tab="submitScan"
		/>

		<v-dialog v-model="showInvalidScanDialog" max-width="420">
			<v-card>
				<v-card-title class="headline">Invalid Scan Type</v-card-title>
				<v-card-text>{{ invalidScanMessage }}</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn color="primary" text @click="closeInvalidScanDialog">OK</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="showDuplicateScanDialog" max-width="420">
			<v-card>
				<v-card-title class="headline d-flex align-center">
					<v-icon class="mr-2" color="warning">mdi-alert-circle</v-icon>
					Duplicate QR Code
				</v-card-title>
				<v-card-text>{{ duplicateScanMessage }}</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn color="warning" text @click="closeDuplicateScanDialog">OK</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="showPrintDialog" max-width="560">
			<v-card rounded="lg" class="print-dialog-card" elevation="8">
				<v-card-title class="headline d-flex align-center print-dialog-title pb-2">
					<v-icon class="mr-2" color="primary">mdi-printer</v-icon>
					Scanned Item
					<v-spacer />
					<v-chip x-small outlined color="primary">{{ printMode === 'single' ? 'Single' : 'Bulk' }}</v-chip>
				</v-card-title>
				<v-card-subtitle class="pt-0 pb-3 dialog-subtitle">
					Choose print mode and review selected details
				</v-card-subtitle>
				<v-divider />
				<v-card-text class="pt-4 dialog-content">
					<v-sheet rounded="lg" class="dialog-hero pa-3 mb-4" outlined>
						<div class="d-flex align-center">
							<v-icon color="primary" class="mr-2">mdi-file-document-outline</v-icon>
							<div>
								<div class="hero-title">Print Setup</div>
								<div class="hero-caption">Configure mode and verify the item before printing</div>
							</div>
						</div>
					</v-sheet>

					<div class="section-label mb-2">Print Mode</div>
					<v-btn-toggle v-model="printMode" mandatory rounded class="mode-toggle mb-4" color="primary">
						<v-btn value="single" class="mode-option-btn">
							<v-icon x-small class="mr-1">mdi-printer-outline</v-icon>
							Single Print
						</v-btn>
						<v-btn value="bulk" class="mode-option-btn">
							<v-icon x-small class="mr-1">mdi-printer-pos</v-icon>
							Bulk Print
						</v-btn>
					</v-btn-toggle>

					<div v-if="selectedPrintItem">
						<div class="section-label mb-2">Selected Item</div>
						<v-text-field
							v-model="singlePrintInput"
							:label="printMode === 'single' ? 'Label Content' : 'Number of Copies'"
							:type="printMode === 'bulk' ? 'text' : 'text'"
							:inputmode="printMode === 'bulk' ? 'numeric' : undefined"
							:maxlength="printMode === 'bulk' ? 3 : undefined"
							:hint="printMode === 'bulk' ? 'Maximum 3 digits' : undefined"
							:persistent-hint="printMode === 'bulk'"
							:error-messages="printInputError"
							@input="onPrintInput"
							outlined
							dense
							class="mb-3"
						/>
						<v-sheet outlined rounded="lg" class="pa-3 item-summary">
							<div class="summary-row">
								<span class="summary-label d-flex align-center"><v-icon x-small class="mr-1">mdi-qrcode</v-icon>Value</span>
								<span class="summary-value">{{ selectedPrintItem.value }}</span>
							</div>
							<div class="summary-row mt-2">
								<span class="summary-label d-flex align-center"><v-icon x-small class="mr-1">mdi-clock-outline</v-icon>Scanned At</span>
								<span class="summary-value">{{ selectedPrintItem.scannedAt }}</span>
							</div>
						</v-sheet>
						<div class="d-flex justify-center mt-4 preview-wrap" v-if="selectedPrintItem.qrThumbnail">
							<img :src="selectedPrintItem.qrThumbnail" alt="QR preview" class="print-preview-image" />
						</div>
					</div>
				</v-card-text>
				<v-card-actions class="px-4 pb-4 pt-0">
					<v-spacer />
					<v-btn color="primary" class="px-6 mr-2" @click="onDialogPrintClick">
						<v-icon left small>mdi-printer</v-icon>
						Print
					</v-btn>
					<v-btn outlined color="secondary" class="px-6" @click="closePrintDialog">Close</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-row class="mb-4" justify="center">
			<v-col cols="12" md="10" lg="8">
				<v-sheet rounded="lg" elevation="3" class="pa-5 text-center">
					<div class="d-flex align-center justify-center mb-2">
						<v-icon color="primary" class="mr-2">mdi-clipboard-text-clock-outline</v-icon>
						<span class="text-h5 font-weight-bold">Station One Scan Log</span>
					</div>
				</v-sheet>
			</v-col>
		</v-row>

		<v-row>
			<v-col v-if="showScannerPanel" cols="12" md="6">
				<v-card outlined rounded="lg" class="pa-2" elevation="3">
					<v-card-title class="d-flex align-center">
						<v-icon color="primary" class="mr-2">mdi-barcode-scan</v-icon>
						Station One Barcode Scanner Input
					</v-card-title>
					<v-divider />
					<v-card-text>
						<v-text-field
							ref="scannerInput"
							v-model="scanInput"
							label="Scan barcode or QR here"
							prepend-inner-icon="mdi-barcode"
							outlined
							dense
							hide-details
							@keyup.enter.native="submitScan"
						/>
					</v-card-text>
				</v-card>
			</v-col>

			<v-col cols="12" :md="showScannerPanel ? 6 : 12" class="d-flex justify-center align-stretch">
				<v-card outlined rounded="lg" class="table-card" elevation="6">
					<v-card-title class="table-title d-flex align-center justify-space-between py-4 px-5">
						<div class="d-flex align-center">
							<v-icon class="mr-2" color="primary">mdi-table-large</v-icon>
							<span>Scanned Data</span>
						</div>
						<div class="d-flex align-center">
							<v-chip small outlined color="primary" class="mr-2">{{ scans.length }} Records</v-chip>
						</div>
					</v-card-title>
					<v-divider />
					<v-card-text class="px-5 pt-4 pb-5">
						<v-row class="mb-4" align="center">
							<v-col cols="12" md="6">
								<v-text-field
									v-model="search"
									prepend-inner-icon="mdi-magnify"
									label="Search scans..."
									outlined
									dense
									clearable
									hide-details
								/>
							</v-col>
							<v-col cols="12" md="6" class="text-right">
								<span class="text-caption text-disabled">{{ filteredScans.length }} of {{ scans.length }} results</span>
							</v-col>
						</v-row>
						<v-data-table
							:headers="headers"
							:items="filteredScans"
							:items-per-page="5"
							:sort-by.sync="sortBy"
							:sort-desc.sync="sortDesc"
							class="elevation-1 station-table rounded-lg"
							hide-default-header
						>
							<template #header="{ props }">
								<thead class="station-table-head">
									<tr>
									<th v-for="header in props.headers" :key="header.value" class="text-left station-head-cell" :class="{ sortable: header.sortable }" @click="header.sortable && toggleSort(header.value)">
										<div class="d-flex align-center">
											<span>{{ header.text }}</span>
											<v-icon v-if="header.sortable" x-small class="ml-1" :class="{ active: sortBy === header.value }">
												{{ getSortIcon(header.value) }}
											</v-icon>
										</div>
										</th>
									</tr>
								</thead>
							</template>
							<template #no-data>
								<div class="py-8 text-center">
									<v-icon color="grey lighten-1" size="32">mdi-inbox-outline</v-icon>
									<div class="mt-2 subtitle-2 grey--text text--darken-1">No scans yet</div>
								</div>
							</template>
							<template v-slot:[`item.index`]="{ item }">
								<v-chip x-small outlined class="index-pill">{{ item.index }}</v-chip>
							</template>
							<template v-slot:[`item.type`]="{ item }">
								<div class="d-flex align-center type-cell">
									<div v-if="item.type === 'QR' && item.qrThumbnail" class="qr-thumb-wrapper">
										<img :src="item.qrThumbnail" alt="QR thumbnail" class="qr-thumb-image" />
									</div>
									<span v-else>{{ item.type }}</span>
								</div>
							</template>
							<template v-slot:[`item.value`]="{ item }">
								<span class="scan-value">{{ item.value }}</span>
							</template>
							<template v-slot:[`item.scannedAt`]="{ item }">
								<div class="d-flex align-center scanned-time">
									<v-icon x-small class="mr-1">mdi-clock-outline</v-icon>
									<span>{{ item.scannedAt }}</span>
								</div>
							</template>
							<template v-slot:[`item.printCopies`]="{ item }">
								<div class="d-flex align-center">
									<v-chip small outlined color="primary" label>{{ item.printCopies }}</v-chip>
								</div>
							</template>
							<template v-slot:[`item.action`]="{ item }">
								<v-btn small outlined color="primary" @click="openPrintDialog(item)">
									<v-icon small>mdi-printer</v-icon>
								</v-btn>
							</template>
						</v-data-table>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import QRCode from 'qrcode';
import { getKanbanPrintsStation1, getAllKanbanPrints, saveKanbanPrint, updateKanbanPrint, saveErrorLog } from '../services/api';
// import { printZebraLabels100Bulk } from '../utils/print';
import { printStationOneLabels } from '../utils/Station-OnePrint';


export default {
	name: 'StationOneView',
	data() {
		return {
			showScannerPanel: false,
			showInvalidScanDialog: false,
			showDuplicateScanDialog: false,
			showPrintDialog: false,
			selectedPrintItem: null,
			printMode: 'single',
			singlePrintInput: '',
			printInputError: '',
			invalidScanMessage: '',
			duplicateScanMessage: '',
			scanInput: '',
			scannerBuffer: '',
			scannerBufferTimer: null,
			duplicateScanDialogTimer: null,
			lastScanTime: 0,
			scanCooldownMs: 500,
			search: '',
			sortBy: 'index',
			sortDesc: true,
			scans: [],
			scannedValues: new Set(),
			userId: null,
			headers: [
				{ text: '#', value: 'index', width: 70, sortable: true },
				{ text: 'Type', value: 'type', width: 120, sortable: true },
				{ text: 'Value', value: 'value', sortable: true },
				{ text: 'Scanned At', value: 'scannedAt', width: 180, sortable: true },
				{ text: 'Print Copies', value: 'printCopies', width: 120, sortable: true },
				{ text: 'Action', value: 'action', width: 130, sortable: false }
			],
			kanbanData: ['FSC LH', 'FSC RH', 'FSB LH', 'FSB RH', 'RSB RH', 'RSB LH', 'RR Cushion']
		};
	},
	mounted() {
		window.addEventListener('keydown', this.onGlobalScannerKeydown);
		this.fetchKanbanPrints();
		this.focusInput();
	},
	beforeDestroy() {
		window.removeEventListener('keydown', this.onGlobalScannerKeydown);
		this.clearScannerBufferTimer();
		this.clearDuplicateScanDialogTimer();
	},
	watch: {
		showScannerPanel() {
			this.focusInput();
		},
		printMode() {
			this.singlePrintInput = '';
			this.printInputError = '';
		},
		showDuplicateScanDialog(newVal) {
			if (newVal) {
				this.clearDuplicateScanDialogTimer();
				this.duplicateScanDialogTimer = setTimeout(() => {
					this.showDuplicateScanDialog = false;
				}, 2000);
			} else {
				this.clearDuplicateScanDialogTimer();
			}
		}
	},
	computed: {
		filteredScans() {
			if (!this.search) {
				return this.scans;
			}

			const searchTerm = this.search.toLowerCase();
			return this.scans.filter(item => {
				return (
					item.value.toLowerCase().includes(searchTerm) ||
					item.type.toLowerCase().includes(searchTerm) ||
					item.scannedAt.toLowerCase().includes(searchTerm) ||
					item.index.toString().includes(searchTerm) ||
					item.printCopies.toString().includes(searchTerm)
				);
			});
		}
	},
	methods: {
		async fetchKanbanPrints() {
			try {
				const isAdmin = this.$store.state.user?.isAdmin;
				let kanbanPrints;
				
				if (isAdmin === 1) {
					kanbanPrints = await getAllKanbanPrints(true);
				} else {
					kanbanPrints = await getKanbanPrintsStation1();
				}
				
				const mappedData = await Promise.all(
					kanbanPrints.map(async (item, index) => {
						const detectedType = this.detectScanType(item.kanban);
						let qrThumbnail = '';
						
						if (detectedType === 'QR') {
							qrThumbnail = await this.generateQrThumbnail(item.kanban);
						}
						
						return {
							id: item.id,
							index: kanbanPrints.length - index,
							type: detectedType,
							value: item.kanban,
							qrThumbnail,
							scannedAt: new Date(item.created_at).toLocaleTimeString(),
							printCopies: item.printCopies
						};
					})
				);
				
				this.scans = mappedData;
				
				mappedData.forEach(item => {
					this.scannedValues.add(item.value);
				});
			} catch (error) {
				await saveErrorLog('/station-one', `Error fetching kanban prints: ${error.message}`);
			}
		},
		onGlobalScannerKeydown(event) {
			if (this.showScannerPanel) {
				return;
			}

			if (event.ctrlKey || event.altKey || event.metaKey) {
				return;
			}
			if (event.key === 'Enter' || event.key === 'Tab') {
				if (this.scannerBuffer.trim()) {
					this.submitScannedValue(this.scannerBuffer);
					event.preventDefault();
				}
				this.scannerBuffer = '';
				this.clearScannerBufferTimer();
				this.focusInput();
				return;
			}

			if (event.key.length === 1) {
				this.scannerBuffer += event.key;
				this.restartScannerBufferTimer();
			}
		},
		restartScannerBufferTimer() {
			this.clearScannerBufferTimer();
			this.scannerBufferTimer = setTimeout(() => {
				this.scannerBuffer = '';
			}, 120);
		},
		clearScannerBufferTimer() {
			if (this.scannerBufferTimer) {
				clearTimeout(this.scannerBufferTimer);
				this.scannerBufferTimer = null;
			}
		},
		clearDuplicateScanDialogTimer() {
			if (this.duplicateScanDialogTimer) {
				clearTimeout(this.duplicateScanDialogTimer);
				this.duplicateScanDialogTimer = null;
			}
		},
		focusInput() {
			this.$nextTick(() => {
				if (this.showScannerPanel && this.$refs.scannerInput && this.$refs.scannerInput.focus) {
					this.$refs.scannerInput.focus();
					return;
				}

				if (!this.showScannerPanel && this.$refs.hiddenScannerInput) {
					this.$refs.hiddenScannerInput.focus();
				}
			});
		},
		submitScan() {
			const barcodeText = this.scanInput.trim();
			if (!barcodeText) {
				this.focusInput();
				return;
			}

			this.submitScannedValue(barcodeText);

			this.scanInput = '';
			this.focusInput();
		},
		async submitScannedValue(rawValue) {
			const now = Date.now();
			if (now - this.lastScanTime < this.scanCooldownMs) {
				return;
			}
			this.lastScanTime = now;

			const barcodeText = String(rawValue).trim();
			if (!barcodeText) {
				return;
			}

			const detectedType = this.detectScanType(barcodeText);
			if (detectedType !== 'QR') {
				this.invalidScanMessage = `Only QR codes are allowed. Detected: ${detectedType}.`;
				this.showInvalidScanDialog = true;
				return;
			}

			if (this.scannedValues.has(barcodeText)) {
				this.duplicateScanMessage = `This QR code (${barcodeText}) has already been scanned. Please scan a different QR code.`;
				this.showDuplicateScanDialog = true;
				return;
			}

			this.scannedValues.add(barcodeText);
			let qrThumbnail = '';

			if (detectedType === 'QR') {
				qrThumbnail = await this.generateQrThumbnail(barcodeText);
			}

			this.scans.unshift({
				index: this.scans.length + 1,
				type: detectedType,
				value: barcodeText,
				qrThumbnail,
				scannedAt: new Date().toLocaleTimeString(),
				printCopies: 0,
				id: null
			});

			// Save the scanned data to the kanban_print table
			try {
				const response = await saveKanbanPrint({
					kanban: barcodeText,
					printCopies: 0,
					user_id: this.$store.state.user?.userId
				});
				// Update the first item in scans with the returned ID
				if (this.scans.length > 0 && response.id) {
					this.scans[0].id = response.id;
				}
			} catch (error) {
				await saveErrorLog('/station-one', `Error saving kanban print: ${error.message}`);
			}
		},
		closeInvalidScanDialog() {
			this.showInvalidScanDialog = false;
			this.focusInput();
		},
		closeDuplicateScanDialog() {
			this.clearDuplicateScanDialogTimer();
			this.showDuplicateScanDialog = false;
			this.focusInput();
		},
		openPrintDialog(item) {
			this.selectedPrintItem = item;
			this.printMode = 'single';
			this.singlePrintInput = '';
			this.printInputError = '';
			this.showPrintDialog = true;
            console.log(item)
		},
		closePrintDialog() {
			this.showPrintDialog = false;
			this.selectedPrintItem = null;
			this.printMode = 'single';
			this.singlePrintInput = '';
			this.printInputError = '';
			this.focusInput();
		},
		onPrintInput(value) {
			if (this.printMode === 'bulk') {
				const digitsOnly = String(value || '').replace(/\D/g, '').slice(0, 3);
				if (digitsOnly !== String(this.singlePrintInput || '')) {
					this.singlePrintInput = digitsOnly;
				}
			}

			this.printInputError = '';
		},
		async onDialogPrintClick() {
			const inputValue = String(this.singlePrintInput || '').trim();

			if (!inputValue) {
				this.printInputError = this.printMode === 'single'
					? 'Label content is required.'
					: 'Number of copies is required.';
				return;
			}

			if (this.printMode === 'bulk') {
				const copyCount = Number(inputValue);
				if (!Number.isInteger(copyCount) || copyCount < 1 || copyCount > 999) {
					this.printInputError = 'Enter a valid copy count from 1 to 999.';
					return;
				}

				// Update printCopies in table for bulk mode
				if (this.selectedPrintItem) {
					this.selectedPrintItem.printCopies = copyCount;
					// Update the database with new printCopies value
					this.updatePrintCopiesInDatabase(this.selectedPrintItem.id, copyCount);
				}

				// Remove last digit and add incrementing numbers
				const baseValue = String(this.selectedPrintItem.value || '').slice(0, -1);
				const items = Array(copyCount).fill(null).map((_, index) => {
					const spec = `${baseValue}${String(index + 1).padStart(4, '0')}`;
					return {
						value : this.selectedPrintItem.value,
						specification: spec,
						quantity: `${copyCount}(${index + 1})`,
						model: this.$store.state.user.model,
						manufacturingDate: new Date().toISOString().split('T')[0],
						qrData: spec
					};
				});
				// Ensure the last label has the correct quantity (e.g., 2(2) for 2 copies)
				if (items.length > 1) {
					items[items.length - 1].quantity = `${copyCount}(${copyCount})`;
				}
				console.log(items)
				await printStationOneLabels(items);
			} else {
				// Single print mode - print just the selected item
				if (this.selectedPrintItem) {
					const baseValue = String(this.selectedPrintItem.value || '').slice(0, -1);
					const match = String(this.singlePrintInput || '').match(/\((\d+)\)/);
					const numberFromParenthesis = match ? match[1] : '1';
					const paddedNumber = String(numberFromParenthesis).padStart(4, '0');
				const spec = `${baseValue}${paddedNumber}`;
				const items = [{
					value : this.selectedPrintItem.value,
					specification: spec,
					quantity: this.singlePrintInput || `${this.$store.state.user.data_set}(1)`,
					model: this.$store.state.user.model,
					manufacturingDate: new Date().toISOString().split('T')[0],
					qrData: spec
					}];
					// Call print function
					await printStationOneLabels(items);
				}
			}

			this.printInputError = '';
			this.closePrintDialog();
		},
		async updatePrintCopiesInDatabase(itemId, printCopies) {
			try {
				await updateKanbanPrint(itemId, { printCopies });
			} catch (error) {
				await saveErrorLog('/station-one', `Error updating print copies in database: ${error.message}`);
			}
		},
		async generateQrThumbnail(value) {
			try {
				return await QRCode.toDataURL(value, {
					width: 56,
					margin: 1
				});
			} catch (error) {
				await saveErrorLog('/station-one', `Error generating QR thumbnail: ${error.message}`);
				return '';
			}
		},

		clearTable() {
			this.scans = [];
			this.scannedValues = new Set();
		},
		detectScanType(value) {
			const upperValue = value.toUpperCase();
			const isKanbanMatch = this.kanbanData.some((item) => {
				const upperItem = String(item).toUpperCase();
				return upperValue.startsWith(upperItem) || upperValue.includes(upperItem);
			});

			if (upperValue.startsWith('QR:')) {
				return 'QR';
			}

			if (isKanbanMatch) {
				return 'QR';
			}

			if (upperValue.startsWith('BAR:') || upperValue.startsWith('BC:')) {
				return 'Barcode';
			}

			if (/^(HTTPS?:\/\/|WIFI:|BEGIN:VCARD|MAILTO:|SMSTO:|TEL:|GEO:)/i.test(value)) {
				return 'QR';
			}

			if (/^\d{8}$|^\d{12,14}$/.test(value)) {
				return 'Barcode';
			}

			if (/^[A-Z0-9\-.$/+% ]{4,48}$/i.test(value)) {
				return 'Barcode';
			}

			return 'Unknown';
		},
		toggleSort(value) {
			if (this.sortBy === value) {
				this.sortDesc = !this.sortDesc;
			} else {
				this.sortBy = value;
				this.sortDesc = false;
			}
		},
		getSortIcon(value) {
			if (this.sortBy !== value) {
				return 'mdi-unfold-more-vertical';
			}
			return this.sortDesc ? 'mdi-sort-descending' : 'mdi-sort-ascending';
		}
	}
};
</script>

<style scoped>
.hidden-scanner-input {
	position: fixed;
	top: -1000px;
	left: -1000px;
	width: 1px;
	height: 1px;
	opacity: 0;
	pointer-events: none;
}

.table-card {
	width: 100%;
	max-width: 980px;
	overflow: hidden;
	border: 1px solid #e0e7ff;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
	background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
}

.table-title {
	font-weight: 700;
	letter-spacing: 0.2px;
	color: #1e293b;
}

.station-table {
	border-radius: 8px;
	overflow: hidden;
}

.station-table-head {
	background: linear-gradient(135deg, var(--v-background-base) 0%, #f0f4f8 100%);
	border-bottom: 2px solid #e0e7ff;
}

.station-head-cell {
	font-weight: 700;
	font-size: 12px;
	letter-spacing: 0.4px;
	text-transform: uppercase;
	padding: 16px 18px !important;
	color: #475569;
	user-select: none;
}

.station-head-cell.sortable {
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.station-head-cell.sortable:hover {
	background-color: rgba(71, 85, 105, 0.1);
}

.station-head-cell .v-icon {
	opacity: 0.7;
	transition: all 0.2s ease;
	font-size: 16px !important;
	margin-left: 6px;
}

.station-head-cell .v-icon.active {
	opacity: 1;
	color: #2563eb;
	font-weight: 900;
}

::v-deep .station-table .v-data-table-header th {
	font-weight: 700;
	color: #475569;
}

::v-deep .station-table tbody tr {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	border-bottom: 1px solid #f1f5f9;
}

::v-deep .station-table tbody tr:nth-child(even) {
	background-color: #ffffff;
}

::v-deep .station-table tbody tr:nth-child(odd) {
	background-color: #f8fafc;
}

::v-deep .station-table tbody tr:hover {
	background-color: #f0f9ff !important;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

::v-deep .station-table tbody td {
	padding-top: 16px !important;
	padding-bottom: 16px !important;
	padding-left: 18px !important;
	padding-right: 18px !important;
}

.scan-value {
	word-break: break-all;
	font-weight: 500;
	color: #1e293b;
	line-height: 1.4;
}

.index-pill {
	min-width: 32px;
	justify-content: center;
	font-weight: 600;
	background: linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%);
	color: #1e40af;
}

.type-cell {
	min-height: 30px;
	align-items: center;
}

.scanned-time {
	font-size: 12px;
	color: #64748b;
	align-items: center;
	gap: 6px;
}

.qr-thumb-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	background: linear-gradient(135deg, #E3F2FD 0%, #D6E8F7 100%);
	border-radius: 8px;
	padding: 4px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.qr-thumb-wrapper:hover {
	background: linear-gradient(135deg, #BBDEFB 0%, #90CAF9 100%);
	transform: scale(1.1) translateY(-2px);
	box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
}

.qr-thumb-image {
	width: 100%;
	height: 100%;
	border: 1px solid rgba(59, 130, 246, 0.15);
	border-radius: 5px;
	object-fit: cover;
	filter: hue-rotate(200deg) saturate(1.2) brightness(0.95);
	mix-blend-mode: multiply;
}

.print-preview-image {
	width: 140px;
	height: 140px;
	object-fit: contain;
	border-radius: 4px;
}

.bulk-preview {
	padding: 6px 0;
}

.print-dialog-card {
	overflow: hidden;
}

.print-dialog-title {
	font-weight: 700;
	letter-spacing: 0.2px;
}

.dialog-subtitle {
	font-size: 13px;
}

.dialog-content {
	padding-bottom: 12px;
}

.dialog-hero {
	background-color: var(--v-background-base);
}

.hero-title {
	font-size: 14px;
	font-weight: 700;
	line-height: 1.2;
}

.hero-caption {
	font-size: 12px;
	opacity: 0.75;
	margin-top: 2px;
}

.section-label {
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	font-weight: 700;
	opacity: 0.75;
}

.mode-toggle {
	width: 100%;
	display: flex;
}

.mode-option-btn {
	flex: 1;
	text-transform: none;
	font-weight: 600;
}

.preview-wrap {
	background-color: var(--v-background-base);
	border-radius: 10px;
	padding: 10px;
}

.summary-row {
	display: flex;
	justify-content: space-between;
	gap: 12px;
}

.summary-label {
	font-size: 12px;
	text-transform: uppercase;
	letter-spacing: 0.4px;
	font-weight: 600;
	opacity: 0.75;
}

.summary-value {
	font-size: 13px;
	font-weight: 600;
	text-align: right;
	word-break: break-word;
}

.item-summary {
	background-color: var(--v-background-base);
}

.station-one-page {
	max-width: 1280px;
	margin: 0 auto;
}
</style>
