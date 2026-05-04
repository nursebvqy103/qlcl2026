import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Calendar, MapPin, Briefcase, Phone, Mail, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface RegistrationFormProps {
  onSuccess: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    rank_position: '',
    unit: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (
      !formData.full_name.trim() || 
      !formData.birth_date.trim() || 
      !formData.rank_position.trim() || 
      !formData.unit.trim() || 
      !formData.phone.trim() || 
      !formData.email.trim()
    ) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      setLoading(false);
      return;
    }

    try {
      const { error: submitError } = await supabase
        .from('dang_ky')
        .insert([
          {
            full_name: formData.full_name.trim(),
            birth_date: formData.birth_date ? formData.birth_date : null,
            rank_position: formData.rank_position.trim(),
            unit: formData.unit.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            notes: formData.notes.trim()
          }
        ]);

      if (submitError) {
        console.error('Supabase Error:', submitError);
        if (submitError.code === '23505') {
          setError('Số điện thoại này đã được đăng ký trên hệ thống.');
        } else {
          setError(`Lỗi CSDL: ${submitError.message}`);
        }
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError('Lỗi kết nối: ' + (err.message || 'Không thể kết nối đến máy chủ.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10">
        <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tight text-center">
          Thông tin đăng ký
        </h3>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Họ và tên <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input 
                  type="text" 
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  placeholder="Nhập họ và tên..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Ngày sinh <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="date" 
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Cấp bậc / Chức vụ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="rank_position"
                    value={formData.rank_position}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                    placeholder="Cấp bậc/Chức vụ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Đơn vị công tác <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                    placeholder="Đơn vị hiện tại"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                  placeholder="Email liên hệ"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Ghi chú thêm</label>
              <div className="relative">
                <div className="absolute top-3 left-4 flex items-center pointer-events-none">
                  <FileText size={18} className="text-slate-400" />
                </div>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all resize-none"
                  placeholder="Yêu cầu ăn ở, đi lại hoặc ghi chú khác..."
                ></textarea>
              </div>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={loading}
            className="w-full bg-red-700 hover:bg-red-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-red-900/20 uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CheckCircle2 size={20} />
            )}
            {loading ? 'Đang gửi...' : 'Xác nhận đăng ký'}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
