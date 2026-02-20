<template>
  <div class="kanban-root">
    <header class="scan-header">
      <div class="scan-label">Scan</div>
      <input class="scan-input" value="KBA1" />
      <div class="scan-count">{{ scanCount }} / 40</div>
    </header>

    <main class="board">
      <aside class="row-numbers">
        <div v-for="n in 5" :key="n" class="row-number">{{ n }}</div>
      </aside>

      <section class="columns">
        <div v-for="(column, colIdx) in currentData.columns" :key="column.header" class="column">
          <div class="col-header">{{ column.header }}</div>
          <div class="slot-list">
            <div v-for="(item, idx) in column.items" :key="idx" :class="['slot', { highlight: column.type === 'highlight' }]">
              <div class="slot-inner">
                <div class="qr-col">
                  <div v-if="item.qrCode" class="qr-code-container">
                    <img :src="item.qrCode" alt="QR Code" class="qr-code" />
                  </div>
                </div>
                <div class="bar-col">
                  <svg :ref="`barcode-${currentSet}-${colIdx}-${idx}`" class="barcode-svg"></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <div v-if="isGenerating" class="loader-overlay">
      <div class="loader">Generating QR codes...</div>
    </div>

    <div class="nav-controls">
      <v-btn class="nav-btn" @click="incrementScanCount" :disabled="isGenerating" aria-label="Next">
        <span class="nav-label">Next</span>
        <span class="nav-arrow">›</span>
      </v-btn>
      <v-btn class="nav-btn" @click="decrementScanCount" :disabled="isGenerating" aria-label="Back">
        <span class="nav-arrow">‹</span>
        <span class="nav-label">Back</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'

