import { useState, useMemo, useEffect } from 'react'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import {
  Search,
  AlertOctagon,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react'

import API from '@/services/api'

function formatTimestamp(ts: string): string {

  const d = new Date(ts)

  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function SeverityIcon({
  severity
}: {
  severity: string
}) {

  switch (severity) {

    case 'critical':

      return (
        <AlertOctagon
          className="h-4 w-4 text-red-400 flex-shrink-0"
        />
      )

    case 'high':

      return (
        <AlertTriangle
          className="h-4 w-4 text-amber-400 flex-shrink-0"
        />
      )

    case 'medium':

      return (
        <Info
          className="h-4 w-4 text-blue-400 flex-shrink-0"
        />
      )

    default:

      return (
        <Info
          className="h-4 w-4 text-slate-400 flex-shrink-0"
        />
      )
  }
}

function AlertCard({
  alert
}: {
  alert: any
}) {
  const borderColorMap = {
    critical: 'border-l-red-500/60',
    
    high: 'border-l-amber-500/60',
    
    medium: 'border-l-blue-500/40',

    low: 'border-l-slate-500/40',

  }
  const borderColor =
  borderColorMap[
    alert.severity as keyof typeof borderColorMap
  ] || 'border-l-slate-500/40'

  return (

    <div
      className={`rounded-lg border border-border bg-card p-4 border-l-[3px] ${borderColor} hover:bg-muted/50 transition-colors duration-150`}
      id={`alert-${alert.id}`}
    >

      <div className="flex items-start gap-3">

        <SeverityIcon severity={alert.severity} />

        <div className="flex-1 min-w-0">

          <div className="flex items-center justify-between gap-2 mb-1">

            <h3 className="text-sm font-medium text-foreground truncate">

              {alert.rule_name}

            </h3>

            <Badge
              variant="outline"
              className="flex-shrink-0 capitalize"
            >

              {alert.severity}

            </Badge>

          </div>

          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">

            {alert.description}

          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">

            <span className="font-mono">

              #{alert.id}

            </span>

            <span className="flex items-center gap-1">

              <Clock className="h-3 w-3" />

              {formatTimestamp(alert.trigger_time)}

            </span>

          </div>

        </div>

      </div>

    </div>
  )
}

function AlertSection({
  title,
  alerts,
  accentColor
}: {
  title: string
  alerts: any[]
  accentColor: string
}) {

  if (alerts.length === 0)
    return null

  return (

    <div className="space-y-3">

      <div className="flex items-center gap-2">

        <span
          className={`h-2 w-2 rounded-full ${accentColor}`}
        />

        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">

          {title}

        </h2>

        <span className="text-xs text-muted-foreground">

          ({alerts.length})

        </span>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

        {alerts.map(alert => (

          <AlertCard
            key={alert.id}
            alert={alert}
          />

        ))}

      </div>

    </div>
  )
}

export default function AlertsView() {

  const [alerts, setAlerts] =
    useState<any[]>([])

  const [search, setSearch] =
    useState('')

  const [severityFilter, setSeverityFilter] =
    useState<string>('all')

  const fetchAlerts = async () => {

    try {

      const response =
        await API.get('/alerts/recent')

      setAlerts(response.data)

    } catch (err) {

      console.error(err)
    }
  }

  useEffect(() => {

    fetchAlerts()

    const interval = setInterval(
      fetchAlerts,
      5000
    )

    return () => clearInterval(interval)

  }, [])

  const filtered = useMemo(() => {

    let result = alerts

    if (severityFilter !== 'all') {

      result = result.filter(
        a => a.severity === severityFilter
      )
    }

    if (search.trim()) {

      const q =
        search.toLowerCase()

      result = result.filter(

        a =>

          a.rule_name
            ?.toLowerCase()
            .includes(q)

          ||

          a.description
            ?.toLowerCase()
            .includes(q)

          ||

          String(a.id)
            .includes(q)
      )
    }

    return result

  }, [
    alerts,
    search,
    severityFilter
  ])

  const critical = filtered.filter(
    a => a.severity === 'critical'
  )

  const high = filtered.filter(
    a => a.severity === 'high'
  )

  const recent = filtered.filter(
    a =>
      a.severity === 'medium'
      ||
      a.severity === 'low'
  )

  return (

    <div className="space-y-6" id="alerts-view">

      <div>

        <h1 className="text-lg font-semibold text-foreground">

          Alerts

        </h1>

        <p className="text-sm text-muted-foreground">

          Active security alerts across monitored systems

        </p>

      </div>

      {/* Filters */}

      <div className="flex flex-col sm:flex-row gap-3">

        <div className="relative flex-1">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search alerts..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="alerts-search"
          />

        </div>

        <Select
          value={severityFilter}
          onValueChange={setSeverityFilter}
        >

          <SelectTrigger
            className="w-full sm:w-[180px]"
            id="severity-filter"
          >

            <SelectValue placeholder="All Severities" />

          </SelectTrigger>

          <SelectContent>

            <SelectItem value="all">

              All Severities

            </SelectItem>

            <SelectItem value="critical">

              Critical

            </SelectItem>

            <SelectItem value="high">

              High

            </SelectItem>

            <SelectItem value="medium">

              Medium

            </SelectItem>

            <SelectItem value="low">

              Low

            </SelectItem>

          </SelectContent>

        </Select>

      </div>

      {/* Sections */}

      <div className="space-y-8">

        <AlertSection
          title="Critical Alerts"
          alerts={critical}
          accentColor="bg-red-500"
        />

        <AlertSection
          title="High Alerts"
          alerts={high}
          accentColor="bg-amber-500"
        />

        <AlertSection
          title="Recent Alerts"
          alerts={recent}
          accentColor="bg-blue-500"
        />

      </div>

      {filtered.length === 0 && (

        <div className="text-center py-12 text-muted-foreground text-sm">

          No alerts match your filters.

        </div>
      )}

    </div>
  )
}