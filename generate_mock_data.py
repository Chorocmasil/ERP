import random
from datetime import datetime, timedelta

# Configuration
START_DATE = datetime(2024, 1, 1)
END_DATE = datetime(2024, 3, 31)
NUM_LOTS = 60  # Reduced from 150-300 to keep output manageable but sufficient for demo
EVENTS_PER_LOT = 15

# Data Stores
items = []
process_lines = []
machines = []
bom_items = []
defect_codes = []
cause_codes = []
lots = []
ai_events = []
defect_logs = []

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

for fg_id, lines in lines_data.items():
    process_lines.extend(lines)

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
while current_date <= END_DATE and lot_counter < NUM_LOTS:
    for fg_id in fgs:
        if random.random() > 0.5: # Randomly skip some products per day
            continue
        
        fg_code = fg_id[0]
        # Find a line for this product
        product_lines = lines_data[fg_code]
        selected_line = random.choice(product_lines)[0]
        
        date_str = current_date.strftime('%Y%m%d')
        module_code = fg_code.split('_')[1]
        lot_no = f"LOT{date_str}-{module_code}-{random.randint(1, 9):02d}"
        
        lots.append((lot_no, fg_code, selected_line, current_date.strftime('%Y-%m-%d')))
        lot_counter += 1
        if lot_counter >= NUM_LOTS:
            break
    current_date += timedelta(days=1)

# 8. AI Events & 9. Defect Logs
event_id_counter = 1
defect_log_id_counter = 1

for lot in lots:
    lot_no = lot[0]
    product_id = lot[1]
    line_id = lot[2]
    lot_date = datetime.strptime(lot[3], '%Y-%m-%d')
    
    # Find machines for this line
    line_machines = [m for m in machines if m[2] == line_id]
    if not line_machines:
        continue
        
    for _ in range(EVENTS_PER_LOT):
        event_id = f"EVT{event_id_counter:06d}"
        machine = random.choice(line_machines)
        machine_id = machine[0]
        
        # Random time within the day
        event_time = lot_date + timedelta(hours=random.randint(8, 17), minutes=random.randint(0, 59), seconds=random.randint(0, 59))
        timestamp = event_time.strftime('%Y-%m-%d %H:%M:%S')
        
        is_ng = random.random() < 0.05 # 5% NG rate
        sound_result = 'NG' if is_ng else 'OK'
        
        defect_type_ai = 'NULL'
        severity = 'NULL'
        
        if is_ng:
            defect = random.choice(defect_codes)
            defect_type_ai = f"'{defect[1]}'"
            severity = f"'{random.choice(['HIGH', 'MEDIUM', 'LOW'])}'"
            
            # Create Defect Log
            defect_log_id = f"DL{defect_log_id_counter:06d}"
            cause_code = f"'{random.choice(cause_codes)[0]}'" if random.random() > 0.5 else 'NULL'
            action = f"'{random.choice(['Replaced part', 'Adjusted torque', 'Cleaned sensor', 'Retested OK'])}'" if random.random() > 0.3 else 'NULL'
            qty = random.choice([1, 1, 1, 2])
            
            defect_logs.append(
                f"INSERT INTO defect_logs (defect_log_id, event_id, lot_no, product_id, line_id, machine_id, defect_code, cause_code, action, qty, created_at, updated_at) VALUES ('{defect_log_id}', '{event_id}', '{lot_no}', '{product_id}', '{line_id}', '{machine_id}', '{defect[0]}', {cause_code}, {action}, {qty}, '{timestamp}', '{timestamp}');"
            )
            defect_log_id_counter += 1
        
        ai_events.append(
            f"INSERT INTO ai_events (event_id, timestamp, machine_id, line_id, lot_no, sound_result, defect_type_ai, severity) VALUES ('{event_id}', '{timestamp}', '{machine_id}', '{line_id}', '{lot_no}', '{sound_result}', {defect_type_ai}, {severity});"
        )
        
        event_id_counter += 1

# Output Generation
print("-- 1. Items")
for i in items:
    print(f"INSERT INTO items (item_id, item_name, type, unit) VALUES ('{i[0]}', '{i[1]}', '{i[2]}', '{i[3]}');")

print("\n-- 2. Process Lines")
for l in process_lines:
    print(f"INSERT INTO process_lines (line_id, line_name, seq) VALUES ('{l[0]}', '{l[1]}', {l[2]});")

print("\n-- 3. Machines")
for m in machines:
    print(f"INSERT INTO machines (machine_id, machine_name, line_id) VALUES ('{m[0]}', '{m[1]}', '{m[2]}');")

print("\n-- 4. BOM Items")
for b in bom_items:
    print(f"INSERT INTO bom_items (id, product_id, material_id, qty) VALUES ({b[0]}, '{b[1]}', '{b[2]}', {b[3]});")

print("\n-- 5. Defect Codes")
for d in defect_codes:
    print(f"INSERT INTO defect_codes (code, name, category, iso_group, iso_code) VALUES ('{d[0]}', '{d[1]}', '{d[2]}', '{d[3]}', '{d[4]}');")

print("\n-- 6. Cause Codes")
for c in cause_codes:
    print(f"INSERT INTO cause_codes (code, name) VALUES ('{c[0]}', '{c[1]}');")

print("\n-- 7. Lots")
for l in lots:
    print(f"INSERT INTO lots (lot_no, product_id, line_id, production_date) VALUES ('{l[0]}', '{l[1]}', '{l[2]}', '{l[3]}');")

print("\n-- 8. AI Events")
for e in ai_events:
    print(e)

print("\n-- 9. Defect Logs")
for d in defect_logs:
    print(d)
