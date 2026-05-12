import React, { useEffect, useRef, useState } from 'react';
import { structuredTimeline } from './data/timelineStructured';

export default function App() {
  const [language, setLanguage] = useState('vi');
  const isVi = language === 'vi';
  const [selectedDay, setSelectedDay] = useState("Tổng quan");
  const [selectedHall, setSelectedHall] = useState(null);
  const [expandedSessionId, setExpandedSessionId] = useState(null);

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

    const url = 'https://script.google.com/macros/s/AKfycbxPW0vP8YdsuBhsJyIgO3pMeWeSFIBnemWRAP2oipzvgOlLQ9JHezpc96cMoI6pG6BM/exec';
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

      <div className="w-full max-w-7xl flex flex-col relative min-h-screen" id="gioi-thieu">
        {/* Header */}
        <header className="md:px-12 flex z-10 w-full pt-6 pr-6 pb-6 pl-6 relative items-center justify-between animate-header-intro">
          <a href="#gioi-thieu" className="flex items-center select-none">
            <img 
              src="/vpa-logo.jpg" 
              alt="Hội Tâm Thần Học Việt Nam" 
              className="mix-blend-multiply h-11 object-contain"
            />
          </a>
          <nav className="hidden gap-x-4 md:flex">
            <a href="#gioi-thieu" className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">{isVi ? 'Giới thiệu' : 'About'}</a>
            <a href="#timeline" className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">{isVi ? 'Sự kiện' : 'Timeline'}</a>
            <a href="#tai-tro" className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">{isVi ? 'Nhà tài trợ' : 'Sponsors'}</a>
            <a href="#dang-ky" className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">{isVi ? 'Đăng ký' : 'Register'}</a>
            <a href="#lien-he" className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">{isVi ? 'Liên hệ' : 'Contact'}</a>
          </nav>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-1 rounded border border-white/30 p-1">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`px-2 py-1 text-[10px] tracking-wider rounded ${isVi ? 'bg-white text-[#0D3C1F] font-semibold' : 'text-white/70'}`}
              >
                VN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-[10px] tracking-wider rounded ${!isVi ? 'bg-white text-[#0D3C1F] font-semibold' : 'text-white/70'}`}
              >
                EN
              </button>
            </div>
            <button type="button" className="text-xs tracking-widest font-medium text-white/70 hover:text-white uppercase transition-colors hidden sm:block drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              {isVi ? 'Đăng nhập' : 'Log in'}
            </button>
            <a href="#dang-ky" className="inline-flex items-center justify-center text-white px-5 py-2.5 rounded text-xs font-medium tracking-[0.15em] uppercase transition-all shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)] hover:opacity-90 bg-[#0D3C1F]">
              {isVi ? 'Đăng ký tham dự' : 'Register now'}
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col text-center pt-0 px-6 pb-16 items-center justify-center gap-0">
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
      <section className="w-full bg-white py-20 md:py-28 px-6 flex justify-center relative z-20">
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
              ? 'Chọn ngày và hội trường để xem chi tiết lịch trình của hội nghị.'
              : 'Select a day and hall to view the detailed conference schedule.'}
          </p>

          <div className="mt-12 w-full reveal-up delay-200">
            {/* Day tabs — cấp 1 */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {["Tổng quan", "Ngày 29-30/5/2026", "Ngày 31/5/2026"].map(day => (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    setSelectedHall(day === "Ngày 31/5/2026" ? "Phiên toàn thể" : null);
                    setExpandedSessionId(null);
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

            {/* Hall sub-tabs — cấp 2, chỉ hiện cho Ngày 31 */}
            {selectedDay === "Ngày 31/5/2026" && (
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {["Phiên toàn thể","Hội trường Hồng Quảng","Hội trường Yên Trung","Hội trường Đồng Sơn","Hội trường Yên Đức 1","Hội trường Yên Đức 2","Hội trường Yên Đức 3","Hội trường Thanh Lân 1","Hội trường Thanh Lân 2","Hội trường Kim Quy"].map(hall => (
                  <button
                    key={hall}
                    onClick={() => { setSelectedHall(hall); setExpandedSessionId(null); }}
                    className={`px-2.5 py-1.5 sm:px-4 sm:py-2 border rounded text-[11px] sm:text-[14px] font-medium transition-all font-geist ${
                      selectedHall === hall
                        ? 'bg-[#3D7F61] text-white border-[#3D7F61]'
                        : 'bg-white text-[#3D7F61] border-[#B8CEC5] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    {hall}
                  </button>
                ))}
              </div>
            )}

            {/* Sessions */}
            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
              {structuredTimeline
                .filter(s =>
                  s.daySection === selectedDay &&
                  (selectedDay !== "Ngày 31/5/2026" || s.hall === selectedHall)
                )
                .map(session => {
                  const alwaysOpen = true;
                  const isOpen = alwaysOpen || expandedSessionId === session.id;
                  return (
                    <div key={session.id} className="bg-white border text-left border-[#E5EBE8] rounded-[16px] overflow-hidden shadow-sm hover:shadow transition-shadow">
                      {!alwaysOpen ? (
                        <button
                          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#F0F4F2]/50 transition-colors"
                          onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                        >
                          <span className="text-[17px] font-semibold text-[#0D3C1F]" style={{ fontFamily: '"Playfair Display", serif' }}>
                            {session.title.replace('PHIÊN', 'Phiên')}
                          </span>
                          <span className="text-[#3D7F61] shrink-0 ml-4 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            ▼
                          </span>
                        </button>
                      ) : (
                        <div className="px-6 pt-5 pb-2">
                          <span className="text-[17px] font-semibold text-[#0D3C1F]" style={{ fontFamily: '"Playfair Display", serif' }}>
                            {session.title.replace('PHIÊN', 'Phiên')}
                          </span>
                        </div>
                      )}

                      {isOpen && (
                        <div className="px-6 pb-6 overflow-hidden border-t border-[#E5EBE8] pt-4">
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
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Bottom day switcher — cho Tổng quan & Ngày 29-30 */}
            {selectedDay !== "Ngày 31/5/2026" && (
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
                        setSelectedHall(day === "Ngày 31/5/2026" ? "Phiên toàn thể" : null);
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
            )}

            {/* Bottom hall switcher — chỉ hiện cho Ngày 31 */}
            {selectedDay === "Ngày 31/5/2026" && (
              <div className="max-w-4xl mx-auto w-full mt-10 pt-8 border-t border-[#E5EBE8]">
                <p className="text-center text-[12px] uppercase tracking-[0.2em] text-[#4A6B5A] font-geist font-semibold mb-5">
                  Chuyển sang hội trường khác
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Phiên toàn thể","Hội trường Hồng Quảng","Hội trường Yên Trung","Hội trường Đồng Sơn","Hội trường Yên Đức 1","Hội trường Yên Đức 2","Hội trường Yên Đức 3","Hội trường Thanh Lân 1","Hội trường Thanh Lân 2","Hội trường Kim Quy"].map(hall => (
                    <button
                      key={hall}
                      onClick={() => {
                        setSelectedHall(hall);
                        setExpandedSessionId(null);
                        document.getElementById('lich-trinh')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`px-2.5 py-1.5 sm:px-4 sm:py-2 border rounded text-[11px] sm:text-[14px] font-medium transition-all font-geist ${
                        selectedHall === hall
                          ? 'bg-[#3D7F61] text-white border-[#3D7F61]'
                          : 'bg-white text-[#3D7F61] border-[#B8CEC5] hover:bg-[#F0F4F2]'
                      }`}
                    >
                      {hall}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

          {/* Bạc — 100M — 1 */}
          <div className="mt-12 w-full reveal-up delay-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A9E92] font-geist font-semibold px-3">Bạc</span>
              <div className="h-px flex-1 bg-[#E5EBE8]"></div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center justify-center hover:-translate-y-1 transition-transform duration-300">
                <img src="/logo-hoang-duc.png" alt="Hoàng Đức" className="h-14 sm:h-16 max-w-[180px] object-contain" />
              </div>
            </div>
          </div>

          {/* Đồng — 50M — 12 */}
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
                { src: '/logo-gedeon-richter.png',  alt: 'Gedeon Richter' },
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
              ].map((logo) => (
                <div key={logo.alt} className="flex items-center justify-center hover:-translate-y-0.5 transition-transform duration-300">
                  <img src={logo.src} alt={logo.alt} className="h-7 sm:h-8 max-w-[90px] object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="w-full bg-[#FAF9F6] py-24 md:py-[100px] px-6 flex justify-center relative z-20" id="dang-ky">
        <div className="max-w-[1100px] w-full flex flex-col md:flex-row gap-8 items-start reveal-up">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-semibold text-[#0D3C1F] tracking-tight leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              {isVi ? 'Đăng ký tham dự' : 'Registration'}
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
              <option value="">{isVi ? 'Chọn nội dung tham dự' : 'Select participation content'}</option>
              <option value="Toàn bộ hội nghị (29-31/5)">Toàn bộ hội nghị (29-31/5)</option>
              <option value="Phiên đào tạo CME (29-30/5)">Phiên đào tạo CME (29-30/5)</option>
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
            <a href="#gioi-thieu" className="flex items-center select-none shrink-0">
              <img src="/vpa-logo.jpg" alt="Hội Tâm Thần Học Việt Nam" className="mix-blend-multiply h-7 object-contain" />
            </a>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-xs font-medium text-[#4A6B5A] tracking-[0.05em] uppercase font-geist">
              <a href="#gioi-thieu" className="hover:text-[#0D3C1F] transition-colors">Hội Tâm Thần Học Việt Nam</a>
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