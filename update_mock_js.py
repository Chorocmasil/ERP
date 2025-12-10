import json
import random
from datetime import datetime, timedelta

# Configuration
START_DATE = datetime(2024, 1, 1)
END_DATE = datetime(2024, 3, 31)
EVENTS_PER_LOT = 20

# Data Stores
items = []
process_lines = []
machines = []
bom_items = []
defect_codes = []
cause_codes = []
lots = []

# 1. Items
fgs = [
    ('FG_FEM_001', 'Front End Module', 'FG', 'EA'),
    ('FG_FCH_001', 'Front Chassis Module', 'FG', 'EA'),
    ('FG_RCH_001', 'Rear Chassis Module', 'FG', 'EA'),
    ('FG_CPT_001', 'Cockpit Module', 'FG', 'EA')
]
items.extend(fgs)

rms_data = {
    'FG_FEM_001': [
        ('RM_RAD_001', 'Radiator', 'RM', 'EA'), ('RM_HL_001', 'Headlamp', 'RM', 'EA'),
        ('RM_SB_001', 'Steel Beam', 'RM', 'EA'), ('RM_FAN_001', 'Cooling Fan', 'RM', 'EA'),
        ('RM_SEN_001', 'Front Sensor', 'RM', 'EA'), ('RM_GRI_001', 'Grille', 'RM', 'EA'),
        ('RM_BUM_001', 'Bumper Rail', 'RM', 'EA'), ('RM_HORN_001', 'Horn', 'RM', 'EA')
    ],
    'FG_FCH_001': [
        ('RM_SUS_001', 'Suspension Strut', 'RM', 'EA'), ('RM_KNU_001', 'Knuckle', 'RM', 'EA'),
        ('RM_HUB_001', 'Wheel Hub', 'RM', 'EA'), ('RM_ARM_001', 'Lower Arm', 'RM', 'EA'),
        ('RM_STR_001', 'Steering Gear', 'RM', 'EA'), ('RM_LINK_001', 'Stabilizer Link', 'RM', 'EA'),
        ('RM_BRK_001', 'Brake Caliper', 'RM', 'EA'), ('RM_DISC_001', 'Brake Disc', 'RM', 'EA')
    ],
    'FG_RCH_001': [
        ('RM_SUB_001', 'Subframe', 'RM', 'EA'), ('RM_RARM_001', 'Rear Arm', 'RM', 'EA'),
        ('RM_RSUS_001', 'Rear Shock Absorber', 'RM', 'EA'), ('RM_RSPR_001', 'Coil Spring', 'RM', 'EA'),
        ('RM_RBRK_001', 'Rear Caliper', 'RM', 'EA'), ('RM_RDISC_001', 'Rear Disc', 'RM', 'EA'),
        ('RM_EPB_001', 'EPB Module', 'RM', 'EA'), ('RM_BUSH_001', 'Bushings', 'RM', 'EA')
    ],
    'FG_CPT_001': [
        ('RM_HVAC_001', 'HVAC Unit', 'RM', 'EA'), ('RM_IP_001', 'Instrument Panel', 'RM', 'EA'),
        ('RM_CLU_001', 'Cluster', 'RM', 'EA'), ('RM_AUD_001', 'Audio Unit', 'RM', 'EA'),
        ('RM_AB_001', 'Airbag Module', 'RM', 'EA'), ('RM_SW_001', 'Steering Wheel', 'RM', 'EA'),
        ('RM_GLOVE_001', 'Glove Box', 'RM', 'EA'), ('RM_HUD_001', 'Head Up Display', 'RM', 'EA')
    ]
}

for fg_id, rms in rms_data.items():
    items.extend(rms)

