

<template>
	<v-container fluid class="qa-view">
		<!-- Header Section -->
		<div class="page-header">
			<div class="header-content">
				<div class="header-icon">
					<v-icon size="32">mdi-clipboard-check-outline</v-icon>
				</div>
				<div>
					<h1 class="page-title">Quality Assurance</h1>
					<p class="page-subtitle">Review and verify kanban quality records</p>
				</div>
			</div>
		</div>

		<!-- Filters Section -->
		<v-card class="filter-card" elevation="2">
			<v-card-text>
				<v-row align="center">
					<v-col cols="12" md="6">
						<v-text-field
							v-model="search"
							prepend-inner-icon="mdi-magnify"
							label="Search kanban..."
							placeholder="Search by kanban, QR, or barcode"
							outlined
							dense
							clearable
							hide-details
							class="search-field"
						></v-text-field>
					</v-col>
					<v-col cols="12" md="3">
						<v-menu ref="menu" v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
							<template v-slot:activator="{ on, attrs }">
								<v-text-field
									v-model="selectedDate"
									label="Date"
									prepend-inner-icon="mdi-calendar"
									readonly
									v-bind="attrs"
									v-on="on"
									outlined
									dense
									hide-details
								></v-text-field>
							</template>
							<v-date-picker v-model="selectedDate" @input="menu = false"></v-date-picker>
						</v-menu>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>

		<!-- Kanban QA Data Table -->
		<v-card class="qa-table-card" elevation="2">
			<v-data-table
				:headers="headers"
				:items="filteredRows"
				:search="search"
				:loading="loading"
				class="qa-table"
				:items-per-page="10"
				:footer-props="{ 'items-per-page-options': [10, 25, 50, 100] }"
        >
        
            <template v-slot:[`item.isValidatedBarcode`]="{ item }">
                <v-chip
					v-if="item.isValidatedBarcode === true || item.isValidatedBarcode == 1"
                    color="success"
                    small
                    class="status-chip-aesthetic"
                >
                    Yes
                </v-chip>
                <v-chip
					v-else-if="item.isValidatedBarcode === false || item.isValidatedBarcode == 0"
                    color="error"
                    small
                    class="status-chip-aesthetic"
                >
                    No
                </v-chip>
                <v-chip
                    v-else
                    color="warning"
                    small
                    class="status-chip-aesthetic"
                >
                    <v-icon left small>mdi-alert</v-icon> Not validated
                </v-chip>
            </template>

            <template v-slot:[`item.isValidatedQR`]="{ item }">
                <v-chip
					v-if="item.isValidatedQR === true || item.isValidatedQR == 1"
                    color="success"
                    small
                    class="status-chip-aesthetic"
                >
                    Yes
                </v-chip>
                <v-chip
					v-else-if="item.isValidatedQR === false || item.isValidatedQR == 0"
                    color="error"
                    small
                    class="status-chip-aesthetic"
                >
                    No
                </v-chip>
                <v-chip
                    v-else
                    color="warning"
                    small
                    class="status-chip-aesthetic"
                >
                    <v-icon left small>mdi-alert</v-icon> Not validated
                </v-chip>
            </template>
                <template v-slot:[`item.status`]="{ item }">
					<v-chip :color="statusColor(item.status)" small class="status-chip-aesthetic">{{ item.status }}</v-chip>
				</template>
				<template v-slot:[`item.action`]="{ item }">
					<v-tooltip bottom>
						<template v-slot:activator="{ on, attrs }">
							<v-btn icon small class="action-btn edit-btn" v-bind="attrs" v-on="on" @click="editRow(item)">
								<v-icon small>mdi-pencil</v-icon>
							</v-btn>
						</template>
						<span>Edit Record</span>
					</v-tooltip>
					<v-tooltip bottom>
						<template v-slot:activator="{ on, attrs }">
							<v-btn icon small class="action-btn delete-btn" v-bind="attrs" v-on="on" @click="deleteRow(item)">
								<v-icon small>mdi-delete</v-icon>
							</v-btn>
						</template>
						<span>Delete Record</span>
					</v-tooltip>
				</template>
				<template v-slot:loading>
					<div class="loading-container">
						<v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
						<p class="loading-text">Loading records...</p>
					</div>
				</template>
				<template v-slot:no-data>
					<div class="no-data-container">
						<v-icon size="64" color="grey">mdi-clipboard-alert-outline</v-icon>
						<p class="no-data-text">No kanban QA records found</p>
					</div>
				</template>
			</v-data-table>
		</v-card>
        <v-dialog v-model="editDialog" max-width="500" persistent>
			<v-card class="aesthetic-card dialog-card">
				<div class="dialog-header">
					<v-icon size="32" color="primary" class="dialog-header-icon">mdi-pencil-box-outline</v-icon>
					<div>
						<div class="dialog-title">Edit Kanban QA Record</div>
						<div class="dialog-subtitle">Update the details and validation status for this kanban record.</div>
					</div>
				</div>
				<v-divider></v-divider>
				<v-card-text class="dialog-content">
					<v-form>
						<v-text-field v-model="editForm.kanban" label="Kanban Detail" outlined dense class="dialog-field"></v-text-field>
						<v-text-field v-model="editForm.qr_kanban" label="QR Tag" outlined dense class="dialog-field"></v-text-field>
						<v-text-field
							v-model="editForm.barcode"
							label="Barcode"
							outlined
							dense
							class="dialog-field"
							:disabled="isBarcodeDisabled"
						></v-text-field>
						<v-switch v-model="editForm.isValidatedBarcode" label="Validated Barcode?" inset class="dialog-switch"></v-switch>
						<v-switch v-model="editForm.isValidatedQR" label="Validated QR?" inset class="dialog-switch"></v-switch>
						<v-select v-model="editForm.status" :items="['Verified', 'Unverified', 'QR Code does not match', 'Barcode does not match']" label="Status" outlined dense class="dialog-field"></v-select>
					</v-form>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions class="dialog-actions">
					<v-spacer></v-spacer>
					<v-btn text @click="editDialog = false" class="cancel-btn">Cancel</v-btn>
					<v-btn color="primary" @click="saveEdit" class="save-btn">Save</v-btn>
				</v-card-actions>
			</v-card>

        </v-dialog>
	</v-container>