export default {
  name: 'KanbanView',
  data() {
    return {
      currentSet: 0,
      isGenerating: false,
      kanbanData: [
        {
          scanCount: 1,
          columns: [
            {
              header: "FSC LH",
              type: "highlight",
              items: [
                { qrData: "FSC-LH-001" },
                { qrData: "FSC-LH-002" },
                { qrData: "FSC-LH-003" },
                { qrData: "FSC-LH-004" },
                { qrData: "FSC-LH-005" }
              ]
            },
            {
              header: "FSC RH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSB LH",
              type: "highlight",
                           items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSB RH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            }
          ]
        },
        {
          scanCount: 6,
          columns: [
            {
              header: "FSC LH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSC RH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSB LH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            },
            {
              header: "FSB RH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            }
          ]
        },
        {
          scanCount: 11,
          columns: [
            {
              header: "FSC LH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSC RH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSB LH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            },
            {
              header: "FSB RH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            }
          ]
        },
        {
          scanCount: 16,
          columns: [
            {
              header: "FSC LH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSC RH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSB LH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            },
            {
              header: "FSB RH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            }
          ]
        },
        {
          scanCount: 21,
          columns: [
            {
              header: "FSC LH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSC RH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSB LH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            },
            {
              header: "FSB RH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            }
          ]
        },
        {
          scanCount: 26,
          columns: [
            {
              header: "FSC LH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSC RH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSB LH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            },
            {
              header: "FSB RH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            }
          ]
        },
        {
          scanCount: 31,
          columns: [
            {
              header: "FSC LH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSC RH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSB LH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            },
            {
              header: "FSB RH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            }
          ]
        },
        {
          scanCount: 36,
          columns: [
            {
              header: "FSC LH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSC RH",
              type: "highlight",
              items: [
                {},
                {},
                {},
                {},
                {}
              ]
            },
            {
              header: "FSB LH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            },
            {
              header: "FSB RH",
              type: "empty",
              items: [{}, {}, {}, {}, {}]
            }
          ]
        }
      ]
    }
  },
  computed: {
    currentData() {
      return this.kanbanData[this.currentSet]
    },
    scanCount() {
      return this.currentData.scanCount
  
    }
  },
    mounted() {
      // generate all QR codes first, then generate barcodes for the active set
      this.generateAllQRCodes().then(() => {
        this.$nextTick(() => this.generateBarcodesForCurrentSet())
      })
    },
  methods: {
    incrementScanCount() {
      if (this.currentSet < this.kanbanData.length - 1) {
        this.currentSet++
        this.$nextTick(() => this.generateBarcodesForCurrentSet())
      }
    },
    decrementScanCount() {
      if (this.currentSet > 0) {
        this.currentSet--
        this.$nextTick(() => this.generateBarcodesForCurrentSet())
      }
    },
    generateAllQRCodes() {
      this.isGenerating = true
      const promises = []
      this.kanbanData.forEach(set => {
        set.columns.forEach(column => {
          column.items.forEach(item => {
            // Prefer explicit `qrData`; fall back to `subtitle` or `title` when absent
            const payload = item.qrData || item.subtitle || item.title
            if (payload && !item.qrCode) {
              const p = QRCode.toDataURL(String(payload), {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.92,
                margin: 1,
                width: 150
              }).then(url => {
                this.$set(item, 'qrCode', url)
              })
              promises.push(p)
            }
          })
        })
      })
      return Promise.all(promises).finally(() => {
        this.isGenerating = false
      })
    },

    generateBarcodesForCurrentSet() {
      // Render barcodes only for the currently displayed set to avoid manipulating DOM for hidden sets
      this.currentData.columns.forEach((column, colIdx) => {
        column.items.forEach((item, idx) => {
          const refName = `barcode-${this.currentSet}-${colIdx}-${idx}`
          const el = this.$refs[refName]
          // refs created in v-for may be arrays; handle both
          const svgEl = Array.isArray(el) ? el[0] : el
          if (svgEl) {
            const code = item.barcodeData || item.qrData || item.subtitle
            if (code) {
              try {
                JsBarcode(svgEl, String(code), {format: 'CODE128', displayValue: false, width:2, height:60, margin:0})
              } catch (e) {
                console.error(`JsBarcode render error for ${refName} (code=${code}):`, e)
              }
            } else {
              // clear any previously rendered barcode
              try {
                svgEl.innerHTML = ''
              } catch (e) {
                console.error(`Failed to clear barcode SVG for ${refName}:`, e)
              }
            }
          }
        })
      })
    }
  }
}
</script>

<style scoped>
:root{--bg:#c84b2f;--card:#fff;--highlight:#ffe86b}
.kanban-root{position:relative;min-height:100vh;background:var(--bg);padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111}
.scan-header{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.scan-label{font-weight:700;font-size:20px;color:#000}
.scan-input{width:120px;padding:6px 10px;border:3px solid #fff;background:#fff;text-align:center;font-weight:700}
.scan-count{margin-left:8px;padding:6px 10px;border:3px solid #fff;background:#fff}

.board{display:flex;gap:12px;align-items:stretch}
.row-numbers{display:flex;flex-direction:column;gap:12px;margin-top:57px}
.row-number{width:36px;height:160px;background:#fff;border:3px solid #000;display:flex;align-items:center;justify-content:center;font-weight:700}

.columns{display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;flex:1}
.column{display:flex;flex-direction:column}
.col-header{background:#e6e6e6;padding:10px;text-align:center;font-weight:700;border:3px solid #000;margin-bottom:8px}
.slot-list{display:flex;flex-direction:column;gap:12px}
.slot{height:160px;background:var(--card);border:3px solid #000;box-sizing:border-box;padding:10px;display:block}
.slot.highlight{border-color:#000}
.slot-sub{padding:6px 12px;color:#333;text-align:center}
.slot-inner{height:100%;display:flex;flex-direction:row}
.qr-col{flex:1;display:flex;align-items:center;justify-content:center;padding:8px}
.bar-col{flex:1;display:flex;align-items:center;justify-content:center;padding:8px;border-left:2px solid rgba(0,0,0,0.08)}
.qr-code-container{display:flex;justify-content:center;align-items:center}
.qr-code{width:110px;height:110px;border:2px solid #ddd}
.barcode-placeholder{font-family:monospace;font-size:18px;letter-spacing:2px;color:#333}

/* Make layout visually closer to the mock */
.column:nth-child(1) .slot.highlight, .column:nth-child(2) .slot.highlight{border-radius:2px}

@media (max-width:900px){
  .columns{grid-template-columns:repeat(2,1fr)}
}

.loader-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.85);z-index:60}
.loader{padding:12px 16px;background:#fff;border:2px solid #000;border-radius:6px;font-weight:700}

.nav-controls{position:fixed;right:20px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:10px;z-index:80}
.nav-btn{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#fff;border:2px solid #000;border-radius:8px;min-width:96px;box-shadow:0 6px 18px rgba(0,0,0,0.12);font-weight:800}
.nav-btn[disabled]{opacity:0.5;pointer-events:none}
.nav-arrow{font-size:20px;line-height:1}
.nav-label{font-size:14px}
</style>
