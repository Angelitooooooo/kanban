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
                  style="max-width: 250px; background: white; border-radius: 8px;"
                  @change="loadBatchData"
                ></v-autocomplete>
              </div>
              <div class="kanban-hero-title">Station: {{ station }}</div>
              <div class="kanban-hero-meta">
                <v-chip class="kanban-chip" label>Rows {{ rowRangeLabel }}</v-chip>
                <!-- <v-btn
                  color="success"
                  class="kanban-chip kanban-chip-success"
                  small
                  @click="createNewBatch"
                >
                  <v-icon left size="18">mdi-plus</v-icon>
                  New Batch
                </v-btn> -->
                <!-- <v-btn
                  color="primary"
                  class="kanban-chip"
                  :disabled="isGenerating"
                  :loading="isGenerating"
                  @click="printPage"
                >
                  <v-icon left size="18">mdi-print</v-icon>
                  Print
                </v-btn> -->
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

          <!-- QR Scanner Video and Output UI -->
          <div class="d-flex flex-column align-center mt-8">
            <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import api from '../services/api'
import Swal from 'sweetalert2'

export default {
  name: 'KanbanVuetifyView',
  data() {
    return {
      currentSet: 0,
      rowPage: 0,
      rowsPerPage: 5,
      dataSet : 42,
      isGenerating: false,
      delayedLoading: false,
      scanInput: '',
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
      kanbanColumns: ['FSC LH', 'FSC RH', 'FSB LH', 'FSB RH', 'RSB RH', 'RSB LH', 'RR Cushion'],
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
              header: "RR Cushion",
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
  computed: {
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
  mounted() {
    this.normalizeDataSet();
    this.fetchBatches();
    window.addEventListener('keydown', this.onGlobalScannerKeydown);
    this.generateAllQRCodes().then(() => {
      this.$nextTick(() => this.generateBarcodesForCurrentSet());
    });
    
    // Listen for socket events to refresh data
    this.$socket.on('refresh-kanban-prints', (data) => {
      console.log('Received refresh-kanban-prints event:', data);
      console.log('Refreshing kanban data for all users');
      this.fetchBatches();
    });
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onGlobalScannerKeydown);
    this.clearScannerBufferTimer();
    
    // Remove socket listener
    this.$socket.off('refresh-kanban-prints');
  },
  methods: {
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
            console.log('Batches fetched:', this.batchList);
            // Set the first batch as default if available (data loads on selection)
            if (this.batchList.length > 0 && !this.selectedBatchId) {
              this.selectedBatchId = this.batchList[0].id;
              await this.loadBatchData();
            }
          } catch (error) {
            console.error('Failed to fetch batches:', error);
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
            
            const station = this.$store.state.user?.station;
            const response = await api.get(`/kanbans/${this.selectedBatchId}/data`, {
              params: { station }
            });
            const kanbanSetData = response.data;
            
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
                  scannedBarcodeImg: scannedBarcodeImg
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
            console.log('Batch data loaded successfully');
          } catch (error) {
            console.error('Failed to load batch data:', error);
            this.error = 'Failed to load batch data';
            setTimeout(() => {
              this.error = '';
            }, 3000);
          } finally {
            this.isGenerating = false;
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
            console.log('New batch created:', response.data);
          } catch (error) {
            console.error('Failed to create new batch:', error);
            alert('Failed to create new batch');
          }
        },
        playBeep() {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 1000; // Hz (higher pitch, more like barcode scanner)
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.15);
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
          console.log('Data normalized to target:', this.kanbanData);
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
          this.submitScannedValue(this.scannerBuffer);
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
    async submitScannedValue(rawValue) {
      const now = Date.now();
      if (now - this.lastScanTime < this.scanCooldownMs) {
        return;
      }
      this.lastScanTime = now;

      const value = String(rawValue).trim();
      if (!value) {
        return;
      }
      const scanType = this.detectScanType(value);
     

      // If it's a Barcode, trim to 5 characters and log
      if (scanType === 'Barcode') {
        // Check for duplicate barcode scan
        if (this.scannedList.includes(value)) {
          console.log('DUPLICATE BARCODE: Value already scanned');
          Swal.fire({
            icon: 'warning',
            title: 'Duplicate Barcode',
            text: 'This barcode has already been scanned.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          return;
        }
        
        const trimmedBarcode = value.substring(1, 5);
        const Position = value.charAt(value.length - 1);
        if(Position == "R"){
          console.log('Detected Barcode Scan (Right):', value);
          const fsbRhColumn = this.currentData.columns.find(col => col.header === 'FSB RH');
          if (fsbRhColumn) {
            const matchedIndex = fsbRhColumn.items.findIndex(
              item => item && item.qrData && item.qrData.slice(-4) === trimmedBarcode
            );
            console.log('Trimmed Barcode:', trimmedBarcode);
            console.log('Match Found at Index:', matchedIndex);
            
            if (matchedIndex !== -1) {
              // Generate barcode image for the scanned value
              const canvas = document.createElement('canvas');
              canvas.width = 160;
              canvas.height = 60;
              try {
                JsBarcode(canvas, String(value), {
                  format: 'CODE128',
                  displayValue: true,
                  fontSize: 18,
                  height: 48,
                  width: 2,
                  margin: 0,
                  background: '#fff',
                  lineColor: '#222',
                });
                const scannedBarcodeImg = canvas.toDataURL('image/png');
                
                // Update the matched position with the scanned value and barcode image
                this.$set(fsbRhColumn.items, matchedIndex, {
                  ...fsbRhColumn.items[matchedIndex],
                  scannedBarcode: value,
                  scannedBarcodeImg: scannedBarcodeImg
                });
                console.log('Updated FSB RH at index', matchedIndex, 'with value:', value);
                
                // Save to database
                this.sendBarcodeScan({
                  barcodeValue: value,
                  batchKey: this.selectedBatchId,
                  station: this.$store.state.user?.station,
                  trimmedBarcode: trimmedBarcode,
                  position: Position
                });
                
                // Add to scanned list to prevent duplicates
                if (!this.scannedList.includes(value)) {
                  this.scannedList.push(value);
                }
                
                this.playBeep();
              } catch (err) {
                console.error('Failed to generate barcode:', err);
              }
            } else {
              // No matching QR code found, place barcode at row based on last 4 characters
              console.log('No matching QR code found for barcode:', trimmedBarcode);
              
              // Extract numeric value from trimmedBarcode to determine row index
              const numericValue = parseInt(trimmedBarcode, 10);
              const calculatedIndex = isNaN(numericValue) ? 0 : Math.min(numericValue - 1, this.totalRows - 1);
              
              console.log('Placing at calculated index:', calculatedIndex, '(Row', calculatedIndex + 1, ')');
              
              // Generate barcode image
              const canvas = document.createElement('canvas');
              canvas.width = 160;
              canvas.height = 60;
              try {
                JsBarcode(canvas, String(value), {
                  format: 'CODE128',
                  displayValue: true,
                  fontSize: 18,
                  height: 48,
                  width: 2,
                  margin: 0,
                  background: '#fff',
                  lineColor: '#222',
                });
                const scannedBarcodeImg = canvas.toDataURL('image/png');
                
                // Update the position with barcode only (no QR data)
                this.$set(fsbRhColumn.items, calculatedIndex, {
                  ...fsbRhColumn.items[calculatedIndex],
                  scannedBarcode: value,
                  scannedBarcodeImg: scannedBarcodeImg
                });
                console.log('Placed barcode at FSB RH index', calculatedIndex, 'without QR match');
                
                // Save QR scan payload with null value to mark the row position
                const qrPayload = {
                  value: null,
                  row: calculatedIndex + 1,
                  column: 'FSB RH',
                  batchKey: this.selectedBatchId,
                  setIndex: this.currentSet,
                  rowPage: Math.floor(calculatedIndex / this.rowsPerPage),
                  station: this.$store.state.user?.station
                };
                this.sendQrScan(qrPayload);
                
                // Save to database
                this.sendBarcodeScan({
                  barcodeValue: value,
                  batchKey: this.selectedBatchId,
                  station: this.$store.state.user?.station,
                  trimmedBarcode: trimmedBarcode,
                  position: Position,
                  row: calculatedIndex + 1,
                  rowPage: Math.floor(calculatedIndex / this.rowsPerPage)
                });
                
                // Add to scanned list to prevent duplicates
                if (!this.scannedList.includes(value)) {
                  this.scannedList.push(value);
                }
                
                this.playBeep();
              } catch (err) {
                console.error('Failed to generate barcode:', err);
              }
            }
          }
        } else if(Position == "L"){
          console.log('Detected Barcode Scan (Left):', value);
          const fsbLhColumn = this.currentData.columns.find(col => col.header === 'FSB LH');
          if (fsbLhColumn) {
            const matchedIndex = fsbLhColumn.items.findIndex(
              item => item && item.qrData && item.qrData.slice(-4) === trimmedBarcode
            );
            console.log('Trimmed Barcode:', trimmedBarcode);
            console.log('Match Found at Index:', matchedIndex);
            
            if (matchedIndex !== -1) {
              // Generate barcode image for the scanned value
              const canvas = document.createElement('canvas');
              canvas.width = 160;
              canvas.height = 60;
              try {
                JsBarcode(canvas, String(value), {
                  format: 'CODE128',
                  displayValue: true,
                  fontSize: 18,
                  height: 48,
                  width: 2,
                  margin: 0,
                  background: '#fff',
                  lineColor: '#222',
                });
                const scannedBarcodeImg = canvas.toDataURL('image/png');
                
                // Update the matched position with the scanned value and barcode image
                this.$set(fsbLhColumn.items, matchedIndex, {
                  ...fsbLhColumn.items[matchedIndex],
                  scannedBarcode: value,
                  scannedBarcodeImg: scannedBarcodeImg
                });
                console.log('Updated FSB LH at index', matchedIndex, 'with value:', value);
                
                // Save to database
                this.sendBarcodeScan({
                  barcodeValue: value,
                  batchKey: this.selectedBatchId,
                  station: this.$store.state.user?.station,
                  trimmedBarcode: trimmedBarcode,
                  position: Position
                });
                
                // Add to scanned list to prevent duplicates
                if (!this.scannedList.includes(value)) {
                  this.scannedList.push(value);
                }
                
                this.playBeep();
              } catch (err) {
                console.error('Failed to generate barcode:', err);
              }
            } else {
              // No matching QR code found, place barcode at row based on last 4 characters
              console.log('No matching QR code found for barcode:', trimmedBarcode);
              
              // Extract numeric value from trimmedBarcode to determine row index
              const numericValue = parseInt(trimmedBarcode, 10);
              const calculatedIndex = isNaN(numericValue) ? 0 : Math.min(numericValue - 1, this.totalRows - 1);
              
              console.log('Placing at calculated index:', calculatedIndex, '(Row', calculatedIndex + 1, ')');
              
              // Generate barcode image
              const canvas = document.createElement('canvas');
              canvas.width = 160;
              canvas.height = 60;
              try {
                JsBarcode(canvas, String(value), {
                  format: 'CODE128',
                  displayValue: true,
                  fontSize: 18,
                  height: 48,
                  width: 2,
                  margin: 0,
                  background: '#fff',
                  lineColor: '#222',
                });
                const scannedBarcodeImg = canvas.toDataURL('image/png');
                
                // Update the position with barcode only (no QR data)
                this.$set(fsbLhColumn.items, calculatedIndex, {
                  ...fsbLhColumn.items[calculatedIndex],
                  scannedBarcode: value,
                  scannedBarcodeImg: scannedBarcodeImg
                });
                console.log('Placed barcode at FSB LH index', calculatedIndex, 'without QR match');
                
                // Save QR scan payload with null value to mark the row position
                const qrPayload = {
                  value: null,
                  row: calculatedIndex + 1,
                  column: 'FSB LH',
                  batchKey: this.selectedBatchId,
                  setIndex: this.currentSet,
                  rowPage: Math.floor(calculatedIndex / this.rowsPerPage),
                  station: this.$store.state.user?.station
                };
                this.sendQrScan(qrPayload);
                
                // Save to database
                this.sendBarcodeScan({
                  barcodeValue: value,
                  batchKey: this.selectedBatchId,
                  station: this.$store.state.user?.station,
                  trimmedBarcode: trimmedBarcode,
                  position: Position,
                  row: calculatedIndex + 1,
                  rowPage: Math.floor(calculatedIndex / this.rowsPerPage)
                });
                
                // Add to scanned list to prevent duplicates
                if (!this.scannedList.includes(value)) {
                  this.scannedList.push(value);
                }
                
                this.playBeep();
              } catch (err) {
                console.error('Failed to generate barcode:', err);
              }
            }
          }
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Barcode Position Unknown',
            text: 'The scanned barcode does not indicate Left or Right position. Please check the barcode format.',
            timer: 2500,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }
        console.log('Original Barcode:', value);
        console.log('Trimmed Barcode (chars 1-4):', trimmedBarcode);
        console.log('Last Character:', Position);
        return;
      }

      // If it's Unknown, show error and return
      if (scanType === 'Unknown') {
        console.log('ERROR: Unknown scan type');
        Swal.fire({
          icon: 'error',
          title: 'Invalid Scan',
          text: 'Unable to identify the scanned code. Please scan a valid QR/Barcode.',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        console.log('=== END SCAN DATA ===');
        return;
      }

      console.log('=== SCAN DATA ===');
      console.log('Raw Scanned Value:', rawValue);
      console.log('Trimmed Value:', value);
      


      // Check if scanned value matches selected batch name
      if (this.selectedBatchId) {
        const selectedBatch = this.batchList.find(b => b.id === this.selectedBatchId);
        if (selectedBatch) {
          const trimmedValue = value.startsWith('RR Cushion')
            ? value.slice(11)
            : value.slice(7);
          
          console.log('Trimmed for Batch Check:', trimmedValue);
          console.log('Selected Batch Name:', selectedBatch.name);
          
          if (!trimmedValue.startsWith(selectedBatch.name)) {
            console.log('ERROR: Scanned value does not match batch name');
            Swal.fire({
              icon: 'error',
              title: 'Model Mismatch',
              html: `QR code does not match selected Model "<strong>${selectedBatch.name}</strong>".<br><br>Scanned: "<strong>${trimmedValue}</strong>"`,
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false
            });
            return;
          }
        }
      }

      const getMatchKey = (text) => {
        const parts = String(text || '').trim().split(/\s+/);
        return parts.length ? parts[parts.length - 1] : '';
      };

      // Try to match with column headers - check if scanned value starts with column header
      let column = null;
      for (const col of this.currentData.columns) {
        const normalizedHeader = col.header.replace(/\s+/g, '').toUpperCase();
        const normalizedValue = value.replace(/\s+/g, '').toUpperCase();
        
        // Check if the scanned value starts with the column header
        if (normalizedValue.startsWith(normalizedHeader) || normalizedHeader.startsWith(normalizedValue.substring(0, normalizedHeader.length))) {
          column = col;
          console.log('Matched Column:', col.header);
          break;
        }
      }

      if (!column) {
        console.log('ERROR: No column matched');
        this.error = `QR code '${value}' does not match any column header.`;
        setTimeout(() => {
          this.error = '';
        }, 1500);
        return;
      }

      const matchKey = getMatchKey(value);
      console.log('Match Key:', matchKey);
      if (!matchKey) {
        console.log('ERROR: No valid match key');
        this.error = `QR code '${value}' does not have a valid match key.`;
        setTimeout(() => {
          this.error = '';
        }, 1500);
        return;
      }

      let rowIndex = -1;
      this.currentData.columns.forEach(col => {
        col.items.forEach((item, idx) => {
          if (item.qrData && getMatchKey(item.qrData) === matchKey) {
            if (rowIndex === -1 || idx < rowIndex) rowIndex = idx;
          }
        });
      });

      if (rowIndex === -1) {
        const maxLen = Math.max(...this.currentData.columns.map(col => col.items.length));
        const pageStart = this.rowPage * this.rowsPerPage;
        const pageEnd = Math.min(pageStart + this.rowsPerPage, maxLen);
        let emptyRowIndex = -1;

        for (let i = pageStart; i < pageEnd; i++) {
          const isRowEmpty = this.currentData.columns.every(col => !col.items[i] || !col.items[i].qrData);
          if (isRowEmpty) {
            emptyRowIndex = i;
            break;
          }
        }

        if (emptyRowIndex === -1) {
          for (let i = 0; i < maxLen; i++) {
            const isRowEmpty = this.currentData.columns.every(col => !col.items[i] || !col.items[i].qrData);
            if (isRowEmpty) {
              emptyRowIndex = i;
              break;
            }
          }
        }

        if (emptyRowIndex === -1) {
          const allRowsFilled = this.currentData.columns.every(col => {
            return col.items.length >= this.totalRows && 
                   col.items.slice(0, this.totalRows).every(item => item && item.qrData);
          });
          
          if (allRowsFilled) {
            Swal.fire({
              icon: 'warning',
              title: 'Batch Full',
              text: `This batch is full (${this.totalRows}/${this.totalRows}). Cannot add more QR codes.`,
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'No Empty Slots',
              text: 'No empty slots available.',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            });
          }
          return;
        }
        rowIndex = emptyRowIndex;
      }

      this.rowPage = Math.floor(rowIndex / this.rowsPerPage);
      console.log('Placing at Row Index:', rowIndex, '(Row', rowIndex + 1, ')');
      console.log('Row Page:', this.rowPage);

      if (!this.scannedList.includes(value)) {
        this.scannedList.push(value);
      } else {
        console.log('DUPLICATE: Value already scanned');
        Swal.fire({
          icon: 'warning',
          title: 'Duplicate QR Code',
          text: 'This QR code has already been scanned.',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        return;
      }

      if (!column.items[rowIndex] || !column.items[rowIndex].qrData) {
        Promise.all([
          QRCode.toDataURL(String(value), {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            width: 110
          }),
          new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 60;
            try {
              JsBarcode(canvas, String(value), {
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
        ]).then(([qrCode, barcodeImg]) => {
          const existingItem = column.items[rowIndex] || {};
          this.$set(column.items, rowIndex, {
            ...existingItem,
            qrData: value,
            qrCode,
            barcodeImg
          });

          const payload = {
            value,
            row: rowIndex + 1,
            column: column.header,
            batchKey: this.selectedBatchId,
            setIndex: this.currentSet,
            rowPage: this.rowPage,
            station: this.$store.state.user?.station
          };
          
          this.sendQrScan(payload);
          
          console.log('Scan Payload Sent to Database:', payload);
          console.log('=== END SCAN DATA ===');
          this.playBeep();
        });
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
        console.error('QR scan upload failed:', err);
      }
    },
    async sendBarcodeScan(payload) {
      try {
        const response = await api.post('/barcode-scan', payload);
        console.log('Barcode scan saved:', response.data);
      } catch (err) {
        console.error('Barcode scan upload failed:', err);
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
      const upperValue = value.toUpperCase();
      const isKanbanMatch = this.kanbanColumns.some((item) => {
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
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Space+Grotesk:wght@600;700&display=swap');

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
.kanban-chip-success{background:linear-gradient(135deg,#4caf50,#388e3c) !important;}
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
