import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Users, RefreshCw, ChevronLeft } from 'lucide-react';

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dang_ky')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching registrations:', error);
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const exportToCSV = () => {
    // Thêm BOM (Byte Order Mark) để Excel nhận diện đúng UTF-8
    const BOM = '\uFEFF';
    const header = ['STT', 'ID', 'Họ và tên', 'Ngày sinh', 'Cấp bậc/Chức vụ', 'Đơn vị', 'Số điện thoại', 'Email', 'Ghi chú', 'Ngày đăng ký'].join(',');
    
    const rows = registrations.map((reg, index) => {
      const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '';
      const formatDateTime = (d: string) => d ? new Date(d).toLocaleString('vi-VN') : '';
      
      return [
        index + 1,
        reg.id,
        `"${reg.full_name || ''}"`,
        `"${formatDate(reg.dob)}"`,
        `"${reg.rank || ''}"`,
        `"${reg.unit || ''}"`,
        `"${reg.phone || ''}"`,
        `"${reg.email || ''}"`,
        `"${(reg.note || '').replace(/"/g, '""')}"`,
        `"${formatDateTime(reg.created_at)}"`
      ].join(',');
    });

    const csvContent = BOM + header + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_dang_ky_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 selection:bg-red-100 selection:text-red-700 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <Users className="text-red-700" />
                Danh sách đăng ký
              </h2>
              <p className="text-sm text-slate-500 font-medium">Tổng số: {registrations.length} người tham gia</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchRegistrations}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors text-sm uppercase tracking-wider"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Làm mới
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-900/20 text-sm uppercase tracking-wider"
            >
              <Download size={16} />
              Xuất Excel (CSV)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
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
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 opacity-50" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                    Chưa có ai đăng ký
                  </td>
                </tr>
              ) : (
                registrations.map((reg, index) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{reg.full_name}</td>
                    <td className="px-6 py-4 text-slate-600">{reg.dob ? new Date(reg.dob).toLocaleDateString('vi-VN') : ''}</td>
                    <td className="px-6 py-4 text-slate-600">{reg.rank}</td>
                    <td className="px-6 py-4 text-slate-600">{reg.unit}</td>
                    <td className="px-6 py-4 text-slate-800 font-medium">{reg.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{reg.email}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={reg.note}>{reg.note}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(reg.created_at).toLocaleString('vi-VN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