# 2. Process Lines
lines_data = {
    'FG_FEM_001': [('L-FEM-01', 'Radiator Assy', 1), ('L-FEM-02', 'Headlamp Assy', 2), ('L-FEM-03', 'Bumper Assy', 3)],
    'FG_FCH_001': [('L-FCH-01', 'Suspension Assy', 1), ('L-FCH-02', 'Steering Assy', 2), ('L-FCH-03', 'Brake Assy', 3)],
    'FG_RCH_001': [('L-RCH-01', 'Subframe Mount', 1), ('L-RCH-02', 'Rear Suspension', 2), ('L-RCH-03', 'Final Inspection', 3)],
    'FG_CPT_001': [('L-CPT-01', 'HVAC Install', 1), ('L-CPT-02', 'Dashboard Assy', 2), ('L-CPT-03', 'Electronics Test', 3)]
}

managers = ['최성욱', '신승연', '유효열', '하승민']
manager_idx = 0

for fg_id, lines in lines_data.items():
    for line in lines:
        process_lines.append(line + (managers[manager_idx % len(managers)],))
        manager_idx += 1

# 3. Machines
machines_map = {
    'L-FEM-01': ['MC-FEM-01-01', 'MC-FEM-01-02'],
    'L-FEM-02': ['MC-FEM-02-01', 'MC-FEM-02-02'],
    'L-FEM-03': ['MC-FEM-03-01'],
    'L-FCH-01': ['MC-FCH-01-01', 'MC-FCH-01-02'],
    'L-FCH-02': ['MC-FCH-02-01'],
    'L-FCH-03': ['MC-FCH-03-01', 'MC-FCH-03-02'],
    'L-RCH-01': ['MC-RCH-01-01'],
    'L-RCH-02': ['MC-RCH-02-01', 'MC-RCH-02-02'],
    'L-RCH-03': ['MC-RCH-03-01'],
    'L-CPT-01': ['MC-CPT-01-01', 'MC-CPT-01-02'],
    'L-CPT-02': ['MC-CPT-02-01'],
    'L-CPT-03': ['MC-CPT-03-01', 'MC-CPT-03-02']
}

machine_names = [
    'Electric Torque Wrench', 'Hydraulic Press', 'Spring Compressor', 'Leak Tester',
    'Headlamp Aimer', 'CMM', 'Harness Board', 'Connector Press', 'EOL Tester', 'JIG Fixture'
]

for line_id, machine_ids in machines_map.items():
    for m_id in machine_ids:
        machines.append((m_id, random.choice(machine_names), line_id))

# 4. BOM Items
bom_id_counter = 1
for fg_id, rms in rms_data.items():
    for rm in rms:
        bom_items.append((bom_id_counter, fg_id, rm[0], random.randint(1, 4)))
        bom_id_counter += 1

# 5. Defect Codes
defect_codes_data = [
    ('D-AC-001', 'Noise Defect', 'Acoustic', 'Q-AC', 'Q-AC-0001'),
    ('D-AC-002', 'Vibration Defect', 'Acoustic', 'Q-AC', 'Q-AC-0002'),
    ('D-DIM-001', 'Length Out of Spec', 'Dimension', 'Q-DIM', 'Q-DIM-0001'),
    ('D-DIM-002', 'Gap Out of Spec', 'Dimension', 'Q-DIM', 'Q-DIM-0002'),
    ('D-APP-001', 'Scratch', 'Appearance', 'Q-APP', 'Q-APP-0001'),
    ('D-APP-002', 'Dent', 'Appearance', 'Q-APP', 'Q-APP-0002'),
    ('D-APP-003', 'Color Mismatch', 'Appearance', 'Q-APP', 'Q-APP-0003'),
    ('D-FUNC-001', 'Leakage', 'Function', 'Q-FUNC', 'Q-FUNC-0001'),
    ('D-FUNC-002', 'Operation Failure', 'Function', 'Q-FUNC', 'Q-FUNC-0002'),
    ('D-FUNC-003', 'Electrical Short', 'Function', 'Q-FUNC', 'Q-FUNC-0003')
]
defect_codes.extend(defect_codes_data)

