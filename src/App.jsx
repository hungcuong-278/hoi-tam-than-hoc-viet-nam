import React, { useEffect, useRef, useState } from 'react';
import { structuredTimeline } from './data/timelineStructured';

export default function App() {
  const [language, setLanguage] = useState('vi');
  const isVi = language === 'vi';
  const [selectedDay, setSelectedDay] = useState("Tổng quan");
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Countdown to May 29 2026 08:00 Vietnam time (UTC+7)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date('2026-05-29T08:00:00+07:00').getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setCountdown({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // --- Registration form ---
  // Tracks when the form section became visible — used to calculate _fillTime for bot detection.
  // The Apps Script rejects submissions where _fillTime < 5000ms.
  const formOpenTimeRef = useRef(Date.now());
  const [formData, setFormData] = useState({
    Ho_Ten: '', Ngay_Sinh: '', Email: '', So_Dien_Thoai: '',
    Don_Vi: '', Chuc_Vu: '', Noi_Dung_Tham_Du: '',
  });
  const [formStatus, setFormStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [formMessage, setFormMessage] = useState('');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');

    const url = 'https://script.google.com/macros/s/AKfycbxvrVEjnGD7BrlhLVEHGZOXYXi2W75UBtfJukuuppKv3arJLXP0EHkNtdgf967FITrW/exec';
    const payload = {
      ...formData,
      _timestamp: Date.now(),
      _fillTime: Date.now() - formOpenTimeRef.current,
      _timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    try {
      await fetch(url + '?data=' + encodeURIComponent(JSON.stringify(payload)), {
        method: 'GET',
        mode: 'no-cors',
      });
      setFormStatus('success');
      setFormMessage('Đăng ký thành công! Ban Tổ chức sẽ xác nhận qua email của bạn.');
      setFormData({ Ho_Ten: '', Ngay_Sinh: '', Email: '', So_Dien_Thoai: '', Don_Vi: '', Chuc_Vu: '', Noi_Dung_Tham_Du: '' });
      formOpenTimeRef.current = Date.now();
    } catch {
      setFormStatus('error');
      setFormMessage('Lỗi kết nối, vui lòng kiểm tra mạng và thử lại!');
    }
  };

  // Reset fill-time clock when the registration form scrolls into view.
  useEffect(() => {
    const section = document.getElementById('dang-ky');
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          formOpenTimeRef.current = Date.now();
          observer.unobserve(section);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Setup scroll reveal observer matching the source script behavior
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-up').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);


  return (
    <div className="antialiased min-h-screen flex flex-col items-center selection:bg-gray-100 text-gray-900 relative">
      {/* Intro Background */}
      <div className="absolute top-0 left-0 w-full h-screen -z-10 bg-cover bg-center bg-[url('/anh-vinh-ha-long-2.png')] animate-bg-intro">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/25"></div>
      </div>

      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-3 flex items-center justify-between animate-header-intro transition-all duration-300 bg-white shadow-sm`}>
        <a href="#gioi-thieu" className="flex items-center select-none">
          <img
            src="/vpa-new-logo-transparent.png"
            alt="Hội Tâm Thần Học Việt Nam"
            className="h-11 object-contain"
          />
        </a>
        <nav className="hidden gap-x-4 md:flex">
          <a href="#gioi-thieu-ha-long" className="text-sm font-medium text-[#4B5563] hover:text-[#0D3C1F] transition-colors">{isVi ? 'Giới thiệu' : 'About'}</a>
          <a href="#timeline" className="text-sm font-medium text-[#4B5563] hover:text-[#0D3C1F] transition-colors">{isVi ? 'Sự kiện' : 'Timeline'}</a>
          <a href="#tai-tro" className="text-sm font-medium text-[#4B5563] hover:text-[#0D3C1F] transition-colors">{isVi ? 'Nhà tài trợ' : 'Sponsors'}</a>
          <a href="#dang-ky" className="text-sm font-medium text-[#4B5563] hover:text-[#0D3C1F] transition-colors">{isVi ? 'Đăng ký' : 'Register'}</a>
          <a href="#lien-he" className="text-sm font-medium text-[#4B5563] hover:text-[#0D3C1F] transition-colors">{isVi ? 'Liên hệ' : 'Contact'}</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="#dang-ky-cme" className="inline-flex items-center justify-center bg-[#3D7F61] text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded text-[10px] sm:text-xs font-medium tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-all hover:bg-[#2E6B50] shadow-sm whitespace-nowrap">
            Đăng ký CME
          </a>
          <a href="#dang-ky" className="inline-flex items-center justify-center bg-[#0D3C1F] text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded text-[10px] sm:text-xs font-medium tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-all hover:bg-[#155A2F] shadow-sm whitespace-nowrap">
            Đăng ký tham dự
          </a>
        </div>
      </header>

      <div className="w-full max-w-7xl flex flex-col relative min-h-screen" id="gioi-thieu">
        {/* Hero Section */}
        <main className="flex-grow flex flex-col text-center pt-24 px-6 pb-16 items-center justify-center gap-0">
          {/* Title */}
          <h1 className="text-white text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-5xl animate-title-intro drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]" style={{ fontFamily: '"Be Vietnam Pro", sans-serif' }}>
            {isVi ? 'Hội Tâm Thần Học Việt Nam' : 'Vietnam Psychiatric Association'}
          </h1>

          {/* Subject */}
          <div className="mt-7 animate-subtitle-intro">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/60 font-geist mb-2">
              {isVi ? 'Chủ đề' : 'Theme'}
            </p>
            <p className="text-lg md:text-2xl font-semibold text-white tracking-wide font-geist drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
              {isVi ? <>Sức Khỏe Tâm Thần Trong <span className="whitespace-nowrap">Bối Cảnh Mới</span></> : 'Mental Health In The New Context'}
            </p>
          </div>

          {/* Date & Venue */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 animate-subtitle-intro">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
              <iconify-icon icon="solar:calendar-bold" width="18" height="18" className="text-white/80 shrink-0"></iconify-icon>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-geist">Thời gian</p>
                <p className="text-sm font-semibold text-white font-geist">29 – 31 / 5 / 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
              <iconify-icon icon="solar:map-point-bold" width="18" height="18" className="text-white/80 shrink-0"></iconify-icon>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-geist">Địa điểm</p>
                <p className="text-sm font-semibold text-white font-geist">Hạ Long, Quảng Ninh</p>
              </div>
            </div>
          </div>

          {/* Register button */}
          <div className="mt-8 animate-btn-intro">
            <a href="#lich-trinh" className="inline-flex items-center justify-center gap-2 uppercase transition-all hover:opacity-90 text-xs font-medium text-white tracking-[0.15em] rounded px-8 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_4px_16px_rgba(0,0,0,0.3)] bg-[#0D3C1F] hover:bg-[#0D3C1F]/90">
              <iconify-icon icon="solar:calendar-bold" width="14" height="14"></iconify-icon>
              {isVi ? 'Xem lịch trình chi tiết' : 'View schedule'}
            </a>
          </div>

          {/* Countdown */}
          <div className="mt-10 animate-btn-intro">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-geist mb-4">
              {isVi ? 'Hội nghị sẽ chính thức khai mạc sau' : 'Conference opens in'}
            </p>
            <div className="flex items-center gap-3">
              {[
                { value: countdown.days,    label: isVi ? 'Ngày' : 'Days' },
                { value: countdown.hours,   label: isVi ? 'Giờ'  : 'Hours' },
                { value: countdown.minutes, label: isVi ? 'Phút' : 'Min' },
                { value: countdown.seconds, label: isVi ? 'Giây' : 'Sec' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 min-w-[60px] md:min-w-[72px]">
                  <span className="text-2xl md:text-3xl font-bold text-white font-geist tabular-nums">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.12em] text-white/50 font-geist mt-1">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Ha Long Section */}
      <section id="gioi-thieu-ha-long" className="w-full bg-white py-20 md:py-28 px-6 flex justify-center relative z-20">
        <div className="max-w-[1100px] w-full flex flex-col md:flex-row items-center gap-12 md:gap-16 reveal-up">
          {/* Image */}
          <div className="w-full md:w-[48%] shrink-0">
            <div className="relative rounded-[20px] overflow-hidden shadow-[0_8px_40px_rgba(13,60,31,0.12)]">
              <img
                src="/anh-vinh-ha-long-1.png"
                alt="Vịnh Hạ Long – Quảng Ninh"
                className="w-full h-full object-cover aspect-[4/3]"
              />
              <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2">
                <iconify-icon icon="solar:map-point-bold" width="16" height="16" className="text-[#0D3C1F]"></iconify-icon>
                <span className="text-[13px] font-medium text-[#0D3C1F] font-geist">Vịnh Hạ Long – Quảng Ninh</span>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="w-full md:w-[52%]">
            <div className="inline-flex items-center gap-2 bg-[#F0F7F4] rounded-full px-4 py-1.5 mb-6">
              <iconify-icon icon="solar:star-bold" width="14" height="14" className="text-[#F69066]"></iconify-icon>
              <span className="text-[11px] uppercase tracking-[0.18em] text-[#3D7F61] font-geist font-semibold">Chào mừng đến với Hạ Long</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#0D3C1F] leading-tight tracking-tight mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
              Kỳ quan thiên nhiên thế giới
            </h2>
            <div className="space-y-5 text-[15px] text-[#4A6B5A] leading-[1.85] font-geist">
              <p>
                <strong className="text-[#0D3C1F]">Hạ Long (Quảng Ninh)</strong> – vùng đất được thiên nhiên ưu ái ban tặng kỳ quan thiên nhiên thế giới, hội tụ vẻ đẹp kỳ vĩ của non nước mây trời – từ lâu đã mang trong mình sức sống mãnh liệt của một thành phố vươn tầm quốc tế. Hôm nay, trên hành trình đổi mới và bứt phá, Hạ Long không chỉ là đầu tàu kinh tế năng động của vùng Đông Bắc mà còn đang khẳng định vị thế quan trọng trong mạng lưới y tế khu vực, với nhiều thành tựu nổi bật về đầu tư cơ sở hạ tầng và nâng cao chất lượng chăm sóc sức khỏe chuyên sâu.
              </p>
              <p>
                Việc lựa chọn <strong className="text-[#0D3C1F]">Hạ Long</strong> là nơi tổ chức <strong className="text-[#0D3C1F]">Hội nghị</strong> quan trọng này không chỉ là sự ghi nhận đối với năng lực tổ chức sự kiện chuyên nghiệp và hệ sinh thái dịch vụ chất lượng cao của địa phương, mà còn thể hiện mong muốn kiến tạo một không gian học thuật uy tín, truyền cảm hứng và gắn kết. Hội nghị sẽ là cơ hội quý báu để các chuyên gia, nhà khoa học hàng đầu trong nước và quốc tế cùng hội tụ, trao đổi kinh nghiệm, chia sẻ tri thức và cập nhật những tiến bộ mới nhất trong chẩn đoán, điều trị và chăm sóc sức khỏe tâm thần tại Việt Nam.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0D3C1F] text-white text-sm font-semibold font-geist shrink-0">
                500+
              </div>
              <span className="text-[13px] text-[#4A6B5A] font-geist">Đại biểu từ khắp cả nước và quốc tế</span>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="w-full bg-[#FAF9F6] py-24 md:py-[100px] px-6 flex justify-center relative z-20" id="lich-trinh">
        <div className="max-w-[1100px] w-full flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-semibold text-[#0D3C1F] text-center max-w-3xl tracking-tight leading-tight reveal-up" style={{ fontFamily: '"Playfair Display", serif' }}>
            {isVi ? 'Chương trình chi tiết' : 'Detailed Agenda'}
          </h2>
          <p className="mt-6 text-[16px] text-[#4A6B5A] text-center max-w-[720px] leading-relaxed font-geist reveal-up delay-100">
            {isVi
              ? 'Chọn ngày để xem chi tiết lịch trình của hội nghị.'
              : 'Select a day to view the detailed conference schedule.'}
          </p>

          <div className="mt-12 w-full reveal-up delay-200">
            {/* Day tabs — cấp 1 */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {["Tổng quan", "Ngày 29-30/5/2026", "Ngày 31/5/2026"].map(day => (
                <button
                  key={day}
                  onClick={() => { setSelectedDay(day); setExpandedSessionId(null); }}
                  className={`px-6 py-2.5 border rounded text-[15px] font-medium transition-all font-geist ${
                    selectedDay === day
                      ? 'bg-[#0D3C1F] text-white border-[#0D3C1F]'
                      : 'bg-white text-[#0D3C1F] border-[#C5D4CC] hover:bg-[#F0F4F2]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Sessions — continuous scroll */}
            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
              {selectedDay === "Ngày 31/5/2026"
                ? ["Phiên toàn thể","Hội trường Hồng Quảng","Hội trường Yên Trung","Hội trường Đồng Sơn","Hội trường Yên Đức 1","Hội trường Yên Đức 2","Hội trường Yên Đức 3","Hội trường Thanh Lân 1","Hội trường Thanh Lân 2","Hội trường Kim Quy"].map(hall => {
                    const sessions = structuredTimeline.filter(s => s.daySection === "Ngày 31/5/2026" && s.hall === hall);
                    if (!sessions.length) return null;
                    return (
                      <React.Fragment key={hall}>
                        <div className="mt-4 px-4 py-2 bg-[#EEF4F1] rounded-lg">
                          <span className="text-[14px] font-semibold text-[#0D3C1F] font-geist">{hall}</span>
                        </div>
                        {sessions.map(session => (
                          <div key={session.id} className="bg-white border text-left border-[#E5EBE8] rounded-[16px] overflow-hidden shadow-sm hover:shadow transition-shadow">
                            <div className="px-6 pt-4 pb-3">
                              <span className="text-[15px] font-semibold text-[#0D3C1F]" style={{ fontFamily: '"Be Vietnam Pro", sans-serif' }}>
                                {session.title.replace('PHIÊN', 'Phiên')}
                              </span>
                            </div>
                            <div className="px-6 pb-6 border-t border-[#E5EBE8] pt-4">
                              {session.chuToa && (
                                <div className="mb-2 text-[13px] text-[#4A6B5A] leading-relaxed">
                                  <span className="font-semibold text-[#0D3C1F]">Chủ tọa: </span>
                                  {session.chuToa.split('; ').map((name, i, arr) => (
                                    <React.Fragment key={i}>
                                      <span className="whitespace-nowrap">{name}</span>
                                      {i < arr.length - 1 && <span>; </span>}
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}
                              {session.thuKy && (
                                <div className="mb-4 text-[13px] text-[#4A6B5A] leading-relaxed">
                                  <span className="font-semibold text-[#0D3C1F]">Thư ký: </span>
                                  {session.thuKy.split('; ').map((name, i, arr) => (
                                    <React.Fragment key={i}>
                                      <span className="whitespace-nowrap">{name}</span>
                                      {i < arr.length - 1 && <span>; </span>}
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}
                              <div
                                dangerouslySetInnerHTML={{ __html: session.html }}
                                className="custom-table-styles session-hall-table"
                              />
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    );
                  })
                : structuredTimeline
                    .filter(s => s.daySection === selectedDay)
                    .map(session => (
                      <div key={session.id} className="bg-white border text-left border-[#E5EBE8] rounded-[16px] overflow-hidden shadow-sm hover:shadow transition-shadow">
                        {session.daySection !== 'Tổng quan' && (
                          <div className="px-6 pt-4 pb-3 border-b border-[#E5EBE8]">
                            <span className="text-[15px] font-semibold text-[#0D3C1F]" style={{ fontFamily: '"Be Vietnam Pro", sans-serif' }}>
                              {session.title.replace('PHIÊN', 'Phiên')}
                            </span>
                          </div>
                        )}
                        <div className="px-6 pt-4 pb-6">
                          {session.chuToa && (
                            <div className="mb-2 text-[13px] text-[#4A6B5A] leading-relaxed">
                              <span className="font-semibold text-[#0D3C1F]">Chủ tọa: </span>
                              {session.chuToa.split('; ').map((name, i, arr) => (
                                <React.Fragment key={i}>
                                  <span className="whitespace-nowrap">{name}</span>
                                  {i < arr.length - 1 && <span>; </span>}
                                </React.Fragment>
                              ))}
                            </div>
                          )}
                          {session.thuKy && (
                            <div className="mb-4 text-[13px] text-[#4A6B5A] leading-relaxed">
                              <span className="font-semibold text-[#0D3C1F]">Thư ký: </span>
                              {session.thuKy.split('; ').map((name, i, arr) => (
                                <React.Fragment key={i}>
                                  <span className="whitespace-nowrap">{name}</span>
                                  {i < arr.length - 1 && <span>; </span>}
                                </React.Fragment>
                              ))}
                            </div>
                          )}
                          <div
                            dangerouslySetInnerHTML={{ __html: session.html }}
                            className={`custom-table-styles ${session.daySection === 'Tổng quan' ? 'session-overview-table' : 'session-hall-table'}`}
                          />
                        </div>
                      </div>
                    ))
              }
            </div>

            {/* Bottom day switcher */}
            <div className="max-w-4xl mx-auto w-full mt-10 pt-8 border-t border-[#E5EBE8]">
              <p className="text-center text-[12px] uppercase tracking-[0.2em] text-[#4A6B5A] font-geist font-semibold mb-5">
                Xem ngày khác
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {["Tổng quan", "Ngày 29-30/5/2026", "Ngày 31/5/2026"].map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDay(day);
                      setExpandedSessionId(null);
                      document.getElementById('lich-trinh')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`px-6 py-2.5 border rounded text-[15px] font-medium transition-all font-geist ${
                      selectedDay === day
                        ? 'bg-[#0D3C1F] text-white border-[#0D3C1F]'
                        : 'bg-white text-[#0D3C1F] border-[#C5D4CC] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="w-full bg-white py-24 md:py-[100px] px-6 flex justify-center relative z-20" id="tai-tro">
        <div className="max-w-[1100px] w-full flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-semibold text-[#0D3C1F] text-center max-w-3xl tracking-tight leading-tight reveal-up" style={{ fontFamily: '"Playfair Display", serif' }}>
            {isVi ? 'Nhà tài trợ' : 'Sponsors'}
          </h2>
          <p className="mt-6 text-[16px] text-[#4A6B5A] text-center max-w-[640px] leading-relaxed font-geist reveal-up delay-100">
            {isVi
              ? 'Hội nghị được đồng hành bởi các đối tác chiến lược trong lĩnh vực y tế, dược phẩm và công nghệ y tế.'
              : 'The conference is supported by strategic partners in healthcare, pharmaceuticals, and medical technology.'}
          </p>

          {/* Kim cương — 200M — 2 */}
          <div className="mt-16 w-full reveal-up delay-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
              <span className="text-[14px] uppercase tracking-[0.2em] text-[#B8980A] font-geist font-bold px-3">Kim cương</span>
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-10">
              {[
                { src: '/logo-egis.png', alt: 'EGIS' },
                { src: '/logo-eisai.png', alt: 'Eisai' },
              ].map((logo) => (
                <div key={logo.alt} className="flex items-center justify-center hover:-translate-y-1 transition-transform duration-300">
                  <img src={logo.src} alt={logo.alt} className="h-20 sm:h-24 max-w-[240px] object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Vàng — 150M — 1 */}
          <div className="mt-12 w-full reveal-up delay-150">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
              <span className="text-[12px] uppercase tracking-[0.2em] text-[#C0880A] font-geist font-bold px-3">Vàng</span>
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center justify-center hover:-translate-y-1 transition-transform duration-300">
                <img src="/logo-gigamed.png" alt="Gigamed" className="h-16 sm:h-20 max-w-[200px] object-contain" />
              </div>
            </div>
          </div>

          {/* Bạc — 100M — 2 */}
          <div className="mt-12 w-full reveal-up delay-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A9E92] font-geist font-semibold px-3">Bạc</span>
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
              {[
                { src: '/logo-hoang-duc.png', alt: 'Hoàng Đức' },
                { src: '/logo-gedeon-richter.png', alt: 'Gedeon Richter' },
              ].map((logo) => (
                <div key={logo.alt} className="flex items-center justify-center hover:-translate-y-1 transition-transform duration-300">
                  <img src={logo.src} alt={logo.alt} className="h-14 sm:h-16 max-w-[180px] object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Đồng — 50M — 11 */}
          <div className="mt-12 w-full reveal-up delay-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#A0724A] font-geist font-semibold px-3">Đồng</span>
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {[
                { src: '/logo-golden-gate.png',     alt: 'Golden Gate' },
                { src: '/logo-viatris.png',         alt: 'Viatris' },
                { src: '/logo-watson.png',          alt: 'Watson & Company' },
                { src: '/logo-vietcare.png',        alt: 'Vietcare Solutions' },
                { src: '/logo-biocodex.png',        alt: 'Biocodex' },
                { src: '/logo-ever-pharma.png',     alt: 'Ever Pharma' },
                { src: '/logo-torrent.png',         alt: 'Torrent Pharma' },
                { src: '/logo-novartis.png',        alt: 'Novartis' },
                { src: '/logo-abbott.png',          alt: 'Abbott' },
                { src: '/logo-y-med.png',           alt: 'Y-Med' },
                { src: '/logo-hyphens.png',         alt: 'Hyphens' },
              ].map((logo) => (
                <div key={logo.alt} className="flex items-center justify-center hover:-translate-y-0.5 transition-transform duration-300">
                  <img src={logo.src} alt={logo.alt} className="h-9 sm:h-10 max-w-[110px] object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Đồng tài trợ — 20M — 7 */}
          <div className="mt-12 w-full reveal-up delay-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#8A9E92] font-geist font-semibold px-3">Đồng tài trợ</span>
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-5 sm:gap-7">
              {[
                { src: '/logo-mosneuro.png',       alt: 'Mosneuro' },
                { src: '/logo-danapha.png',        alt: 'Danapha' },
                { src: '/logo-qdu-pharma.png',     alt: 'QDu Pharma' },
                { src: '/logo-davipharm.png',      alt: 'Davipharm' },
                { src: '/logo-nhat-viet.png',      alt: 'Nhật Việt' },
                { src: '/logo-pharma-science.png', alt: 'Pharma Science' },
                { src: '/logo-famed.png',          alt: 'Famed' },
                { src: '/logo-nevada.png',         alt: 'Nevada' },
              ].map((logo) => (
                <div key={logo.alt} className="flex items-center justify-center hover:-translate-y-0.5 transition-transform duration-300">
                  <img src={logo.src} alt={logo.alt} className="h-7 sm:h-8 max-w-[90px] object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CME Section */}
      <section className="w-full bg-[#FAF9F6] py-24 md:py-[100px] px-6 flex justify-center relative z-20" id="dang-ky-cme">
        <div className="max-w-[1100px] w-full reveal-up">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#3D7F61] font-geist font-semibold mb-4">Đào tạo liên tục CME</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#0D3C1F] max-w-3xl tracking-tight leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              Ứng dụng kỹ thuật Kích thích dòng điện một chiều xuyên sọ trong điều trị rối loạn trầm cảm
            </h2>
            <p className="mt-4 text-[14px] text-[#6B7280] font-geist">
              Hội Tâm Thần Học Việt Nam phối hợp Trường Đại học Y Hà Nội · Năm 2026
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left — thông tin */}
            <div className="flex-1 flex flex-col gap-4">

              {/* Thông tin nhanh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: 'solar:calendar-bold', label: 'Thời gian', value: '29/05/2026 · 8 tiết' },
                  { icon: 'solar:users-group-rounded-bold', label: 'Đối tượng', value: 'Bác sĩ tâm thần, bác sĩ đa khoa' },
                  { icon: 'solar:map-point-bold', label: 'Địa điểm', value: 'Bệnh viện Sức khỏe Tâm Thần Quảng Ninh' },
                  { icon: 'solar:diploma-bold', label: 'Chứng chỉ', value: 'Cấp theo quy định · Học phí 500.000 đ' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#E5EBE8]">
                    <div className="w-9 h-9 rounded-lg bg-[#EEF4F1] flex items-center justify-center shrink-0">
                      <iconify-icon icon={item.icon} width="18" height="18" className="text-[#3D7F61]"></iconify-icon>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A9E92] font-geist font-medium">{item.label}</p>
                      <p className="text-[13px] font-semibold text-[#0D3C1F] font-geist mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hồ sơ đăng ký */}
              <div className="bg-white rounded-xl border border-[#E5EBE8] p-5">
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A9E92] font-geist font-semibold mb-3">Hồ sơ đăng ký</p>
                <ul className="space-y-1.5">
                  {[
                    '01 đơn xin học (theo mẫu)',
                    '01 bản sao văn bằng tốt nghiệp Đại học (có chứng thực)',
                    '01 bản sao căn cước công dân (photo)',
                    'Giấy giới thiệu của cơ quan cử đi học (nếu có)',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-[#4A6B5A] font-geist">
                      <iconify-icon icon="solar:check-circle-bold" width="16" height="16" className="text-[#3D7F61] shrink-0 mt-0.5"></iconify-icon>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Liên hệ */}
              <div className="bg-[#0D3C1F] rounded-xl p-5 flex flex-col gap-1">
                <p className="text-[11px] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.5)] font-geist font-semibold mb-1">Liên hệ cán bộ phụ trách</p>
                <p className="text-[14px] font-semibold text-white font-geist">Đoàn Thị Huệ</p>
                <p className="text-[13px] text-[#8ABF9E] font-geist">SĐT: 0979 010 382</p>
                <a href="mailto:doanthihue@hmu.edu.vn" className="text-[13px] text-[#8ABF9E] hover:text-white font-geist transition-colors">doanthihue@hmu.edu.vn</a>
              </div>

              {/* Văn bản gốc */}
              <p className="text-[12px] text-[#8A9E92] font-geist italic">
                Thông báo số 14/TB-HTTHVN ngày 18/05/2026 — ký bởi PGS.TS. Nguyễn Văn Tuấn, Chủ tịch Hội Tâm Thần Học Việt Nam.
              </p>
            </div>

            {/* Right — QR + nút đăng ký */}
            <div className="w-full lg:w-[280px] flex flex-col items-center gap-5 shrink-0">
              <div className="bg-white rounded-2xl border border-[#E5EBE8] p-6 flex flex-col items-center gap-4 w-full shadow-[0_4px_16px_rgba(13,60,31,0.06)]">
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A9E92] font-geist font-semibold">Quét mã QR để đăng ký</p>
                <img src="/QR-Dangki.jpg" alt="QR đăng ký CME tDCS" className="w-48 h-48 object-contain rounded-lg" />
                <p className="text-[11px] text-[#8A9E92] font-geist text-center">hoặc nhấn nút bên dưới</p>
              </div>
              <a
                href="https://forms.gle/TcXJwfGCvt1eaRj28"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0D3C1F] hover:bg-[#155A2F] text-white px-6 py-3.5 rounded-lg text-[13px] font-semibold tracking-wide font-geist transition-all hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(13,60,31,0.2)]"
              >
                <iconify-icon icon="solar:document-add-bold" width="16" height="16"></iconify-icon>
                Đăng ký ngay
              </a>
              <p className="text-[11px] text-[#8A9E92] font-geist text-center">Số lượng giới hạn · Trên 50 học viên</p>
            </div>

          </div>

          {/* Văn bản chính thức nhúng PDF */}
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <iconify-icon icon="solar:document-text-bold" width="18" height="18" className="text-[#3D7F61]"></iconify-icon>
              <p className="text-[13px] font-semibold text-[#0D3C1F] font-geist">Văn bản thông báo chính thức</p>
            </div>
            {/* Mobile: 2 trang PDF render thành ảnh, xếp chồng */}
            <div className="md:hidden w-full rounded-2xl border border-[#E5EBE8] overflow-hidden shadow-[0_4px_16px_rgba(13,60,31,0.06)] flex flex-col">
              <img src="/tb-tdcs-trang-1.jpg" alt="Thông báo tuyển sinh tDCS – Trang 1" className="w-full block" />
              <img src="/tb-tdcs-trang-2.jpg" alt="Thông báo tuyển sinh tDCS – Trang 2" className="w-full block" />
              <a
                href="/TB%20tuy%E1%BB%83n%20sinh%20tDCS.pdf"
                download
                className="flex items-center justify-center gap-2 bg-[#0D3C1F] hover:bg-[#155A2F] text-white py-3.5 text-[13px] font-semibold font-geist transition-all"
              >
                <iconify-icon icon="solar:download-bold" width="16" height="16"></iconify-icon>
                Tải công văn chính thức (PDF)
              </a>
            </div>
            {/* Desktop: iframe embed */}
            <div className="hidden md:block w-full rounded-2xl overflow-hidden border border-[#E5EBE8] shadow-[0_4px_16px_rgba(13,60,31,0.06)]">
              <iframe
                src="/TB%20tuy%E1%BB%83n%20sinh%20tDCS.pdf"
                className="w-full"
                style={{ height: '680px' }}
                title="Thông báo tuyển sinh lớp tDCS"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Registration Section */}
      <section className="w-full bg-[#FAF9F6] py-24 md:py-[100px] px-6 flex justify-center relative z-20" id="dang-ky">
        <div className="max-w-[1100px] w-full flex flex-col md:flex-row gap-8 items-start reveal-up">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-semibold text-[#0D3C1F] tracking-tight leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              {isVi ? 'Đăng ký tham dự hội nghị ngày 31/5/2026' : 'Conference Registration – May 31, 2026'}
            </h2>
            <p className="mt-5 text-[16px] text-[#4A6B5A] leading-relaxed font-geist max-w-[52ch]">
              {isVi
                ? 'Vui lòng điền thông tin để Ban Tổ Chức xác nhận đăng ký. Chúng tôi sẽ phản hồi qua email trong thời gian sớm nhất.'
                : 'Please fill in your details for confirmation. The organizing committee will contact you by email shortly.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full md:w-1/2 bg-white rounded-[16px] p-6 shadow-[0_6px_20px_rgba(13,60,31,0.08)] border border-[#EAEFEB]">

            {/* Họ và tên */}
            <label className="text-[13px] text-[#4A6B5A] font-geist block mb-2">{isVi ? 'Họ và tên *' : 'Full name *'}</label>
            <input required name="Ho_Ten" value={formData.Ho_Ten} onChange={handleFormChange}
              type="text" placeholder={isVi ? 'Nhập họ và tên' : 'Enter full name'}
              className="w-full mb-4 px-4 py-3 rounded bg-[#F5F5F3] text-[#0D3C1F] outline-none focus:ring-2 focus:ring-[#3D7F61]" />

            {/* Ngày sinh */}
            <label className="text-[13px] text-[#4A6B5A] font-geist block mb-2">{isVi ? 'Ngày sinh *' : 'Date of birth *'}</label>
            <input required name="Ngay_Sinh" value={formData.Ngay_Sinh} onChange={handleFormChange}
              type="date"
              className="w-full mb-4 px-4 py-3 rounded bg-[#F5F5F3] text-[#0D3C1F] outline-none focus:ring-2 focus:ring-[#3D7F61]" />

            {/* Học hàm / Học vị */}
            <label className="text-[13px] text-[#4A6B5A] font-geist block mb-2">{isVi ? 'Học hàm / Học vị / Vị trí *' : 'Title / Degree / Position *'}</label>
            <select required name="Chuc_Vu" value={formData.Chuc_Vu} onChange={handleFormChange}
              className="w-full mb-4 px-4 py-3 rounded bg-[#F5F5F3] text-[#0D3C1F] outline-none focus:ring-2 focus:ring-[#3D7F61]">
              <option value="">{isVi ? 'Chọn học hàm / học vị' : 'Select title / degree'}</option>
              <option value="Bác sĩ Nội trú (BSNT.)">Bác sĩ Nội trú (BSNT.)</option>
              <option value="Thạc sĩ Bác sĩ (ThS. BS.)">Thạc sĩ Bác sĩ (ThS. BS.)</option>
              <option value="Thạc Sĩ Bác sĩ Nội trú (ThS. BSNT.)">Thạc Sĩ Bác sĩ Nội trú (ThS. BSNT.)</option>
              <option value="Tiến sĩ Bác sĩ (TS. BS.)">Tiến sĩ Bác sĩ (TS. BS.)</option>
              <option value="Bác sĩ Chuyên khoa 1 (BSCKI.)">Bác sĩ Chuyên khoa 1 (BSCKI.)</option>
              <option value="Bác sĩ Chuyên khoa 2 (BSCKII.)">Bác sĩ Chuyên khoa 2 (BSCKII.)</option>
              <option value="Phó Giáo sư Tiến sĩ Bác sĩ (PGS. TS. BS.)">Phó Giáo sư Tiến sĩ Bác sĩ (PGS. TS. BS.)</option>
              <option value="Giáo sư Tiến sĩ Bác sĩ (GS. TS. BS.)">Giáo sư Tiến sĩ Bác sĩ (GS. TS. BS.)</option>
              <option value="Điều dưỡng">Điều dưỡng</option>
              <option value="Kĩ thuật viên">Kĩ thuật viên</option>
              <option value="Kĩ sư">Kĩ sư</option>
              <option value="Khác">Khác</option>
            </select>

            {/* Đơn vị công tác */}
            <label className="text-[13px] text-[#4A6B5A] font-geist block mb-2">{isVi ? 'Đơn vị công tác *' : 'Organization *'}</label>
            <input required name="Don_Vi" value={formData.Don_Vi} onChange={handleFormChange}
              type="text" placeholder={isVi ? 'Bệnh viện / Trung tâm / Trường' : 'Hospital / Center / University'}
              className="w-full mb-4 px-4 py-3 rounded bg-[#F5F5F3] text-[#0D3C1F] outline-none focus:ring-2 focus:ring-[#3D7F61]" />

            {/* Email */}
            <label className="text-[13px] text-[#4A6B5A] font-geist block mb-2">{isVi ? 'Email liên hệ *' : 'Contact email *'}</label>
            <input required name="Email" value={formData.Email} onChange={handleFormChange}
              type="email" placeholder="example@email.com"
              className="w-full mb-4 px-4 py-3 rounded bg-[#F5F5F3] text-[#0D3C1F] outline-none focus:ring-2 focus:ring-[#3D7F61]" />

            {/* Số điện thoại */}
            <label className="text-[13px] text-[#4A6B5A] font-geist block mb-2">{isVi ? 'Số điện thoại *' : 'Phone number *'}</label>
            <input required name="So_Dien_Thoai" value={formData.So_Dien_Thoai} onChange={handleFormChange}
              type="tel" placeholder={isVi ? '0xxx xxx xxx' : '+84 xxx xxx xxx'}
              className="w-full mb-4 px-4 py-3 rounded bg-[#F5F5F3] text-[#0D3C1F] outline-none focus:ring-2 focus:ring-[#3D7F61]" />

            {/* Nội dung tham dự */}
            <label className="text-[13px] text-[#4A6B5A] font-geist block mb-2">{isVi ? 'Nội dung tham dự *' : 'Participation content *'}</label>
            <select required name="Noi_Dung_Tham_Du" value={formData.Noi_Dung_Tham_Du} onChange={handleFormChange}
              className="w-full mb-6 px-4 py-3 rounded bg-[#F5F5F3] text-[#0D3C1F] outline-none focus:ring-2 focus:ring-[#3D7F61]">
              <option value="Phiên toàn thể và báo cáo khoa học (31/5)">Phiên toàn thể và báo cáo khoa học (31/5)</option>
            </select>

            {/* Thông báo kết quả */}
            {formStatus === 'success' && (
              <div className="mb-4 px-4 py-3 rounded bg-[#ECFDF5] border border-[#6EE7B7] text-[#065F46] text-[13px]">
                ✅ {formMessage}
              </div>
            )}
            {formStatus === 'error' && (
              <div className="mb-4 px-4 py-3 rounded bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[13px]">
                ❌ {formMessage}
              </div>
            )}

            <button type="submit" disabled={formStatus === 'loading'}
              className="inline-flex items-center justify-center px-7 py-3.5 rounded text-xs font-medium tracking-[0.1em] uppercase transition-all bg-[#0D3C1F] hover:opacity-90 text-white gap-2 shadow-[0_4px_14px_rgba(13,60,31,0.2)] hover:-translate-y-0.5 w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
              {formStatus === 'loading'
                ? (isVi ? 'Đang gửi...' : 'Submitting...')
                : (isVi ? 'Gửi đăng ký' : 'Submit registration')}
            </button>
          </form>
        </div>
      </section>

      {/* Banner Image */}
      <div className="w-full h-[180px] md:h-[260px] relative overflow-hidden reveal-up z-20">
        <div className="absolute inset-0 bg-cover bg-center bg-[url('/anh-vinh-ha-long-17.png')] opacity-90"></div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#FAF9F6] pt-12 pb-8 px-6 flex justify-center relative z-20" id="lien-he">
        <div className="max-w-[1100px] w-full flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
            <a href="#gioi-thieu" className="flex items-center gap-3 select-none shrink-0">
              <img src="/vpa-new-logo-transparent.png" alt="Hội Tâm Thần Học Việt Nam" className="h-9 object-contain" />
              <span className="text-xs font-semibold text-[#4A6B5A] tracking-[0.05em] uppercase font-geist">Hội Tâm Thần Học Việt Nam</span>
            </a>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-xs font-medium text-[#4A6B5A] tracking-[0.05em] uppercase font-geist">
              <a href="#gioi-thieu" className="hover:text-[#0D3C1F] transition-colors">Về chúng tôi</a>
              <a href="#lien-he" className="hover:text-[#0D3C1F] transition-colors">Liên hệ</a>
            </div>
            <div className="flex items-center gap-6 text-[#0D3C1F] shrink-0">
              <a href="https://x.com" className="hover:opacity-70 transition-opacity" target="_blank" rel="noreferrer">
                <iconify-icon icon="simple-icons:x" width="16" height="16"></iconify-icon>
              </a>
              <a href="https://linkedin.com" className="hover:opacity-70 transition-opacity" target="_blank" rel="noreferrer">
                <iconify-icon icon="simple-icons:linkedin" width="16" height="16"></iconify-icon>
              </a>
            </div>
          </div>
          <div className="w-full h-px bg-gray-200/80 mb-8"></div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#8A9E92] font-geist">
            <p>Copyright © 2026 Hội Tâm Thần Học Việt Nam</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#lien-he" className="hover:text-[#0D3C1F] transition-colors">Thông báo</a>
              <a href="#lien-he" className="hover:text-[#0D3C1F] transition-colors">Điều khoản sử dụng</a>
              <a href="#lien-he" className="hover:text-[#0D3C1F] transition-colors">Chính sách bảo mật</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}