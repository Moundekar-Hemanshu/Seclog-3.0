import { useEffect, useState, useMemo } from 'react'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import {
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle
} from 'lucide-react'

import API from '@/services/api'

function formatNumber(n: number): string {

  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1) + 'M'

  if (n >= 1_000)
    return (n / 1_000).toFixed(1) + 'K'

  return n.toString()
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
  }>
  label?: string
}

function CustomTooltip({
  active,
  payload,
  label
}: ChartTooltipProps) {

  if (!active || !payload?.length)
    return null

  return (

    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-sm">

      <p className="text-xs text-muted-foreground mb-1">

        {label}

      </p>

      {payload.map((entry, i) => (

        <p
          key={i}
          className="text-xs font-medium"
          style={{ color: entry.color }}
        >

          {entry.name}: {formatNumber(entry.value)}

        </p>

      ))}

    </div>
  )
}

export default function DashboardView() {

  const [stats, setStats] =
    useState<any>(null)

  const [logs, setLogs] =
    useState<any[]>([])

  const [alerts, setAlerts] =
    useState<any[]>([])

  const fetchDashboardData = async () => {

    try {

      const [
        statsRes,
        logsRes,
        alertsRes
      ] = await Promise.all([

        API.get("/stats"),

        API.get("/logs/recent"),

        API.get("/alerts/recent")

      ])

      setStats(statsRes.data)

      setLogs(logsRes.data)

      setAlerts(alertsRes.data)

    } catch (err) {

      console.error(err)
    }
  }

  useEffect(() => {

    fetchDashboardData()

    const interval = setInterval(
      fetchDashboardData,
      5000
    )

    return () => clearInterval(interval)

  }, [])

  const totalLogs =
    stats?.total_logs || 0

  const totalAlerts =
    stats?.total_alerts || 0

  const criticalAlerts =
    stats?.critical_alerts || 0

  const highAlerts =
    stats?.high_alerts || 0

  const totalLogsTrend = 0

  const totalAlertsTrend = 0

  const logVolumeData = useMemo(() => {

    const counts: Record<string, number> = {}

    logs.forEach(log => {

      const key =
        log.logfile || "Unknown"

      counts[key] =
        (counts[key] || 0) + 1
    })

    return Object.entries(counts).map(
      ([name, value], index) => ({

        name,

        value,

        fill: [
          '#eab308',
          '#f59e0b',
          '#d97706',
          '#92400e'
        ][index % 4]

      })
    )

  }, [logs])

  const securityTimelineData = useMemo(() => {

    return [
      {
        time: "Now",

        critical: criticalAlerts,

        high: highAlerts,

        medium: logs.filter(
          l => l.severity === "medium"
        ).length,

        low: logs.filter(
          l => l.severity === "low"
        ).length
      }
    ]

  }, [
    logs,
    criticalAlerts,
    highAlerts
  ])

  const logTrendData = [
    {
      time: "1m",
      logs: Math.max(totalLogs - 1200, 0),
      alerts: Math.max(totalAlerts - 12, 0)
    },

    {
      time: "30s",
      logs: Math.max(totalLogs - 600, 0),
      alerts: Math.max(totalAlerts - 6, 0)
    },

    {
      time: "Now",
      logs: totalLogs,
      alerts: totalAlerts
    }
  ]

  return (

    <div className="space-y-6" id="dashboard-view">

      {/* Header */}

      <div>

        <h1 className="text-lg font-semibold text-foreground">

          Dashboard

        </h1>

        <p className="text-sm text-muted-foreground">

          Security overview — live telemetry

        </p>

      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Total Logs */}

        <div
          className="rounded-lg border border-border bg-card p-5"
          id="card-total-logs"
        >

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">

              <FileText className="h-4 w-4 text-muted-foreground" />

              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">

                Total Logs

              </span>

            </div>

            <div className={`flex items-center gap-1 text-xs font-medium ${totalLogsTrend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>

              {totalLogsTrend >= 0
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />
              }

              {Math.abs(totalLogsTrend)}%

            </div>

          </div>

          <p className="text-3xl font-bold text-foreground mb-4">

            {formatNumber(totalLogs)}

          </p>

          <div className="h-[120px]">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={logTrendData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis hide />

                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="logs"
                  name="Logs"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={{
                    r: 2.5,
                    fill: 'var(--chart-1)',
                    strokeWidth: 0
                  }}
                  activeDot={{
                    r: 4,
                    fill: 'var(--chart-1)',
                    strokeWidth: 0
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* Total Alerts */}

        <div
          className="rounded-lg border border-border bg-card p-5"
          id="card-total-alerts"
        >

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">

              <AlertTriangle className="h-4 w-4 text-muted-foreground" />

              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">

                Total Alerts

              </span>

            </div>

            <div className={`flex items-center gap-1 text-xs font-medium ${totalAlertsTrend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>

              {totalAlertsTrend >= 0
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />
              }

              {Math.abs(totalAlertsTrend)}%

            </div>

          </div>

          <p className="text-3xl font-bold text-foreground mb-4">

            {formatNumber(totalAlerts)}

          </p>

          <div className="h-[120px]">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={logTrendData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis hide />

                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="alerts"
                  name="Alerts"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={{
                    r: 2.5,
                    fill: 'var(--chart-2)',
                    strokeWidth: 0
                  }}
                  activeDot={{
                    r: 4,
                    fill: 'var(--chart-2)',
                    strokeWidth: 0
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* Log Volume */}

        <div
          className="rounded-lg border border-border bg-card p-5"
          id="card-log-volume"
        >

          <div className="flex items-center gap-2 mb-4">

            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">

              Log Volume Distribution

            </span>

          </div>

          <div className="h-[180px]">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart
                data={logVolumeData}
                barCategoryGap="20%"
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => formatNumber(v)}
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="value"
                  name="Events"
                  radius={[4, 4, 0, 0]}
                >

                  {logVolumeData.map((entry, index) => (

                    <Cell
                      key={index}
                      fill={entry.fill}
                    />

                  ))}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* Security Timeline */}

        <div
          className="rounded-lg border border-border bg-card p-5"
          id="card-security-timeline"
        >

          <div className="flex items-center gap-2 mb-4">

            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">

              Security Event Timeline

            </span>

          </div>

          <div className="h-[180px]">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={securityTimelineData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="critical"
                  name="Critical"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                />

                <Line
                  type="monotone"
                  dataKey="high"
                  name="High"
                  stroke="var(--chart-1)"
                  strokeWidth={1.5}
                />

                <Line
                  type="monotone"
                  dataKey="medium"
                  name="Medium"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                />

                <Line
                  type="monotone"
                  dataKey="low"
                  name="Low"
                  stroke="var(--chart-5)"
                  strokeWidth={1.5}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>
  )
}