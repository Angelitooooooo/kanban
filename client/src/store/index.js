import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

Vue.use(Vuex)

// Helper function to generate QR code
async function generateQRCode(data) {
  try {
    return await QRCode.toDataURL(data, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'H'
    })
  } catch (err) {
    console.error('Error generating QR code:', err)
    return ''
  }
}

// Helper function to generate barcode
function generateBarcode(data) {
  try {
    const canvas = document.createElement('canvas')
    JsBarcode(canvas, data, {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true,
      fontSize: 18
    })
    return canvas.toDataURL('image/png')
  } catch (err) {
    console.error('Error generating barcode:', err)
    return ''
  }
}

export default new Vuex.Store({
  state: {
    user: null,
    currentBatchKey: 'KBN1',
    batchCounter: 1,
    scanRecords: [
      // KBN1 Records
      {
        batchKey: 'KBN1',
        row: 1,
        column: 'FSC LH',
        qrData: 'FSC LH ABC123 KBA1',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T08:30:15.000Z'
      },
      {
        batchKey: 'KBN1',
        row: 1,
        column: 'FSC RH',
        qrData: 'FSC RH DEF456 KBA1',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T08:31:22.000Z'
      },
      {
        batchKey: 'KBN1',
        row: 1,
        column: 'FSB LH',
        qrData: 'FSB LH GHI789 KBA1',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T08:32:45.000Z'
      },
      {
        batchKey: 'KBN1',
        row: 1,
        column: 'FSB RH',
        qrData: 'FSB RH JKL012 KBA1',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T08:33:12.000Z'
      },
      // KBN2 Records
      {
        batchKey: 'KBN2',
        row: 2,
        column: 'FSC LH',
        qrData: 'FSC LH MNO345 KBA2',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T09:15:30.000Z'
      },
      {
        batchKey: 'KBN2',
        row: 2,
        column: 'FSC RH',
        qrData: 'FSC RH PQR678 KBA2',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T09:16:45.000Z'
      },
      {
        batchKey: 'KBN2',
        row: 3,
        column: 'FSB LH',
        qrData: 'FSB LH STU901 KBA3',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T10:05:20.000Z'
      },
      {
        batchKey: 'KBN2',
        row: 4,
        column: 'FSC LH',
        qrData: 'FSC LH VWX234 KBA4',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T10:30:55.000Z'
      },
      {
        batchKey: 'KBN2',
        row: 4,
        column: 'FSB RH',
        qrData: 'FSB RH YZA567 KBA4',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T10:32:10.000Z'
      },
      // KBN3 Records
      {
        batchKey: 'KBN3',
        row: 5,
        column: 'FSC RH',
        qrData: 'FSC RH BCD890 KBA5',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T11:00:00.000Z'
      },
      {
        batchKey: 'KBN3',
        row: 6,
        column: 'FSB LH',
        qrData: 'FSB LH EFG123 KBA6',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T11:45:30.000Z'
      },
      {
        batchKey: 'KBN3',
        row: 7,
        column: 'FSC LH',
        qrData: 'FSC LH HIJ456 KBA7',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T13:20:15.000Z'
      },
      // KBN4 Records
      {
        batchKey: 'KBN4',
        row: 1,
        column: 'FSC LH',
        qrData: 'FSC LH JKL789 KBA8',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T14:00:00.000Z'
      },
      {
        batchKey: 'KBN4',
        row: 2,
        column: 'FSC RH',
        qrData: 'FSC RH MNO012 KBA9',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T14:15:30.000Z'
      },
      {
        batchKey: 'KBN4',
        row: 2,
        column: 'FSB LH',
        qrData: 'FSB LH PQR345 KBA10',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T14:30:45.000Z'
      },
      {
        batchKey: 'KBN4',
        row: 3,
        column: 'FSB RH',
        qrData: 'FSB RH STU678 KBA11',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T14:45:00.000Z'
      },
      {
        batchKey: 'KBN4',
        row: 4,
        column: 'FSC LH',
        qrData: 'FSC LH VWX901 KBA12',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T15:00:15.000Z'
      },
      // KBN5 Records
      {
        batchKey: 'KBN5',
        row: 1,
        column: 'FSB LH',
        qrData: 'FSB LH YZA234 KBA13',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T15:30:00.000Z'
      },
      {
        batchKey: 'KBN5',
        row: 2,
        column: 'FSC LH',
        qrData: 'FSC LH BCD567 KBA14',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T15:45:30.000Z'
      },
      {
        batchKey: 'KBN5',
        row: 3,
        column: 'FSC RH',
        qrData: 'FSC RH EFG890 KBA15',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T16:00:00.000Z'
      },
      {
        batchKey: 'KBN5',
        row: 4,
        column: 'FSB RH',
        qrData: 'FSB RH HIJ123 KBA16',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T16:15:45.000Z'
      },
      {
        batchKey: 'KBN5',
        row: 5,
        column: 'FSC LH',
        qrData: 'FSC LH KLM456 KBA17',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-12T16:30:00.000Z'
      },
      // KBN6 Records
      {
        batchKey: 'KBN6',
        row: 1,
        column: 'FSB LH',
        qrData: 'FSB LH NOP789 KBA18',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-13T08:00:00.000Z'
      },
      {
        batchKey: 'KBN6',
        row: 2,
        column: 'FSC RH',
        qrData: 'FSC RH QRS012 KBA19',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-13T08:30:00.000Z'
      },
      {
        batchKey: 'KBN6',
        row: 3,
        column: 'FSB RH',
        qrData: 'FSB RH TUV345 KBA20',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        barcodeImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        timestamp: '2026-02-13T09:00:00.000Z'
      }
    ]
  },
  getters: {
    isAuthenticated: state => !!(state.user && state.user.username),
    isAdmin: state => !!(state.user && state.user.isAdmin),
    getUser: state => state.user,
    getScanRecords: state => state.scanRecords,
    getCurrentBatchKey: state => state.currentBatchKey,
    getBatchCount: state => state.batchCounter,
    getRecordsByBatch: state => (batchKey) => {
      return state.scanRecords.filter(record => record.batchKey === batchKey)
    },
    getAllBatches: state => {
      const batches = new Set()
      state.scanRecords.forEach(record => {
        const batchKey = record.batchKey || 'KBN1' // Default to KBN1 if missing
        batches.add(batchKey)
      })
      return Array.from(batches).sort()
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    logout(state) {
      state.user = null
    },
    addScanRecord(state, record) {
      state.scanRecords.push({
        ...record,
        batchKey: state.currentBatchKey,
        timestamp: new Date().toISOString()
      })
    },
    deleteScanRecord(state, recordId) {
      state.scanRecords.splice(recordId, 1)
    },
    clearAllScanRecords(state) {
      state.scanRecords = []
    },
    updateRecordImages(state, { index, qrCode, barcodeImg }) {
      if (state.scanRecords[index]) {
        state.scanRecords[index].qrCode = qrCode
        state.scanRecords[index].barcodeImg = barcodeImg
      }
    },
    createNewBatch(state) {
      state.batchCounter++
      state.currentBatchKey = `KBN${state.batchCounter}`
    },
    setCurrentBatch(state, batchKey) {
      state.currentBatchKey = batchKey
    }
  },
  actions: {
    login({ commit }, user) {
      commit('setUser', user)
    },
    logout({ commit }) {
      commit('logout')
    },
    addScanRecord({ commit }, record) {
      commit('addScanRecord', record)
    },
    deleteScanRecord({ commit }, recordId) {
      commit('deleteScanRecord', recordId)
    },
    clearAllScanRecords({ commit }) {
      commit('clearAllScanRecords')
    },
    async regenerateAllImages({ state, commit }) {
      for (let i = 0; i < state.scanRecords.length; i++) {
        const record = state.scanRecords[i]
        const qrCode = await generateQRCode(record.qrData)
        const barcodeImg = generateBarcode(record.qrData)
        commit('updateRecordImages', { index: i, qrCode, barcodeImg })
      }
    },
    createNewBatch({ commit }) {
      commit('createNewBatch')
    },
    setCurrentBatch({ commit }, batchKey) {
      commit('setCurrentBatch', batchKey)
    },
    async loadSampleData({ dispatch }) {
      // Regenerate QR codes and barcodes for all existing records
      await dispatch('regenerateAllImages')
    }
  },
  plugins: [createPersistedState({
    key: 'kanban-user',
    paths: ['user', 'scanRecords']
  })]
})
