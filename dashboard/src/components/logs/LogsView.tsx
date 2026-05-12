import { useEffect, useState, useMemo } from 'react'
import { isSameDay } from 'date-fns'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'

import {
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import API from "@/services/api"

function formatTimestamp(ts: string): string {

  if (!ts) return "-"

  const d = new Date(ts)

  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function SeverityDot({
  severity
}: {
  severity: string
}) {

  const colors: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-slate-400',
    info: 'bg-emerald-500',
  }

  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${colors[severity?.toLowerCase()] || 'bg-slate-400'} flex-shrink-0`}
    />
  )
}

const PAGE_SIZE = 10

export default function LogsView() {

  const [logs, setLogs] = useState<any[]>([])

  const [search, setSearch] = useState('')

  const [typeFilter, setTypeFilter] =
    useState<string>('all')

  const [dateFilter, setDateFilter] =
    useState<Date | null>(null)

  const [page, setPage] = useState(1)

  const fetchLogs = async () => {

    try {

      const response = await API.get(
        "/logs/recent"
      )

      setLogs(response.data)

    } catch (err) {

      console.error(err)
    }
  }

  useEffect(() => {

    fetchLogs()

    const interval = setInterval(
      fetchLogs,
      3000
    )

    return () => clearInterval(interval)

  }, [])

  const filtered = useMemo(() => {

    let result = logs

    if (typeFilter !== 'all') {

      result = result.filter(
        l => l.logfile === typeFilter
      )
    }

    if (dateFilter) {

      result = result.filter(
        l =>
          l.timestamp &&
          isSameDay(
            new Date(l.timestamp),
            dateFilter
          )
      )
    }

    if (search.trim()) {

      const q = search.toLowerCase()

      result = result.filter(
        l =>
          l.message?.toLowerCase().includes(q) ||
          l.source?.toLowerCase().includes(q) ||
          l.event_name?.toLowerCase().includes(q) ||
          String(l.id).includes(q)
      )
    }

    return result

  }, [
    logs,
    search,
    typeFilter,
    dateFilter
  ])

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  )

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  return (

    <div className="space-y-6" id="logs-view">

      <div>

        <h1 className="text-lg font-semibold text-foreground">
          Logs
        </h1>

        <p className="text-sm text-muted-foreground">
          Real-time log entries from all monitored sources
        </p>

      </div>

      {/* Filters */}

      <div className="flex flex-col sm:flex-row gap-3">

        <div className="relative flex-1">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search logs..."
            className="pl-9"
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
            id="logs-search"
          />

        </div>

        <div className="flex gap-3">

          <DatePicker
            date={dateFilter}
            onDateChange={(d) => {
              setDateFilter(d)
              setPage(1)
            }}
            id="date-picker-btn"
          />

          <Select
            value={typeFilter}
            onValueChange={v => {
              setTypeFilter(v)
              setPage(1)
            }}
          >

            <SelectTrigger
              className="w-[160px]"
              id="log-type-filter"
            >

              <SelectValue placeholder="All Types" />

            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">
                All Types
              </SelectItem>

              <SelectItem value="System">
                System
              </SelectItem>

              <SelectItem value="Security">
                Security
              </SelectItem>

              <SelectItem value="Application">
                Application
              </SelectItem>

            </SelectContent>

          </Select>

        </div>

      </div>

      {/* Table */}

      <div className="rounded-lg border border-border overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm" id="logs-table">

            <thead className="sticky top-0 z-10">

              <tr className="bg-muted/60 border-b border-border">

                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Timestamp
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Source
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Event
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Severity
                </th>

                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Message
                </th>

              </tr>

            </thead>

            <tbody>

              {paginated.map((log, i) => (

                <tr
                  key={log.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors duration-100 ${i % 2 === 1 ? 'bg-muted/10' : ''}`}
                  id={`log-row-${log.id}`}
                >

                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">

                    {formatTimestamp(log.timestamp)}

                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">

                    {log.source || "-"}

                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">

                    <span className="text-xs text-muted-foreground">

                      {log.event_name || "-"}

                    </span>

                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">

                    <div className="flex items-center gap-1.5">

                      <SeverityDot severity={log.severity} />

                      <span className="text-xs text-foreground">

                        {log.severity || "-"}

                      </span>

                    </div>

                  </td>

                  <td className="px-4 py-3">

                    <span className="font-mono text-xs text-foreground/80 line-clamp-1">

                      {log.message || "-"}

                    </span>

                  </td>

                </tr>

              ))}

              {paginated.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground text-sm"
                  >

                    No log entries match your filters.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Pagination */}

      <div className="flex items-center justify-between">

        <p className="text-xs text-muted-foreground">

          Showing {
            ((page - 1) * PAGE_SIZE) + 1
          }–{
            Math.min(
              page * PAGE_SIZE,
              filtered.length
            )
          } of {filtered.length} entries

        </p>

        <div className="flex items-center gap-1">

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            id="logs-prev-page"
          >

            <ChevronLeft className="h-4 w-4" />

          </Button>

          {Array.from(
            { length: totalPages },
            (_, i) => i + 1
          ).map(p => (

            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => setPage(p)}
            >

              {p}

            </Button>

          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            id="logs-next-page"
          >

            <ChevronRight className="h-4 w-4" />

          </Button>

        </div>

      </div>

    </div>
  )
}