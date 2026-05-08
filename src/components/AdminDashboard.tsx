import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ClipboardCheck, Download, Power, RefreshCw, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

type AdminTab = 'registrations' | 'tests';
const PASSING_PERCENTAGE = 50;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('registrations');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testOpen, setTestOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    const { data, error: fetchError } = await supabase
      .from('dang_ky')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    setRegistrations(data || []);
  };

  const fetchTestResults = async () => {
    const { data, error: fetchError } = await supabase
      .from('kq_test')
      .select('id, full_name, rank_position, unit, score, max_score, percentage, total_questions, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    setTestResults(data || []);
  };

  const fetchTestStatus = async () => {
    const { data, error: fetchError } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'test_open')
      .maybeSingle();

    if (fetchError) throw fetchError;
    setTestOpen(data?.value?.open !== false);
  };

  const refreshAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchRegistrations(), fetchTestResults(), fetchTestStatus()]);
    } catch (err: any) {
      console.error('Admin fetch error:', err);
      setError(`Lỗi: ${err.message || 'Không thể tải dữ liệu'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const toggleTestStatus = async () => {
    const nextOpen = !testOpen;
    setTestLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('app_settings')
        .upsert(
          {
            key: 'test_open',
            value: { open: nextOpen },
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key' }
        );

      if (updateError) throw updateError;
      setTestOpen(nextOpen);
    } catch (err: any) {
      console.error('Toggle test status error:', err);
      setError(`Lỗi cập nhật trạng thái kiểm tra: ${err.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  const exportRegistrationsToCSV = () => {
    const BOM = '\uFEFF';
    const header = ['STT', 'ID', 'Họ và tên', 'Ngày sinh', 'Cấp bậc/Chức vụ', 'Đơn vị', 'Số điện thoại', 'Email', 'Ghi chú', 'Ngày đăng ký'].join(',');

    const rows = registrations.map((reg, index) => {
      const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '';
      const formatDateTime = (d: string) => d ? new Date(d).toLocaleString('vi-VN') : '';

      return [
        index + 1,
        reg.id,
        `"${reg.full_name || ''}"`,
        `"${formatDate(reg.birth_date)}"`,
        `"${reg.rank_position || ''}"`,
        `"${reg.unit || ''}"`,
        `"${reg.phone || ''}"`,
        `"${reg.email || ''}"`,
        `"${(reg.notes || '').replace(/"/g, '""')}"`,
        `"${formatDateTime(reg.created_at)}"`
      ].join(',');
    });

    downloadCSV(BOM + header + '\n' + rows.join('\n'), `danh_sach_dang_ky_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportTestResultsToExcel = () => {
    const rows = testResults.map((item) => {
      const score = Number(item.score ?? 0);
      const total = Number(item.max_score ?? item.total_questions ?? 30);
      const percentage = total > 0 ? (score / total) * 100 : 0;

      return {
        'Họ tên': item.full_name || '',
        'Cấp bậc/chức vụ': item.rank_position || '',
        'Đơn vị': item.unit || '',
        'Số câu trả lời đúng  .../30': `${score}/${total}`,
        'Đạt': percentage >= PASSING_PERCENTAGE ? 'Đạt' : 'Chưa đạt'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: ['Họ tên', 'Cấp bậc/chức vụ', 'Đơn vị', 'Số câu trả lời đúng  .../30', 'Đạt']
    });
    worksheet['!cols'] = [
      { wch: 28 },
      { wch: 24 },
      { wch: 28 },
      { wch: 26 },
      { wch: 12 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ket qua test');
    XLSX.writeFile(workbook, `ket_qua_kiem_tra_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-4 md:p-8 selection:bg-red-100 selection:text-red-700 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => window.location.href = '/'}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 shrink-0"
              aria-label="Quay lại trang chủ"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                {activeTab === 'registrations' ? <Users className="text-red-700" /> : <ClipboardCheck className="text-red-700" />}
                Quản lý hội nghị
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Đăng ký: {registrations.length} người | Kết quả kiểm tra: {testResults.length} bài
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap gap-3">
            <button
              onClick={toggleTestStatus}
              disabled={testLoading}
              className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-xl font-bold transition-colors text-xs sm:text-sm uppercase tracking-wider shadow-sm disabled:opacity-60 ${
                testOpen ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-red-700 hover:bg-red-800 text-white'
              }`}
            >
              <Power size={16} />
              {testLoading ? 'Đang cập nhật...' : testOpen ? 'Đang mở kiểm tra' : 'Đang đóng kiểm tra'}
            </button>
            <button
              onClick={refreshAll}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors text-xs sm:text-sm uppercase tracking-wider"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>
            <button
              onClick={activeTab === 'registrations' ? exportRegistrationsToCSV : exportTestResultsToExcel}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-900/20 text-xs sm:text-sm uppercase tracking-wider"
            >
              <Download size={16} />
              {activeTab === 'registrations' ? 'Xuất CSV' : 'Xuất Excel'}
            </button>
          </div>
        </div>

        <div className="mb-6 grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1 sm:flex sm:w-fit">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-3 sm:px-5 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wide sm:tracking-widest transition-all ${
              activeTab === 'registrations' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Danh sách đăng ký
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 sm:px-5 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wide sm:tracking-widest transition-all ${
              activeTab === 'tests' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Kết quả kiểm tra
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {activeTab === 'registrations' ? (
          <RegistrationsTable registrations={registrations} loading={loading} />
        ) : (
          <TestResultsTable testResults={testResults} loading={loading} />
        )}
      </div>
    </div>
  );
};

const RegistrationsTable = ({ registrations, loading }: { registrations: any[]; loading: boolean }) => (
  <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
    <table className="w-full min-w-[920px] text-left text-sm whitespace-nowrap">
      <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[11px] tracking-wider border-b border-slate-200">
        <tr>
          <th className="px-6 py-4">STT</th>
          <th className="px-6 py-4">Họ và tên</th>
          <th className="px-6 py-4">Ngày sinh</th>
          <th className="px-6 py-4">Cấp bậc/Chức vụ</th>
          <th className="px-6 py-4">Đơn vị</th>
          <th className="px-6 py-4">Số điện thoại</th>
          <th className="px-6 py-4">Email</th>
          <th className="px-6 py-4">Ghi chú</th>
          <th className="px-6 py-4">Ngày đăng ký</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {loading ? (
          <TableLoading colSpan={9} />
        ) : registrations.length === 0 ? (
          <TableEmpty colSpan={9} message="Chưa có ai đăng ký" />
        ) : (
          registrations.map((reg, index) => (
            <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-bold text-slate-500">{index + 1}</td>
              <td className="px-6 py-4 font-bold text-slate-800">{reg.full_name}</td>
              <td className="px-6 py-4 text-slate-600">{reg.birth_date ? new Date(reg.birth_date).toLocaleDateString('vi-VN') : ''}</td>
              <td className="px-6 py-4 text-slate-600">{reg.rank_position}</td>
              <td className="px-6 py-4 text-slate-600">{reg.unit}</td>
              <td className="px-6 py-4 text-slate-800 font-medium">{reg.phone}</td>
              <td className="px-6 py-4 text-slate-600">{reg.email}</td>
              <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={reg.notes}>{reg.notes}</td>
              <td className="px-6 py-4 text-slate-500 text-xs">{new Date(reg.created_at).toLocaleString('vi-VN')}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const TestResultsTable = ({ testResults, loading }: { testResults: any[]; loading: boolean }) => (
  <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
    <table className="w-full min-w-[760px] text-left text-sm whitespace-nowrap">
      <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[11px] tracking-wider border-b border-slate-200">
        <tr>
          <th className="px-6 py-4">STT</th>
          <th className="px-6 py-4">Họ và tên</th>
          <th className="px-6 py-4">Cấp bậc/Chức vụ</th>
          <th className="px-6 py-4">Đơn vị</th>
          <th className="px-6 py-4">Điểm</th>
          <th className="px-6 py-4">Tỷ lệ</th>
          <th className="px-6 py-4">Thời gian nộp</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {loading ? (
          <TableLoading colSpan={7} />
        ) : testResults.length === 0 ? (
          <TableEmpty colSpan={7} message="Chưa có kết quả kiểm tra" />
        ) : (
          testResults.map((item, index) => (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-bold text-slate-500">{index + 1}</td>
              <td className="px-6 py-4 font-bold text-slate-800">{item.full_name}</td>
              <td className="px-6 py-4 text-slate-600">{item.rank_position}</td>
              <td className="px-6 py-4 text-slate-600">{item.unit}</td>
              <td className="px-6 py-4 font-black text-red-700">{item.score}/{item.max_score || item.total_questions || 30}</td>
              <td className="px-6 py-4 font-bold text-green-800">{item.percentage ?? 0}%</td>
              <td className="px-6 py-4 text-slate-500 text-xs">{item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : ''}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const TableLoading = ({ colSpan }: { colSpan: number }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-400">
      <RefreshCw size={24} className="animate-spin mx-auto mb-2 opacity-50" />
      Đang tải dữ liệu...
    </td>
  </tr>
);

const TableEmpty = ({ colSpan, message }: { colSpan: number; message: string }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
      {message}
    </td>
  </tr>
);

export default AdminDashboard;
