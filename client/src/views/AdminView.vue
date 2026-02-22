<template>
  <v-container fluid class="admin-container">
    <v-card class="admin-card" elevation="4">
      <!-- Header -->
      <v-card-title class="admin-header">
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
      <v-card-text class="pt-2 pb-2">
        <v-row class="mb-2 stat-row" align="center">
          <v-col cols="12" sm="6" md="2" class="stat-col">
            <v-card class="stat-card" color="#8B5CF6" dark>
              <v-card-text class="pa-2">
                <div class="stat-label">Total Scans</div>
                <div class="stat-value">{{ totalScans }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="2" class="stat-col">
            <v-card class="stat-card" color="#F43F5E" dark>
              <v-card-text class="pa-2">
                <div class="stat-label">FSB RH</div>
                <div class="stat-value">{{ getColumnCount('FSB RH') }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="2" class="stat-col">
            <v-card class="stat-card" color="#FB923C" dark>
              <v-card-text class="pa-2">
                <div class="stat-label">FSB LH</div>
                <div class="stat-value">{{ getColumnCount('FSB LH') }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="2" class="stat-col">
            <v-card class="stat-card" color="#10B981" dark>
              <v-card-text class="pa-2">
                <div class="stat-label">FSC RH</div>
                <div class="stat-value">{{ getColumnCount('FSC RH') }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="2" class="stat-col">
            <v-card class="stat-card" color="#06B6D4" dark>
              <v-card-text class="pa-2">
                <div class="stat-label">FSC LH</div>
                <div class="stat-value">{{ getColumnCount('FSC LH') }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="2" class="stat-col">
            <v-card class="stat-card" color="#22C55E" dark>
              <v-card-text class="pa-2">
                <div class="stat-label">RSB RH</div>
                <div class="stat-value">{{ getColumnCount('RSB RH') }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="2" class="stat-col">
            <v-card class="stat-card" color="#0EA5E9" dark>
              <v-card-text class="pa-2">
                <div class="stat-label">RSB LH</div>
                <div class="stat-value">{{ getColumnCount('RSB LH') }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="2" class="stat-col">
            <v-card class="stat-card" color="#F59E0B" dark>
              <v-card-text class="pa-2">
                <div class="stat-label">RR Cushion</div>
                <div class="stat-value">{{ getColumnCount('RR Cushion') }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Search and Filter -->
        <v-row class="mb-2 filter-row" align="center">
          <v-col cols="12" md="3" class="filter-col">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search records..."
              outlined
              dense
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2" class="filter-col">
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
          <v-col cols="12" md="2" class="filter-col">
            <v-select
              v-model="filterColumn"
              :items="columnOptions"
              label="Filter by Column"
              outlined
              dense
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="2" class="filter-col">
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
            <div class="thumb-cell" @click="openQrDialog(item)">
              <img
                v-if="getQrThumb(item)"
                :src="getQrThumb(item)"
                alt="QR Thumbnail"
                class="thumb-img"
              >
              <v-icon v-else color="primary">mdi-qrcode</v-icon>
            </div>
            <v-dialog v-model="item.qrDialog" max-width="320">
              <v-card>
                <v-card-title>QR Code</v-card-title>
                <v-card-text class="text-center">
                  <img v-if="item.qrCode" :src="item.qrCode" alt="QR Code" style="max-width: 100%;">
                  <div v-else class="text-caption">No QR data available</div>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="item.qrDialog = false">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>

          <template v-slot:[`item.barcode`]="{ item }">
            <div class="thumb-cell" @click="openBarcodeDialog(item)">
              <img
                v-if="getBarcodeThumb(item)"
                :src="getBarcodeThumb(item)"
                alt="Barcode Thumbnail"
                class="thumb-img"
              >
              <v-icon v-else color="secondary">mdi-barcode</v-icon>
            </div>
            <v-dialog v-model="item.barcodeDialog" max-width="420">
              <v-card>
                <v-card-title>Barcode</v-card-title>
                <v-card-text class="text-center">
                  <img v-if="item.barcodeImg" :src="item.barcodeImg" alt="Barcode" style="max-width: 100%;">
                  <div v-else class="text-caption">No barcode data available</div>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="item.barcodeDialog = false">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>

          <template v-slot:[`item.station`]="{ item }">
            <span v-if="item.station">Station {{ item.station }}</span>
            <span v-else>-</span>
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
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import api from '../services/api'
import Swal from 'sweetalert2'

export default {
  name: 'AdminView',
  data() {
    return {
      loading: false,
      search: '',
      filterColumn: null,
      filterDate: null,
      filterBatch: null,
      filterStation: null,
      dateMenu: null,
      deleteDialog: false,
      itemToDelete: null,
      refreshTimer: null,
      refreshIntervalMs: 60000,
      kanbanBatches: [],
      kanbanBatchList: [],
      userStations: [],
      records: [],
      headers: [
        { text: 'Batch Key', value: 'batchKey', sortable: true },
        // { text: 'Station', value: 'station', sortable: true },
        // { text: 'Row', value: 'row', sortable: true },
        // { text: 'Column', value: 'column', sortable: true },
        { text: 'Data', value: 'qrData', sortable: true },
        { text: 'QR Code', value: 'qrCode', sortable: false, align: 'center' },
        { text: 'Barcode', value: 'barcode', sortable: false, align: 'center' },
        { text: 'Timestamp', value: 'timestamp', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false, align: 'center' }
      ],
      columnOptions: ['FSB RH', 'FSB LH', 'FSC RH', 'FSC LH', 'RSB RH', 'RSB LH', 'RR Cushion']
    }
  },
  mounted() {
    this.startAutoRefresh();
  },
  beforeDestroy() {
    this.stopAutoRefresh();
  },
  watch: {
    filterStation() {
      if (this.filterBatch && !this.batchOptions.includes(this.filterBatch)) {
        this.filterBatch = null;
      }
    }
  },
  computed: {
    filteredRecords() {
      let filtered = this.records;
      
      // Filter by batch
      if (this.filterBatch) {
        const selectedBatch = String(this.filterBatch).trim().toLowerCase();
        filtered = filtered.filter(record => {
          const batchKey = String(record.batchKey || '').trim().toLowerCase();
          return batchKey === selectedBatch;
        });
      }
      
      // Filter by column
      if (this.filterColumn) {
        filtered = filtered.filter(record => record.column === this.filterColumn);
      }

      // Filter by station
      if (this.filterStation) {
        const selectedStation = String(this.filterStation).trim();
        filtered = filtered.filter(record => String(record.station || '').trim() === selectedStation);
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
      const stationFilter = this.filterStation ? String(this.filterStation).trim() : null;
      const batchNames = stationFilter
        ? this.kanbanBatchList
            .filter(batch => String(batch.station || '').trim() === stationFilter)
            .map(batch => batch.name)
        : this.kanbanBatches;
      const uniqueBatches = [
        ...new Set(
          batchNames
            .map(name => String(name || '').trim())
            .filter(Boolean)
        )
      ];
      return uniqueBatches.length > 0 ? uniqueBatches : [];
    },
    stationOptions() {
      const uniqueStations = [
        ...new Set(
          this.userStations
            .map(station => String(station || '').trim())
            .filter(Boolean)
        )
      ];
      uniqueStations.sort((a, b) => {
        const aNum = Number(a);
        const bNum = Number(b);
        const aIsNum = !Number.isNaN(aNum);
        const bIsNum = !Number.isNaN(bNum);
        if (aIsNum && bIsNum) {
          return aNum - bNum;
        }
        return a.localeCompare(b);
      });
      return uniqueStations.length > 0 ? uniqueStations : [];
    },
    totalScans() {
      return this.filteredRecords.length;
    }
  },
  methods: {
    startAutoRefresh() {
      this.stopAutoRefresh();
      this.runAutoRefresh();
    },
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    },
    async runAutoRefresh() {
      const startTime = Date.now();
      await this.loadAllKanbans();
      const elapsed = Date.now() - startTime;
      const delay = Math.max(this.refreshIntervalMs - elapsed, 0);
      this.refreshTimer = setTimeout(() => this.runAutoRefresh(), delay);
    },
    async loadAllKanbans() {
      try {
        this.loading = true;
        const response = await api.get('/kanbans');
        const batches = response.data;
        this.kanbanBatchList = batches;
        this.kanbanBatches = batches.map(batch => batch.name);
        await this.loadUserStations();
        
        // Load data for all batches
        const allData = [];
        for (const batch of batches) {
          try {
            const dataResponse = await api.get(`/kanbans/${batch.id}/data`);
            const batchData = dataResponse.data.map(item => ({
              ...item,
              column: item.columnName,  // Map API's columnName to column
              qrData: item.value,        // Map API's value to qrData
              timestamp: item.timestamp || item.created_at || item.createdAt || new Date().toISOString(),
              batchKey: batch.name,
              station: item.station || batch.station || '',
              id: `${batch.id}-${item.id}`,
              qrThumb: null,
              qrCode: null,
              barcodeThumb: null,
              barcodeImg: null,
              qrDialog: false,
              barcodeDialog: false
            }));
            allData.push(...batchData);
          } catch (err) {
            console.error(`Failed to load data for batch ${batch.id}:`, err);
          }
        }
        
        this.records = allData;
        console.log('All kanbans loaded:', allData);
      } catch (error) {
        console.error('Failed to load kanbans:', error);
      } finally {
        this.loading = false;
      }
    },
    getColumnCount(columnName) {
      return this.filteredRecords.filter(record => record.column === columnName).length;
    },
    async loadUserStations() {
      try {
        const response = await api.get('/users');
        this.userStations = response.data.map(user => user.station);
      } catch (error) {
        console.error('Failed to load user stations:', error);
        this.userStations = [];
      }
    },
    getQrThumb(item) {
      this.ensureQrThumb(item);
      return item?.qrThumb || '';
    },
    getBarcodeThumb(item) {
      this.ensureBarcodeThumb(item);
      return item?.barcodeThumb || '';
    },
    async openQrDialog(item) {
      if (!item) return;
      await this.ensureQrCode(item);
      this.$set(item, 'qrDialog', true);
    },
    async openBarcodeDialog(item) {
      if (!item) return;
      await this.ensureBarcodeImg(item);
      this.$set(item, 'barcodeDialog', true);
    },
    async ensureQrThumb(item) {
      if (!item || item.qrThumb || !item.qrData) return;
      try {
        const qrThumb = await QRCode.toDataURL(String(item.qrData), {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.8,
          margin: 0,
          width: 56
        });
        this.$set(item, 'qrThumb', qrThumb);
      } catch (error) {
        console.error('Failed to generate QR thumbnail:', error);
      }
    },
    async ensureQrCode(item) {
      if (!item || item.qrCode || !item.qrData) return;
      try {
        const qrCode = await QRCode.toDataURL(String(item.qrData), {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          width: 220
        });
        this.$set(item, 'qrCode', qrCode);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    },
    async ensureBarcodeThumb(item) {
      if (!item || item.barcodeThumb || !item.barcode) return;
      const value = String(item.barcode);
      const barcodeThumb = await new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 36;
        try {
          JsBarcode(canvas, value, {
            format: 'CODE128',
            displayValue: false,
            height: 32,
            width: 1.5,
            margin: 0,
            background: '#fff',
            lineColor: '#222'
          });
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          resolve(null);
        }
      });
      if (barcodeThumb) {
        this.$set(item, 'barcodeThumb', barcodeThumb);
      }
    },
    async ensureBarcodeImg(item) {
      if (!item || item.barcodeImg || !item.barcode) return;
      const value = String(item.barcode);
      const barcodeImg = await new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 220;
        canvas.height = 80;
        try {
          JsBarcode(canvas, value, {
            format: 'CODE128',
            displayValue: true,
            fontSize: 18,
            height: 56,
            width: 2,
            margin: 0,
            background: '#fff',
            lineColor: '#222'
          });
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          resolve(null);
        }
      });
      if (barcodeImg) {
        this.$set(item, 'barcodeImg', barcodeImg);
      }
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
        // TODO: Implement delete endpoint
        this.records = this.records.filter(r => r.id !== this.itemToDelete.id);
        this.deleteDialog = false;
        this.itemToDelete = null;
      }
    },
    exportToCSV() {
      const filtered = this.filteredRecords;
      if (filtered.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No records to export',
          text: 'There are no records matching your filter.',
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }

      const csvRows = [];
      const headers = ['Row', 'Column', 'QR Data', 'Timestamp'];
      csvRows.push(headers.join(','));

      filtered.forEach(record => {
        const row = [
          record.row == null ? '' : record.row,
          record.column == null ? '' : record.column,
          record.qrData == null ? '""' : `"${record.qrData}"`,
          record.timestamp == null ? '' : this.formatDate(record.timestamp)
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
  padding: 12px;
}

.admin-card {
  border-radius: 12px;
  overflow: hidden;
}

.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.stat-card {
  border-radius: 8px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  opacity: 1;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
  color: white;
}

.stat-value {
  font-size: 24px;
  font-weight: 900;
  color: white;
}

.stat-row {
  flex-wrap: wrap;
}

.filter-row {
  flex-wrap: wrap;
}

@media (min-width: 960px) {
  .filter-row {
    flex-wrap: nowrap;
  }
  .filter-row > .filter-col {
    flex: 1 1 0 !important;
    max-width: none !important;
  }
}

@media (min-width: 960px) {
  .stat-row {
    flex-wrap: nowrap;
  }

  .stat-row > .stat-col {
    flex: 1 1 0 !important;
    max-width: none !important;
  }
}

.records-table {
  border-radius: 8px;
  overflow: hidden;
}

.thumb-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  cursor: pointer;
}

.thumb-img {
  max-width: 56px;
  max-height: 32px;
  border-radius: 4px;
}

::v-deep .v-data-table-header {
  background-color: #f5f7fa;
}

::v-deep .v-data-table-header th {
  font-weight: 700;
  color: #1f2937;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.8px;
  padding: 8px 4px !important;
}

::v-deep .v-data-table tbody td {
  padding: 8px 4px !important;
  height: auto;
}

::v-deep .v-card__text {
  padding: 8px 12px !important;
}

::v-deep .v-col {
  padding: 4px !important;
}
</style>
