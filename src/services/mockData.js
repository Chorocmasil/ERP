// Initial Data
const initialData = {
  items: [
    { item_id: "FG001", item_name: "MDPS ASSY", type: "FG", unit: "EA" },
    { item_id: "RM001", item_name: "Housing", type: "RM", unit: "EA" },
    { item_id: "RM002", item_name: "Motor", type: "RM", unit: "EA" },
    { item_id: "RM003", item_name: "PCB", type: "RM", unit: "EA" }
  ],
  boms: [
    {
      product_id: "FG001",
      materials: [
        { material_id: "RM001", qty: 1 },
        { material_id: "RM002", qty: 1 },
        { material_id: "RM003", qty: 1 }
      ]
    }
  ],
  process_lines: [
    { line_id: "L-A1", line_name: "Assembly Line 1", seq: 1 },
    { line_id: "L-A2", line_name: "Assembly Line 2", seq: 2 },
    { line_id: "L-A3", line_name: "AI Sound Inspection", seq: 3 }
  ],
  machines: [
    { machine_id: "M-01", machine_name: "Assembler A", line_id: "L-A1" },
    { machine_id: "M-02", machine_name: "Assembler B", line_id: "L-A2" },
    { machine_id: "M-03", machine_name: "Acoustic AI Inspector", line_id: "L-A3" }
  ],
  defect_codes: [
    { code: "D001", name: "Noise Defect", category: "Acoustic", iso_group: "Q-AC", iso_code: "Q-AC-0001" },
    { code: "D002", name: "Vibration Defect", category: "Acoustic", iso_group: "Q-AC", iso_code: "Q-AC-0002" },
    { code: "D003", name: "Scratch", category: "Visual", iso_group: "Q-VIS", iso_code: "Q-VIS-0001" }
  ],
  cause_codes: [
    { code: "C001", name: "Machine Malfunction" },
    { code: "C002", name: "Material Defect" },
    { code: "C003", name: "Operator Error" }
  ],
  lots: [
    { lot_no: "LOT20241101-01", product_id: "FG001", line_id: "L-A1", date: "2024-11-01" },
    { lot_no: "LOT20241101-02", product_id: "FG001", line_id: "L-A1", date: "2024-11-01" }
  ],
  ai_events: [], // Will be populated by dummy generator
  defect_logs: []
};

// LocalStorage Key
const STORAGE_KEY = 'cloud_qm_db';

// Service Class
class MockDataService {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
  }

  getDB() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  }

  saveDB(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  // Generic CRUD
  getAll(collection) {
    const db = this.getDB();
    return db[collection] || [];
  }

  getById(collection, idField, id) {
    const db = this.getDB();
    return (db[collection] || []).find(item => item[idField] === id);
  }

  create(collection, item) {
    const db = this.getDB();
    if (!db[collection]) db[collection] = [];
    db[collection].push(item);
    this.saveDB(db);
    return item;
  }

  update(collection, idField, id, updates) {
    const db = this.getDB();
    const index = (db[collection] || []).findIndex(item => item[idField] === id);
    if (index !== -1) {
      db[collection][index] = { ...db[collection][index], ...updates };
      this.saveDB(db);
      return db[collection][index];
    }
    return null;
  }

  delete(collection, idField, id) {
    const db = this.getDB();
    const initialLength = (db[collection] || []).length;
    db[collection] = (db[collection] || []).filter(item => item[idField] !== id);
    this.saveDB(db);
    return db[collection].length < initialLength;
  }

  // Specific Logic
  getNextIsoCode(isoGroup) {
    const db = this.getDB();
    const codes = db.defect_codes || [];
    const groupCodes = codes.filter(c => c.iso_group === isoGroup);
    
    let maxSeq = 0;
    groupCodes.forEach(c => {
      const parts = c.iso_code.split('-');
      const seq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    });

    const nextSeq = maxSeq + 1;
    return `${isoGroup}-${String(nextSeq).padStart(4, '0')}`;
  }

  // AI Event Logic
  generateDummyEvents(count = 5) {
    const db = this.getDB();
    const machines = db.machines || [];
    const lots = db.lots || [];
    const defectCodes = db.defect_codes || [];
    
    if (machines.length === 0 || lots.length === 0) return [];

    const newEvents = [];
    const newLogs = [];

    for (let i = 0; i < count; i++) {
      const isNG = Math.random() > 0.7; // 30% NG rate
      const machine = machines[Math.floor(Math.random() * machines.length)];
      const lot = lots[Math.floor(Math.random() * lots.length)];
      const timestamp = new Date().toISOString();
      const eventId = `E${Date.now()}-${i}`;

      const event = {
        event_id: eventId,
        timestamp: timestamp,
        line_id: machine.line_id,
        machine_id: machine.machine_id,
        sound_result: isNG ? 'NG' : 'OK',
        defect_type_ai: isNG ? defectCodes[Math.floor(Math.random() * defectCodes.length)]?.name || 'Unknown' : null,
        severity: isNG ? (Math.random() > 0.5 ? 'HIGH' : 'MEDIUM') : null,
        lot_no: lot.lot_no
      };

      newEvents.push(event);

      // Auto-create Defect Log if NG
      if (isNG) {
        const defectCodeObj = defectCodes.find(d => d.name === event.defect_type_ai);
        const log = {
          defect_log_id: `DL${Date.now()}-${i}`,
          event_id: eventId,
          product_id: lot.product_id,
          lot_no: lot.lot_no,
          defect_code: defectCodeObj?.code || '',
          qty: 1,
          cause_code: '', // To be filled by user
          action: '',     // To be filled by user
          machine_id: machine.machine_id,
          line_id: machine.line_id,
          created_at: timestamp
        };
        newLogs.push(log);
      }
    }

    // Prepend new events/logs
    db.ai_events = [...newEvents, ...(db.ai_events || [])];
    db.defect_logs = [...newLogs, ...(db.defect_logs || [])];
    this.saveDB(db);

    return newEvents;
  }
}

export const dataService = new MockDataService();
