<template>
  <v-container fluid class="pa-0 kanban-bg-pro fullpage-container" style="min-height: 100vh; min-width: 100vw; padding: 2vw 2vw 0 2vw; box-sizing: border-box;">
    <v-row class="fill-height fullpage-row" align="stretch" justify="center" style="height: 100vh; min-height: 100vh;">
      <v-col cols="12" class="pa-0 fullpage-col" style="height: 100vh; min-height: 100vh;">
        <v-card elevation="0" class="pa-2 pt-2 kanban-card-pro fullpage-card flat-card kanban-inner-padding" style="position: relative; height: calc(100vh - 70px - 4vw); min-height: calc(100vh - 70px - 4vw); width: calc(100vw - 4vw); min-width: calc(100vw - 4vw); border-radius: 0; box-shadow: none; margin: 0 auto;">
          <v-progress-linear
            v-if="isGenerating || delayedLoading"
            color="primary"
            height="6"
            indeterminate
            style="position: absolute; top: 0; left: 0; width: 100%; z-index: 1000;"
          />
          <!-- Scan Header -->
          <template>
            <div class="kanban-hero">
              <div class="kanban-hero-text">
                <div class="kanban-hero-title">Kanban Board</div>
                <v-progress-circular
                  v-if="isFetchingBatches"
                  indeterminate
                  size="32"
                  width="3"
                  color="primary"
                  style="margin-right: 10px;"
                ></v-progress-circular>
                <div style="display: flex; align-items: center; gap: 12px;">

                  <v-autocomplete
                    v-model="selectedBatchId"
                    :items="batchList"
                    :search-input.sync="batchSearch"
                    item-text="name"
                    item-value="id"
                    label="Search Model"
                    clearable
                    dense
                    outlined
                    hide-details
                    :disabled="isFetchingBatches"
                    :loading="isFetchingBatches"
                    class="batch-select"
                    style="width: 250px; height: 40px; background: white; border-radius: 8px;"
                    @change="getKanbanDataFromLocalStorage"
                  ></v-autocomplete>

                  <v-text-field
                    v-model="manualScanInput"
                    label="Manual Scan Input (temporary)"
                    outlined
                    dense
                    style="width: 250px; height: 40px; background: white; border-radius: 8px;"
                    @keyup.enter.native="triggerManualScan"
                    placeholder="Type or paste scan value and press Enter"
                 />
                </div>
              </div>


              <div class="kanban-hero-title">Station: {{ station }}</div>
                  <!-- :disabled="isGenerating || !isPrintAllowed" -->

              
              <div class="kanban-hero-meta">
                <v-btn
                  color="success"
                  class="kanban-chip print-btn"
                  small
                  @click="clearCurrentBatch"
                      :style="{
                    opacity: (isGenerating || !isPrintAllowed) ? 0.5 : 1,
                    cursor: (isGenerating || !isPrintAllowed) ? 'not-allowed' : 'pointer',
                    background: (isGenerating || !isPrintAllowed) ? '#f5f5f5' : 'linear-gradient(135deg,#ff6b6b,#d32f2f)',
                    color: (isGenerating || !isPrintAllowed) ? '#aaa' : '#fff',
                    border: (isGenerating || !isPrintAllowed) ? '1px solid #ccc' : 'none',
                    boxShadow: (isGenerating || !isPrintAllowed) ? 'none' : '0 4px 12px rgba(255,107,107,0.2)'
                  }"
                >
                  <v-icon left size="18">mdi-content-save</v-icon>
                  Save Batch
                </v-btn>
                <v-chip class="kanban-chip" label>Rows {{ rowRangeLabel }}</v-chip>
                <!-- :disabled="isGenerating || !isPrintAllowed"  -->
              <v-btn
                  color="red"
                  class="kanban-chip print-btn"
                  :loading="isGenerating"
                  
                  @click="showPrintDialog = true"
                  :style="{
                    opacity: (isGenerating || !isPrintAllowed) ? 0.5 : 1,
                    cursor: (isGenerating || !isPrintAllowed) ? 'not-allowed' : 'pointer',
                    background: (isGenerating || !isPrintAllowed) ? '#f5f5f5' : 'linear-gradient(135deg,#ff6b6b,#d32f2f)',
                    color: (isGenerating || !isPrintAllowed) ? '#aaa' : '#fff',
                    border: (isGenerating || !isPrintAllowed) ? '1px solid #ccc' : 'none',
                    boxShadow: (isGenerating || !isPrintAllowed) ? 'none' : '0 4px 12px rgba(255,107,107,0.2)'
                  }"
                >
                  <v-icon left size="18" :style="{ color: (isGenerating || !isPrintAllowed) ? '#aaa' : '#fff' }">mdi-print</v-icon>
                  Print
                </v-btn>
              </div>
            </div>
            <v-row no-gutters>
              <div class="kanban-grid-wrapper">
                <!-- Row Numbers -->
                <div class="kanban-grid-numbers">
                  <div class="kanban-grid-header-spacer"></div>
                  <div
                    v-for="rowIndex in visibleRowIndices"
                    :key="rowIndex"
                    :class="['kanban-grid-row-number', rowIndex === visibleRowIndices[0] ? 'kanban-grid-row-number-first' : '']"
                  >
                    {{ rowIndex + 1 }}
                  </div>
                </div>
                <!-- Kanban Columns with Sticky Header and Grid -->
                <div class="kanban-grid-main">
                  <div class="kanban-grid-header-row">
                    <div v-for="(column) in currentData.columns" :key="column.header" class="kanban-grid-header">{{ column.header }}</div>
                  </div>
                  <div class="kanban-grid-body">
                    <div v-for="rowIndex in visibleRowIndices" :key="rowIndex" class="kanban-grid-row">
                      <div v-for="(column, colIdx) in currentData.columns" :key="colIdx" class="kanban-grid-cell">
                        <v-hover v-slot="{ hover }">
                          <v-sheet
                            :class="['slot-pro', { highlight: column.type === 'highlight', 'slot-hover': hover }]"
                            elevation="0"
                            class="qr-barcode-elevated"
                          >
                            <div class="slot-inner-pro qr-elevate-pro">
                              <div class="qr-col-pro">
                                <center>
                                  <img v-if="column.items[rowIndex] && column.items[rowIndex].qrCode" :src="column.items[rowIndex].qrCode" alt="QR Code" class="qr-code-pro" />
                                </center>
                              </div>
                               <div style="text-align: center; width: 100%;">
                                <p v-if="column.items[rowIndex] && column.items[rowIndex].qrData" style="width: 100%; max-width: 100px; height: auto; object-fit: contain;">
                                <!-- {{ column.items[rowIndex].qrData.startsWith('RSC') ? column.items[rowIndex].qrData.slice(4) : column.items[rowIndex].qrData.slice(7) }} -->
                                {{  column.items[rowIndex].qrData.slice(12,23) }}
                                </p>
                               </div>
                              <div style="text-align: center; width: 100%;">
                                <img v-if="column.items[rowIndex] && column.items[rowIndex].scannedBarcodeImg" :src="column.items[rowIndex].scannedBarcodeImg" alt="Scanned Barcode" style="width: 100%; max-width: 100px; height: auto; object-fit: contain;" />
                              </div>
                              <!-- <div class="bar-col-pro">
                                <center>
                                  <img v-if="column.items[rowIndex] && column.items[rowIndex].barcodeImg" :src="column.items[rowIndex].barcodeImg" alt="Barcode" class="barcode-img-pro" />
                                </center>
                              </div> -->
                            </div>
                          </v-sheet>
                        </v-hover>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-row>

            <div class="nav-controls mt-6" v-if="totalRows > 5" style="display: flex; justify-content: center; align-items: center; padding: 10px 0 10px 0;">
              <div class="pagination-pill">
                <button
                  class="pagination-btn"
                  :disabled="isGenerating || rowPage === 0"
                  @click="goPrevSet"
                  aria-label="Previous page"
                  type="button"
                >
                  <v-icon size="22">mdi-chevron-left</v-icon>
                </button>
                <div class="pagination-page">
                  {{ rowPage + 1 }} / {{ maxRowPage + 1 }}
                </div>
                <button
                  class="pagination-btn"
                  :disabled="isGenerating || rowPage >= maxRowPage"
                  @click="goNextSet"
                  aria-label="Next page"
                  type="button"
                >
                  <v-icon size="22">mdi-chevron-right</v-icon>
                </button>
              </div>
            </div>
          </template>

          <!-- Temporary Manual Scan Input -->
          <!-- <div class="d-flex flex-column align-center mt-8">
            <v-text-field
              v-model="manualScanInput"
              label="Manual Scan Input (temporary)"
              outlined
              dense
              style="max-width: 320px;"
              @keyup.enter.native="triggerManualScan"
              placeholder="Type or paste scan value and press Enter"
            />
            <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
          </div>  -->
          
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showPrintDialog" max-width="500px" transition="dialog-bottom-transition">
  <v-card class="elevation-4 rounded-lg">
    <!-- Header with a Solid Blue Background -->
    <v-card-title class="headline blue darken-2 white--text d-flex align-center py-4">
      <v-icon left dark class="mr-2">mdi-printer</v-icon>
      <span>Confirm Print</span>
    </v-card-title>

    <!-- Content Area with Enhanced Text Field -->
    <v-card-text class="pt-6 px-6">
      <p class="subtitle-1 grey--text text--darken-2 mb-4">
        Please enter the required quality number before proceeding with the print.
      </p>
      
      <v-text-field 
        v-model="qualityNumber"
        label="Input Quality Number"
        prepend-inner-icon="mdi-file-check-outline"
        color="blue darken-2"
        outlined
        dense
        hide-details
        clearable
        placeholder="e.g., 2 print preview 40(2), leave empty if 1."
      ></v-text-field>
    </v-card-text>

    <v-divider></v-divider>

    <!-- Action Buttons -->
    <v-card-actions class="pa-4 bg-lighten-5">
      <v-spacer></v-spacer>
      
      <v-btn 
        color="grey darken-1" 
        text 
        class="text-capitalize px-4"
        @click="showPrintDialog = false , qualityNumber = null"
      >
        Cancel
      </v-btn>
      
      <v-btn 
        color="blue darken-2" 
        depressed
        dark
        class="text-capitalize px-6 font-weight-bold"
        @click="printPageFromDialog"
      >
        <v-icon left small>mdi-printer-check</v-icon>
        Print
      </v-btn>
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
  name: 'StationTwoView',
  data() {
    return {
      currentSet: 0,
      rowPage: 0,
      rowsPerPage: 5,
      dataSet : 40,
      isGenerating: false,
      showPrintDialog:false,
      delayedLoading: false,
      qualityNumber: null,
      scanInput: '',
      manualScanInput: '', // For temporary manual scan
      scannedList: [],
      error: '',
      scannerBuffer: '',
      scannerBufferTimer: null,
      lastScanTime: 0,
      scanCooldownMs: 500,
      batchList: [],
      selectedBatchId: null,
      isFetchingBatches: false,
      batchSearch: '',
      selectedDate: new Date().toISOString().substr(0, 10),
      dateMenu: false,
      kanbanColumns: ['FSC LH', 'FSC RH', 'FSB LH', 'FSB RH', 'RSB RH', 'RSB LH', 'RSC'],
      kanbanData: [
        {
          columns: [
            {
              header: "FSB RH",
              type: "empty",
              items: [
              ]
            },
            {
              header: "FSB LH",
              type: "highlight",
              items: [
              ]
            },
            {
              header: "FSC RH",
              type: "highlight",
              items: [
              ]
            },
            {
              header: "FSC LH",
              type: "highlight",
              items: [
              ]
            },
            {
              header: "RSB RH",
              type: "empty",
              items: [
              ]
            },
            {
              header: "RSB LH",
              type: "empty",
              items: [
              ]
            },
            {
              header: "RSC",
              type: "empty",
              items: [
              ]
            }
          ]
        }
        // ... (add more sets as needed, or copy from KanbanView.vue)
      ]
    }
  },
  computed: {
      isPrintAllowed() {
        // Check if all rows in all columns have completed QR data
        if (!this.currentData || !this.currentData.columns) return false;
        // For each column, check if every item in items has a non-empty qrData
        for (const column of this.currentData.columns) {
          for (let i = 0; i < this.totalRows; i++) {
            const item = column.items[i];
            if (!item || !item.qrData || String(item.qrData).trim() === '') {
              return false;
            }
          }
        }
        return true;
      },
    currentData() {
      return this.kanbanData[this.currentSet]
    },
    totalRows() {
      // Reference data_set from selected batch if available, otherwise use dataSet
      const batchDataSet = this.selectedBatchId 
        ? this.batchList.find(b => b.id === this.selectedBatchId)?.data_set 
        : null;
      const rowCount = batchDataSet || this.dataSet;
      return Math.max(0, Number(rowCount) || 0);
    },
    maxRowPage() {
      return Math.max(0, Math.ceil(this.totalRows / this.rowsPerPage) - 1);
    },
    visibleRowIndices() {
      const start = this.rowPage * this.rowsPerPage;
      const end = Math.min(start + this.rowsPerPage, this.totalRows);
      return Array.from({ length: Math.max(0, end - start) }, (_, idx) => start + idx);
    },
    rowRangeLabel() {
      if (!this.totalRows) {
        return '0-0';
      }
      const start = (this.rowPage * this.rowsPerPage) + 1;
      const end = Math.min(start + (this.rowsPerPage - 1), this.totalRows);
      return `${start}-${end} of ${this.totalRows}`;
    },
    station() {
      return this.$store.state.user?.station || '';
    }
  },
  async mounted() {
    this.dataSet = this.$store.state.user?.data_set || this.dataSet;
    window.addEventListener('keydown', this.onGlobalScannerKeydown);
    await this.getModel();
    this.normalizeDataSet();
    await this.generateAllQRCodes();
    this.$nextTick(() => this.generateBarcodesForCurrentSet());
    // Listen for socket events to refresh data
    // this.$socket.on('refresh-kanban-prints', () => {
    //   // this.fetchBatches();
    //     this.getAllKanbanQA(this.selectedDate);
    // });
    // Initial KanbanQA fetch for today
  },
    watch: {
      scanInput(newVal, oldVal) {
        if (newVal && !oldVal) {
          this.delayedLoading = true;
          setTimeout(() => {
            this.delayedLoading = false;
          }, 1000); // 1 second delay
        } else if (!newVal) {
          this.delayedLoading = false;
        }
      }
    },

  beforeDestroy() {
    window.removeEventListener('keydown', this.onGlobalScannerKeydown);
    this.clearScannerBufferTimer();
    
    // Remove socket listener
    // this.$socket.off('refresh-kanban-prints');
  },
  methods: {
            async printPageFromDialog() {
          this.showPrintDialog = false;
          await this.printPage();
        },
    async clearCurrentBatch(){
      const selectedBatch = this.batchList.find(b => b.id === this.selectedBatchId);
      if (!selectedBatch) return;

      const result = await Swal.fire({
        title: 'Clear current batch?',
        text: `This will reset the current batch "${selectedBatch.name}" `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear it',
        cancelButtonText: 'No, keep it',
        focusCancel: true,
        allowEnterKey: true,
        confirmButtonColor: '#28a745', // Green
        cancelButtonColor: '#dc3545'   // Red
      });

      if (!result.isConfirmed) {
        return;
      }

      this.isGenerating = true;
      try {
        // Save the current batch to history before clearing.
        // If this fails, abort so the operator does not lose data silently.
        const response = await api.post('/stationtwo/kanban/history', {
          data: this.currentData,
          kanban: selectedBatch.name
        });
        console.log('Saved current batch data to history:', response.data);

        // Reset the board to an empty data set
        const dataSet = Number(selectedBatch.data_set) || Number(this.dataSet) || 40;
        const emptyData = this.createTemporaryKanbanData(dataSet);
        this.kanbanData = emptyData;
        this.rowPage = 0;
        this.scannedList = [];
        this.manualScanInput = '';

        // Persist the cleared state to the JSON file storage
        try {
          await api.post('/stationtwo/kanban/storage', {
            name: selectedBatch.name,
            data: emptyData
          });
        } catch (storageErr) {
          console.error(`Failed to clear batch ${selectedBatch.name} in JSON file:`, storageErr);
        }

        this.playBeep(false);
        Swal.fire({
          icon: 'success',
          title: 'Batch Save',
          text: `"${selectedBatch.name}" has been saved to history and reset.`,
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Failed to clear current batch:', error);
        this.saveErrorLog('clearCurrentBatch', error);
        this.playBeep(true);
        Swal.fire({
          icon: 'error',
          title: 'Clear Failed',
          //text: error.response?.data?.error || error.message || 'Could not save batch to history. The board was not cleared.',
          text:  error.message || 'Could not save batch to history. The board was not cleared.',
          allowEnterKey: true,
          showConfirmButton: true
        });
      } finally {
        this.isGenerating = false;
      }
    },
    async getKanbanDataFromLocalStorage(){
      try {
        const selectedBatch = this.batchList.find(b => b.id === this.selectedBatchId);
        if (!selectedBatch) return;
        // Persist selection so it survives page reloads (small value, kept in localStorage)
        localStorage.setItem('stationTwoSelectedBatch', selectedBatch.name);
        const response = await api.get('/stationtwo/kanban/storage', {
          params: { name: selectedBatch.name }
        });
        const parsed = response.data?.data;
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.kanbanData = parsed;
          
          // Ensure arrays are properly sized to totalRows
          const targetSize = Number(selectedBatch.data_set) || this.dataSet || 40;
          this.kanbanData[0].columns.forEach(col => {
            const currentSize = col.items.length;
            if (currentSize < targetSize) {
              // Expand array to targetSize
              while (col.items.length < targetSize) {
                col.items.push({});
              }
            }
          });
          
          // Rebuild scannedList from loaded data
          this.scannedList = [];
          this.kanbanData.forEach(set => {
            set.columns.forEach(column => {
              column.items.forEach(item => {
                if (item && item.qrData && !this.scannedList.includes(item.qrData)) {
                  this.scannedList.push(item.qrData);
                }
              });
            });
          });
          
          // Reset row page to first page
          this.rowPage = 0;
          this.$forceUpdate();
        }
      } catch (err) {
        console.error('Failed to load kanbanData from JSON file:', err);
      }
    },
    async initializeAllBatchesInLocalStorage() {
      // Initialize temporary data for all batches in batchList (stored in JSON files)
      await Promise.all(this.batchList.map(async (batch) => {
        const dataSet = batch.data_set || this.dataSet || 40;
        try {
          const response = await api.get('/stationtwo/kanban/storage', {
            params: { name: batch.name }
          });
          const stored = response.data?.data;

          if (!Array.isArray(stored) || stored.length === 0) {
            // Create new data if not yet stored
            const tempData = this.createTemporaryKanbanData(dataSet);
            await api.post('/stationtwo/kanban/storage', {
              name: batch.name,
              data: tempData
            });
          } else {
            // Data exists - verify it has the correct size
            const currentSize = stored[0]?.columns[0]?.items?.length || 0;

            if (currentSize < dataSet) {
              // Expand arrays to match dataSet
              stored[0].columns.forEach(col => {
                while (col.items.length < dataSet) {
                  col.items.push({});
                }
              });
              await api.post('/stationtwo/kanban/storage', {
                name: batch.name,
                data: stored
              });
            }
          }
        } catch (err) {
          console.error(`Failed to initialize batch ${batch.name} in JSON file:`, err);
        }
      }));
    },
    createTemporaryKanbanData(totalRows = 40) {
      // Create a temporary kanban data structure with empty items
      return [
        {
          columns: [
            {
              header: "FSB RH",
              type: "empty",
              items: Array(totalRows).fill(null).map(() => ({}))
            },
            {
              header: "FSB LH",
              type: "highlight",
              items: Array(totalRows).fill(null).map(() => ({}))
            },
            {
              header: "FSC RH",
              type: "highlight",
              items: Array(totalRows).fill(null).map(() => ({}))
            },
            {
              header: "FSC LH",
              type: "highlight",
              items: Array(totalRows).fill(null).map(() => ({}))
            },
            {
              header: "RSB RH",
              type: "empty",
              items: Array(totalRows).fill(null).map(() => ({}))
            },
            {
              header: "RSB LH",
              type: "empty",
              items: Array(totalRows).fill(null).map(() => ({}))
            },
            {
              header: "RSC",
              type: "empty",
              items: Array(totalRows).fill(null).map(() => ({}))
            }
          ]
        }
      ];
    },
        async triggerManualScan(rawValue) {
          let value = String(rawValue || this.manualScanInput || '').trim();
          if (!value) return;
          
          if (rawValue instanceof Event) {
            value = rawValue.target.value;
          }

          const scanType = this.detectScanType(value);
          const currentBatch = this.batchList.find(b => b.id === this.selectedBatchId);

          // Check for duplicate scan
          if (this.scannedList.includes(value)) {
            this.playBeep(true);
            Swal.fire({
              icon: 'warning',
              title: 'Duplicate scan',
              text: 'This scan value has already been entered.',
              allowEnterKey: true,
              showConfirmButton: false,
              timer: 2500
            });
            this.manualScanInput = '';
            return;
          }

          // Check there is available space in the target column before scanning
          if (scanType === 'QR') {
            const headerName = this.extractColumnHeader(value);
            const columns = (this.currentData && this.currentData.columns) || [];
            const targetColumn = columns.find(col => col.header === headerName);
            const hasSpace = targetColumn
              ? targetColumn.items.some(item => !item || Object.keys(item).length === 0)
              : false;
            if (!hasSpace) {
              this.playBeep(true);
              Swal.fire({
                icon: 'error',
                title: `${headerName || 'Target'} Full`,
                text: `There is no available space. The "${headerName || 'target'}" column is full.`,
                allowEnterKey: true,
                showConfirmButton: false,
                timer: 2500
              });
              this.manualScanInput = '';
              return;
            }
          }

          try {
            if (scanType === 'QR') {
              await this.validateQRScan(value, currentBatch);
              // Place QR item on the board
              await this.placeQROnBoard(value);
            } else if (scanType === 'Barcode') {
              await this.validateBarcodeScan(value);
            } else {
              this.playBeep(true);
              Swal.fire({
                icon: 'warning',
                title: 'Unknown scan type',
                text: 'Unable to determine scan type.',
                allowEnterKey: true,
                showConfirmButton: false,
                timer: 2500
              });
              return;
            }

            // Add to scanned list and save
            if (!this.scannedList.includes(value)) {
              this.scannedList.push(value);
            }
            await this.saveKanbanDataToLocalStorage();
            this.$forceUpdate();
          } catch (error) {
            console.error('Scan error:', error);
          }

          this.manualScanInput = '';
        },

        extractColumnHeader(value) {
          // Parse column header from QR code
          // Example: "KBA9  F/CRH202604230001C" => "FSC RH"
          const cleaned = value.replace(/\s+/g, '').replace(/\//g, '').toUpperCase();
          console.log(cleaned ," test")
          
          // Mapping of scanned patterns to column headers
          const headerMappings = {
            'FCRH': 'FSC RH',
            'FCLH': 'FSC LH',
            'FBRH': 'FSB RH',
            'FBLH': 'FSB LH',
            'RSBRH': 'RSB RH',
            'RBRH': 'RSB RH',
            'RSBLH': 'RSB LH',
            'RBLH': 'RSB LH',
            'RSC': 'RSC',
            'RC': 'RSC',

          };

          // Try to match patterns in order
          for (const [pattern, header] of Object.entries(headerMappings)) {
            if (cleaned.includes(pattern)) {
              return header;
            }
          }

          return null;
        },

        findFirstEmptySlot(columnIndex) {
          const column = this.currentData.columns[columnIndex];
          if (!column) return -1;

          return column.items.findIndex(item =>
            item &&
            typeof item === "object" &&
            !Array.isArray(item) &&
            Object.keys(item).length === 0
          );
        },
        async placeQROnBoard(value) {
          // Extract the column header from the QR code
          const headerName = this.extractColumnHeader(value);
          if (!headerName) {
            console.warn('Could not extract column header from:', value);
            return;
          }

          // Find the column index
          const columns = this.currentData.columns;
          const columnIndex = columns.findIndex(col => col.header === headerName);
          
          if (columnIndex === -1) {
            console.warn('Column not found:', headerName);
            return;
          }

          // Find the first empty slot in this column
          const itemIndex = this.findFirstEmptySlot(columnIndex);
          if (itemIndex === -1) {
            this.playBeep(true);
            Swal.fire({
              icon: 'warning',
              title: 'Column Full',
              text: `The "${headerName}" column is full.`,
              allowEnterKey: true,
              showConfirmButton: false,
              timer: 2500
            });
            return;
          }

          // Generate QR code
          const qrCodeData = await this.convertToQRCode(value);

          // Remove any existing item with the same qrData to avoid duplicates on the board.
          // Compare normalized values (ignore whitespace/slashes/case) so near-identical
          // scans of the same item are treated as duplicates even when not strictly equal.
          this.removeDuplicateQrData([this.currentData]);


          // Place item on the board
          this.$set(this.currentData.columns[columnIndex].items, itemIndex, {
            qrData: value,
            qrCode: qrCodeData
          });

          // Auto-navigate pagination to the page containing the newly placed item
          const targetPage = Math.floor(itemIndex / this.rowsPerPage);
          if (targetPage !== this.rowPage && targetPage >= 0 && targetPage <= this.maxRowPage) {
            this.rowPage = targetPage;
          }
        },
        removeDuplicateQrData(data) {
          data.forEach(board => {
            board.columns.forEach(column => {
              const seen = new Set();

              column.items = column.items.map(item => {
                // Skip empty objects
                if (
                  !item ||
                  Object.keys(item).length === 0 ||
                  !item.qrData
                ) {
                  return item;
                }

                // Duplicate qrData found
                if (seen.has(item.qrData)) {
                  return {};
                }

                // First occurrence
                seen.add(item.qrData);
                return item;
              });
            });
          });

          return data;
        },

        async validateQRScan(value, currentBatch) {
          // Validate model match
          const valueKanbanModel = value.substring(0, 5);
          if (currentBatch && currentBatch.name !== valueKanbanModel.trim()) {
            this.playBeep(true);
            Swal.fire({
              icon: 'error',
              title: 'Model Mismatch',
              html: `Scanned value does not match selected Model "<strong>${currentBatch.name}</strong>".<br><br>Scanned: "<strong>${valueKanbanModel}</strong>"`,
              allowEnterKey: true,
              showConfirmButton: false
            });
            throw new Error('Model mismatch');
          }

          // API validation
          try {
            await api.post('/stationtwo/kanban/validate/qr', { kanban: value });
            this.playBeep(false);
            Swal.fire({
              icon: 'success',
              title: 'Validated',
              text: 'QR code validated successfully!',
              timer: 1000,
              showConfirmButton: false
            });
          } catch (error) {
            this.playBeep(true);
            Swal.fire({
              icon: 'error',
              title: 'Validation Failed',
              text: error.response?.data?.error || error.message || 'API error',
              allowEnterKey: true,
              showConfirmButton: false
            });
            throw error;
          }
        },

        async validateBarcodeScan(value) {
          try {
            const response = await api.post('/stationtwo/kanban/validate/barcode', {
              barcode: value
            });
            console.log('Barcode validation response:', response.data);

            this.playBeep(false);
            Swal.fire({
              icon: 'success',
              title: 'Validated',
              text: 'Barcode validated successfully!',
              timer: 1000,
              showConfirmButton: false
            });
          } catch (error) {
            this.playBeep(true);
            Swal.fire({
              icon: 'error',
              title: 'Validation Failed',
              text: error.response?.data?.error || error.message || 'API error',
              allowEnterKey: true,
              showConfirmButton: false
            });
            throw error;
          }
        },
      async convertToQRCode(value) {
        try {
          return await QRCode.toDataURL(String(value), {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            width: 110
          });
        } catch (err) {
          console.error('Error generating QR code:', err);
          return null;
        }
      },
    async getModel(){
            const response = await api.get('/stationtwo/kanban');
            this.batchList = response.data.map((item,index) => ({
              id : index + 1, // Assign a unique ID based on index (or use item.id if available)
              name : item.name
            }));
            // Initialize temporary data in the JSON file storage for each batch BEFORE loading
            await this.initializeAllBatchesInLocalStorage();
            if (this.batchList.length > 0) {
              // Restore previously selected batch from localStorage, fallback to first batch
              const savedBatchName = localStorage.getItem('stationTwoSelectedBatch');
              const savedBatch = savedBatchName
                ? this.batchList.find(b => b.name === savedBatchName)
                : null;
              this.selectedBatchId = savedBatch ? savedBatch.id : this.batchList[0].id;
              await this.getKanbanDataFromLocalStorage();
            }
       },
        async getAllKanbanQA(date) {
          try {
            this.isFetchingBatches = true;
            // Replace with your actual API endpoint and params
            const response = await api.get('/stationtwo/kanbanqa', {
              params: { date }
            });

            let kanbanQAData = response.data.map(item => ({
              ...item,
              data_set : this.$store.state.user?.data_set || this.dataSet // Use data_set from user state or fallback to local dataSet
            }));
            this.batchList = kanbanQAData; // Assuming you want to populate batchList with this data
            // Initialize temporary data in the JSON file storage for each batch
            await this.initializeAllBatchesInLocalStorage();
            if (this.batchList.length > 0) {
              this.selectedBatchId = this.batchList[0].id;
              this.loadBatchData()
            }
            // Handle response data as needed
            // Example: this.kanbanQAData = response.data;
            this.isFetchingBatches = false;

          } catch (error) {
            this.playBeep(true);
            this.isFetchingBatches = false;
            this.saveErrorLog('getAllKanbanQA', error);
          }
        },
          triggerManualScan1(rawValue) {
            let value = String(rawValue || this.manualScanInput || '').trim();
            if (!value) return;
            if (rawValue instanceof Event) {
              value = rawValue.target.value;
            } else {
              value = String(rawValue || this.manualScanInput || '').trim();
            }
          let scanType = this.detectScanType(value);

          if (scanType === 'Barcode') {
            const selectedBatch = this.batchList.find(b => b.id === this.selectedBatchId);
            api.patch(`/stationtwo/kanbanqa/validate/barcode?value=${encodeURIComponent(value)}&date=${encodeURIComponent(this.selectedDate)}&kanban=${encodeURIComponent(selectedBatch.name)}`)
              .then(() => {
                this.loadBatchData()
                 this.playBeep(false);
                Swal.fire({
                  icon: 'success',
                  title: 'Validated',
                  text: `KanbanQA row validated!`,
                  timer: 4000,
                  showConfirmButton: false
                });
              })
              .catch(err => {
                 this.playBeep(true);
                Swal.fire({
                  icon: 'error',
                  title: 'Validation Failed',
                  text: err?.response?.data?.error || 'API error',
                  allowEnterKey: true,
                  showConfirmButton: false
                });
              });

          }else if (scanType === 'QR') {
            if (this.selectedBatchId) {
              const selectedBatch = this.batchList.find(b => b.id === this.selectedBatchId);
              if (selectedBatch) {
                  let batchValue = Object.assign({},{kanban : selectedBatch.name.split(' ')[0] , date : selectedBatch.name.split(' ').find(p => /^\d{8}$/.test(p)) || null  }  );

                    let kanban = value.trim().split(/\s+/)[0];

                    // date = 8-digit number
                    let date = value.match(/\d{8}/)?.[0] || null;
                    let finalTrimmedValue = Object.assign({},{kanban , date});

                  if(batchValue.date != finalTrimmedValue.date || batchValue.kanban != finalTrimmedValue.kanban){
                     this.playBeep(true);
                    Swal.fire({
                      icon: 'error',
                      title: 'Model Mismatch',
                      html: `QR code does not match selected Model "<strong>${selectedBatch.name}</strong>".<br><br>Scanned: "<strong>${finalTrimmedValue.kanban}</strong>"`,
                      allowEnterKey: true,
                      showConfirmButton: false
                    });
                    return;
                  }
              }
            }
            api.patch(`/stationtwo/kanbanqa/validate/qr?value=${encodeURIComponent(value)}&date=${encodeURIComponent(this.selectedDate)})}`)
              .then(() => {
                this.loadBatchData()
                this.playBeep(false);
                Swal.fire({
                  icon: 'success',
                  title: 'Validated',
                  text: `KanbanQA row validated!`,
                  timer: 4000,
                  showConfirmButton: false
                });
              })
              .catch(err => {
                this.playBeep(true);
                Swal.fire({
                  icon: 'error',
                  title: 'Validation Failed',
                  text: err?.response?.data?.error || 'API error',
                  allowEnterKey: true,
                  showConfirmButton: false
                });
              });
          }
            this.manualScanInput = '';
          },
      async printPage() {
          const { print } = await import('../utils/StationTwoPrint');
          // Gather all items from all columns in the current set
          const allItems = [];
          const selectedBatch = this.batchList.find(b => b.id === this.selectedBatchId);
          const createdAtTimestamps = this.currentData.columns
            .flatMap(column => column.items || [])
            .map(item => new Date(item?.updated_at).getTime())
            .filter(timestamp => !Number.isNaN(timestamp));
          const latestManufacturingDate = createdAtTimestamps.length
            ? new Date(Math.max(...createdAtTimestamps)).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          this.currentData.columns.forEach(column => {
            column.items.forEach(async (item) => {
              if (item && item.qrData) {
                let obj = {
                  // specification: item.qrData.startsWith('RR Cushion') ? item.qrData.slice(11) : item.qrData.slice(7),
                  specification: selectedBatch.name,
                  qrData: `(${this.$store.state.user.model})(${selectedBatch.name})()(${this.$store.state.user.data_set})()()()()`,
                  quantity: `${this.$store.state.user.data_set}(${this.qualityNumber || 1})`,
                  model: this.$store.state.user.model,
                  manufacturingDate: latestManufacturingDate,
                };
                allItems.push(obj);
              }
            });
          });
          // Dynamically import and call printZebraLabels100Bulk
          if(allItems.length === 0) {
             this.playBeep(true);
            Swal.fire({
              icon: 'info',
              title: 'No QR Codes',
              text: 'There are no QR codes to print on the current page.',
              allowEnterKey: true,
              showConfirmButton: false
            });
            return;
          }
           await print(allItems[0]);
          this.qualityNumber = null;

        },
        saveErrorLog(context, error) {
          // Save error log to backend or local storage
          // Example: send to backend API
          try {
            api.post('/error-log', {
              context,
              error: error?.message || String(error),
              stack: error?.stack || null,
              timestamp: new Date().toISOString()
            });
          } catch (logErr) {
            console.error('Failed to save error log:', logErr);
          }
        },
        async fetchBatches() {
          try {
            this.isFetchingBatches = true;
            const user = this.$store.state.user;
            let response;
            if (user && user.role === 'admin') {
              response = await api.get('/kanbans');
            } else {
              const station = user?.station;
              response = await api.get('/kanbans', {
                params: { station }
              });
            }
            this.batchList = response.data;
            // Set the first batch as default if available (data loads on selection)
            if (this.batchList.length > 0 && !this.selectedBatchId) {
              this.selectedBatchId = this.batchList[0].id;
              await this.loadBatchData();
            }
          } catch (error) {
             this.playBeep(true);
            this.saveErrorLog('fetchBatches', error);
          } finally {
            this.isFetchingBatches = false;
          }
        },
        async loadBatchData() {
          if (!this.selectedBatchId) return;
          
          try {
            this.isGenerating = true;
            
            // Find the selected batch and update dataSet
            const selectedBatch = this.batchList.find(b => b.id === this.selectedBatchId);
            if (selectedBatch && selectedBatch.data_set) {
              this.dataSet = Number(selectedBatch.data_set);
              this.normalizeDataSet();
            }
            
            // Reset row page to show first rows (1-5)
            this.rowPage = 0;
            
            // const response = await api.get(`/kanbans/${this.selectedBatchId}/data`, {
            //   params: { station }
            // })

            const response = await api.get('/stationtwo/kanbanqa/filter', {
              params: {
                date: this.selectedDate,
                kanban: selectedBatch.name
              }
            });
            // const kanbanSetData = response.data;
            const kanbanSetData = response.data.map(rec => ({
              ...rec,
              columnName: rec.columnName === "RR Cus" ? "RSC" : rec.columnName
            }));
            
            // Clear existing data in all columns
            this.currentData.columns.forEach(column => {
              column.items = Array(this.totalRows).fill(null).map(() => ({}));
            });
            
            // Populate the kanban board with loaded data
            for (const item of kanbanSetData) {
              const column = this.currentData.columns.find(
                col => col.header === item.columnName
              );
              
              if (column && item.row > 0 && item.row <= this.totalRows) {
                const rowIndex = item.row - 1; // Convert to 0-based index
                
                // Generate QR and barcode only when value exists
                const promises = [];
                if (item.value) {
                  promises.push(
                    QRCode.toDataURL(String(item.value), {
                      errorCorrectionLevel: 'H',
                      type: 'image/png',
                      quality: 0.92,
                      margin: 1,
                      width: 110
                    })
                  );
                  promises.push(
                    new Promise((resolve) => {
                      const canvas = document.createElement('canvas');
                      canvas.width = 160;
                      canvas.height = 60;
                      try {
                        JsBarcode(canvas, String(item.value), {
                          format: 'CODE128',
                          displayValue: true,
                          fontSize: 18,
                          height: 48,
                          width: 2,
                          margin: 0,
                          background: '#fff',
                          lineColor: '#222',
                        });
                        resolve(canvas.toDataURL('image/png'));
                      } catch (err) {
                        resolve(null);
                      }
                    })
                  );
                }

                // Generate scanned barcode image if barcode exists
                if (item.barcode) {
                  promises.push(
                    new Promise((resolve) => {
                      const canvas = document.createElement('canvas');
                      canvas.width = 160;
                      canvas.height = 60;
                      try {
                        JsBarcode(canvas, String(item.barcode), {
                          format: 'CODE128',
                          displayValue: true,
                          fontSize: 18,
                          height: 48,
                          width: 2,
                          margin: 0,
                          background: '#fff',
                          lineColor: '#222',
                        });
                        resolve(canvas.toDataURL('image/png'));
                      } catch (err) {
                        resolve(null);
                      }
                    })
                  );
                }

                const results = await Promise.all(promises);
                let cursor = 0;
                const qrCode = item.value ? results[cursor++] : null;
                const barcodeImg = item.value ? results[cursor++] : null;
                const scannedBarcodeImg = item.barcode ? (results[cursor++] || null) : null;
                
                this.$set(column.items, rowIndex, {
                  qrData: item.value,
                  qrCode: qrCode,
                  barcodeImg: barcodeImg,
                  scannedBarcode: item.barcode || null,
                  scannedBarcodeImg: scannedBarcodeImg,
                  created_at: item.created_at || null
                });
                
                // Add to scanned list to prevent duplicates
                if (item.value && !this.scannedList.includes(item.value)) {
                  this.scannedList.push(item.value);
                }
                
                // Add scanned barcode to scanned list if it exists
                if (item.barcode && !this.scannedList.includes(item.barcode)) {
                  this.scannedList.push(item.barcode);
                }
              }
            }
            
            this.$forceUpdate();
            await this.saveKanbanDataToLocalStorage();
          } catch (error) {
            this.saveErrorLog('loadBatchData', error);
            this.error = 'Failed to load batch data';
            setTimeout(() => {
              this.error = '';
            }, 3000);
          } finally {
            this.isGenerating = false;
          }
        },
        async saveKanbanDataToLocalStorage() {
          try {
            const selectedBatch = this.batchList.find(b => b.id === this.selectedBatchId);
            if (!selectedBatch) return;
            await api.post('/stationtwo/kanban/storage', {
              name: selectedBatch.name,
              data: this.kanbanData
            });
          } catch (err) {
            console.error('Failed to save kanbanData to JSON file:', err);
          }
        },
        async loadKanbanDataFromLocalStorage() {
          try {
            const selectedBatch = this.batchList.find(b => b.id === this.selectedBatchId);
            if (!selectedBatch) return;
            const response = await api.get('/stationtwo/kanban/storage', {
              params: { name: selectedBatch.name }
            });
            const parsed = response.data?.data;
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.kanbanData = parsed;
            }
          } catch (err) {
            console.error('Failed to load kanbanData from JSON file:', err);
          }
        },
        async createNewBatch() {
          const batchName = prompt('Enter new batch name:');
          if (!batchName) return;
          
          try {
            const station = this.$store.state.user?.station;
            const userId = this.$store.state.user?.userId;
            const response = await api.post('/kanbans', {
              name: batchName,
              station: station,
              userId: userId
            });
            
            // Refresh batch list and select the new batch
            await this.fetchBatches();
            this.selectedBatchId = response.data.id;
            
            // Clear the board for the new batch
            this.currentData.columns.forEach(column => {
              column.items = Array(this.totalRows).fill(null).map(() => ({}));
            });
            this.scannedList = [];
            this.rowPage = 0; // Reset row to 1-5
            
            this.$forceUpdate();
          } catch (error) {
            this.saveErrorLog('createNewBatch', error);
          }
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
        normalizeDataSet() {
          const target = Math.max(0, Number(this.dataSet) || 0);
          this.kanbanData.forEach(set => {
            set.columns.forEach(column => {
              while (column.items.length < target) {
                column.items.push({});
              }
            });
          });
        },
        goNextSet() {
          if (this.rowPage < this.maxRowPage) {
            this.rowPage++;
          }
        },
        goPrevSet() {
          if (this.rowPage > 0) {
            this.rowPage--;
          }
        },
    onGlobalScannerKeydown(event) {
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        if (this.scannerBuffer.trim()) {
          // this.submitScannedValue(this.scannerBuffer);
          this.triggerManualScan(this.scannerBuffer)
          event.preventDefault();
        }
        this.scannerBuffer = '';
        this.clearScannerBufferTimer();
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

    startScan() {
      this.error = '';
    },
    stopScan() {
      this.clearScannerBufferTimer();
    },
    resetScan() {
      this.scannedList = [];
      this.error = '';
      this.startScan();
    },
    async sendQrScan(payload) {
      try {
        await api.post('/qr-scan', payload);
      } catch (err) {
        this.saveErrorLog('sendQrScan', err);
      }
    },
    async sendBarcodeScan(payload) {
      try {
        const response = await api.post('/barcode-scan', payload);
        console.log(response)
      } catch (err) {
        this.saveErrorLog('sendBarcodeScan', err);
      }
    },
    generateAllQRCodes() {
      this.isGenerating = true;
      const promises = [];
      this.kanbanData.forEach(set => {
        set.columns.forEach(column => {
          column.items.forEach((item, idx) => {
            const payload = item.qrData || item.subtitle || item.title;
            if (payload) {
              const p = QRCode.toDataURL(String(payload), {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.92,
                margin: 1,
                width: 110
              })
                .then(url => {
                  column.items[idx].qrCode = url;
                })
                .catch(() => {
                  column.items[idx].qrCode = null;
                });
              promises.push(p);
            }
          });
        });
      });
      return Promise.all(promises).finally(() => {
        this.isGenerating = false;
      });
    },
    async generateBarcodesForCurrentSet() {
      this.isGenerating = true;
      const promises = [];
      const set = this.currentData;
      set.columns.forEach((column) => {
        column.items.forEach((item, idx) => {
          const payload = item.qrData || item.subtitle || item.title;
          if (payload) {
            const p = new Promise((resolve) => {
              const canvas = document.createElement('canvas');
              canvas.width = 160;
              canvas.height = 60;
              try {
                JsBarcode(canvas, String(payload), {
                  format: 'CODE128',
                  displayValue: true,
                  fontSize: 18,
                  height: 48,
                  width: 2,
                  margin: 0,
                  background: '#fff',
                  lineColor: '#222',
                });
                column.items[idx].barcodeImg = canvas.toDataURL('image/png');
                resolve();
              } catch (err) {
                column.items[idx].barcodeImg = null;
                resolve();
              }
            });
            promises.push(p);
          }
        });
      });
      return Promise.all(promises).finally(() => {
        this.isGenerating = false;
        this.$forceUpdate();
      });
    },
 
    detectScanType(value) {
      const cleaned = String(value).replace(/\s+/g, '').replace(/\//g, '').toUpperCase();
      const qrPatterns = ['FCRH', 'FCLH', 'FBRH', 'FBLH', 'RSBRH', 'RBRH', 'RSBLH', 'RBLH', 'RSC'];

      if (qrPatterns.some(pattern => cleaned.includes(pattern))) {
        return 'QR';
      }

      if (String(value).toUpperCase().startsWith('QR:')) {
        return 'QR';
      }

      if (String(value).toUpperCase().startsWith('BAR:') || String(value).toUpperCase().startsWith('BC:')) {
        return 'Barcode';
      }

      if (/^(HTTPS?:\/\/|WIFI:|BEGIN:VCARD|MAILTO:|SMSTO:|TEL:|GEO:)/i.test(value)) {
        return 'QR';
      }

      if (/^\d{8}$|^\d{12,14}$/.test(value)) {
        return 'Barcode';
      }

      // Default to QR for kanban-like model codes containing letters and digits
      if (/^[A-Z0-9\-.$/+%]+$/i.test(cleaned) && cleaned.length >= 12) {
        return 'QR';
      }

      return 'Unknown';
    }
  }
}
</script>

<style scoped>
:global(html, body) {
  overflow: hidden;
}

:root{--bg-pro:linear-gradient(135deg,#f0f4f8 0%,#e1ecf7 40%,#d4e4f7 100%);--card-pro:#ffffff;--highlight-pro:#ffd966;--header-pro:#1a2332;--border-pro:#c8d9e8;--primary-pro:#1976d2;--accent-pro:#ff6b6b}
.kanban-bg-pro{background:var(--bg-pro);min-height:100vh;position:relative;overflow:visible;}
.kanban-bg-pro::before{content:"";position:absolute;inset:-20% -10% auto auto;width:420px;height:420px;background:radial-gradient(circle at center,rgba(25,118,210,0.16),rgba(25,118,210,0));filter:blur(6px);pointer-events:none;}
.kanban-bg-pro::after{content:"";position:absolute;inset:auto auto -25% -10%;width:520px;height:520px;background:radial-gradient(circle at center,rgba(249,115,22,0.18),rgba(249,115,22,0));filter:blur(8px);pointer-events:none;}
.kanban-card-pro{border-radius:22px;box-shadow:0 18px 48px rgba(31,41,55,0.12);background:linear-gradient(180deg,#ffffff 0%,#fbfdff 100%);border:1px solid rgba(31,41,55,0.06);}
.kanban-hero{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:12px 20px;margin-bottom:16px;background:linear-gradient(135deg,rgba(25,118,210,0.08),rgba(255,107,107,0.04));border:1px solid rgba(25,118,210,0.15);border-radius:16px;box-shadow:0 4px 20px rgba(25,118,210,0.1);}
.kanban-hero-text{display:flex;flex-direction:row;align-items:center;gap:16px;flex:1;}
.kanban-hero-title{font-family:'Space Grotesk','Segoe UI',Tahoma,sans-serif;font-weight:800;font-size:28px;color:var(--header-pro);letter-spacing:0.6px;white-space:nowrap;background:linear-gradient(135deg,#1976d2,#1565c0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center;}
.kanban-hero-subtitle{font-family:'DM Sans','Segoe UI',Tahoma,sans-serif;font-weight:500;font-size:14px;color:#5b6b82;}
.kanban-hero-meta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;flex:1;justify-content:flex-end;}
.kanban-chip{font-weight:700;letter-spacing:0.4px;border-radius:8px;background:linear-gradient(135deg,#1976d2,#1565c0) !important;color:#fff !important;padding:6px 14px !important;transition:all 0.3s ease;display:inline-flex !important;min-height:32px !important;box-shadow:0 4px 12px rgba(25,118,210,0.2);}
.kanban-chip >>> .v-chip__content{color:#fff !important;font-weight:700;}
.kanban-chip >>> .v-btn__content{color:#fff !important;font-weight:700;}
.kanban-chip >>> .v-icon{color:#fff !important;}
.batch-select{font-weight:600;letter-spacing:0.3px;background:linear-gradient(135deg,#ffffff,#f8fafc);border-radius:8px;border:1px solid rgba(25,118,210,0.15);transition:all 0.3s ease;box-shadow:0 2px 8px rgba(25,118,210,0.08);}
.batch-select:hover{border-color:rgba(25,118,210,0.3);box-shadow:0 4px 16px rgba(25,118,210,0.15);}
.batch-select >>> .v-input__control{min-height:38px;}.batch-select >>> .v-input__slot{padding:0 12px !important;}
.batch-select >>> .v-select__selection{font-weight:700;font-size:14px;color:#1976d2;}
.kanban-chip:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(25,118,210,0.4) !important;}
.kanban-chip-success{background:linear-gradient(135deg,#f41602,#e83e05) !important;}
.kanban-chip-success:hover{box-shadow:0 8px 24px rgba(76,175,80,0.4) !important;}
.pagination-pill{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:12px;background:linear-gradient(135deg,#ffffff,#f8fafc);border:1px solid rgba(25,118,210,0.2);box-shadow:0 6px 20px rgba(25,118,210,0.15);}
.pagination-btn{width:40px;height:40px;border-radius:50%;border:none;background:linear-gradient(135deg,#1976d2,#1565c0);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 12px rgba(25,118,210,0.3);}
.pagination-btn:disabled{opacity:0.4;cursor:not-allowed;box-shadow:none;}
.pagination-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(25,118,210,0.35);}
.pagination-page{min-width:92px;text-align:center;font-weight:700;color:#1f2937;}
.kanban-grid-body{animation:rise-in 520ms ease;}
.kanban-grid-header-row{animation:fade-slide 520ms ease;}
.scan-header-pro{border-bottom:2px solid var(--border-pro);padding-bottom:18px;}
.scan-label-pro{font-weight:800;font-size:22px;color:var(--header-pro);letter-spacing:1px;}
.scan-input-pro input{font-weight:700;letter-spacing:1px;}
.scan-count-pro{margin-left:8px;padding:7px 14px;border-radius:8px;background:var(--primary-pro);color:#5f5c5c;font-weight:700;box-shadow:0 2px 8px rgba(25,118,210,0.08);font-size:16px;}
.row-numbers-pro{margin-top:57px}
.row-number-pro{width:38px;height:160px;background:#f7fafc;border:2px solid var(--border-pro);display:flex;align-items:center;justify-content:center;font-weight:700;margin-bottom:12px;border-radius:10px;box-shadow:0 2px 8px rgba(44,62,80,0.04);}
.columns-pro{gap:16px;align-items:stretch}
.column-pro{display:flex;flex-direction:column}
.kanban-header-row-pro {
  .nav-controls{display:flex;flex-direction:row;gap:10px;justify-content:center;margin-top:24px;}
  .nav-btn{display:flex;align-items:center;gap:8px;padding:10px 14px;background:linear-gradient(135deg,#ffffff,#f8fafc);border:2px solid #1976d2;border-radius:8px;min-width:96px;box-shadow:0 4px 12px rgba(25,118,210,0.15);font-weight:800;color:#1976d2;transition:all 0.3s ease;cursor:pointer;}
  .nav-btn:hover:not([disabled]){background:linear-gradient(135deg,#1976d2,#1565c0);color:#fff;box-shadow:0 6px 20px rgba(25,118,210,0.3);transform:translateY(-2px);}
  .nav-btn[disabled]{opacity:0.4;pointer-events:none;}
  .nav-arrow{font-size:20px;line-height:1}
  .nav-label{font-size:14px}
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin-bottom: 8px;
  position: relative;
}
.col-header-pro {
  background: var(--primary-pro);
  color: #5f5c5c;
  padding: 12px;
  text-align: center;
  font-weight: 800;
  border-radius: 12px 12px 0 0;
  font-size: 18px;
  letter-spacing: 1px;
  box-shadow: 0 2px 8px rgba(25,118,210,0.10);
  flex: 1 1 0;
  z-index: 2;
}
.sticky-header-pro {
  position: sticky;
  top: 0;
}
 slot-list-pro{display:flex;flex-direction:column;gap:16px}
 slot-pro{height:105px;max-height:105px;background:var(--card-pro);border:2px solid var(--border-pro);box-sizing:border-box;padding:6px;display:block;border-radius:14px;transition:all 0.3s ease;box-shadow:0 2px 12px rgba(25,118,210,0.08);overflow:hidden;cursor:pointer;}
 slot-pro:hover{border-color:#1976d2;box-shadow:0 8px 24px rgba(25,118,210,0.15);transform:translateY(-2px);}
 slot-pro.highlight{border-color:var(--primary-pro);background:var(--highlight-pro);box-shadow:0 4px 16px rgba(25,118,210,0.2);}
 slot-pro.slot-hover{box-shadow:0 8px 28px rgba(25,118,210,0.25);border-color:#1565c0;z-index:2;transform:translateY(-2px);}
 slot-inner-pro{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0px}
 .qr-col-pro{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  overflow: hidden;
}
 .bar-col-pro{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  background: transparent;
  border-radius: 0;
  border: none;
  overflow: hidden;
}
 .qr-code-pro{
  width: 40px;
  height: 40px;
  max-width: 40px;
  max-height: 40px;
  object-fit: contain;
  border: none;
  border-radius: 2px;
  box-shadow: none;
  display: block;
}
 barcode-img-pro {
  width: 100%;
  height: 100%;
  max-width: 65px;
  max-height: 22px;
  object-fit: contain;
  display: block;
  background: transparent;
  border-radius: 0;
  border: none;
  box-shadow: none;
  margin-left: auto;
  margin-right: auto;
}
.mt-6{margin-top:10px;}
 .qr-barcode-elevated {
   background: #fff !important;
   height: 120px;
   min-width: 100%;
   border: none !important;
   border-radius: 22px;
   margin-bottom: 8px;
   margin-top: 4px;
   padding: 4px 3px 3px 3px;
   transition: background 0.18s;
   display: flex;
   align-items: center;
   justify-content: center;
   position: relative;
   overflow: hidden;
   box-shadow: none !important;
 }

.qr-barcode-elevated:hover {
  background: #fff !important;
  transform: translateY(-3px) scale(1.03);
}
/* Full-page Kanban adjustments */
.fullpage-container {
  min-height: 100vh !important;
  min-width: 90vw !important;
  padding: 0 !important;
  margin: 0 !important;
}
.fullpage-row {
  height: auto !important;
  min-height: 100vh !important;
}
.fullpage-col {
  height: auto !important;
  min-height: 100vh !important;
  padding: 0 !important;
}
.fullpage-card {
  height: auto !important;
  min-height: calc(100vh - 90px - 8vw) !important;
  width: 100vw !important;
  min-width: 100vw !important;
  border-radius: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
}
/* Kanban Excel-like grid */
.kanban-grid-wrapper {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}
.kanban-grid-numbers {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 54px;
  background: transparent;
  z-index: 2;
}
.kanban-grid-header-spacer {
  height: 36px;
  width: 100%;
}
.kanban-grid-row-number {
  width: 48px;
  height: 120px !important;
  min-height: 120px !important;
  background: linear-gradient(180deg, #1976d2 0%, #1565c0 100%);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.05rem;
  margin-bottom: 0;
  border-radius: 0;
  box-shadow: 0 4px 12px rgba(25,118,210,0.25);
  text-shadow: 0 2px 4px rgba(0,0,0,0.15);
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  padding: 0;
}
.kanban-grid-row-number:hover {
  background: linear-gradient(180deg, #1565c0 0%, #0d47a1 100%);
  box-shadow: 0 6px 20px rgba(25,118,210,0.35);
  transform: translateX(2px);
}
.kanban-grid-main {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  width: 100%;
}
.kanban-grid-header-row {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 36px;
}
.kanban-grid-header {
  flex: 1 1 0;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: #fff;
  padding: 14px;
  text-align: center;
  font-weight: 900;
  border-radius: 0;
  font-size: 1.05rem;
  letter-spacing: 1.5px;
  box-shadow: 0 4px 12px rgba(25,118,210,0.2);
  border: none;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  z-index: 2;
}
.kanban-grid-header:hover {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
  box-shadow: 0 6px 20px rgba(25,118,210,0.35);
}
.kanban-grid-row-number-first {
  height: 120px !important;
  min-height: 120px !important;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.kanban-grid-header:hover{background:#1565c0;}

.kanban-grid-row {
  display: flex;
  flex-direction: row;
  width: 100%;
}
.kanban-grid-cell {
  flex: 1 1 0;
  border-right: 1.5px solid #e2e8f0;
  border-bottom: 1.5px solid #e2e8f0;
  min-width: 0;
  height: 120px;
  min-height: 120px;
  max-height: 120px;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  padding: 0;
}
.kanban-grid-cell:last-child {
  border-right: none;
}
.kanban-grid-row:last-child .kanban-grid-cell {
  border-bottom: none;
}
.flat-card {
  box-shadow: none !important;
  border-radius: 0 !important;
  background: transparent !important;
}
.kanban-inner-padding {
  padding: 2.5vw !important;
}

@keyframes rise-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-slide {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 960px) {
  .kanban-hero{flex-direction:column;align-items:flex-start;}
  .kanban-hero-title{font-size:24px;}
}
</style>
