exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('Kanban_QA').del();

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  await knex('Kanban_QA').insert([
    { id: 1, kanban: 'FSC LH KBB1', qr_kanban: 'FSC LH KBB1 0001', barcode: '', status: 'Verified', created_at: todayStr, updated_at: todayStr },
    { id: 2, kanban: 'FSC RH KBB1', qr_kanban: 'FSC RH KBB1 0001', barcode: '', status: 'Verified', created_at: todayStr, updated_at: todayStr },
    { id: 3, kanban: 'FSB LH KBB1', qr_kanban: 'FSB LH KBB1 0002', barcode: 'C0006631331L', status: 'Verified', created_at: todayStr, updated_at: todayStr },
    { id: 4, kanban: 'FSB RH KBB1', qr_kanban: 'FSB RH KBB1 0002', barcode: 'C0006631331R', status: 'Verified', created_at: todayStr, updated_at: todayStr },
    // Add data for a different date
    { id: 5, kanban: 'RSB LH KBB5', qr_kanban: 'RSB LH KBB5 0001', barcode: '', status: 'Verified', created_at: '2026-03-18', updated_at: '2026-03-17' },
    { id: 6, kanban: 'RSB RH KBB6', qr_kanban: 'RSB RH KBB6 0001', barcode: '', status: 'Verified', created_at: '2026-03-18', updated_at: '2026-03-17' },
  ]);
};
