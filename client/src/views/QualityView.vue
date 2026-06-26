<template>
  <div class="quality-view-container">
    <div class="qa-title-bar">
    </div>
		<div class="filters">
			<label>
				Scan:
				<input
					ref="hiddenScannerInput"
					v-model="scanInput"
					type="text"
					class="hidden-scanner-input"
					@keyup.enter="submitScan"
					@keyup.tab="submitScan"
					placeholder="Scan barcode or QR here"
				/>
			</label>
			<label>
				Date:
				<input type="date" v-model="selectedDate" />
			</label>
    </div>
    <div class="kanban-table-wrapper">
      <table class="kanban-table">
        <thead>
          <tr>
            <th>Kanban Detail</th>
            <th>QR Tag</th>
            <th>Barcode</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedRows" :key="row.id">
            <td>{{ row.kanban }}</td>
            <td>{{ row.qr }}</td>
            <td>{{ row.barcode }}</td>
            <td>
              <span
                :class=" [
                  'status-chip',
                  row.status === 'Verified' ? 'verified' :
                  row.status === 'Unverified' ? 'unverified' :
                  row.status === 'QR Code does not match' || row.status === 'Barcode does not match' ? 'notmatch' : ''
                ]"
              >
                {{ row.status }}
              </span>
            </td>
          </tr>
          <tr v-if="paginatedRows.length === 0">
            <td colspan="4" class="no-data">No data found.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="record-count">{{ paginatedRows.length }} / {{ sortedFilteredRows.length }} records</div>
    <div class="pagination-bar" v-if="totalPages > 1">
      <button :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">&gt;</button>
    </div>
  </div>
</template>


<script>
// Scanner logic adapted from StationOneView
import Swal from 'sweetalert2';
import api from '../services/api';

