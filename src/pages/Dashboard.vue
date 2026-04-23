<script setup>
import { ref, computed } from 'vue'
import { topCustomers, liveActivity } from '../data/mockData'
import { Monitor, Users, Play, DollarSign, Download, Calendar } from 'lucide-vue-next'

const period = ref('30D')

const statCards = [
  {
    label: 'Total Screens',
    value: '1,267',
    trend: '+12.4%',
    up: true,
    color: '#22c55e',
    icon: Monitor,
    bars: [40, 35, 42, 38, 45, 50, 48, 55, 60, 58, 65, 70, 68, 75, 82],
  },
  {
    label: 'Active Customers',
    value: '142',
    trend: '+8.2%',
    up: true,
    color: '#3b82f6',
    icon: Users,
    bars: [30, 35, 32, 40, 38, 42, 45, 48, 50, 55, 52, 58, 60, 65, 72],
  },
  {
    label: 'Media Plays Today',
    value: '284K',
    trend: '+23.1%',
    up: true,
    color: '#22c55e',
    icon: Play,
    bars: [25, 30, 28, 35, 40, 38, 45, 48, 55, 60, 58, 65, 70, 78, 90],
  },
  {
    label: 'Monthly Revenue',
    value: '$48.2K',
    trend: '-2.3%',
    up: false,
    color: '#8b5cf6',
    icon: DollarSign,
    bars: [80, 75, 72, 78, 82, 85, 80, 75, 72, 70, 68, 65, 62, 60, 58],
  },
]

const activityData = {
  '7D':  { screens: [1220, 1230, 1240, 1250, 1255, 1260, 1267], plays: [160, 165, 170, 168, 172, 175, 180] },
  '30D': { screens: [950, 970, 990, 1010, 1050, 1080, 1100, 1150, 1170, 1200, 1230, 1267], plays: [50, 70, 80, 90, 110, 120, 130, 140, 150, 160, 170, 180] },
  '90D': { screens: [800, 850, 900, 930, 960, 990, 1020, 1060, 1100, 1140, 1200, 1267], plays: [30, 40, 50, 60, 75, 90, 110, 130, 145, 160, 170, 180] },
}

