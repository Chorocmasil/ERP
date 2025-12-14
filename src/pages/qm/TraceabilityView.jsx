import React, { useEffect, useMemo, useState } from 'react';
import { dataService } from '../../services/mockData';
import { Search, ChevronDown, ChevronRight, Box, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const DEFAULT_MAX_DEPTH = 4;

const UI = {
  page: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' },
  sectionTitle: { fontSize: '24px', fontWeight: 700, marginBottom: '4px' },
  sectionDesc: { color: 'var(--text-secondary)' },

  panel: { padding: '24px' },

  label: { display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' },
  input: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    background: 'white'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    background: 'white'
  },
  btnSecondary: {
    height: '40px',
    backgroundColor: 'rgba(100, 116, 139, 0.10)',
    color: 'var(--text-primary)'
  },

  chip: {
    padding: '6px 12px',
    borderRadius: '9999px',
    fontSize: '14px',
    backgroundColor: 'rgba(29, 64, 163, 0.08)',
    color: 'var(--accent-primary)'
  },

  listRow: { marginTop: '16px' },
  listLabel: { fontSize: '14px', color: 'var(--text-secondary)' },
  listWrap: { marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' },

  note: { marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 },

  error: {
    marginTop: '16px', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.10)', color: '#b91c1c'
  },

  resultsWrap: { display: 'flex', flexDirection: 'column', gap: '16px' },
  resultsHeader: { padding: '24px' },
  resultsTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 700 },
  resultsMeta: { marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' },

  treePanel: { padding: '24px' }
};

function safeStr(value) {
  return value == null ? '' : String(value);
}

function getProcessLabel(productId) {
  switch (safeStr(productId)) {
    case 'PROC_PRESS':
      return '프레스';
    case 'PROC_WELD':
      return '용접';
    case 'PROC_PAINT':
      return '도장';
    case 'PROC_ASSY':
      return '조립';
    case 'PROC_INSP':
      return '검사';
    default:
      return '';
  }
}

function safeJoin(parts, sep = ' · ') {
  return parts.filter(Boolean).join(sep);
}

function findLotMeta(lots, lotNo) {
  const lot = lots.find((l) => l.lot_no === lotNo);
  if (!lot) return null;
  return {
    lot_no: lot.lot_no,
    item_code: lot.item_code || lot.product_id || '',
    process_line_id: lot.process_line_id || lot.line_id || '',
    created_at: lot.created_at || lot.date || ''
  };
}

function buildTraceTree({ rootLotNo, direction, maxDepth }) {
  const allTrace = dataService.getAll('lot_traceability');
  const lots = dataService.getAll('lots');
  const items = dataService.getAll('items');
  const processLines = dataService.getAll('process_lines');

  const rootMeta = findLotMeta(lots, rootLotNo);

  /** @type {Map<string, any[]>} */
  const adjacency = new Map();
  for (const rel of allTrace) {
    const parent = rel.parent_lot_no;
    const child = rel.child_lot_no;

    // backward: FG(parent) -> RM(child)
    // forward: RM(child) -> FG(parent)
    // 즉, 항상 root에서 '다음 노드'로 확장될 수 있게 from/to를 구성합니다.
    const from = direction === 'backward' ? parent : child;
    const to = direction === 'backward' ? child : parent;

    if (!adjacency.has(from)) adjacency.set(from, []);
    adjacency.get(from).push({
      to,
      component_id: rel.component_id,
      input_qty: rel.input_qty
    });
  }

  const visited = new Set();
  visited.add(rootLotNo);

  const makeNode = (lotNo, depth, via) => {
    const meta = findLotMeta(lots, lotNo);
    const item = meta?.item_code ? items.find((i) => i.item_id === meta.item_code) : null;
    const line = meta?.process_line_id ? processLines.find((pl) => pl.line_id === meta.process_line_id) : null;
    const processLabel = meta?.item_code ? getProcessLabel(meta.item_code) : '';
    return {
      id: lotNo,
      lotNo,
      depth,
      meta,
      item,
      line,
      processLabel,
      via, // {component_id, input_qty, fromLotNo}
      children: []
    };
  };

  const root = makeNode(rootLotNo, 0, null);

  // BFS to avoid deep recursion
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) break;
    if (node.depth >= maxDepth) continue;

    const edges = adjacency.get(node.lotNo) || [];
    for (const edge of edges) {
      const nextLotNo = edge.to;
      // cycle guard
      if (visited.has(nextLotNo)) {
        node.children.push({
          id: `${node.lotNo}__${nextLotNo}__cycle`,
          lotNo: nextLotNo,
          depth: node.depth + 1,
          meta: findLotMeta(lots, nextLotNo),
          item: null,
          line: null,
          processLabel: '',
          via: { component_id: edge.component_id, input_qty: edge.input_qty, fromLotNo: node.lotNo },
          children: [],
          isCycle: true
        });
        continue;
      }

      visited.add(nextLotNo);
      const child = makeNode(nextLotNo, node.depth + 1, {
        component_id: edge.component_id,
        input_qty: edge.input_qty,
        fromLotNo: node.lotNo
      });
      node.children.push(child);
      queue.push(child);
    }
  }

  const hasAny = root.children.length > 0;
  return { root, hasAny, rootMeta, traceCount: allTrace.length };
}