export default {
	name: 'QualityView',
	data() {
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const dd = String(today.getDate()).padStart(2, '0');
		const todayStr = `${yyyy}-${mm}-${dd}`;
		return {
			kanbanColumns: ['FSC LH', 'FSC RH', 'FSB LH', 'FSB RH', 'RSB RH', 'RSB LH', 'RSC'],
			selectedDate: todayStr,
		scanInput: '',
		lastAddedRowId: null,
		rows: [],
		currentPage: 1,
		rowsPerPage: 5,
		};
	},
	mounted() {
		window.addEventListener('keydown', this.onGlobalScannerKeydown);
		this.loadKanbanQA();
		this.focusInput();
	},
	beforeDestroy() {
		window.removeEventListener('keydown', this.onGlobalScannerKeydown);
	},
    methods: {
			focusInput() {
				this.$nextTick(() => {
					if (this.$refs.hiddenScannerInput && this.$refs.hiddenScannerInput.focus) {
						this.$refs.hiddenScannerInput.focus();
					}
				});
			},
			onGlobalScannerKeydown(event) {
				if (event.ctrlKey || event.altKey || event.metaKey) return;
				if (event.key === 'Enter' || event.key === 'Tab') {
					if (this.scanInput.trim()) {
						this.submitScan();
						event.preventDefault();
					}
					this.scanInput = '';
					this.focusInput();
					return;
				}
			},
			submitScan() {
				const value = this.scanInput.trim();
				if (!value) {
					this.focusInput();
					return;
				}
				this.newRowName = value;
				this.saveRow();
				this.scanInput = '';
				this.focusInput();
			},
		playBeep(isError = false) {
			const audioContext = new (window.AudioContext || window.webkitAudioContext)();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			if (isError) {
			const now = audioContext.currentTime;

				[0, 0.7, 1.4, 2.1, 2.8].forEach(offset => {
				const oscillator = audioContext.createOscillator();
				const gainNode = audioContext.createGain();

				oscillator.connect(gainNode);
				gainNode.connect(audioContext.destination);

				oscillator.frequency.value = 400; // Lower pitch for error
				oscillator.type = 'square';

				gainNode.gain.setValueAtTime(5, now + offset);
				gainNode.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.6);

				oscillator.start(now + offset);
				oscillator.stop(now + offset + 0.6);
				});
			} else {
				oscillator.frequency.value = 1000; // Normal beep
				oscillator.type = 'sine';
				gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
				gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
				oscillator.start(audioContext.currentTime);
				oscillator.stop(audioContext.currentTime + 0.15);
			}
		},
		getCode(value) {
			const match = value.match(/\bK[A-Z0-9]{3}\b/);
			return match ? match[0] : null;
		},
        async saveRow() {
            const value = this.newRowName.trim();
            if (!value) return;
            const matched = this.kanbanColumns.some((col) => value.startsWith(col) || value.startsWith("RR C"));
            const stringVal = this.kanbanColumns.filter((col) => value.startsWith(col) || value.startsWith("RR C"));
			// Find the index of the row with the highest id
			let lastIndex = -1;
			if (this.rows.length > 0) {
				const maxIdRow = this.rows.reduce((max, r) => r.id > max.id ? r : max, this.rows[0]);
				lastIndex = this.rows.findIndex(r => r.id === maxIdRow.id);
			}
            if (matched) {
				//add new row with kanban

                const trimmedValue =  value.startsWith("RR C") ? value.slice(11) : value.slice(stringVal[0].length + 1);
                if (trimmedValue.length === 4) {
					if( lastIndex!== -1 && !this.rows[lastIndex].qr){
						this.playBeep(true);

							Swal.fire({
								title: 'Cannot Add',
								text: 'The last kanban does not have QR code. Please scan QR code for that kanban first.',
								icon: 'warning',
								timer: 4000,
								timerProgressBar: true,
								showConfirmButton: false
							});
						return;
					}
                    // Prevent adding new kanban if last row matches user condition and barcode is empty
                    const userConditions = this.$store.state.user?.condition || [];
                    const lastRow = this.rows.length > 0 ? this.rows[0] : null;
                    if (lastRow && userConditions.some(cond => lastRow.kanban.startsWith(cond)) && (!lastRow.barcode || lastRow.barcode === '')) {
                        if (typeof Swal !== 'undefined') {
						this.playBeep(true);
                            Swal.fire({
                                title: 'Cannot Add',
                                text: 'The last kanban matches a user condition and its barcode is empty. Please scan barcode for that kanban first.',
                                icon: 'warning',
                                timer: 4000,
                                timerProgressBar: true,
                                showConfirmButton: false
                            });
                        }
                        return;
                    }
                    try {
                        const res = await api.post('/kanbanqa', {
                            kanban: value,
                            status: 'Unverified',
                            date: this.selectedDate
                        });
                        const newRow = {
                            id: res.data.id,
                            kanban: res.data.kanban,
                            qr: res.data.qr_kanban ?? null,
                            barcode: res.data.barcode ?? '',
                            status: res.data.status ?? 'Unverified',
                            date: this.selectedDate || new Date().toISOString().slice(0, 10)
                        };
                        this.rows.unshift(newRow);
                        this.lastAddedRowId = newRow.id;
						this.playBeep(false);
                        this.newRowName = '';
                        return;
                    } catch (err) {
                        if (typeof Swal !== 'undefined') {
						this.playBeep(true);
                            Swal.fire({
                                title: 'Save Failed',
                                text: 'Could not add KanbanQA row.',
                                icon: 'error',
                                timer: 4000,
                                timerProgressBar: true,
                                showConfirmButton: false
                            });
                        }
                        return;
                    }
                }
				//update qr code for existing row
                let targetIndex = -1;
                // Always target the highest id row without QR
                const rowsWithoutQR = this.rows.filter(r => !r.qr);
                if (rowsWithoutQR.length > 0) {
                    const maxIdRow = rowsWithoutQR.reduce((max, r) => r.id > max.id ? r : max, rowsWithoutQR[0]);
                    targetIndex = this.rows.findIndex(r => r.id === maxIdRow.id);
                }
                if (targetIndex === -1) {
                    const rowKey = value.split(' ').slice(0, -1).join(' ');
                    targetIndex = this.rows.findIndex((r) => r.kanban === rowKey || r.kanban.startsWith(rowKey));
                }
                if (targetIndex >= 0) {
					// ...existing code...
					const duplicateQRRow = this.rows.find((r, idx) => idx !== targetIndex && r.qr === value);
					if (duplicateQRRow) {
						if (typeof Swal !== 'undefined') {
						this.playBeep(true);

							Swal.fire({
								title: 'Duplicate QR',
								text: 'This QR code already exists in another row.',
								icon: 'error',
								timer: 4000,
								timerProgressBar: true,
								showConfirmButton: false
							});
						} else {
							console.warn('Duplicate QR code found in another row.');
						}
						return;
					}
                        try {
                        this.rows[targetIndex].qr =  value;
                        this.rows[targetIndex].date = this.selectedDate || new Date().toISOString().slice(0, 10);
                        this.lastAddedRowId = this.rows[targetIndex].id;

                        if (value.startsWith(this.rows[targetIndex].kanban)) {
                            if (this.$store.state.user?.condition.some((col) => col.startsWith(stringVal))) {
                                this.rows[targetIndex].status = 'Unverified';
                            } else {
                                this.rows[targetIndex].status = 'Verified';
                            }
                        } else {
							if(value.startsWith("RSC") && this.rows[targetIndex].kanban.startsWith("RR C")) {
								const kanban = this.getCode(value);
								const qr_kanban = this.getCode(this.rows[targetIndex].kanban);
								if(kanban === qr_kanban){
								this.rows[targetIndex].status = 'Verified';
								}else{
								this.rows[targetIndex].status = 'QR Code does not match';
								}
							} else {
								this.rows[targetIndex].status = 'QR Code does not match';
							}
                        }
						await api.put(`/kanbanqa/${this.rows[targetIndex].id}/qr`, {
                            qr_kanban: value,
							status : this.rows[targetIndex].status
                        });
                        this.newRowName = '';
						this.playBeep(false);

                        return;
                    } catch (err) {
                        if (typeof Swal !== 'undefined') {
						this.playBeep(true);
                            Swal.fire({
                                title: 'Error',
                                text: 'Failed to update QR code.',
                                icon: 'error',
                                timer: 4000,
                                timerProgressBar: true,
                                showConfirmButton: false
                            });
                        }
                        return;
                    }
                }

                if (typeof Swal !== 'undefined') {
						this.playBeep(true);

                    Swal.fire({
                        title: 'Error',
                        text: 'Please scan kanban detail first.',
                        icon: 'error',
						timer: 4000,
						timerProgressBar: true,
						showConfirmButton: false
                    });
                } else {
                    console.error('Please scan kanban detail first.');
                }
                return;
            }
			if(value.length == 24){
				console.log(value ,"scanned QR code")
				//checking if the scanned QR code contains kanban that matches any existing row, if not show error and prevent adding QR code
				if(lastIndex === -1){
					this.playBeep(true);
						Swal.fire({
							title: 'Error',
							text: 'No kanban available to assign QR code. Please scan kanban detail first.',
							icon: 'error',
							timer: 4000,
							timerProgressBar: true,
							showConfirmButton: false
						});
					return;
				}
				
				// step 1: get F/CRH
			let part = value.slice(6, 11);

			// step 2: insert space between C and R
			let newVal = part.slice(0, 3) + " " + part.slice(3);
			newVal = newVal.replace("/", "S");

			if (this.$store.state.user?.condition.some((col) => col.startsWith(newVal))) {
				if(this.rows[lastIndex].barcode && this.rows[lastIndex].barcode !== ''){
						this.playBeep(true);
							Swal.fire({
								title: 'Error',
								text: 'The last kanban already has a barcode. Please scan a new kanban detail.',
								icon: 'error',
								timer: 4000,
								timerProgressBar: true,
								showConfirmButton: false
							});
						return;
					}
			}
				let isDuplicate = this.rows.some(item => item.qr === value);
				if(isDuplicate){
					this.playBeep(true);
						Swal.fire({
							title: 'Duplicate QR',
							text: 'This QR code already exists in another row.',
							icon: 'error',
							timer: 4000,
							timerProgressBar: true,
							showConfirmButton: false
						});
					return;
				}
			if(this.rows[lastIndex].kanban.startsWith(newVal) && this.rows[lastIndex].kanban.includes(value.slice(0, 6).trim())  ){
				this.rows[lastIndex].qr = value;

				if (this.$store.state.user?.condition.some((col) => col.startsWith(newVal))) {
					this.rows[lastIndex].status = 'Unverified';
					this.playBeep(false);
				} else {
					this.rows[lastIndex].status = 'Verified';
					this.playBeep(false);
				}
			}else{
				
				if(newVal.startsWith("RSC") && (this.rows[lastIndex].kanban.startsWith("RR C") || this.rows[lastIndex].kanban.startsWith("RSC"))) {
					const kanban = this.getCode(value);
					const qr_kanban = this.getCode(this.rows[lastIndex].kanban);

					if(kanban === qr_kanban){	
						this.rows[lastIndex].status = 'Verified';
						this.playBeep(false);
					}else{
						this.rows[lastIndex].status = 'QR Code does not match';
						this.playBeep(true);
					}
				} else {
					this.rows[lastIndex].status = 'QR Code does not match';
					this.playBeep(true);
				}
			}
			this.rows[lastIndex].qr = value;
			await api.put(`/kanbanqa/${this.rows[lastIndex].id}/qr`, {
					qr_kanban: value,
					status : this.rows[lastIndex].status
				});

			}

			// update barcode for existing row
			// add barcode here
			//incorrect barcode format, show error and prevent adding barcode
			if (value.startsWith('C') && (value.length <= 11 || value.length == 14)) {
				// your code here
				this.playBeep(true);
				Swal.fire({
					title: 'Error',
					text: 'Invalid barcode format. Please scan a valid barcode.',
					icon: 'error',
					timer: 4000,
					timerProgressBar: true,
					showConfirmButton: false
				});
				return;

			}
			// C0006631331L
			if (value.startsWith('C') && value.length >= 12 && value.length <= 13) {

				const LastItemUpdated = this.rows.reduce((max, item) => item.id > max.id ? item : max);
				const results = this.rows.filter(item => item.qr.includes(LastItemUpdated.qr.slice(0, -5)))

				const isDuplicate = results.some(item => item.barcode === value);
				if (isDuplicate) {
					this.playBeep(true);
					Swal.fire({
						title: 'Duplicate Barcode',
						text: 'This barcode and kanban combination already exists in another row.',
						icon: 'error',
						timer: 4000,
						timerProgressBar: true,
						showConfirmButton: false
					});
					return;
				}
				let targetRow = null;
				if (this.lastAddedRowId !== null) {
					targetRow = this.rows.find((r) => r.id === this.lastAddedRowId);
				}
				if (!targetRow) {
					// Always select the row with the highest id
					if (this.rows.length > 0) {
						targetRow = this.rows.reduce((max, r) => r.id > max.id ? r : max, this.rows[0]);
					}
				}

				if (!targetRow) {
					console.warn('No rows available to assign barcode.');
					return;
				}

				// If QR code does not match, show error and prevent barcode scan
				if (targetRow.status === 'QR Code does not match') {
						this.playBeep(true);

					Swal.fire({
						title: 'Error',
						text: 'QR code does not match. Please fix the QR code first before scanning the barcode.',
						icon: 'error',
						timer: 4000,
						timerProgressBar: true,
						showConfirmButton: false
					});
					return;
				}

				if(this.$store.state.user?.condition.filter((col) => targetRow.kanban.startsWith(col)).length > 0){
					try {
						const updateRes = await api.put(`/kanbanqa/${targetRow.id}/barcode`, {
							barcode: value
						});
						const updated = updateRes.data;
						targetRow.barcode = updated.barcode || value;
						targetRow.date = this.selectedDate || new Date().toISOString().slice(0, 10);
						let positionKanban = targetRow.kanban.split(" ")[1][0];
						let lastCharBarcode = value.slice(-1);
						targetRow.status =  positionKanban === lastCharBarcode ? 'Verified' : 'Barcode does not match';
						this.playBeep(false);

					} catch (err) {
						this.playBeep(true);

						Swal.fire({
							title: 'Error',
							text: 'Failed to update barcode.',
							icon: 'error',
							timer: 4000,
							timerProgressBar: true,
							showConfirmButton: false
						});
					}
				}else{
						this.playBeep(true);
					Swal.fire({
						title: 'Error',
						text: 'This Kanban Should not have barcode.',
						icon: 'error',
						timer: 4000,
						timerProgressBar: true,
						showConfirmButton: false
					});
				}
			}
			
        },
        async loadKanbanQA() {
            try {
                const response = await api.get('/kanbanqa', {
                    params: { date: this.selectedDate }
                });

                const rowsFromApi = Array.isArray(response.data) ? response.data : [];
                this.rows = rowsFromApi.map((item) => ({
                    id: item.id,
                    kanban: item.kanban,
                    qr: item.qr_kanban ?? item.qr ?? '',
                    barcode: item.barcode ?? '',
                    status: item.status ?? 'Unverified',
                    date: this.selectedDate
                }));


                if (this.rows.length === 0) {
                    console.warn('KanbanQA loaded 0 rows for date', this.selectedDate);
                }
            } catch (error) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to load QA data.',
                        icon: 'error',
                        timer: 4000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                }
            }
        }
    },
    computed: {
		sortedFilteredRows() {
			// Filter first, then sort by date desc, then by id desc for stable sort
			const filtered = this.rows.filter(row => {
				const dateMatch = !this.selectedDate || row.date === this.selectedDate;
				return dateMatch;
			});
			return filtered.sort((a, b) => {
				if (a.date === b.date) return b.id - a.id;
				return b.date.localeCompare(a.date);
			});
		},
		paginatedRows() {
			const start = (this.currentPage - 1) * this.rowsPerPage;
			return this.sortedFilteredRows.slice(start, start + this.rowsPerPage);
		},
		totalPages() {
			return Math.ceil(this.sortedFilteredRows.length / this.rowsPerPage) || 1;
		},
    },
	watch: {
		selectedDate() {
			this.currentPage = 1;
			this.loadKanbanQA();
		},
	},
};
</script>
<style scoped>
.status-chip {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	min-width: 90px;
	padding: 10px 24px;
	border-radius: 16px;
	font-size: 1.15rem;
	font-weight: 900;
	letter-spacing: 0.04em;
	color: #fff;
	background: #bdbdbd;
	box-shadow: 0 4px 16px rgba(25, 118, 210, 0.12);
	border: none;
	text-shadow: 0 4px 16px rgba(0,0,0,0.04);
	white-space: nowrap;
}
.status-chip.verified {
	background: linear-gradient(90deg, #43a047 60%, #388e3c 100%);
}
.status-chip.unverified {
	background: linear-gradient(90deg, #ffb300 60%, #ff9800 100%);
	color: #fff;
}
.status-chip.notmatch {
	background: linear-gradient(90deg, #e53935 60%, #b71c1c 100%);
}
.quality-view-container {
	max-width: 1300px;
	margin: 56px auto;
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border-radius: 24px;
	box-shadow: 0 12px 48px rgba(25, 118, 210, 0.16), 0 1px 0 #e3f2fd;
	padding: 48px 32px 32px 32px;
	font-family: 'Inter', 'Space Grotesk', 'Segoe UI', 'Roboto', Arial, sans-serif;
	border: 2.5px solid #e3f2fd;
	position: relative;
}
.filters {
	display: flex;
	gap: 32px;
	margin-bottom: 32px;
	align-items: flex-end;
	flex-wrap: wrap;
	background: linear-gradient(135deg, #f7fafd 0%, #e8ecf1 100%);
	border-radius: 16px;
	padding: 24px 24px 16px 24px;
	box-shadow: 0 4px 16px rgba(25, 118, 210, 0.10);
	border: 2px solid #e3f2fd;
}
.filters label {
	font-weight: 700;
	color: #1976d2;
	display: flex;
	flex-direction: column;
	font-size: 1.2rem;
	margin-bottom: 0;
	letter-spacing: 0.03em;
}
.filters input[type="date"],
.filters input[type="text"],
.filters select {
	margin-top: 8px;
	padding: 12px 18px;
	border: 2px solid #b0bec5;
	border-radius: 12px;
	font-size: 1.15rem;
	background: #f9f9f9;
	transition: border 0.2s, box-shadow 0.2s;
	outline: none;
	box-shadow: 0 4px 16px rgba(25, 118, 210, 0.08);
}
.filters input[type="date"]:focus,
.filters input[type="text"]:focus,
.filters select:focus {
	border: 2px solid #1976d2;
	box-shadow: 0 0 0 3px #bbdefb;
}
.filters .search-btn,
.filters .clear-btn {
	margin-top: 4px;
	border: none;
	border-radius: 5px;
	padding: 6px 10px;
	font-size: 0.9rem;
	font-weight: 600;
	cursor: pointer;
	background: #1976d2;
	color: #fff;
	transition: background 0.2s ease;
}
.filters .clear-btn {
	background: #6b7280;
}
.filters .search-btn:hover { background: #145dbf; }
.filters .clear-btn:hover { background: #4b5563; }
.kanban-table {
	width: 100%;
	border-collapse: separate;
	border-spacing: 0;
	background: #fff;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 4px 16px rgba(25, 118, 210, 0.12);
	margin-top: 18px;
}
.kanban-table th {
	background: linear-gradient(135deg, #e3f2fd 0%, #f7fafd 100%);
	color: #1976d2;
	padding: 16px 14px;
	font-size: 1.18rem;
	font-weight: 900;
	letter-spacing: 0.08em;
	border-bottom: 2.5px solid #e3f2fd;
	text-align: left;
	text-transform: uppercase;
	border-top: 2.5px solid #e3f2fd;
}
	.kanban-table th:last-child,
	.kanban-table td:last-child {
		min-width: 170px;
		text-align: center;
}
.kanban-table td {
		padding: 14px 14px;
		border-bottom: 2px solid #e3f2fd;
		font-size: 1.15rem;
		color: #263238;
		background: #fff;
		transition: background 0.2s;
		vertical-align: middle;
}
.kanban-table tr:hover td {
		background: #e3f2fd;
}
.kanban-table tr:last-child td {
	border-bottom: none;
}
.no-data {
	text-align: center;
	color: #b71c1c;
	font-size: 1.18rem;
	font-weight: 700;
	background: #fff3e0;
	border-radius: 16px;
	padding: 20px 0;
}
.pagination-bar {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 18px;
	margin-top: 24px;
}
.pagination-bar button {
	background: #1976d2;
	color: #fff;
	border: none;
	border-radius: 12px;
	padding: 12px 28px;
	font-size: 1.15rem;
	font-weight: 900;
	cursor: pointer;
	transition: background 0.2s, box-shadow 0.2s;
	box-shadow: 0 4px 16px rgba(25, 118, 210, 0.12);
	outline: none;
}
.pagination-bar button:disabled {
	background: #b0bec5;
	cursor: not-allowed;
}
.pagination-bar span {
	font-size: 1.15rem;
	font-weight: 900;
	color: #1976d2;
}
.record-count {
	display: block;
	text-align: right;
	color: #1976d2;
	font-size: 1.15rem;
	font-weight: 900;
	margin: 12px 0 0 0;
	letter-spacing: 0.03em;
}
@media (max-width: 900px) {
	.quality-view-container {
		padding: 18px 6px;
	}
	.qa-title-bar {
		padding: 24px 0 12px 0;
		font-size: 1.4rem;
	}
	.filters {
		flex-direction: column;
		gap: 18px;
		align-items: stretch;
		padding: 16px 8px 12px 8px;
	}
	.kanban-table th, .kanban-table td {
		padding: 10px 4px;
		font-size: 1.05rem;
	}
	.pagination-bar {
		gap: 10px;
		margin-top: 14px;
	}
	.record-count {
		text-align: left;
		margin: 10px 0 0 0;
	}
}
</style>