const monthLabels = {
  '7D': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  '30D': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  '90D': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

const CL = 50
const CR = 750
const CT = 15
const CB = 190
const CW = CR - CL
const CH = CB - CT
const MAX_Y = 1500

function xPos(i, total) { return CL + (i / (total - 1)) * CW }
function yPos(val) { return CB - (val / MAX_Y) * CH }
function buildLinePath(data) {
  return data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i, data.length).toFixed(1)} ${yPos(v).toFixed(1)}`).join(' ')
}
function buildAreaPath(data) {
  const n = data.length
  return buildLinePath(data) + ` L ${xPos(n - 1, n).toFixed(1)} ${CB} L ${xPos(0, n).toFixed(1)} ${CB} Z`
}

const screensLinePath = computed(() => buildLinePath(activityData[period.value].screens))
const screensAreaPath = computed(() => buildAreaPath(activityData[period.value].screens))
const playsLinePath   = computed(() => buildLinePath(activityData[period.value].plays))

const xAxisLabels = computed(() => {
  const labels = monthLabels[period.value]
  return labels.map((lbl, i) => ({ lbl, x: xPos(i, labels.length).toFixed(1) }))
})

const RADIUS = 65
const CIRC = 2 * Math.PI * RADIUS

const donutSegments = computed(() => {
  const segs = [
    { label: 'Online',  pct: 0.775, color: '#22c55e', count: '982',  share: '77.5%' },
    { label: 'Offline', pct: 0.172, color: '#ef4444', count: '218',  share: '17.2%' },
    { label: 'Idle',    pct: 0.053, color: '#f59e0b', count: '67',   share: '5.3%'  },
  ]
  let cumAngle = -90
  return segs.map(seg => {
    const len = seg.pct * CIRC
    const gap = CIRC - len
    const rotate = cumAngle
    cumAngle += seg.pct * 360
    return { ...seg, dasharray: `${len.toFixed(2)} ${gap.toFixed(2)}`, rotate }
  })
})

const today = new Date()
const hour = today.getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dash-header">
      <div>
        <h1 class="greeting-title">{{ greeting }}, Admin 👋</h1>
        <p class="greeting-sub">Here's what's happening across your network today.</p>
      </div>
      <div class="dash-header-actions">
        <button class="btn-period">
          <Calendar :size="15" />
          Last 30 days
          <span class="caret">▾</span>
        </button>
        <button class="btn-export">
          <Download :size="15" />
          Export Report
        </button>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stat-grid">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" :style="{ background: card.color + '22' }">
            <component :is="card.icon" :size="20" :color="card.color" />
          </div>
          <span :class="['stat-trend', card.up ? 'trend-up' : 'trend-down']">
            {{ card.up ? '▲' : '▼' }} {{ card.trend }}
          </span>
        </div>
        <p class="stat-label">{{ card.label }}</p>
        <p class="stat-value">{{ card.value }}</p>
        <p class="stat-vs">vs last month</p>
        <svg class="sparkline" viewBox="0 0 120 30" preserveAspectRatio="none">
          <defs>
            <linearGradient :id="`sg${card.label.replace(/\s/g,'')}`" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="card.color" stop-opacity="0.3"/>
              <stop offset="100%" :stop-color="card.color" stop-opacity="0.02"/>
            </linearGradient>
          </defs>
          <polyline
            :points="card.bars.map((v, i) => `${(i / (card.bars.length - 1)) * 120},${30 - (v / 100) * 28}`).join(' ')"
            fill="none" :stroke="card.color" stroke-width="1.5" stroke-linejoin="round"
          />
          <polygon
            :points="[
              ...card.bars.map((v, i) => `${(i / (card.bars.length - 1)) * 120},${30 - (v / 100) * 28}`),
              '120,30', '0,30'
            ].join(' ')"
            :fill="`url(#sg${card.label.replace(/\s/g,'')})`"
          />
        </svg>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Screen Activity -->
      <div class="chart-card activity-card">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Screen Activity</h3>
            <p class="chart-sub">Active screens &amp; media impressions</p>
          </div>
          <div class="period-tabs">
            <button
              v-for="p in ['7D','30D','90D']"
              :key="p"
              :class="['period-btn', { active: period === p }]"
              @click="period = p"
            >{{ p }}</button>
          </div>
        </div>

        <div class="chart-legend">
          <span class="legend-item"><span class="dot" style="background:#22c55e"></span>Active Screens</span>
          <span class="legend-item"><span class="dot" style="background:#3b82f6"></span>Media Plays (K)</span>
        </div>

        <svg viewBox="0 0 800 215" class="area-svg">
          <defs>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#22c55e" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="#22c55e" stop-opacity="0.01"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          <line v-for="yv in [500,1000,1500]" :key="yv"
            :x1="CL" :y1="yPos(yv).toFixed(1)" :x2="CR" :y2="yPos(yv).toFixed(1)"
            stroke="#f1f5f9" stroke-width="1"
          />
          <!-- Y labels -->
          <text v-for="yv in [0,500,1000,1500]" :key="'y'+yv"
            :x="CL - 6" :y="yPos(yv).toFixed(1)"
            text-anchor="end" dominant-baseline="middle" font-size="10" fill="#94a3b8"
          >{{ yv }}</text>
          <!-- Area + lines -->
          <path :d="screensAreaPath" fill="url(#area-grad)" />
          <path :d="screensLinePath" fill="none" stroke="#22c55e" stroke-width="2" stroke-linejoin="round" />
          <path :d="playsLinePath"   fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linejoin="round" />
          <!-- X labels -->
          <text v-for="({ lbl, x }) in xAxisLabels" :key="lbl"
            :x="x" :y="CB + 14" text-anchor="middle" font-size="10" fill="#94a3b8"
          >{{ lbl }}</text>
        </svg>
      </div>

      <!-- Screen Status -->
      <div class="chart-card status-card">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Screen Status</h3>
            <p class="chart-sub">Across all customers</p>
          </div>
        </div>
        <div class="donut-wrap">
          <svg viewBox="0 0 200 200" class="donut-svg">
            <circle cx="100" cy="100" :r="RADIUS" fill="none" stroke="#f1f5f9" stroke-width="22"/>
            <circle
              v-for="seg in donutSegments"
              :key="seg.label"
              cx="100" cy="100" :r="RADIUS"
              fill="none" :stroke="seg.color" stroke-width="22"
              :stroke-dasharray="seg.dasharray"
              stroke-dashoffset="0"
              :transform="`rotate(${seg.rotate}, 100, 100)`"
            />
            <text x="100" y="94" text-anchor="middle" font-size="11" fill="#94a3b8">Total</text>
            <text x="100" y="114" text-anchor="middle" font-size="20" font-weight="700" fill="#1e293b">1,267</text>
          </svg>
        </div>
        <div class="donut-legend">
          <div v-for="seg in donutSegments" :key="seg.label" class="legend-row">
            <span class="dot" :style="{ background: seg.color }"></span>
            <span class="legend-label">{{ seg.label }}</span>
            <span class="legend-count">{{ seg.count }}</span>
            <span class="legend-share">{{ seg.share }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="bottom-row">
      <!-- Top Customers -->
      <div class="bottom-card">
        <div class="bottom-header">
          <div>
            <h3 class="chart-title">Top Customers</h3>
            <p class="chart-sub">By active screens &amp; usage</p>
          </div>
          <a href="#" class="view-all">View all →</a>
        </div>
        <table class="cust-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Screens</th>
              <th>Plan</th>
              <th>Storage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in topCustomers" :key="c.name">
              <td class="cust-name">{{ c.name }}</td>
              <td>{{ c.screens }}</td>
              <td>{{ c.plan }}</td>
              <td>{{ c.storage }}</td>
              <td>
                <span :class="['cust-badge', c.status === 'active' ? 'badge-active' : 'badge-inactive']">
                  {{ c.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Live Activity -->
      <div class="bottom-card live-card">
        <div class="bottom-header">
          <h3 class="chart-title">Live Activity</h3>
          <span class="live-badge"><span class="live-dot"></span>Live</span>
        </div>
        <div class="activity-feed">
          <div v-for="(item, i) in liveActivity" :key="i" class="activity-item">
            <span class="act-dot"></span>
            <div>
              <p class="act-text">{{ item.text }}</p>
              <p class="act-time">{{ item.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 1.5rem 2rem;
  background: #f9fafb;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.greeting-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.greeting-sub { margin: 0; color: #64748b; font-size: 0.9rem; }

.dash-header-actions { display: flex; gap: 0.75rem; align-items: center; }

.btn-period {
  display: flex; align-items: center; gap: 0.5rem;
  background: white; border: 1.5px solid #e2e8f0;
  color: #374151; padding: 0.55rem 1rem; border-radius: 6px;
  font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: border-color 0.2s;
}
.btn-period:hover { border-color: #fdc704; }
.caret { font-size: 0.7rem; color: #94a3b8; }

.btn-export {
  display: flex; align-items: center; gap: 0.5rem;
  background: #fdc704; border: none; color: white;
  padding: 0.55rem 1.1rem; border-radius: 6px;
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
}
.btn-export:hover { background: #e6b400; }

/* Stat Cards */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}
@media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }

.stat-card {
  background: white; border: 1px solid #e2e8f0;
  border-radius: 12px; padding: 1.25rem;
  display: flex; flex-direction: column;
}

.stat-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }

.stat-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}

.stat-trend { font-size: 0.78rem; font-weight: 700; }
.trend-up { color: #22c55e; }
.trend-down { color: #ef4444; }

.stat-label { margin: 0 0 0.2rem 0; font-size: 0.8rem; color: #64748b; font-weight: 500; }
.stat-value { margin: 0 0 0.1rem 0; font-size: 1.8rem; font-weight: 800; color: #1e293b; line-height: 1.1; }
.stat-vs { margin: 0 0 0.75rem 0; font-size: 0.75rem; color: #94a3b8; }

.sparkline { width: 100%; height: 34px; }

/* Charts Row */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.25rem;
}
@media (max-width: 1100px) { .charts-row { grid-template-columns: 1fr; } }

.chart-card {
  background: white; border: 1px solid #e2e8f0;
  border-radius: 12px; padding: 1.5rem;
}

.chart-header {
  display: flex; justify-content: space-between;
  align-items: flex-start; margin-bottom: 1rem;
}

.chart-title { margin: 0 0 0.2rem 0; font-size: 1rem; font-weight: 700; color: #1e293b; }
.chart-sub { margin: 0; font-size: 0.8rem; color: #94a3b8; }

.period-tabs {
  display: flex; background: #f1f5f9;
  border-radius: 6px; padding: 3px; gap: 2px;
}

.period-btn {
  background: none; border: none; padding: 0.3rem 0.7rem;
  border-radius: 4px; font-size: 0.8rem; font-weight: 600;
  color: #64748b; cursor: pointer; transition: all 0.2s;
}
.period-btn.active { background: #fdc704; color: white; }

.chart-legend { display: flex; gap: 1.5rem; margin-bottom: 0.5rem; }
.legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #64748b; }

.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

.area-svg { width: 100%; height: 220px; display: block; }

/* Donut */
.donut-wrap { display: flex; justify-content: center; margin: 0.5rem 0 1rem; }
.donut-svg { width: 180px; height: 180px; }

.donut-legend { display: flex; flex-direction: column; gap: 0.625rem; }
.legend-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
.legend-label { flex: 1; color: #374151; }
.legend-count { font-weight: 700; color: #1e293b; min-width: 36px; text-align: right; }
.legend-share { color: #94a3b8; min-width: 42px; text-align: right; font-size: 0.8rem; }

/* Bottom Row */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.25rem;
}
@media (max-width: 1100px) { .bottom-row { grid-template-columns: 1fr; } }

.bottom-card {
  background: white; border: 1px solid #e2e8f0;
  border-radius: 12px; padding: 1.5rem;
}

.bottom-header {
  display: flex; justify-content: space-between;
  align-items: flex-start; margin-bottom: 1.25rem;
}

.view-all { font-size: 0.875rem; color: #fdc704; font-weight: 600; text-decoration: none; }
.view-all:hover { text-decoration: underline; }

/* Customers Table */
.cust-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.cust-table th {
  text-align: left; color: #64748b; font-weight: 600;
  font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em;
  padding: 0 0 0.75rem 0; border-bottom: 1px solid #e2e8f0;
}
.cust-table td { padding: 0.75rem 0; color: #374151; border-bottom: 1px solid #f1f5f9; }
.cust-table tr:last-child td { border-bottom: none; }
.cust-name { font-weight: 600; color: #1e293b; }

.cust-badge { font-size: 0.75rem; font-weight: 600; padding: 2px 10px; border-radius: 10px; }
.badge-active { background: #dcfce7; color: #16a34a; }
.badge-inactive { background: #f1f5f9; color: #94a3b8; }

/* Live Activity */
.live-badge { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600; color: #22c55e; }
.live-dot {
  width: 8px; height: 8px; background: #22c55e;
  border-radius: 50%; animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

.activity-feed { display: flex; flex-direction: column; gap: 1rem; }
.activity-item { display: flex; gap: 0.875rem; align-items: flex-start; }

.act-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #fdc704; margin-top: 5px; flex-shrink: 0;
}

.act-text { margin: 0 0 0.2rem 0; font-size: 0.875rem; color: #374151; line-height: 1.4; }
.act-time { margin: 0; font-size: 0.78rem; color: #94a3b8; }
</style>
