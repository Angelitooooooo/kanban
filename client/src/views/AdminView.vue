<template>
  <v-container fluid class="admin-container">
    <v-card class="admin-card" elevation="4">
      <!-- Header -->
      <v-card-title class="admin-header">
        <v-btn icon color="white" @click="goBack" class="mr-3">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="header-content">
          <v-icon left color="" size="32">mdi-view-dashboard</v-icon>
          <span class="header-title">Scan Records</span>
        </div>
        <v-spacer></v-spacer>
        <v-btn color="white" outlined @click="exportToCSV" class="mr-2">
          <v-icon left>mdi-download</v-icon>
          Export CSV
        </v-btn>
      </v-card-title>

      <!-- Stats Cards -->
      <v-card-text class="pt-6">
        <v-row class="mb-4" justify="space-around" align="center">
          <v-col cols="12" sm="6" md="2">
            <v-card class="stat-card" color="#8B5CF6" dark>
              <v-card-text>
                <div class="stat-label">Total Scans</div>
                <div class="stat-value">{{ totalScans }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-card class="stat-card" color="#06B6D4" dark>
              <v-card-text>
                <div class="stat-label">FSC LH</div>
                <div class="stat-value">{{ getColumnCount('FSC LH') }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-card class="stat-card" color="#10B981" dark>
              <v-card-text>
                <div class="stat-label">FSC RH</div>
                <div class="stat-value">{{ getColumnCount('FSC RH') }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-card class="stat-card" color="#FB923C" dark>
              <v-card-text>
                <div class="stat-label">FSB LH</div>
                <div class="stat-value">{{ getColumnCount('FSB LH') }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-card class="stat-card" color="#F43F5E" dark>
              <v-card-text>
                <div class="stat-label">FSB RH</div>
                <div class="stat-value">{{ getColumnCount('FSB RH') }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Search and Filter -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search records..."
              outlined
              dense
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="filterBatch"
              :items="batchOptions"
              label="Filter by Batch"
              outlined
              dense
              clearable
              filterable
              searchable
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterColumn"
              :items="columnOptions"
              label="Filter by Column"
              outlined
              dense
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-menu
              ref="dateMenu"
              :close-on-content-click="false"
              :return-value.sync="filterDate"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="filterDate"
                  label="Filter by Date"
                  prepend-icon="mdi-calendar"
                  outlined
                  dense
                  readonly
                  clearable
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="filterDate" no-title scrollable>
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="$refs.dateMenu.save(filterDate)">OK</v-btn>
              </v-date-picker>
            </v-menu>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="filteredRecords"
          :search="search"
          :items-per-page="10"
          class="elevation-2 records-table"
          :loading="loading"
          loading-text="Loading records..."
        >
          <template v-slot:[`item.qrCode`]="{ item }">
            <v-dialog v-model="item.qrDialog" max-width="300">
              <template #activator="{ on, attrs }">
                <v-btn icon small color="primary" v-bind="attrs" v-on="on">
                  <v-icon>mdi-qrcode</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title>QR Code</v-card-title>
                <v-card-text class="text-center">
                  <img :src="item.qrCode" alt="QR Code" style="max-width: 100%;">
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="item.qrDialog = false">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>

          <template v-slot:[`item.barcode`]="{ item }">
            <v-dialog v-model="item.barcodeDialog" max-width="400">
              <template #activator="{ on, attrs }">
                <v-btn icon small color="secondary" v-bind="attrs" v-on="on">
                  <v-icon>mdi-barcode</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title>Barcode</v-card-title>
                <v-card-text class="text-center">
                  <img :src="item.barcodeImg" alt="Barcode" style="max-width: 100%;">
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="item.barcodeDialog = false">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>

          <template v-slot:[`item.timestamp`]="{ item }">
            {{ formatDate(item.timestamp) }}
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-btn icon small color="error" @click="deleteRecord(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this record?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" text @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'AdminView',
  data() {
    return {
      loading: false,
      search: '',
      filterColumn: null,
      filterDate: null,
      filterBatch: null,
      dateMenu: null,
      deleteDialog: false,
      itemToDelete: null,
      headers: [
        { text: 'Batch Key', value: 'batchKey', sortable: true },
        { text: 'Row', value: 'row', sortable: true },
        { text: 'Column', value: 'column', sortable: true },
        { text: 'Data', value: 'qrData', sortable: true },
        { text: 'QR Code', value: 'qrCode', sortable: false, align: 'center' },
        { text: 'Barcode', value: 'barcode', sortable: false, align: 'center' },
        { text: 'Timestamp', value: 'timestamp', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false, align: 'center' }
      ],
      columnOptions: ['FSC LH', 'FSC RH', 'FSB LH', 'FSB RH']
    }
  },
  mounted() {
    // Regenerate QR codes and barcodes for existing records
    this.$store.dispatch('regenerateAllImages')
  },
  computed: {
    records() {
      const scanRecords = this.$store.getters.getScanRecords || [];
      return scanRecords.map((record, index) => ({
        ...record,
        batchKey: record.batchKey || 'KBN1', // Ensure batchKey exists
        qrDialog: false,
        barcodeDialog: false,
        id: index
      }));
    },
    filteredRecords() {
      let filtered = this.records;
      
      // Filter by batch
      if (this.filterBatch) {
        filtered = filtered.filter(record => record.batchKey === this.filterBatch);
      }
      
      // Filter by column
      if (this.filterColumn) {
        filtered = filtered.filter(record => record.column === this.filterColumn);
      }
      
      // Filter by date
      if (this.filterDate) {
        const selectedDate = new Date(this.filterDate).toDateString();
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.timestamp).toDateString();
          return recordDate === selectedDate;
        });
      }
      
      return filtered;
    },
    batchOptions() {
      const batches = this.$store.getters.getAllBatches || []
      return batches.length > 0 ? batches : ['KBN1']
    },
    totalScans() {
      return this.filteredRecords.length;
    }
  },
  methods: {
    goBack() {
      this.$router.push('/kanban');
    },
    getColumnCount(columnName) {
      return this.filteredRecords.filter(record => record.column === columnName).length;
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A';
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    deleteRecord(item) {
      this.itemToDelete = item;
      this.deleteDialog = true;
    },
    confirmDelete() {
      if (this.itemToDelete) {
        this.$store.dispatch('deleteScanRecord', this.itemToDelete.id);
        this.deleteDialog = false;
        this.itemToDelete = null;
      }
    },
    exportToCSV() {
      if (this.records.length === 0) {
        alert('No records to export');
        return;
      }

      const csvRows = [];
      const headers = ['Row', 'Column', 'QR Data', 'Timestamp'];
      csvRows.push(headers.join(','));

      this.records.forEach(record => {
        const row = [
          record.row,
          record.column,
          `"${record.qrData}"`,
          this.formatDate(record.timestamp)
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan-records-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
}
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px;
}

.admin-card {
  border-radius: 16px;
  overflow: hidden;
}

.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  opacity: 1;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  color: white;
}

.stat-value {
  font-size: 32px;
  font-weight: 900;
  color: white;
}

.records-table {
  border-radius: 12px;
  overflow: hidden;
}

::v-deep .v-data-table-header {
  background-color: #f5f7fa;
}

::v-deep .v-data-table-header th {
  font-weight: 700;
  color: #1f2937;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
}
</style>
