import QRCode from 'qrcode';

export const printPage = () => {
  window.print();
};

export const printZebraLabels100Bulk = async (items = []) => {
  if (!items.length) return;

  const labelWindow = window.open('', '_blank', 'width=400,height=400');
  if (!labelWindow) return;

  const labelBlocks = [];
  for (const item of items) {
    const qrValue = String(item.qrData || '');
    const qrImg = await QRCode.toDataURL(qrValue, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 220
    });

    labelBlocks.push(`
      <div class="label-page">
        <div class="label">
          <div class="left-panel">
            <div class="spec-row">
              <span class="spec-label">Specification:</span>
              <span class="spec-value">${(() => {
                const specification = item.specification || '';
                return specification.startsWith('RR Cushion')
                  ? specification.slice(11)
                  : specification.slice(7);
              })()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Quantity/Number: </span>
              <span class="info-value">${item.quantity || ''}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Model: </span>
              <span class="info-value">${item.model || ''}</span>
            </div>
            <div class="mfg-date-row">
              <span class="mfg-date-label">Manufacturing Date: </span>
              <span class="mfg-date-value">${item.manufacturingDate || ''}</span>
            </div>
            <div class="info-row shipping-row">
              <span class="info-label">Shipping Date:</span>
            </div>
          </div>
          <div class="qr"><img src="${qrImg}" alt="QR"></div>
          <div class="footer">TBPC</div>
        </div>
      </div>
    `);
  }

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Labels</title>
    <style>
      @page { size: 100mm 100mm; margin: 0; }
      html, body {
        margin: 0;
        padding: 0;
        width: 100mm;
        height: 100mm;
      }
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      * { box-sizing: border-box; }
      .label-page {
        width: 100mm;
        height: 100mm;
        display: block;
        overflow: hidden;
        page-break-after: always;
      }
      .label {
        width: 100mm;
        height: 100mm;
        border: 1.6px solid #000;
        display: grid;
        grid-template-columns: 1fr 42mm;
        grid-template-rows: 1fr auto;
        column-gap: 2.2mm;
        row-gap: 1.1mm;
        padding: 2.2mm;
        background: #fff;
        overflow: hidden;
        align-content: stretch;
        font-variant-numeric: tabular-nums;
      }
      .left-panel {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1.7mm;
        padding-right: 0.5mm;
        min-height: 0;
      }
      .spec-row { 
        display: flex;
        align-items: baseline;
        justify-content: flex-start;
        gap: 0.8mm;
        flex-wrap: wrap;
        padding-bottom: 1.1mm;
        border-bottom: 0.25mm solid #d6d6d6;
      }
      .spec-label { 
        font-weight: 600;
        font-size: 2.35mm;
        color: #4c4c4c;
        white-space: nowrap;
      }
      .spec-value { 
        font-weight: 700; 
        font-size: 6.3mm;
        line-height: 1.02;
        letter-spacing: 0.08mm;
        color: #000;
        max-width: 100%;
        overflow-wrap: anywhere;
        word-break: break-word;
      }
      .info-row { 
        font-size: 2.4mm;
        line-height: 1.08;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: nowrap;
        gap: 0.7mm;
      }
      .info-label { 
        font-weight: 600;
        color: #5a5a5a;
        font-size: 2.3mm;
      }
      .info-value { 
        font-weight: 700;
        color: #000;
        font-size: 4.8mm;
      }
      .mfg-date-row {
        font-size: 2.2mm;
        line-height: 1.08;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.6mm;
      }
      .mfg-date-label {
        font-weight: 600;
        color: #5a5a5a;
        font-size: 2.1mm;
      }
      .mfg-date-value {
        font-weight: 700;
        color: #000;
        font-size: 2.7mm;
      }
      .qr {
        grid-column: 2 / 3;
        grid-row: 1 / 2;
        width: 100%;
        height: 46mm;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        align-self: center;
        background: #fff;
        border: 0.3mm solid #dcdcdc;
        padding: 0.5mm;
      }
      .qr img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .footer {
        grid-column: 1 / -1;
        grid-row: 2 / 3;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 5.2mm;
        font-weight: 700;
        letter-spacing: 0.95mm;
        color: #000;
        padding-top: 1mm;
        padding-bottom: 0.4mm;
        border-top: 0.25mm solid #d6d6d6;
      }
    </style>
  </head>
  <body>
    ${labelBlocks.join('\n')}
    <script>
      window.onload = function () { window.print(); };
    </script>
  </body>
</html>`;

  labelWindow.document.open();
  labelWindow.document.write(html);
  labelWindow.document.close();
};
