'use client';

import { use } from 'react';
import { useLinkStats } from '@/hooks/useLinkStats';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { StatsChart } from '@/components/dashboard/StatsChart';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TimeSeriesChart } from '@/components/dashboard/TimeSeriesChart';
import { PieChart } from '@/components/dashboard/PieChart';

export default function LinkStatsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { data: stats, isLoading, error } = useLinkStats(resolvedParams.slug);

  if (isLoading) {
    return <SkeletonLoader count={4} />;
  }

  if (error || !stats) {
    return <div className="text-center py-8">No stats available</div>;
  }

  return (
    <ErrorBoundary>
      <div className="animate-slide-up">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2" id="page-heading">
            Link Statistics
          </h1>
          <p className="text-slate-600">Track your link performance</p>
        </div>

        <div className="space-y-8">
          {/* Overview Metrics */}
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Clicks"
                value={stats.totalHits}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
              />
              <MetricCard
                title="Unique Visitors"
                value={stats.uniqueVisitors}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              <MetricCard
                title="Avg Clicks/Visitor"
                value={stats.averageClicksPerVisitor}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
              <MetricCard
                title="Growth Rate"
                value={`${stats.growthRate}%`}
                trend={{
                  value: Math.abs(stats.growthRate),
                  isPositive: stats.growthRate >= 0,
                }}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Time-Based Analytics */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Time-Based Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stats.dailyHits.length > 0 && (
                <TimeSeriesChart
                  title="Daily Hits"
                  data={stats.dailyHits.map((item) => ({
                    label: item.date,
                    value: item.count,
                  }))}
                  xAxisLabel="Date"
                />
              )}
              {stats.hourlyHits.length > 0 && (
                <TimeSeriesChart
                  title="Hourly Hits"
                  data={stats.hourlyHits.map((item) => ({
                    label: `${item.hour}:00`,
                    value: item.count,
                  }))}
                  xAxisLabel="Hour of Day"
                />
              )}
              {stats.weeklyHits.length > 0 && (
                <TimeSeriesChart
                  title="Weekly Hits"
                  data={stats.weeklyHits.map((item) => ({
                    label: item.day,
                    value: item.count,
                  }))}
                  xAxisLabel="Day of Week"
                />
              )}
              {stats.monthlyHits.length > 0 && (
                <TimeSeriesChart
                  title="Monthly Hits"
                  data={stats.monthlyHits.map((item) => ({
                    label: item.month,
                    value: item.count,
                  }))}
                  xAxisLabel="Month"
                />
              )}
            </div>
          </div>

          {/* Device & Platform Analytics */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Device & Platform Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stats.topDevices.length > 0 && (
                <PieChart
                  title="Device Types"
                  data={stats.topDevices.map((item) => ({
                    label: item.device,
                    value: item.count,
                  }))}
                />
              )}
              {stats.topOperatingSystems.length > 0 && (
                <StatsChart
                  title="Operating Systems"
                  data={stats.topOperatingSystems.map((item) => ({
                    label: item.os,
                    value: item.count,
                  }))}
                />
              )}
            </div>
          </div>

          {/* Visitor Insights */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Visitor Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard
                title="Return Visitor Rate"
                value={`${stats.returnVisitorRate}%`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              />
              <MetricCard
                title="Click Velocity"
                value={`${stats.clickVelocity.perHour}/hr`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Referrer Analytics */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Referrer Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChart
                title="Referrer Categories"
                data={[
                  { label: 'Social Media', value: stats.referrerCategories.social, color: '#3b82f6' },
                  { label: 'Search Engines', value: stats.referrerCategories.search, color: '#10b981' },
                  { label: 'Direct', value: stats.referrerCategories.direct, color: '#8b5cf6' },
                  { label: 'Email', value: stats.referrerCategories.email, color: '#f59e0b' },
                  { label: 'Other', value: stats.referrerCategories.other, color: '#6b7280' },
                ].filter((item) => item.value > 0)}
              />
              {stats.topReferers.length > 0 && (
                <StatsChart
                  title="Top Referers"
                  data={stats.topReferers.map((item) => ({
                    label: item.referer,
                    value: item.count,
                  }))}
                />
              )}
            </div>
          </div>

          {/* Geographic Analytics */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Geographic Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stats.topCountries.length > 0 && (
                <StatsChart
                  title="Top Countries"
                  data={stats.topCountries.map((item) => ({
                    label: item.country,
                    value: item.count,
                  }))}
                />
              )}
              {stats.topCities && stats.topCities.length > 0 && (
                <StatsChart
                  title="Top Cities"
                  data={stats.topCities.map((item) => ({
                    label: item.city,
                    value: item.count,
                  }))}
                />
              )}
            </div>
          </div>

          {/* Browser Analytics */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Browser Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stats.topBrowsers.length > 0 && (
                <StatsChart
                  title="Top Browsers"
                  data={stats.topBrowsers.map((item) => ({
                    label: item.browser,
                    value: item.count,
                  }))}
                />
              )}
              {stats.browserVersions.length > 0 && (
                <StatsChart
                  title="Browser Versions"
                  data={stats.browserVersions.map((item) => ({
                    label: `${item.browser} ${item.version}`,
                    value: item.count,
                  }))}
                />
              )}
            </div>
          </div>

          {/* Language Preferences */}
          {stats.topLanguages.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Language Preferences</h2>
              <StatsChart
                title="Top Languages"
                data={stats.topLanguages.map((item) => ({
                  label: item.language.toUpperCase(),
                  value: item.count,
                }))}
              />
            </div>
          )}

          {/* Peak Hours */}
          {stats.peakHours.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Peak Hours</h2>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {stats.peakHours.map((item, index) => (
                    <div key={index} className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">{item.hour}:00</p>
                      <p className="text-sm text-slate-600 mt-1">{item.count} clicks</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