# 6. Cause Codes
cause_codes_data = [
    ('C-EQ-01', 'Equipment Failure'), ('C-OP-01', 'Operator Error'),
    ('C-MAT-01', 'Material Defect'), ('C-PAR-01', 'Parameter Error'),
    ('C-ENV-01', 'Environment Issue'), ('C-DES-01', 'Design Issue')
]
cause_codes.extend(cause_codes_data)

# 7. Lots
current_date = START_DATE
lot_counter = 0

while current_date <= END_DATE:
    # Determine daily volume and quality factor
    daily_lots_count = random.randint(1, 4) # 1 to 4 lots per day
    
    # Daily quality factor: 0.0 = perfect, 1.0 = terrible
    # Most days are good (low factor), some are bad spikes
    if random.random() < 0.15: # 15% chance of a bad day
        daily_defect_rate_base = random.uniform(0.15, 0.40) # 15-40% defect rate
    else:
        daily_defect_rate_base = random.uniform(0.01, 0.08) # 1-8% defect rate

    for _ in range(daily_lots_count):
        fg_id = random.choice(fgs) # Pick random FG
        fg_code = fg_id[0]
        product_lines = lines_data[fg_code]
        selected_line = random.choice(product_lines)[0]
        
        date_str = current_date.strftime('%Y%m%d')
        module_code = fg_code.split('_')[1]
        lot_no = f"LOT{date_str}-{module_code}-{random.randint(1, 99):02d}"
        
        lots.append((lot_no, fg_code, selected_line, current_date.strftime('%Y-%m-%d'), daily_defect_rate_base))
        lot_counter += 1
        
    current_date += timedelta(days=1)

# --- Construct JS Objects ---

js_items = [{"item_id": i[0], "item_name": i[1], "type": i[2], "unit": i[3]} for i in items]

js_process_lines = [{"line_id": l[0], "line_name": l[1], "seq": l[2], "manager": l[3]} for l in process_lines]

js_machines = [{"machine_id": m[0], "machine_name": m[1], "line_id": m[2]} for m in machines]

bom_map = {}
for b in bom_items:
    pid = b[1]
    if pid not in bom_map:
        bom_map[pid] = []
    bom_map[pid].append({"material_id": b[2], "qty": b[3]})

js_boms = [{"product_id": pid, "materials": mats} for pid, mats in bom_map.items()]

js_defect_codes = [{"code": d[0], "name": d[1], "category": d[2], "iso_group": d[3], "iso_code": d[4]} for d in defect_codes]

js_cause_codes = [{"code": c[0], "name": c[1]} for c in cause_codes]

js_lots = [{"lot_no": l[0], "product_id": l[1], "line_id": l[2], "date": l[3]} for l in lots]

js_ai_events = []
js_defect_logs = []

event_id_counter = 1
defect_log_id_counter = 1

