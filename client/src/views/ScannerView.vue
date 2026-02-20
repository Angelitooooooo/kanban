<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <v-card class="pa-6" max-width="420" elevation="10">
      <v-row align="center" justify="center">
        <v-icon color="primary" size="40">mdi-qrcode-scan</v-icon>
        <span class="ml-3 font-weight-bold text-h6">QR Code Scanner</span>
      </v-row>
      <v-divider class="my-4" />
      <div class="d-flex flex-column align-center">
        <!-- Video element removed, scanning still works in background -->
        <!-- Start Scan button removed for auto scan -->
        <!-- Stop Scan button removed -->
        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
        <v-card v-if="scannedList.length" class="mt-4 pa-4 text-center" color="#e3f2fd" outlined>
          <div class="font-weight-bold mb-2" style="font-size: 18px; color: #1976d2;">Scanned QR Codes</div>
          <v-list dense>
            <v-list-item v-for="(item, idx) in scannedList" :key="idx">
              <v-list-item-content>
                <v-list-item-title style="font-size: 20px; word-break: break-all; color: #333;">{{ item }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
        <v-btn v-if="scannedList.length" color="primary" class="mt-4" @click="resetScan">Clear All</v-btn>
        <v-dialog v-model="duplicateDialog" max-width="350">
          <v-card>
            <v-card-title class="headline">Duplicate QR Code</v-card-title>
            <v-card-text>This QR code has already been scanned.</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="duplicateDialog = false">OK</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

export default {
  name: 'ScannerView',
  data() {
    return {
      scannedList: [],
      error: '',
      codeReader: null,
      scanning: false,
      duplicateDialog: false
    }
  },
  mounted() {
    this.codeReader = new BrowserMultiFormatReader();
    this.startScan();
  },
  beforeDestroy() {
    this.stopScan();
  },
  methods: {
    startScan() {
      this.error = '';
      this.scanning = true;
      const video = this.$refs.video;
      this.codeReader.decodeFromVideoDevice(null, video, (result, err) => {
        if (result) {
          const value = result.getText();
          if (!this.scannedList.includes(value)) {
            this.scannedList.push(value);
          } else {
            this.duplicateDialog = true;
            this.stopScan();
            setTimeout(() => {
              this.duplicateDialog = false;
              this.startScan();
            }, 1000);
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          this.error = err.message || String(err);
        }
      });
    },
    stopScan() {
      if (this.codeReader) {
        this.codeReader.reset();
      }
      this.scanning = false;
    },
    resetScan() {
      this.scannedList = [];
      this.error = '';
      this.startScan();
    }
  }
}
</script>

<style scoped>
.qrcode-stream {
  width: 320px;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(44,62,80,0.10);
  margin-bottom: 16px;
}
</style>