</template>

<script>
import api from '@/services/api';
import Swal from 'sweetalert2'

export default {
	name: 'QualityAssuranceView',
	data() {
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const dd = String(today.getDate()).padStart(2, '0');
		const todayStr = `${yyyy}-${mm}-${dd}`;
		return {
			search: '',
			menu: false,
			selectedDate: todayStr,
			loading: false,
			rows: [],
			headers: [
				{ text: 'Kanban Detail', value: 'kanban' },
				{ text: 'QR Tag', value: 'qr_kanban' },
				{ text: 'Barcode', value: 'barcode' },
				{ text: 'Validated Barcode', value: 'isValidatedBarcode' },
				{ text: 'Validated QR', value: 'isValidatedQR' },
				{ text: 'Status', value: 'status' },
				{ text: 'Action', value: 'action' },
			],
			editDialog: false,
			editForm: {
				kanban: '',
				qr_kanban: '',
				barcode: '',
				isValidatedBarcode: false,
				isValidatedQR: false,
				status: '',
			},
		};
	},
	computed: {
		filteredRows() {
			let filtered = this.rows;
			// No need to filter by date, API already does it
			if (this.search) {
				const s = this.search.toLowerCase();
				filtered = filtered.filter(row =>
					(row.kanban && row.kanban.toLowerCase().includes(s)) ||
					(row.qr_kanban && row.qr_kanban.toLowerCase().includes(s)) ||
					(row.barcode && row.barcode.toLowerCase().includes(s))
				);
			}
			return filtered;
		},
		isBarcodeDisabled() {
			// Disable if kanban starts with any value in the condition array
			const conditions = this.$store.state.user?.condition;
			if (!Array.isArray(conditions) || !this.editForm.kanban) return false;
			return !conditions.some(cond =>
				typeof cond === 'string' && this.editForm.kanban.startsWith(cond)
			);
		},
	},
	methods: {
        editRow(item) {
            // Normalize null/undefined to false for switches
            this.editForm = {
                ...item,
                isValidatedBarcode: item.isValidatedBarcode === true || item.isValidatedBarcode == 1 ? true : false,
                isValidatedQR: item.isValidatedQR === true || item.isValidatedQR == 1 ? true : false,
            };
            this.editDialog = true;
        },
		async saveEdit() {
            console.log('Saving edit for:', this.editForm);
			if (!this.editForm.id) {
					Swal.fire({
						icon: 'error',
						title: 'Missing record ID',
						text: 'Cannot update record: ID is missing.'
					});
                return;
            }
			try {
                console.log('Sending update request to API with data:', this.editForm.isValidatedBarcode);
				this.loading = true;
				const res = await api.put(`/kanbanqa/${this.editForm.id}`,
					{
						kanban: this.editForm.kanban,
						qr_kanban: this.editForm.qr_kanban,
						barcode: this.editForm.barcode,
						status: this.editForm.status,
						isValidatedBarcode: this.editForm.isValidatedBarcode == true || this.editForm.isValidatedBarcode == 1 ? 1 : null,
						isValidatedQR: this.editForm.isValidatedQR == true || this.editForm.isValidatedQR == 1 ? 1 : null
					}
				);
				// Update the row in the table
				const idx = this.rows.findIndex(r => r.id === this.editForm.id);
				if (idx !== -1) {
					this.$set(this.rows, idx, res.data);
				}
				this.editDialog = false;
				Swal.fire({
					icon: 'success',
					title: 'Success',
					text: 'Record updated successfully.'
				});
			} catch (e) {
                console.log('Error updating record:', e);
				this.$toast && this.$toast.error('Failed to update record.');
			} finally {
				this.loading = false;
			}
		},
		async deleteRow(item) {
			const result = await Swal.fire({
				title: 'Are you sure?',
				text: 'This action will permanently delete the record.',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#d33',
				cancelButtonColor: '#3085d6',
				confirmButtonText: 'Yes, delete it!',
				cancelButtonText: 'Cancel'
			});
			if (result.isConfirmed) {
				try {
					this.loading = true;
					await api.delete(`/kanbanqa/${item.id}`);
					this.rows = this.rows.filter(r => r.id !== item.id);
					Swal.fire({
						icon: 'success',
						title: 'Deleted!',
						text: 'Record has been deleted.'
					});
				} catch (e) {
					Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to delete record.'
					});
				} finally {
					this.loading = false;
				}
			}
		},
		statusColor(status) {
			if (status === 'Verified') return 'success';
			if (status === 'Unverified') return 'grey';
			if (status === 'QR Code does not match' || status === 'Barcode does not match') return 'error';
			return 'primary';
		},
		async loadRows() {
			this.loading = true;
			try {
				const res = await api.get('/kanbanqa', { params: { date: this.selectedDate } });
                console.log('API Response:', res.data);
				this.rows = res.data || [];
			} catch (e) {
				this.rows = [];
			}
			this.loading = false;
		},
	},
	watch: {
		selectedDate() {
			this.loadRows();
		},
	},
	mounted() {
		this.loadRows();
	},
};
</script>

