import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  FileText, 
  UserCheck, 
  Download, 
  ChevronRight, 
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RegistrationForm from './components/RegistrationForm';
import TestForm from './components/TestForm';

const App = () => {
  const [activeDay, setActiveDay] = useState(1);
  const [activeSection, setActiveSection] = useState('home');
  const [showModal, setShowModal] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showRegistrationFallback, setShowRegistrationFallback] = useState(false);

  // Link API lấy danh sách tài liệu từ Google Apps Script
  const docListApi = "https://script.google.com/macros/s/AKfycbz2h4SAcAObTyHcf3l_ZXYYIN_Dz7Bf3sQs7iRCxMDdBjR1H8f8WLIgCvtJZT8aT4Xx/exec"; 
  const registrationFormUrl = "/registration-form";

  // Lấy danh sách tài liệu khi vào mục Tài liệu
  const refreshDocs = () => {
    setLoadingDocs(true);
    // Thêm cache breaker để đảm bảo luôn lấy data mới nhất
    fetch(docListApi + "?action=getDocs&t=" + new Date().getTime()) 
      .then(res => res.json())
      .then(data => {
        console.log("Docs loaded:", data);
        if (Array.isArray(data)) {
          setDocuments(data);
        } else {
          setDocuments([]);
        }
        setLoadingDocs(false);
      })
      .catch(err => {
        console.error("Lỗi lấy tài liệu:", err);
        setDocuments([]); // Clear if error
        setLoadingDocs(false);
      });
  };

  useEffect(() => {
    if (activeSection === 'documents') {
      refreshDocs();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== 'registration') return;

    setShowRegistrationFallback(false);
    const fallbackTimer = window.setTimeout(() => {
      setShowRegistrationFallback(true);
    }, 3500);

    return () => window.clearTimeout(fallbackTimer);
  }, [activeSection]);

  const openRegistration = () => {
    setActiveSection('registration');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const shouldShowRegistrationFallback =
    showRegistrationFallback || (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent));

  // Lắng nghe tín hiệu thành công từ Iframe (Google Apps Script)
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Log để debug (người dùng có thể xem trong F12 Console)
      console.log("Received message from iframe:", event.data);
      
      if (event.data === 'registration_success' || (event.data && event.data.type === 'registration_success')) {
        setShowModal(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Link Google Drive được cung cấp
  const googleDriveLink = "https://drive.google.com/drive/folders/1ReHbH01_Av1YWmMbJ-APFnF3aliCReT6?usp=sharing";
  
  // Link các Logo
  const logoCQY = "https://i.postimg.cc/y6MhWVvZ/download.jpg";
  const logoQLKCB = "https://i.postimg.cc/85knNQT0/tai-xuong-(2).png";
  const logoBV103 = "https://i.postimg.cc/YSf7nw74/logo-103-min.png";
  const logoSponsor = "https://i.postimg.cc/q774DFWG/tai-xuong-(3).png";

  // Thông tin chương trình ngày 07/05/2026
  const agendaDay1 = [
    { time: '06:30 - 07:30', title: 'Ăn sáng', speakers: 'Nhà ăn tầng 4 - BVQY103' },
    { isModule: true, title: 'I. Khai mạc hội nghị tập huấn' },
    { time: '07:30 - 08:00', title: 'Đón tiếp Đại biểu', speakers: 'Ban Tổ chức' },
    { time: '08:00 - 08:10', title: 'Tuyên bố lý do, giới thiệu đại biểu', speakers: 'Ban Tổ chức' },
    { time: '08:10 - 08:20', title: 'Phát biểu khai mạc Hội nghị tập huấn', speakers: 'Thiếu tướng, GS.TS. Nguyễn Trường Giang - Cục Trưởng Cục Quân y, Tổng cục HC-KT, Bộ Quốc phòng' },
    { time: '08:20 - 08:30', title: 'Phát biểu chào mừng Hội nghị tập huấn', speakers: 'TS.BS. Hà Anh Đức - Cục trưởng Cục Quản lý Khám chữa bệnh, Bộ Y tế' },
    { isModule: true, title: 'II. Module 1: Tổng quan về QLCL Bệnh viện' },
    { time: '08:30 - 09:15', title: 'Tổng quan quản lý chất lượng bệnh viện', speakers: 'TS.BS. Hà Anh Đức - Cục trưởng Cục Quản lý khám chữa bệnh/Bộ Y tế' },
    { time: '09:15 - 09:45', title: 'Quản trị bệnh viện trong vấn đề đảm bảo cung ứng thuốc, vật tư y tế kịp thời cho công tác khám bệnh, chữa bệnh', speakers: 'GS.TS. Nguyễn Hoàng Định - Phó Giám đốc Bệnh viện Đại học Y Dược Thành phố Hồ Chí Minh' },
    { time: '09:45 - 10:00', title: 'Giải lao', speakers: '' },
    { time: '10:00 - 10:45', title: 'Ứng dụng chuyển đổi số trong quản lý, đánh giá chất lượng bệnh viện', speakers: 'ThS. Đào Nguyên Minh - Trưởng phòng Quản lý chất lượng và Chuyển giao kỹ thuật/Cục QLKCB/BYT' },
    { time: '10:45 - 11:30', title: 'Hệ thống quản lý chất lượng tại Bệnh viện Quân y 103', speakers: 'ThS. La Quang Hổ - Trưởng ban QLCL Bệnh viện/Bệnh viện Quân y 103' },
    { time: '11:30 - 12:30', title: 'Ăn trưa', speakers: 'Nhà ăn tầng 4 - BVQY103' },
    { isModule: true, title: 'III. Module 2: An toàn người bệnh' },
    { time: '13:30 - 14:15', title: 'Mục tiêu quốc tế về an toàn người bệnh', speakers: 'TS. Đinh Thùy Dương - Phó Giám đốc Khối Y tế Tập đoàn Sun Group' },
    { time: '14:15 - 15:00', title: 'Quản lý sự cố y khoa', speakers: 'TS. Đinh Thùy Dương - Phó Giám đốc Khối Y tế Tập đoàn Sun Group' },
    { time: '15:00 - 15:15', title: 'Giải lao', speakers: '' },
    { time: '15:15 - 16:30', title: 'Kỹ thuật phân tích nguyên nhân gốc rễ', speakers: 'TS. Đinh Thùy Dương - Phó Giám đốc Khối Y tế Tập đoàn Sun Group' },
    { time: '17:30 - 20:00', title: 'Gala Diner', speakers: 'Nhà ăn tầng 4 - BVQY103' },
  ];

  // Thông tin chương trình ngày 08/05/2026
  const agendaDay2 = [
    { time: '06:30 - 07:30', title: 'Ăn sáng', speakers: 'Nhà ăn tầng 4 - BVQY103' },
    { isModule: true, title: 'Sáng - Module 3: Công cụ & chỉ số chất lượng' },
    { time: '07:30 - 08:15', title: 'Công cụ quản lý chất lượng và quản trị rủi ro', speakers: 'TS. Đinh Thùy Dương - Phó Giám đốc Khối Y tế Tập đoàn Sun Group' },
    { time: '08:15 - 09:00', title: 'Xây dựng chỉ số chất lượng bệnh viện', speakers: 'TS. Đinh Thùy Dương - Phó Giám đốc Khối Y tế Tập đoàn Sun Group' },
    { time: '09:00 - 09:30', title: 'Thực hành xây dựng chỉ số chất lượng', speakers: 'TS. Đinh Thùy Dương - Phó Giám đốc Khối Y tế Tập đoàn Sun Group' },
    { time: '09:30 - 10:00', title: 'Thảo luận và giải đáp thắc mắc', speakers: 'Cục QLKCB & Chuyên gia JCI' },
    { time: '10:00 - 10:15', title: 'Kiểm tra đánh giá cuối khóa (Làm bài Test)', speakers: 'Cục Quân y' },
    { time: '10:15 - 10:30', title: 'Giải lao', speakers: '' },
    { isModule: true, title: 'Lễ Bế mạc' },
    { time: '10:30 - 10:45', title: 'Phát biểu Bế mạc', speakers: 'Đại tá, TS.BSCKII. Trần Duy Hưng, Phó Cục trưởng Cục Quân y/ Tổng cục HC-KT/Bộ Quốc phòng' },
    { time: '10:45 - 11:30', title: 'Trao chứng nhận chứng chỉ CME', speakers: 'Ban Tổ chức' },
  ];

  return (
    <div className="min-h-screen bg-[#fffcf5] text-slate-800 font-sans selection:bg-red-100 selection:text-red-700">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 min-h-14 sm:h-16 flex items-center justify-center">
          <div className="grid w-full grid-cols-5 items-center gap-0 sm:flex sm:w-auto sm:gap-4 md:gap-8 py-2 text-[10px] sm:text-[11px] font-black text-slate-500">
            <button 
              onClick={() => {
                setActiveSection('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className={`min-w-0 hover:text-red-700 transition uppercase tracking-tight sm:tracking-widest px-1 sm:px-2 py-2 text-center ${activeSection === 'home' && typeof window !== 'undefined' && window.scrollY < 500 ? 'text-red-700' : ''}`}
            >
              <span className="block leading-tight sm:inline sm:leading-normal">Trang<br className="sm:hidden" /> chủ</span>
            </button>
            <button onClick={openRegistration} className={`min-w-0 hover:text-red-700 transition uppercase tracking-tight sm:tracking-widest px-1 sm:px-2 py-2 text-center ${activeSection === 'registration' ? 'text-red-700' : ''}`}>
              <span className="block leading-tight sm:inline sm:leading-normal">Đăng<br className="sm:hidden" /> ký</span>
            </button>
            <button onClick={() => setActiveSection('agenda')} className={`min-w-0 hover:text-red-700 transition uppercase tracking-tight sm:tracking-widest px-1 sm:px-2 py-2 text-center ${activeSection === 'agenda' ? 'text-red-700' : ''}`}>
              <span className="block leading-tight sm:inline sm:leading-normal">Chương<br className="sm:hidden" /> trình</span>
            </button>
            <button onClick={() => setActiveSection('test')} className={`min-w-0 hover:text-red-700 transition uppercase tracking-tight sm:tracking-widest px-1 sm:px-2 py-2 text-center ${activeSection === 'test' ? 'text-red-700' : ''}`}>
              <span className="block leading-tight sm:inline sm:leading-normal">Kiểm<br className="sm:hidden" /> tra</span>
            </button>
            <button onClick={() => setActiveSection('documents')} className={`min-w-0 hover:text-red-700 transition uppercase tracking-tight sm:tracking-widest px-1 sm:px-2 py-2 text-center ${activeSection === 'documents' ? 'text-red-700' : ''}`}>
              <span className="block leading-tight sm:inline sm:leading-normal">Tài<br className="sm:hidden" /> liệu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {activeSection === 'home' && (
        <section id="cover" className="pt-24 sm:pt-32 pb-14 sm:pb-20 px-2 sm:px-4 lg:px-8 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-7xl mx-auto bg-white border border-slate-200 rounded-[1.5rem] sm:rounded-[3rem] p-4 sm:p-8 md:p-12 lg:p-16 shadow-2xl relative z-10 overflow-hidden"
        >
          {/* Top Logos Row */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 sm:gap-8 mb-10 sm:mb-12 px-0 sm:px-4 md:px-0">
            <div className="flex flex-col items-center justify-self-start">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center mb-2 shadow-xl border-4 border-white overflow-hidden">
                <img src={logoCQY} alt="Logo Cục Quân y" className="w-full h-full object-contain" />
              </div>
              <span className="text-[8px] sm:text-[10px] md:text-sm font-black text-green-800 text-center uppercase leading-tight tracking-tighter">Cục Quân Y</span>
            </div>
            <div className="flex flex-col items-center justify-self-center pt-16 sm:pt-24 md:pt-32">
              <p className="text-[9px] sm:text-xs md:text-base font-black text-green-800 uppercase tracking-normal sm:tracking-wider mb-3 text-center whitespace-nowrap">Đơn vị tổ chức</p>
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white overflow-hidden">
                <img src={logoBV103} alt="Logo Bệnh viện Quân y 103" className="w-full h-full object-contain p-1" />
              </div>
            </div>
            <div className="flex flex-col items-center justify-self-end">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center mb-2 shadow-xl border-4 border-white overflow-hidden text-center">
                <img src={logoQLKCB} alt="Logo Cục QLKCB" className="w-full h-full object-contain" />
              </div>
              <span className="text-[8px] sm:text-[10px] md:text-sm font-black text-green-800 text-center uppercase leading-tight tracking-tighter">Cục Quản Lý<br/>Khám Chữa Bệnh</span>
            </div>
          </div>

          {/* Title Branding */}
          <div className="text-center mb-12 border-b-2 border-slate-800/70 pb-8">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[clamp(1.6rem,5vw,3.75rem)] font-black text-red-600 uppercase leading-[1.15] mb-3 font-sans px-1"
            >
              HỘI NGHỊ TẬP HUẤN
            </motion.h2>
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[clamp(1.15rem,4.5vw,2.6rem)] font-black text-green-800 uppercase leading-[1.2] mb-0 font-sans px-1"
            >
              <span className="block sm:whitespace-nowrap">Quản lý chất lượng Bệnh viện năm 2026</span>
            </motion.h1>
          </div>

          <div className="max-w-5xl mx-auto bg-red-50/70 border-y-2 border-red-100 py-6 md:py-8 px-4 md:px-8 mb-14 text-center">
            <p className="text-[12px] md:text-lg text-red-700 font-black italic leading-relaxed">
              Chủ đề: "Quản trị chất lượng và an toàn người bệnh: từ tiêu chí, tiêu chuẩn quốc gia đến chuẩn mực quốc tế trong kỷ nguyên số"
            </p>
          </div>

          {/* Info Section */}
          <div className="flex flex-col items-center gap-12 mb-16">
            <div className="text-center">
               <p className="text-[10px] font-black text-green-800 uppercase tracking-widest mb-4">Đơn vị tài trợ</p>
               <div className="flex flex-col items-center gap-3">
                 <div className="h-16 md:h-20 flex items-center justify-center px-8 py-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <img src={logoSponsor} alt="Sponsor" className="h-full w-auto object-contain hover:scale-110 transition-all duration-500" />
                 </div>
                 <p className="max-w-full text-[10px] md:text-sm font-black text-green-800 uppercase tracking-tighter sm:whitespace-nowrap">Công ty TNHH Astellas Pharma Việt Nam</p>
               </div>
            </div>
          </div>

          {/* Location & Time */}
          <div className="text-center space-y-4 mb-14">
            <div className="inline-flex max-w-full items-center gap-3 bg-slate-50 px-5 sm:px-8 py-3 rounded-2xl sm:rounded-full border border-slate-100">
              <Calendar size={20} className="text-red-700" />
              <span className="text-slate-800 font-black text-xs sm:text-sm uppercase tracking-wider">Hà Nội, 07 - 08/05/2026</span>
            </div>
            <div className="flex max-w-3xl mx-auto items-start justify-center gap-2 text-[11px] sm:text-xs text-slate-700 font-black uppercase tracking-wide sm:tracking-widest leading-relaxed">
              <MapPin size={16} className="text-red-700 mt-0.5 shrink-0" />
              <span>Hội trường Tòa nhà S1 - Số 261 Phùng Hưng, Hà Đông</span>
            </div>
          </div>

            <div className="flex flex-col md:flex-row justify-center gap-4">
               <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openRegistration}
                className="w-full md:w-auto justify-center bg-red-700 text-white px-6 sm:px-8 py-4 rounded-xl font-black text-base sm:text-lg shadow-xl shadow-red-900/20 flex items-center gap-2 group"
              >
                Đăng ký tham dự
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection('agenda')}
                className="w-full md:w-auto justify-center bg-white border-2 border-green-800 text-green-800 px-6 sm:px-8 py-4 rounded-xl font-black text-base sm:text-lg hover:bg-green-50 transition-all flex items-center gap-2"
              >
                Xem chương trình
              </motion.button>
            </div>
          </motion.div>

          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-100/50 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-100/50 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          {/* Contact Section Integrated into Home */}
          <footer id="contact" className="mt-32 pt-24 pb-16 border-t border-slate-100">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24 text-left">
                <div className="lg:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
                    <h3 className="font-black text-xl sm:text-2xl text-slate-900 tracking-tighter uppercase leading-tight sm:leading-none">Bệnh viện Quân y 103</h3>
                  </div>
                  <p className="text-slate-500 text-sm mb-10 max-w-md leading-relaxed">
                    Chuyên nghiệp - Hiệu quả - An toàn - Hợp tác.
                  </p>
                </div>

                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-100 pb-4">Liên hệ BTC</h4>
                  <div className="space-y-8">
                    <div>
                      <p className="font-bold text-slate-900 text-sm mb-1">Thượng tá La Quang Hồ</p>
                      <p className="text-[11px] text-slate-500 uppercase tracking-tighter mb-2">Trưởng ban QLCL</p>
                      <a href="tel:0985939115" className="text-red-700 font-black text-sm">0985.939.115</a>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm mb-1">Trung tá Lê Trần Hải Đăng</p>
                      <p className="text-[11px] text-slate-500 uppercase tracking-tighter mb-2">Trợ lý Phòng Điều trị</p>
                      <a href="tel:0978105179" className="text-red-700 font-black text-sm">0978.105.179</a>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-100 pb-4">Địa điểm</h4>
                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <MapPin size={18} className="text-slate-300 shrink-0" />
                      <p className="text-[11px] font-medium text-slate-600 leading-relaxed uppercase tracking-tight">
                        Tòa nhà S1 - BVQY 103 <br/> Số 261 Phùng Hưng, Hà Đông, Hà Nội
                      </p>
                    </div>
                    <a href="http://www.benhvien103.vn" target="_blank" className="text-blue-600 font-black text-[11px] uppercase tracking-widest hover:underline">benhvien103.vn</a>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-16 border-t border-slate-100 flex flex-col items-center gap-4">
                <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.8em]">TẬP HUẤN QLCLBV - 2026</p>
                <a 
                  href="/admin" 
                  className="text-[9px] text-slate-200 hover:text-slate-400 transition-colors uppercase tracking-widest font-bold"
                >
                  Quản lý
                </a>
              </div>
            </div>
          </footer>
        </section>
      )}


      {/* Registration Section */}
      {activeSection === 'registration' && (
        <section id="registration" className="pt-20 bg-slate-50 min-h-screen">
          <div className="flex min-h-[calc(100dvh-5rem)] flex-col">
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <button 
                onClick={() => setActiveSection('home')}
                className="flex items-center gap-2 text-slate-500 hover:text-red-700 font-bold transition-colors uppercase tracking-widest text-[10px]"
              >
                <ChevronRight size={14} className="rotate-180" />
                Quay lại
              </button>
              <div className="flex flex-col items-center">
                <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">ĐĂNG KÝ THAM GIA TẬP HUẤN</h2>
                <p className="text-[9px] text-slate-400 font-medium">QUẢN LÝ CHẤT LƯỢNG BỆNH VIỆN NĂM 2026</p>
              </div>
              <div className="w-10"></div> {/* Placeholder to keep header centered */}
            </div>
            
            <div className="flex-1 bg-slate-50 py-8">
              <RegistrationForm onSuccess={() => setShowModal(true)} />
            </div>
          </div>
        </section>
      )}

      {/* Agenda Section */}
      {activeSection === 'agenda' && (
        <section id="agenda" className="py-24 px-4 bg-white min-h-[60vh]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-tight font-display">Chương trình chi tiết</h2>
            <div className="w-20 h-1.5 bg-green-700 mx-auto rounded-full" />
          </div>

          <div className="flex justify-center mb-12 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl w-fit mx-auto">
            <button 
              onClick={() => setActiveDay(1)}
              className={`px-8 py-4 rounded-xl font-black transition-all text-xs uppercase tracking-widest ${activeDay === 1 ? 'bg-white text-red-700 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Ngày 07/05
            </button>
            <button 
              onClick={() => setActiveDay(2)}
              className={`px-8 py-4 rounded-xl font-black transition-all text-xs uppercase tracking-widest ${activeDay === 2 ? 'bg-white text-red-700 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Ngày 08/05
            </button>
          </div>

          <motion.div 
            key={activeDay}
            initial={{ opacity: 0, x: activeDay === 1 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {(activeDay === 1 ? agendaDay1 : agendaDay2).map((item, index) => (
              <div 
                key={index} 
                className={`${item.isModule ? 'bg-green-800 text-white p-4 px-8 rounded-2xl mb-2 mt-6' : 'flex flex-col md:flex-row items-start md:items-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow'}`}
              >
                {item.isModule ? (
                  <h3 className="text-lg font-black uppercase tracking-wide">{item.title}</h3>
                ) : (
                  <>
                    <div className="w-full md:w-48 shrink-0 flex items-center text-red-700 font-bold mb-4 md:mb-0 text-sm">
                      <Clock size={16} className="mr-3 opacity-50" />
                      {item.time}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                        {item.title}
                      </h4>
                      {item.speakers && (
                        <div className="text-slate-500 text-[11px] font-bold flex items-center uppercase tracking-tight">
                          <UserCheck size={14} className="mr-2 text-green-600" />
                          {item.speakers}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Additional Info from image */}
            <div className="mt-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
               <div className="space-y-4">
                 <p className="text-xs text-slate-600 font-bold">
                   <span className="text-red-700 font-black">• Lưu ý:</span> Đại biểu Quân nhân: Quân phục mùa hè thường dùng. Đại biểu khác: Trang phục lịch sự, trang trọng.
                 </p>
                 <div className="pt-4 border-t border-slate-200">
                   <p className="text-xs text-slate-600 font-black uppercase tracking-widest mb-4">• Thông tin liên hệ:</p>
                   <div className="grid md:grid-cols-2 gap-4">
                     <div className="flex items-start gap-3">
                       <span className="text-slate-400 font-bold text-xs">1.</span>
                       <div>
                         <p className="text-xs font-bold text-slate-900">Thượng tá La Quang Hổ</p>
                         <p className="text-[10px] text-slate-500 uppercase">Trưởng ban QLCL/BVQY 103</p>
                         <p className="text-red-700 font-black text-xs">0985.939.115</p>
                       </div>
                     </div>
                     <div className="flex items-start gap-3">
                       <span className="text-slate-400 font-bold text-xs">2.</span>
                       <div>
                         <p className="text-xs font-bold text-slate-900">Trung tá Lê Trần Hải Đăng</p>
                         <p className="text-[10px] text-slate-500 uppercase">Trợ lý Phòng Điều trị/CQY</p>
                         <p className="text-red-700 font-black text-xs">0978.105.179</p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
        </section>
      )}

      {/* Test Section */}
      {activeSection === 'test' && (
        <section id="test" className="py-24 px-4 bg-slate-50 min-h-screen pt-24 text-center">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight text-emerald-900">Kiểm tra đánh giá cuối khóa</h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Hội nghị tập huấn quản lý chất lượng bệnh viện năm 2026</p>
            </div>
            <TestForm />
          </div>
        </section>
      )}

      {/* Documents Section */}
      {activeSection === 'documents' && (
        <section id="documents" className="py-24 px-4 bg-white min-h-screen pt-24 text-center">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black mb-4 uppercase tracking-tighter text-emerald-900 whitespace-nowrap">Tài liệu tập huấn</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Tự động cập nhật từ thư viện hệ thống</p>
              <button 
                onClick={refreshDocs}
                disabled={loadingDocs}
                className="flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-[12px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 active:scale-95 disabled:opacity-50"
              >
                <Clock size={16} className={loadingDocs ? "animate-spin" : ""} />
                Làm mới danh sách
              </button>
            </div>
            
            {loadingDocs ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-red-700 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Đang kết nối thư viện...</p>
              </div>
            ) : selectedDoc ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-700 shadow-sm">
                      <FileText size={24} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-base line-clamp-1">{selectedDoc.name}</h4>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Chế độ xem trực tuyến</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedDoc(null)}
                    className="px-6 py-3 bg-slate-200 hover:bg-slate-900 hover:text-white rounded-2xl text-[10px] font-black uppercase transition-all tracking-widest active:scale-95"
                  >
                    Đóng
                  </button>
                </div>
                <div className="w-full aspect-[3/4] md:aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl relative">
                  <iframe 
                    src={selectedDoc.viewUrl} 
                    className="w-full h-full border-none bg-white"
                    title={selectedDoc.name}
                  ></iframe>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.length > 0 ? (
                  documents.map((doc, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedDoc(doc)}
                      className="group p-5 sm:p-6 bg-slate-50 hover:bg-white border border-slate-100 hover:border-red-700/30 rounded-2xl text-left transition-all cursor-pointer hover:shadow-2xl hover:shadow-red-900/5 grid grid-cols-[84px_minmax(0,1fr)] gap-4 items-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-14 h-14 bg-white group-hover:bg-red-50 rounded-2xl flex items-center justify-center text-red-700 transition-colors shadow-sm">
                          <FileText size={28} />
                        </div>
                        <span className="text-[10px] font-black text-red-700 uppercase tracking-wide text-center">Xem chi tiết</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-base sm:text-lg leading-snug break-words group-hover:text-red-700 transition-colors">{doc.name}</h4>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
                    <Download size={48} className="text-slate-200 mb-6" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Hiện tại chưa có tài liệu mới</p>
                  </div>
                )}
              </div>
            )}

            {!selectedDoc && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-14 p-5 sm:p-6 bg-emerald-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-emerald-900/20"
              >
                <div className="text-center md:text-left">
                  <h4 className="text-white font-black uppercase text-[12px] mb-1 tracking-tight">Thư viện Google Drive</h4>
                  <p className="text-emerald-200 font-bold text-[12px] uppercase tracking-wide">Xem và tải trực tiếp tại thư mục gốc của ban tổ chức</p>
                </div>
                <a 
                  href={googleDriveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-red-700 hover:bg-white hover:text-red-700 text-white px-6 py-3 rounded-xl font-black text-[12px] uppercase tracking-wide transition-all shadow-lg shadow-red-900/30 active:scale-95"
                >
                  Mở Thư Mục Drive
                </a>
              </motion.div>
            )}
          </div>
        </section>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowModal(false);
                setActiveSection('home');
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 w-full max-w-lg relative z-10 text-center border border-slate-100"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-10 leading-tight uppercase tracking-tight">
                Chúc mừng bạn đã đăng ký tham gia tập huấn quản lý chất lượng bệnh viện năm 2026 thành công. Vui lòng bấm nút quay lại để trở về trang chủ
              </h3>
              
              <button 
                onClick={() => {
                  setShowModal(false);
                  setActiveSection('home');
                }}
                className="w-full bg-green-800 hover:bg-slate-900 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-900/20 uppercase tracking-[0.2em] text-xs"
              >
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