for lot in lots:
    lot_no = lot[0]
    product_id = lot[1]
    line_id = lot[2]
    lot_date = datetime.strptime(lot[3], '%Y-%m-%d')
    base_defect_rate = lot[4]
    
    line_machines = [m for m in machines if m[2] == line_id]
    if not line_machines:
        continue
    
    # Define clean lines (Hyundai Mobis scenario: some lines are very stable)
    CLEAN_LINES = ['L-FEM-02', 'L-FCH-03', 'L-RCH-01', 'L-CPT-02']
    VERY_CLEAN_LINES = ['L-FEM-03', 'L-CPT-03'] # Target < 10 defects
        
    for _ in range(EVENTS_PER_LOT):
        event_id = f"EVT{event_id_counter:06d}"
        machine = random.choice(line_machines)
        machine_id = machine[0]
        
        event_time = lot_date + timedelta(hours=random.randint(8, 17), minutes=random.randint(0, 59), seconds=random.randint(0, 59))
        timestamp = event_time.strftime('%Y-%m-%d %H:%M:%S')
        
        # Vary defect rate slightly per event/machine
        if line_id in VERY_CLEAN_LINES:
             # Extremely low defect rate (0.02%) to ensure < 10 defects total
             local_defect_rate = 0.0002
        elif line_id in CLEAN_LINES:
             # Very low defect rate for stable lines (0.1% to 0.5%)
             local_defect_rate = random.uniform(0.001, 0.005)
        else:
             local_defect_rate = max(0, min(1, random.gauss(base_defect_rate, 0.05)))

        is_ng = random.random() < local_defect_rate
        
        sound_result = 'NG' if is_ng else 'OK'
        
        defect_type_ai = None
        severity = None
        
        if is_ng:
            defect = random.choice(defect_codes)
            defect_type_ai = defect[1]
            severity = random.choice(['HIGH', 'MEDIUM', 'LOW'])
            
            defect_log_id = f"DL{defect_log_id_counter:06d}"
            cause_code = random.choice(cause_codes)[0] if random.random() > 0.5 else None
            action = random.choice(['Replaced part', 'Adjusted torque', 'Cleaned sensor', 'Retested OK']) if random.random() > 0.3 else None
            qty = random.choice([1, 1, 1, 2])
            
            js_defect_logs.append({
                "defect_log_id": defect_log_id,
                "event_id": event_id,
                "lot_no": lot_no,
                "product_id": product_id,
                "line_id": line_id,
                "machine_id": machine_id,
                "defect_code": defect[0],
                "cause_code": cause_code,
                "action": action,
                "qty": qty,
                "created_at": timestamp,
                "updated_at": timestamp
            })
            defect_log_id_counter += 1
        
        js_ai_events.append({
            "event_id": event_id,
            "timestamp": timestamp,
            "machine_id": machine_id,
            "line_id": line_id,
            "lot_no": lot_no,
            "sound_result": sound_result,
            "defect_type_ai": defect_type_ai,
            "severity": severity
        })
        
        event_id_counter += 1

initial_data = {
    "items": js_items,
    "boms": js_boms,
    "process_lines": js_process_lines,
    "machines": js_machines,
    "defect_codes": js_defect_codes,
    "cause_codes": js_cause_codes,
    "lots": js_lots,
    "ai_events": js_ai_events,
    "defect_logs": js_defect_logs
}

js_content = f"""// Initial Data
const initialData = {json.dumps(initial_data, indent=2)};

// LocalStorage Key
const STORAGE_KEY = 'cloud_qm_db_v4';

// Service Class
class MockDataService {{
  constructor() {{
    this.init();
  }}

  init() {{
    if (!localStorage.getItem(STORAGE_KEY)) {{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }}
  }}

  getDB() {{
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{{}}');
  }}

  saveDB(db) {{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }}

  // Generic CRUD
  getAll(collection) {{
    const db = this.getDB();
    return db[collection] || [];
  }}

  getById(collection, idField, id) {{
    const db = this.getDB();
    return (db[collection] || []).find(item => item[idField] === id);
  }}

  create(collection, item) {{
    const db = this.getDB();
    if (!db[collection]) db[collection] = [];
    db[collection].push(item);
    this.saveDB(db);
    return item;
  }}

  update(collection, idField, id, updates) {{
    const db = this.getDB();
    const index = (db[collection] || []).findIndex(item => item[idField] === id);
    if (index !== -1) {{
      db[collection][index] = {{ ...db[collection][index], ...updates }};
      this.saveDB(db);
      return db[collection][index];
    }}
    return null;
  }}

  delete(collection, idField, id) {{
    const db = this.getDB();
    const index = (db[collection] || []).findIndex(item => item[idField] === id);
    if (index !== -1) {{
      db[collection].splice(index, 1);
      this.saveDB(db);
      return true;
    }}
    return false;
  }}
}}

export const dataService = new MockDataService();
"""

with open('/Users/chomae/Desktop/ERP/ERP/src/services/mockData.js', 'w') as f:
    f.write(js_content)