<style scoped>
.aesthetic-bg {
	min-height: 100vh;
	background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	padding: 32px 0 48px 0;
}
.aesthetic-card {
	border-radius: 18px;
	box-shadow: 0 4px 24px 0 rgba(60,60,120,0.08);
	background: #fff;
}
.qa-view {
	padding: 24px 0;
}
.page-header {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	margin-bottom: 28px;
	padding-left: 18px;
}
.header-content {
	display: flex;
	align-items: center;
}
.header-icon {
	margin-right: 20px;
	background: #e3eafc;
	border-radius: 50%;
	padding: 10px;
	box-shadow: 0 2px 8px 0 rgba(60,60,120,0.08);
}
.page-title {
	margin: 0;
	font-size: 2.2rem;
	font-weight: 700;
	color: #2d3a4b;
	letter-spacing: 0.5px;
}
.page-subtitle {
	margin: 0;
	color: #7b8ca6;
	font-size: 1.1rem;
	font-weight: 400;
}
.filter-card {
	margin-bottom: 24px;
	padding: 8px 0 0 0;
}
.qa-table-card {
	margin-top: 10px;
	padding-bottom: 8px;
}
.qa-table {
	font-size: 1.05rem;
	border-radius: 12px;
	overflow: hidden;
}
.status-chip-aesthetic {
	font-weight: 600;
	letter-spacing: 0.2px;
	font-size: 0.98rem;
	box-shadow: 0 1px 4px 0 rgba(60,60,120,0.07);
}
.action-btn {
	margin: 0 2px;
	border-radius: 50%;
	transition: background 0.2s, box-shadow 0.2s;
}
.edit-btn {
	background: #e3f2fd;
	color: #1976d2;
}
.edit-btn:hover {
	background: #bbdefb;
	box-shadow: 0 2px 8px 0 rgba(25,118,210,0.10);
}
.delete-btn {
	background: #ffebee;
	color: #d32f2f;
}
.delete-btn:hover {
	background: #ffcdd2;
	box-shadow: 0 2px 8px 0 rgba(211,47,47,0.10);
}
.loading-container, .no-data-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 180px;
}
.loading-text, .no-data-text {
	margin-top: 16px;
	color: #888;
}
		.dialog-card {
			padding: 0 0 8px 0;
			border-radius: 16px;
			box-shadow: 0 4px 24px 0 rgba(60,60,120,0.10);
		}
		.dialog-header {
			display: flex;
			align-items: center;
			padding: 24px 24px 8px 24px;
		}
		.dialog-header-icon {
			margin-right: 18px;
			background: #e3eafc;
			border-radius: 50%;
			padding: 8px;
			box-shadow: 0 2px 8px 0 rgba(60,60,120,0.08);
		}
		.dialog-title {
			font-size: 1.35rem;
			font-weight: 600;
			color: #2d3a4b;
			margin-bottom: 2px;
		}
		.dialog-subtitle {
			color: #7b8ca6;
			font-size: 1rem;
			font-weight: 400;
		}
		.dialog-content {
			padding: 18px 24px 8px 24px;
		}
		.dialog-field {
			margin-bottom: 10px;
		}
		.dialog-switch {
			margin-bottom: 6px;
		}
		.dialog-actions {
			padding: 12px 24px 8px 24px;
		}
		.cancel-btn {
			color: #888;
		}
		.save-btn {
			font-weight: 600;
			letter-spacing: 0.5px;
		}
</style>
