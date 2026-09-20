import React, { useState } from 'react';
import {
  Shield,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Database,
  Settings,
  BarChart3,
  FileText,
  UserCheck,
  MapPin,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import {
  usePendingSubmissions,
  useApproveSubmission,
  useRejectSubmission,
  useCases
} from '@/hooks/useCases';
import { useAuth } from '@/contexts/AuthContext';
import { useVisitorAnalytics } from '@/hooks/useVisitorTracking';
import { useNews, useDeleteNews, NewsArticle } from '@/hooks/useNews';
import NewsModal from '@/components/NewsModal';

const CASE_TYPE_OPTIONS = [
  { value: 'death', label: 'Death' },
  { value: 'assault', label: 'Assault' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'unlawful_arrest', label: 'Unlawful arrest' },
  { value: 'abduction', label: 'Abduction' },
  { value: 'other', label: 'Other' },
];

const severityBadgeClass = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-900/60 text-red-300 border-red-500/40';
    case 'high':
      return 'bg-orange-900/60 text-orange-300 border-orange-500/40';
    case 'medium':
      return 'bg-yellow-900/50 text-yellow-300 border-yellow-500/30';
    default:
      return 'bg-blue-900/50 text-blue-300 border-blue-500/30';
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [newsModalMode, setNewsModalMode] = useState<'create' | 'edit'>('create');
  const [caseTypeSelections, setCaseTypeSelections] = useState<Record<string, string>>({});

  // Data hooks
  const { data: cases, isLoading: casesLoading } = useCases();
  const pendingSubmissions = usePendingSubmissions();
  const { data: newsArticles, isLoading: newsLoading } = useNews();
  const deleteNews = useDeleteNews();

  // Get visitor analytics
  const { data: visitorAnalytics, isLoading: analyticsLoading } = useVisitorAnalytics();

  // Calculate dynamic analytics from actual data
  const totalCases = cases?.length || 0;
  const totalSubmissions = pendingSubmissions.data?.length || 0;
  const recentCases = cases?.filter(c => {
    const dateStr = c.created_at || c.date;
    if (!dateStr) return false;
    const caseDate = new Date(dateStr);
    if (isNaN(caseDate.getTime())) return false;
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return caseDate >= dayAgo;
  }).length || 0;

  // Action hooks
  const approveSubmission = useApproveSubmission();
  const rejectSubmission = useRejectSubmission();

  // Calculate statistics
  const totalPendingSubmissions = pendingSubmissions.data?.length || 0;
  const totalPending = totalPendingSubmissions;

  const thisMonthCases = cases?.filter(c => {
    if (!c.date) return false;
    const caseDate = new Date(c.date);
    if (isNaN(caseDate.getTime())) return false;
    const now = new Date();
    return caseDate.getMonth() === now.getMonth() && caseDate.getFullYear() === now.getFullYear();
  }).length || 0;

  // News management functions
  const handleCreateNews = () => {
    setSelectedNews(null);
    setNewsModalMode('create');
    setIsNewsModalOpen(true);
  };

  const handleEditNews = (article: NewsArticle) => {
    setSelectedNews(article);
    setNewsModalMode('edit');
    setIsNewsModalOpen(true);
  };

  const handleDeleteNews = async (id: string) => {
    if (confirm('Are you sure you want to delete this news article?')) {
      try {
        await deleteNews.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white overflow-x-hidden">
      {/* Floating Navigation Header */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl max-w-7xl w-full">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">PBT Admin</h1>
                <p className="text-xs text-gray-300 hidden sm:block">Administrative Dashboard</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">System Online</span>
              </div>
              <div className="text-sm text-gray-300">
                Welcome, <span className="font-medium text-white">{(user as any)?.full_name || (user as any)?.username || user?.email}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/')}
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Back to Site
              </Button>
              <Button
                onClick={logout}
                size="sm"
                variant="outline"
                className="border-red-500/50 text-red-300 hover:bg-red-500/10"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-8 h-8 text-red-400" />
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-xl text-gray-300">
            Manage case submissions, news, and platform operations
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Cases */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-black/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 border-blue-500/30">
                Published
              </Badge>
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
              {casesLoading ? '...' : totalCases}
            </div>
            <p className="text-sm text-gray-400">Total Published Cases</p>
          </div>

          {/* Pending Reviews */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-black/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300 border-yellow-500/30">
                Pending
              </Badge>
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
              {totalPending}
            </div>
            <p className="text-sm text-gray-400">Awaiting Review</p>
          </div>

          {/* This Month */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-black/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-green-900/50 text-green-300 border-green-500/30">
                Recent
              </Badge>
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2">
              {casesLoading ? '...' : thisMonthCases}
            </div>
            <p className="text-sm text-gray-400">Cases This Month</p>
          </div>

          {/* System Status */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-black/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <Badge variant="secondary" className="bg-green-900/50 text-green-300 border-green-500/30">
                Online
              </Badge>
            </div>
            <div className="text-3xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
              {(() => {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
                return `${daysSinceStart}d`;
              })()}
            </div>
            <p className="text-sm text-gray-400">Days Online</p>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-black/50 border border-white/10 rounded-xl p-1 mb-8">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                Manual Submissions ({totalPendingSubmissions})
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300"
              >
                <Users className="w-4 h-4 mr-2" />
                Site Users
              </TabsTrigger>
              <TabsTrigger
                value="news"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                News Management
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-red-400" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setSelectedTab('submissions')}
                      className="w-full justify-start bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      disabled={totalPendingSubmissions === 0}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Review {totalPendingSubmissions} Manual Submissions
                    </Button>
                    <Button
                      onClick={() => setSelectedTab('news')}
                      className="w-full justify-start bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Manage News
                    </Button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-red-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {pendingSubmissions.data?.slice(0, 3).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <div>
                            <p className="text-sm font-medium">{submission.victim_name}</p>
                            <p className="text-xs text-gray-400">{submission.location}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300 border-yellow-500/30">
                          Pending
                        </Badge>
                      </div>
                    ))}
                    {(!pendingSubmissions.data || pendingSubmissions.data.length === 0) && (
                      <p className="text-center text-gray-400 py-4">No recent submissions</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Manual Submissions Tab */}
            <TabsContent value="submissions" className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-red-400" />
                  Manual Case Submissions
                </h3>
                <div className="space-y-4">
                  {pendingSubmissions.data?.map((submission) => {
                    const isScraped = submission.reporter_name === 'Automated Scraper';
                    const needsCaseType = !submission.case_type;
                    const selectedType = caseTypeSelections[submission.id];
                    const incidentDate = submission.incident_date ? new Date(submission.incident_date) : null;
                    return (
                    <div key={submission.id} className="bg-black/30 rounded-xl p-6 border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-white">
                            {submission.victim_name || 'Unknown victim'}
                            {isScraped && (
                              <Badge variant="secondary" className="ml-2 bg-purple-900/50 text-purple-300 border-purple-500/30 align-middle">
                                Auto-scraped
                              </Badge>
                            )}
                          </h4>
                          {submission.title && (
                            <p className="text-sm text-gray-300 italic">{submission.title}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {[submission.location, submission.county].filter(Boolean).join(', ') || 'Unknown location'}
                            </span>
                            {incidentDate && !isNaN(incidentDate.getTime()) && (
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {incidentDate.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {submission.case_type ? (
                              <Badge variant="secondary" className="bg-red-900/50 text-red-300 border-red-500/30">
                                {submission.case_type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            ) : (
                              <select
                                value={selectedType || ''}
                                onChange={(e) =>
                                  setCaseTypeSelections((prev) => ({ ...prev, [submission.id]: e.target.value }))
                                }
                                className="bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500/50"
                              >
                                <option value="">Assign case type...</option>
                                {CASE_TYPE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}
                            {submission.severity && (
                              <Badge variant="secondary" className={severityBadgeClass(submission.severity)}>
                                Severity: {submission.severity.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          {submission.source_url && (
                            <a
                              href={submission.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-blue-400 hover:text-blue-300 underline truncate max-w-xl"
                            >
                              Source: {submission.source_url}
                            </a>
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-yellow-900/50 text-yellow-300 border-yellow-500/30">
                          Pending Review
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-300 mb-2"><strong>Description:</strong></p>
                        <p className="text-sm text-gray-400 bg-black/20 p-3 rounded-lg">
                          {submission.description}
                        </p>
                      </div>

                      <div className="mb-4 text-sm text-gray-400">
                        <p><strong>Reporter:</strong> {submission.reporter_name || 'Anonymous'}{submission.reporter_contact ? ` (${submission.reporter_contact})` : ''}</p>
                        <p><strong>Submitted:</strong> {new Date(submission.created_at).toLocaleString()}</p>
                      </div>

                      {/* Display submitted photos */}
                      {submission.photo_urls && submission.photo_urls.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-300 mb-2"><strong>Photos ({submission.photo_urls.length}):</strong></p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {submission.photo_urls.map((photoUrl, idx) => (
                              <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-white/10">
                                <img 
                                  src={photoUrl} 
                                  alt={`Evidence ${idx + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() => window.open(photoUrl, '_blank')}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display submitted video links */}
                      {submission.video_urls && submission.video_urls.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-300 mb-2"><strong>Video Links ({submission.video_urls.length}):</strong></p>
                          <div className="space-y-1">
                            {submission.video_urls.map((videoUrl, idx) => (
                              <a 
                                key={idx}
                                href={videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-400 hover:text-blue-300 underline truncate"
                              >
                                {videoUrl}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={() =>
                            approveSubmission.mutate({
                              submissionId: submission.id,
                              caseType: needsCaseType ? selectedType : undefined,
                            })
                          }
                          disabled={approveSubmission.isPending || (needsCaseType && !selectedType)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & Publish
                        </Button>
                        <Button
                          onClick={() => rejectSubmission.mutate({ submissionId: submission.id })}
                          disabled={rejectSubmission.isPending}
                          variant="outline"
                          className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                  {(!pendingSubmissions.data || pendingSubmissions.data.length === 0) && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-xl text-gray-400 mb-2">No pending submissions</p>
                      <p className="text-gray-500">All manual submissions have been reviewed</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Site Analytics */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-red-400" />
                    Site Analytics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">Total Visitors</p>
                        <p className="text-xs text-gray-400">All time unique visitors</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {analyticsLoading ? '...' : visitorAnalytics?.totalVisitors || 0}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">Visitors Today</p>
                        <p className="text-xs text-gray-400">Unique visitors in last 24 hours</p>
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        {analyticsLoading ? '...' : visitorAnalytics?.visitorsToday || 0}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">This Week</p>
                        <p className="text-xs text-gray-400">Visitors in last 7 days</p>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">
                        {analyticsLoading ? '...' : visitorAnalytics?.visitorsThisWeek || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Users */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-red-400" />
                    Admin Users
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">A</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user?.user_metadata?.full_name || user?.email || 'Admin User'}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-900/50 text-green-300 border-green-500/30">
                        {user?.role || 'Admin'}
                      </Badge>
                    </div>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-400">Admin management coming soon</p>
                    </div>
                  </div>
                </div>
              </div>


            </TabsContent>

            {/* News Management Tab */}
            <TabsContent value="news" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">News Management</h2>
                <Button onClick={handleCreateNews} className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create News Article
                </Button>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                {newsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400">Loading news articles...</div>
                  </div>
                ) : newsArticles && newsArticles.length > 0 ? (
                  <div className="space-y-4">
                    {newsArticles.map((article) => (
                      <div key={article.id} className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-white">{article.title}</h3>
                              <Badge
                                variant={article.status === 'published' ? 'default' : 'secondary'}
                                className={article.status === 'published' ? 'bg-green-600' : 'bg-yellow-600'}
                              >
                                {article.status}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={article.source === 'scraped' ? 'border-purple-500 text-purple-400' : 'border-blue-500 text-blue-400'}
                              >
                                {article.source === 'scraped' ? 'Automated' : 'Admin'}
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">
                              By {article.author} • {article.category}
                            </p>
                            {article.excerpt && (
                              <p className="text-gray-400 text-sm mb-2">{article.excerpt}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Created: {new Date(article.created_at).toLocaleDateString()}</span>
                              {article.published_at && (
                                <span>Published: {new Date(article.published_at).toLocaleDateString()}</span>
                              )}
                              {article.tags && article.tags.length > 0 && (
                                <span>Tags: {article.tags.join(', ')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditNews(article)}
                              className="border-white/20 text-gray-300 hover:bg-white/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteNews(article.id)}
                              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No News Articles</h3>
                    <p className="text-gray-400 mb-4">Create your first news article to get started.</p>
                    <Button onClick={handleCreateNews} className="bg-red-600 hover:bg-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create News Article
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* News Modal */}
        <NewsModal
          isOpen={isNewsModalOpen}
          onClose={() => setIsNewsModalOpen(false)}
          article={selectedNews}
          mode={newsModalMode}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
