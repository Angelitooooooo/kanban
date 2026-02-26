import ZebraBrowserPrintWrapper from 'zebra-browser-print-wrapper-global';

export const printZebraRawZPL = (data) => {
  let zpl = `^XA
^CI28
^PW800
-- Shortened Label Length further to match the tighter content --
^LL430

-- Header Section (Moved Y from 30/22 to 10/2) --
^FO120,50^A0N,27,50^FDSpecification:^FS
^FO390,44^A0N,58,108^FD${data.specification}^FS

-- Main Content --

-- Quantity Row (Moved Y from 120/100 to 100/80) --
^FO90,140^A0N,21,36^FDQuantity/Number:^FS
^FO350,120^A0N,50,95^FD${data.quantity}^FS

-- Model Row (Moved Y from 190 to 170) --
^FO245,170^A0N,21,36^FDModel:^FS
^FO350,170^A0N,21,36^FD${data.model}^FS

-- Manufacturing Date Row (Moved Y from 230/225 to 210/205) --
^FO53,210^A0N,21,36^FDManufacturing Date:^FS
^FO347,205^A0N,21,30^FD${data.manufacturingDate}^FS

-- Shipping Date Row (Moved Y from 270 to 250) --
^FO132,250^A0N,21,36^FDShipping Date:^FS

-- Container Row (Moved Y from 310 to 290) --
^FO130,290^A0N,21,36^FDContainer No. :^FS

-- QR Code (Moved Y from 180 to 160) --
^FO530,160^BQN,2,7^FDMA,${data.qrData}^FS

-- Footer (Moved Y from 350 to 330) --
^FO220,330^A0N,32,58^FDTBPC^FS

^XZ`

  const zebra = new ZebraBrowserPrintWrapper();
  console.log('Generated ZPL:', zebra , zpl);
  zebra.getDefaultPrinter().then(printer => {
    if (!printer) {
      alert('No Zebra printer found');
      return;
    }
    zebra.setPrinter(printer);
    console.log('Sending raw ZPL to printer:', printer);
    zebra.print(zpl).then(() => {
    }).catch(e => {
      alert('Zebra printing failed: ' + e);
    });
  });
};