function toYmd(value) {
  const s = safeStr(value);
  // Accept YYYY-MM-DD or YYYY-MM-DD HH:mm:ss
  return s.length >= 10 ? s.substring(0, 10) : s;
}

function dateDistanceDays(aYmd, bYmd) {
  try {
    const a = new Date(aYmd);
    const b = new Date(bYmd);
    return Math.abs((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/**
 * BOM 기반으로 FG LOT의 추적 관계를 생성합니다.
 * - FG LOT(product_id) -> BOM(materials)
 * - material_id 별로 RM LOT을 매칭 (동일 날짜 우선, 없으면 가장 가까운 날짜)
 * - 결과를 lot_traceability에 upsert
 */
function ensureTraceabilityFromBom(rootLotNo) {
  const lots = dataService.getAll('lots');
  const boms = dataService.getAll('boms');

  const fgLot = lots.find((l) => l.lot_no === rootLotNo);
  if (!fgLot?.product_id) {
    return { created: 0, reason: 'LOT 마스터 정보가 없습니다.' };
  }

  const bom = boms.find((b) => b.product_id === fgLot.product_id);
  if (!bom?.materials?.length) {
    return { created: 0, reason: '해당 FG 품목의 BOM이 없습니다.' };
  }

  const fgDate = toYmd(fgLot.date || fgLot.created_at);

  const rmLots = lots.filter((l) => safeStr(l.product_id).startsWith('RM_'));

  const pickRmLot = (materialId) => {
    const candidates = rmLots.filter((l) => l.product_id === materialId);
    if (candidates.length === 0) return null;

    // 1) same date first
    const same = candidates.find((c) => toYmd(c.date || c.created_at) === fgDate);
    if (same) return same;

    // 2) nearest date
    let best = candidates[0];
    let bestDist = dateDistanceDays(toYmd(best.date || best.created_at), fgDate);
    for (const c of candidates.slice(1)) {
      const dist = dateDistanceDays(toYmd(c.date || c.created_at), fgDate);
      if (dist < bestDist) {
        best = c;
        bestDist = dist;
      }
    }
    return best;
  };

  const relations = [];
  for (const m of bom.materials) {
    const materialId = m.material_id;
    const rmLot = pickRmLot(materialId);
    if (!rmLot) continue;
    relations.push({
      parent_lot_no: rootLotNo,
      child_lot_no: rmLot.lot_no,
      component_id: materialId,
      input_qty: m.qty
    });
  }

  if (relations.length > 0 && typeof dataService.upsertLotTraceability === 'function') {
    dataService.upsertLotTraceability(relations);
  }

  return { created: relations.length, reason: relations.length ? '' : 'BOM은 있으나 매칭 가능한 RM LOT이 없습니다.' };
}

function resolveLotNoByPrefix(input) {
  const query = safeStr(input).trim();
  if (!query) return { resolved: '', candidates: [] };

  // 1) exact match first (fast path)
  const allTrace = dataService.getAll('lot_traceability');
  const uniq = new Set();
  for (const r of allTrace) {
    if (r?.parent_lot_no) uniq.add(r.parent_lot_no);
    if (r?.child_lot_no) uniq.add(r.child_lot_no);
  }
  if (uniq.has(query)) return { resolved: query, candidates: [query] };

  // 2) prefix match
  const hits = [];
  for (const lotNo of uniq) {
    if (safeStr(lotNo).startsWith(query)) hits.push(lotNo);
  }
  hits.sort();
  if (hits.length === 1) return { resolved: hits[0], candidates: hits };
  return { resolved: '', candidates: hits };
}

const NodeCard = ({
  node,
  direction,
  expanded,
  onToggle,
  indentPx
}) => {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const itemName = node.item?.item_name || '';
  const itemId = safeStr(node.meta?.item_code);
  const lineName = node.line?.line_name || '';
  const lineId = safeStr(node.meta?.process_line_id);
  const dateYmd = toYmd(node.meta?.created_at);
  const processLabel = node.processLabel || '';

  const metaLine = node.meta
    ? safeJoin([
        itemName ? `${itemName}${itemId ? ` (${itemId})` : ''}` : itemId,
        processLabel,
        lineName ? `${lineName}${lineId ? ` (${lineId})` : ''}` : lineId,
        dateYmd
      ])
    : 'LOT 상세 정보 없음';

  const badge = node.depth === 0
    ? '대상 LOT'
    : direction === 'backward'
      ? '구성(자재)'
      : '사용처(완제품)';

  const componentName = node.via?.component_id
    ? node.via.component_id.startsWith('PROC_')
      ? getProcessLabel(node.via.component_id) || node.via.component_id
      : (dataService.getAll('items').find((i) => i.item_id === node.via.component_id)?.item_name || node.via.component_id)
    : '';

  return (
    <div className="flex" style={{ paddingLeft: indentPx }}>
      <div className="glass-panel p-4 w-full">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: 'rgba(29, 64, 163, 0.08)', color: 'var(--accent-primary)' }}>
                {badge}
              </span>
              {node.isCycle ? (
                <span className="px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  순환 참조
                </span>
              ) : null}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Box size={18} style={{ color: 'var(--accent-primary)' }} />
              <div className="font-semibold text-primary text-sm break-all">{node.lotNo}</div>
            </div>
            <div className="mt-1 text-sm text-secondary break-all">{metaLine}</div>

            {node.via ? (
              <div className="mt-2 text-xs text-secondary">
                구성품: {safeStr(componentName)} · 투입수량: {safeStr(node.via.input_qty)}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={hasChildren ? onToggle : undefined}
            className="shrink-0 p-2 rounded-lg"
            style={{
              backgroundColor: 'rgba(100, 116, 139, 0.08)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(100, 116, 139, 0.18)',
              opacity: hasChildren ? 1 : 0,
              pointerEvents: hasChildren ? 'auto' : 'none'
            }}
            aria-label={expanded ? '접기' : '펼치기'}
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const TraceTree = ({ node, direction, expandedMap, onToggle, indentStep = 18 }) => {
  const expanded = !!expandedMap[node.id];
  const indentPx = node.depth * indentStep;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <NodeCard
        node={node}
        direction={direction}
        expanded={expanded}
        onToggle={() => onToggle(node.id)}
        indentPx={indentPx}
      />

      {expanded && node.children?.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {node.children.map((child) => (
            <TraceTree
              key={child.id}
              node={child}
              direction={direction}
              expandedMap={expandedMap}
              onToggle={onToggle}
              indentStep={indentStep}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const TraceabilityView = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [traceData, setTraceData] = useState(null);
  const [direction, setDirection] = useState('backward'); // backward (FG -> RM), forward (RM -> FG)
  const [maxDepth, setMaxDepth] = useState(DEFAULT_MAX_DEPTH);
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [defectLotsBootstrapped, setDefectLotsBootstrapped] = useState(false);

  const runSearch = (rawInput) => {
    const normalized = safeStr(rawInput).trim();
    if (!normalized) return;

    const { resolved, candidates: found } = resolveLotNoByPrefix(normalized);
    const targetLotNo = resolved || normalized;

    // 후보가 여러 개면 UI에 보여주고, 강제 조회는 하지 않습니다.
    if (!resolved && found.length > 1) {
      setCandidates(found);
      setError('');
      setTraceData(null);
      setExpanded({});
      return;
    }

    // 후보가 0개거나 1개(자동선택)면 정상 조회 흐름으로 진행
    setCandidates([]);

    // 불량 로그 LOT들이 대부분 추적 이력이 없기 때문에, 조회 시점에 일괄 보강을 1회 시도합니다.
    // (MockDataService에 유틸을 추가해 defect_logs 전체 LOT을 lots/trace로 보강)
    if (!defectLotsBootstrapped && typeof dataService.ensureTraceabilityForDefectLots === 'function') {
      if (typeof dataService.ensureBomForAllItems === 'function') {
        dataService.ensureBomForAllItems();
      } else if (typeof dataService.ensureBomForAllLots === 'function') {
        dataService.ensureBomForAllLots({ minMaterialsPerBom: 8, maxMaterialsPerBom: 10 });
      }

      // BOM이 있어도 LOT-LOT 연결(lot_traceability)이 없으면 추적이 안 되므로,
      // 전체 LOT에 대해 BOM 기반 연결을 1회 생성/보강합니다.
      if (typeof dataService.ensureTraceabilityForAllLotsFromBom === 'function') {
        dataService.ensureTraceabilityForAllLotsFromBom({
          maxFgLots: Number.POSITIVE_INFINITY,
          maxMaterialsPerLot: Number.POSITIVE_INFINITY,
          forwardCoverLinksPerRmLot: 3
        });
      }

      dataService.ensureTraceabilityForDefectLots({ maxMaterialsPerLot: Number.POSITIVE_INFINITY });
      setDefectLotsBootstrapped(true);
    }

    // FG LOT(완제품)을 역추적으로 조회할 때는, 해당 LOT 단건에 대해서도 BOM 기반 보강을 추가로 수행합니다.
    if (direction === 'backward') {
      ensureTraceabilityFromBom(targetLotNo);
    }

    const { root, hasAny, rootMeta, traceCount } = buildTraceTree({
      rootLotNo: targetLotNo,
      direction,
      maxDepth
    });

    if (!hasAny) {
      const existsInMaster = !!rootMeta;

      // 불량로그에서 넘어오는 LOT은 '무조건' 역추적이 되게: 연결이 비어있다면 1회 더 보강 후 재시도
      if (direction === 'backward' && existsInMaster) {
        try {
          // 1) BOM 보강
          if (typeof dataService.ensureBomForAllItems === 'function') {
            dataService.ensureBomForAllItems();
          }

          // 2) 전체 LOT 링크 보강
          if (typeof dataService.ensureTraceabilityForAllLotsFromBom === 'function') {
            dataService.ensureTraceabilityForAllLotsFromBom({
              maxFgLots: Number.POSITIVE_INFINITY,
              maxMaterialsPerLot: Number.POSITIVE_INFINITY,
              forwardCoverLinksPerRmLot: 3
            });
          }

          // 3) 대상 LOT 단건 보강
          ensureTraceabilityFromBom(targetLotNo);

          const retry = buildTraceTree({ rootLotNo: targetLotNo, direction, maxDepth });
          if (retry?.hasAny) {
            setError('');
            setTraceData({ type: direction, root: targetLotNo, tree: retry.root, rootMeta: retry.rootMeta });
            const nextExpanded = { [retry.root.id]: true };
            (retry.root.children || []).forEach((c) => {
              nextExpanded[c.id] = true;
            });
            setExpanded(nextExpanded);
            return;
          }
        } catch {
          // ignore and fallthrough to error
        }
      }

      if (traceCount === 0) {
        setError('추적 데이터(lot_traceability)가 비어 있습니다. 샘플 데이터를 생성하거나 이력 적재가 필요합니다.');
      } else if (existsInMaster) {
        setError('마스터 LOT는 존재하지만, 해당 LOT에 대한 추적 이력이 없습니다. (lot_traceability에 연결 데이터가 필요합니다)');
      } else {
        setError('해당 LOT에 대한 추적 데이터가 없습니다. (LOT 번호 또는 방향을 확인해주세요)');
      }
      setTraceData(null);
      setExpanded({});
      return;
    }

    setError('');
    setTraceData({ type: direction, root: targetLotNo, tree: root, rootMeta });
    // Default expand root + first level
    const nextExpanded = { [root.id]: true };
    (root.children || []).forEach((c) => {
      nextExpanded[c.id] = true;
    });
    setExpanded(nextExpanded);
  };

  // Defect Log 등에서 넘어올 때: ?lot=LOT...&dir=backward 같은 쿼리를 자동 반영 + 자동 조회
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lot = params.get('lot');
    const dir = params.get('dir');

    if (dir === 'backward' || dir === 'forward') {
      setDirection(dir);
    }

    if (lot) {
      setSearchTerm(lot);
      // URL 반영 직후 바로 검색 (dir은 위에서 setDirection이 async이므로, lot만 먼저 조회)
      // 실제 조회 방향은 현재 direction 상태를 사용하므로, dir이 함께 넘어오는 경우엔 동일 tick에서 맞추기 위해 약간 지연
      queueMicrotask(() => runSearch(lot));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    runSearch(searchTerm);
  };

  const summary = useMemo(() => {
    if (!traceData?.tree) return null;
    const queue = [traceData.tree];
    let nodes = 0;
    let maxFoundDepth = 0;
    while (queue.length) {
      const n = queue.shift();
      if (!n) break;
      nodes += 1;
      maxFoundDepth = Math.max(maxFoundDepth, n.depth);
      (n.children || []).forEach((c) => queue.push(c));
    }
    return {
      nodes,
      maxFoundDepth
    };
  }, [traceData]);

  const toggleNode = (nodeId) => {
    setExpanded((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleReset = () => {
    setSearchTerm('');
    setTraceData(null);
    setError('');
    setExpanded({});
    setCandidates([]);
  };

  return (
    <div style={UI.page}>
      <div>
        <h1 style={UI.sectionTitle}>추적성 관리</h1>
        <p style={UI.sectionDesc}>LOT 기준으로 역/정 추적을 트리 형태로 확인합니다.</p>
      </div>
      
      {/* Search Panel */}
      <div className="glass-panel" style={UI.panel}>
        <form
          onSubmit={handleSearch}
          style={{ display: 'grid', gridTemplateColumns: '1fr 220px 180px auto auto', gap: '12px', alignItems: 'end' }}
        >
          <div>
            <label style={UI.label}>LOT 번호</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                <Search size={18} />
              </div>
              <input
                type="text"
                style={UI.input}
                placeholder="예) LOT20240331-FCH-47"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={UI.label}>추적 방향</label>
            <select
              style={UI.select}
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option value="backward">역추적 (완제품 → 자재)</option>
              <option value="forward">정추적 (자재 → 완제품)</option>
            </select>
          </div>

          <div>
            <label style={UI.label}>탐색 깊이</label>
            <select
              style={UI.select}
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>
                  {d} 단계
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ height: '40px' }}
          >
            조회
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="btn-primary"
            style={UI.btnSecondary}
            title="초기화"
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} />
              초기화
            </span>
          </button>
        </form>

        {candidates.length > 1 ? (
          <div style={UI.listRow}>
            <div style={UI.listLabel}>
              검색 후보 LOT ({candidates.length.toLocaleString()}개) — 클릭하면 바로 조회
            </div>
            <div style={UI.listWrap}>
              {candidates.slice(0, 24).map((lot) => (
                <button
                  key={lot}
                  type="button"
                  onClick={() => {
                    setSearchTerm(lot);
                    runSearch(lot);
                  }}
                  style={UI.chip}
                  title="바로 조회"
                >
                  {lot}
                </button>
              ))}
            </div>
            {candidates.length > 24 ? (
              <div style={UI.note}>
                너무 많은 후보가 있어 상위 24개만 표시했어요. 더 구체적으로 입력하면 후보가 줄어듭니다.
              </div>
            ) : null}
          </div>
        ) : null}

        {error && (
          <div style={UI.error}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </div>

      {/* Visualization */}
      {traceData && (
        <div style={UI.resultsWrap}>
          <div className="glass-panel" style={UI.resultsHeader}>
            <h3 style={UI.resultsTitle}>
              <Layers style={{ color: 'var(--accent-primary)' }} />
              {traceData.type === 'backward' ? '역추적 결과(구성 트리)' : '정추적 결과(사용처 트리)'}
            </h3>
            {summary ? (
              <div style={UI.resultsMeta}>
                총 노드 {summary.nodes.toLocaleString()}개 · 최대 깊이 {summary.maxFoundDepth}단계 · 탐색 제한 {maxDepth}단계
              </div>
            ) : null}
          </div>

          <div className="glass-panel" style={UI.treePanel}>
            <TraceTree
              node={traceData.tree}
              direction={traceData.type}
              expandedMap={expanded}
              onToggle={toggleNode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TraceabilityView;
