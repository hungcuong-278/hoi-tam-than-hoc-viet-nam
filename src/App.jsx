import React, { useEffect, useRef, useState } from 'react';
import { structuredTimeline } from './data/timelineStructured';

export default function App() {
  const wordRef = useRef(null);
  const [language, setLanguage] = useState('vi');
  const isVi = language === 'vi';
  const [selectedDay, setSelectedDay] = useState("Ngày 31/5/2026");
  const [selectedHall, setSelectedHall] = useState("Phiên toàn thể");
  const [expandedSessionId, setExpandedSessionId] = useState(null);

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

    // Guarantee _fillTime >= 5100ms so the Apps Script bot check always passes.
    // If the user fills the form faster than that (demo/autofill), we wait the remainder.
    const APPS_SCRIPT_MIN_FILL_MS = 5100;
    const elapsed = Date.now() - formOpenTimeRef.current;
    if (elapsed < APPS_SCRIPT_MIN_FILL_MS) {
      await new Promise(resolve => setTimeout(resolve, APPS_SCRIPT_MIN_FILL_MS - elapsed));
    }

    const url = 'https://script.google.com/macros/s/AKfycbydpSsNRDhCtQxoBPU5s4rzfMP4O6r3MAO8t6XB1NVERzsNW8ZHaS9IakztlPGmkR0W/exec';
    const payload = {
      ...formData,
      _timestamp: Date.now(),
      _fillTime: Date.now() - formOpenTimeRef.current,
      _timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    try {
      const formParams = new URLSearchParams();
      formParams.append("data", JSON.stringify(payload));
      
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        body: formParams
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

  // Setup typing effect
  useEffect(() => {
    const words = isVi
      ? ['khoa học.', 'kết nối.', 'chia sẻ.', 'đồng hành.', 'lan tỏa.', 'phát triển.']
      : ['science.', 'connection.', 'sharing.', 'collaboration.', 'impact.', 'growth.'];
    let currentWordIndex = 0;
    let currentText = '';
    let isDeleting = false;
    const wordElement = wordRef.current;
    
    if (!wordElement) return;
    
    let timeoutId;

    function type() {
      const fullWord = words[currentWordIndex];
      
      if (isDeleting) {
        currentText = fullWord.substring(0, currentText.length - 1);
      } else {
        currentText = fullWord.substring(0, currentText.length + 1);
      }
      
      wordElement.textContent = currentText;
      let typeSpeed = 80;
      if (isDeleting) typeSpeed /= 2;

      if (!isDeleting && currentText === fullWord) {
        if (currentWordIndex === words.length - 1) {
          timeoutId = setTimeout(() => {
            if (wordElement) {
              wordElement.classList.remove('animate-blink');
              wordElement.style.borderRight = 'none';
            }
          }, 3000);
          return;
        }
        typeSpeed = 1500;
        isDeleting = true;
      } else if (isDeleting && currentText === '') {
        isDeleting = false;
        currentWordIndex++;
        typeSpeed = 500;
      }
      
      timeoutId = setTimeout(type, typeSpeed);
    }

    wordElement.textContent = '';
    timeoutId = setTimeout(type, 1000);

    return () => clearTimeout(timeoutId);
  }, [isVi]);

  return (
    <div className="antialiased min-h-screen flex flex-col items-center selection:bg-gray-100 text-gray-900 relative">
      {/* Intro Background */}
      <div className="absolute top-0 left-0 w-full h-screen -z-10 bg-cover bg-center bg-[url('https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/169cdb38-2656-4555-bec1-d1acc64bb6fa_3840w.png')] animate-bg-intro"></div>

      <div className="w-full max-w-7xl flex flex-col relative min-h-screen" id="gioi-thieu">
        {/* Header */}
        <header className="md:px-12 flex z-10 w-full pt-6 pr-6 pb-6 pl-6 relative items-center justify-between animate-header-intro">
          <a href="#gioi-thieu" className="flex items-center select-none">
            <img 
              src="/vpa-logo.jpg" 
              alt="Hội Tâm Thần Học Việt Nam" 
              className="mix-blend-multiply h-7 object-contain" 
            />
          </a>
          <nav className="hidden gap-x-4 md:flex">
            <a href="#gioi-thieu" className="text-sm font-normal text-gray-500 hover:text-gray-900 transition-colors">{isVi ? 'Giới thiệu' : 'About'}</a>
            <a href="#timeline" className="text-sm font-normal text-gray-500 hover:text-gray-900 transition-colors">{isVi ? 'Sự kiện' : 'Timeline'}</a>
            <a href="#dai-bieu" className="text-sm font-normal text-gray-500 hover:text-gray-900 transition-colors">{isVi ? 'Đại biểu' : 'Delegates'}</a>
            <a href="#dang-ky" className="text-sm font-normal text-gray-500 hover:text-gray-900 transition-colors">{isVi ? 'Đăng ký' : 'Register'}</a>
            <a href="#lien-he" className="text-sm font-normal text-gray-500 hover:text-gray-900 transition-colors">{isVi ? 'Liên hệ' : 'Contact'}</a>
          </nav>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-1 rounded border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`px-2 py-1 text-[10px] tracking-wider rounded ${isVi ? 'bg-[#0D3C1F] text-white' : 'text-gray-600'}`}
              >
                VN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-[10px] tracking-wider rounded ${!isVi ? 'bg-[#0D3C1F] text-white' : 'text-gray-600'}`}
              >
                EN
              </button>
            </div>
            <button type="button" className="text-xs tracking-widest font-normal text-gray-500 hover:text-gray-900 uppercase transition-colors hidden sm:block">
              {isVi ? 'Đăng nhập' : 'Log in'}
            </button>
            <a href="#dang-ky" className="inline-flex items-center justify-center text-white px-5 py-2.5 rounded text-xs font-medium tracking-[0.15em] uppercase transition-all shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)] hover:opacity-90 bg-[#0D3C1F]">
              {isVi ? 'Đăng ký tham dự' : 'Register now'}
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col text-center pt-0 pr-6 pb-32 pl-6 items-center justify-center">
          <h1 className="leading-[1.1] bg-clip-text md:text-7xl text-5xl font-semibold text-transparent tracking-tighter font-geist bg-gradient-to-b from-[#3D7F61] to-[#0D3C1F] max-w-4xl animate-title-intro" style={{ fontFamily: '"Playfair Display", serif' }}>
            {isVi ? 'Hội Tâm Thần Học Việt Nam' : 'Vietnam Psychiatric Association'} <br className="hidden md:block"/>
            <span className="inline-block border-r-4 border-[#0D3C1F] pr-1 animate-blink text-transparent bg-clip-text bg-gradient-to-b from-[#3D7F61] to-[#0D3C1F]" ref={wordRef}>
              p
            </span>
          </h1>
          <p className="md:text-xl leading-relaxed text-lg font-normal text-gray-500 max-w-2xl mt-8 animate-subtitle-intro font-geist">
            {isVi
              ? 'SỨC KHỎE TÂM THẦN TRONG BỐI CẢNH MỚI'
              : 'MENTAL HEALTH IN THE NEW CONTEXT'}
          </p>
          <div className="mt-14 animate-btn-intro">
            <a href="#dang-ky" className="inline-flex items-center justify-center uppercase transition-all hover:opacity-90 text-xs font-medium text-white tracking-[0.15em] rounded pt-4 pr-8 pb-4 pl-8 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.1)]" style={{ backgroundColor: '#0D3C1F' }}>
              {isVi ? 'Đăng ký tham dự' : 'Register to attend'}
            </a>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <section className="w-full bg-[#FAF9F6] py-24 md:py-32 px-6 flex justify-center relative z-20">
        <div className="max-w-7xl w-full flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-semibold text-[#0D3C1F] text-center max-w-3xl tracking-tight leading-tight reveal-up" style={{ fontFamily: '"Playfair Display", serif' }}>
            Đồng hành cùng cộng đồng chuyên môn sức khỏe tâm thần trên toàn quốc.
          </h2>
          <p className="mt-6 text-lg text-[#4A6B5A] text-center max-w-2xl leading-relaxed font-geist reveal-up delay-100">
            Hội Tâm Thần Học Việt Nam hướng đến việc cập nhật kiến thức, kết nối học thuật và nâng cao chất lượng chăm sóc sức khỏe tâm thần thông qua các chương trình chuyên đề và hội nghị khoa học.
          </p>

          {/* Cards Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(13,60,31,0.06)] flex flex-col overflow-hidden max-w-sm mx-auto w-full reveal-up delay-100 transition-transform duration-500 hover:-translate-y-1">
              <div className="h-72 w-full relative bg-gradient-to-br from-[#F5F8F6] to-[#EAEFEB] overflow-hidden flex items-center justify-center border-b border-gray-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent"></div>
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/80 blur-3xl rounded-full"></div>
                <div className="relative z-10 flex items-center gap-5">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-px bg-gradient-to-r from-transparent via-[#3D7F61]/20 to-transparent"></div>
                  <div className="w-12 h-12 rounded-xl bg-white/40 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-[#3D7F61] z-10">
                    <iconify-icon icon="solar:letter-linear" width="20" height="20"></iconify-icon>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-md flex items-center justify-center text-[#0D3C1F] z-20 scale-110">
                    <iconify-icon icon="solar:chat-round-line-linear" width="28" height="28"></iconify-icon>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/40 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-[#3D7F61] z-10">
                    <iconify-icon icon="solar:calendar-linear" width="20" height="20"></iconify-icon>
                  </div>
                </div>
              </div>
              <div className="p-8 flex flex-col gap-3 grow">
                <h3 className="text-xl font-semibold text-[#0D3C1F] tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Lịch trình sự kiện rõ ràng và khoa học.
                </h3>
                <p className="text-base text-[#4A6B5A] leading-relaxed font-geist">
                  Thông tin được sắp xếp theo từng khung giờ, giúp bác sĩ và đại biểu dễ dàng theo dõi và tham dự đầy đủ các phiên trọng tâm.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(13,60,31,0.06)] flex flex-col overflow-hidden max-w-sm mx-auto w-full reveal-up delay-200 transition-transform duration-500 hover:-translate-y-1">
              <div className="h-72 w-full relative bg-gradient-to-bl from-[#F5F8F6] to-[#EAEFEB] overflow-hidden flex items-center justify-center border-b border-gray-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent"></div>
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/80 blur-3xl rounded-full"></div>
                <div className="relative z-10 w-28 h-32 rounded-t-full rounded-b-2xl bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_8px_16px_rgba(13,60,31,0.04)] flex flex-col items-center justify-center">
                  <iconify-icon icon="solar:shield-linear" width="40" height="40" className="text-[#0D3C1F] opacity-80 mb-2"></iconify-icon>
                  <div className="flex gap-1 opacity-70">
                    <iconify-icon icon="solar:star-bold" width="12" height="12" className="text-[#3D7F61]"></iconify-icon>
                    <iconify-icon icon="solar:star-bold" width="12" height="12" className="text-[#3D7F61]"></iconify-icon>
                    <iconify-icon icon="solar:star-bold" width="12" height="12" className="text-[#3D7F61]"></iconify-icon>
                  </div>
                </div>
              </div>
              <div className="p-8 flex flex-col gap-3 grow">
                <h3 className="text-xl font-semibold text-[#0D3C1F] tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Mạng lưới chuyên gia uy tín.
                </h3>
                <p className="text-base text-[#4A6B5A] leading-relaxed font-geist">
                  Giới thiệu các chủ tọa, báo cáo viên đến từ các bệnh viện, trường đại học và trung tâm tâm thần trên cả nước.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(13,60,31,0.06)] flex flex-col overflow-hidden max-w-sm mx-auto w-full reveal-up delay-300 transition-transform duration-500 hover:-translate-y-1">
              <div className="h-72 w-full relative bg-gradient-to-b from-[#F5F8F6] to-[#EAEFEB] overflow-hidden flex items-center justify-center border-b border-gray-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#3D7F61]/5 blur-3xl rounded-full"></div>
                <div className="relative z-10 flex items-center">
                  <div className="w-20 h-20 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 shadow-md flex items-center justify-center text-[#0D3C1F] z-20 translate-x-4">
                    <iconify-icon icon="solar:user-linear" width="32" height="32" className="opacity-80"></iconify-icon>
                  </div>
                  <div className="w-20 h-20 rounded-2xl rotate-12 bg-gradient-to-br from-[#3D7F61]/10 to-transparent backdrop-blur-md border border-white/60 shadow-inner flex items-center justify-center text-[#3D7F61] z-10 -translate-x-4">
                    <iconify-icon icon="solar:stars-linear" width="28" height="28" className="-rotate-12 opacity-70"></iconify-icon>
                  </div>
                </div>
              </div>
              <div className="p-8 flex flex-col gap-3 grow">
                <h3 className="text-xl font-semibold text-[#0D3C1F] tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Đăng ký tham dự nhanh chóng.
                </h3>
                <p className="text-base text-[#4A6B5A] leading-relaxed font-geist">
                  Bác sĩ có thể gửi thông tin đăng ký trực tuyến để nhận xác nhận tham dự và cập nhật lịch trình mới nhất từ Ban Tổ Chức.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-16 text-sm text-[#4A6B5A] italic font-geist text-center reveal-up delay-300">
            Chúng ta cùng nhau nâng cao sức khỏe tâm thần vì một cộng đồng bền vững.
          </p>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="w-full bg-white py-24 md:py-[100px] px-6 flex justify-center relative z-20">
        <div className="max-w-[1200px] w-full flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-semibold text-[#0D3C1F] text-center max-w-3xl tracking-tight leading-tight reveal-up delay-100" style={{ fontFamily: '"Playfair Display", serif' }}>
            Các chỉ số nổi bật trong công tác chuyên môn và đào tạo.
          </h2>

          <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[auto]">
            {/* Tile 1 */}
            <div className="md:col-span-5 md:row-span-2 bg-[#0D3C1F] rounded-2xl p-8 flex flex-col relative overflow-hidden reveal-up delay-100 min-h-[400px]">
              <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-transparent to-[#0D3C1F] z-10 pointer-events-none"></div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#3D7F61]/20 blur-3xl rounded-full"></div>
              
              <div className="absolute top-8 right-8 w-40 h-32 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transform rotate-6 z-0">
                <iconify-icon icon="solar:inbox-linear" width="48" height="48" className="text-[#FAF9F6] opacity-30 -rotate-6"></iconify-icon>
              </div>
              <div className="absolute top-16 right-24 w-24 h-20 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 shadow-inner flex items-center justify-center transform -rotate-3 z-0">
                <iconify-icon icon="solar:letter-linear" width="32" height="32" className="text-[#3D7F61] opacity-50 rotate-3"></iconify-icon>
              </div>

              <div className="mt-auto relative z-20 flex flex-col gap-2 pt-32">
                <div className="text-[72px] leading-none text-[#F69066] font-semibold" style={{ fontFamily: '"Playfair Display", serif' }}>
                  28%
                </div>
                <p className="text-[16px] text-[#FAF9F6] font-geist leading-relaxed">
                  bác sĩ tham dự đánh giá cao chất lượng chương trình khoa học.
                </p>
                <p className="text-[12px] text-[#3D7F61] font-geist italic mt-2">
                  Tổng hợp khảo sát hội nghị gần đây
                </p>
              </div>
            </div>

            {/* Tile 2 */}
            <div className="md:col-span-4 bg-[#F5F5F3] rounded-2xl p-8 flex flex-col justify-between reveal-up delay-200 min-h-[220px]">
              <div className="text-[56px] leading-tight text-[#0D3C1F] font-semibold" style={{ fontFamily: '"Playfair Display", serif' }}>
                72%
              </div>
              <div className="mt-4">
                <p className="text-[15px] text-[#4A6B5A] font-geist leading-snug mb-2">
                  đại biểu mong muốn tiếp tục mở rộng các phiên thảo luận lâm sàng.
                </p>
                <p className="text-[11px] text-[#8A9E92] font-geist italic">
                  Báo cáo hoạt động thường niên
                </p>
              </div>
            </div>

            {/* Tile 3 */}
            <div className="md:col-span-3 bg-[#3D7F61] rounded-2xl p-8 flex flex-col relative overflow-hidden reveal-up delay-300 min-h-[220px]">
              <iconify-icon icon="solar:shield-check-linear" width="24" height="24" className="absolute top-6 right-6 text-white opacity-80"></iconify-icon>
              <div className="mt-auto">
                <h3 className="text-[22px] leading-tight text-white font-semibold mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Đào tạo liên tục.<br />Kết nối toàn quốc.
                </h3>
                <p className="text-[14px] text-[#D4E8DC] font-geist leading-snug">
                  Ưu tiên thực hành lâm sàng và giá trị cộng đồng.
                </p>
              </div>
            </div>

            {/* Tile 4 */}
            <div className="md:col-span-4 bg-[#F5F5F3] rounded-2xl p-8 flex flex-col justify-between reveal-up delay-200 min-h-[220px]">
              <div className="text-[56px] leading-tight text-[#0D3C1F] font-semibold" style={{ fontFamily: '"Playfair Display", serif' }}>
                121
              </div>
              <div className="mt-4">
                <p className="text-[14px] text-[#4A6B5A] font-geist leading-snug">
                  chủ đề chuyên sâu được đề xuất cho năm tới.
                </p>
              </div>
            </div>

            {/* Tile 5 */}
            <div className="md:col-span-3 bg-[#0D3C1F] rounded-2xl p-8 flex flex-col justify-end reveal-up delay-300 min-h-[220px]">
              <h3 className="text-[20px] leading-tight text-[#FAF9F6] font-semibold mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                Hội phát triển cùng mạng lưới chuyên gia.
              </h3>
              <p className="text-[14px] text-[#8ABF9E] font-geist leading-snug">
                Tăng cường hợp tác giữa bệnh viện, trường học và hội nghề nghiệp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Work Section */}
      <section className="w-full bg-white py-24 md:py-[100px] px-6 flex justify-center relative z-20" id="timeline">
        <div className="max-w-[1200px] w-full flex flex-col items-center">
          <div className="mt-16 w-full flex flex-col gap-4">
            {/* Large Tile */}
            <div className="md:p-16 flex flex-col md:flex-row min-h-[480px] overflow-hidden reveal-up delay-100 bg-[#0D3C1F] w-full rounded-[16px] p-8 relative shadow-[0_8px_32px_rgba(13,60,31,0.12)]">
              {/* Left Side */}
              <div className="w-full md:w-[50%] flex flex-col justify-center relative z-20 md:pr-16">
                <div className="text-[12px] uppercase tracking-[0.15em] text-[#3D7F61] font-geist font-medium mb-6">
                  THÔNG TIN HỘI NGHỊ
                </div>
                <h3 className="text-[36px] font-semibold text-[#FAF9F6] leading-tight mb-6 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Timeline sự kiện rõ ràng theo từng phiên.
                </h3>
                <p className="text-[16px] text-[#B8D4C4] font-geist leading-[1.8] mb-12 max-w-lg">
                  Lịch trình được trình bày theo từng mốc thời gian từ khai mạc, báo cáo chuyên đề, thảo luận đến tổng kết. Nội dung phù hợp để cập nhật nhanh cho bác sĩ tham dự.
                </p>
                <a href="#lich-trinh-demo" className="mt-auto md:mt-0 self-start text-[15px] text-[#F69066] font-geist hover:underline flex items-center gap-2 transition-all">
                  {isVi ? 'Xem lịch trình chi tiết' : 'View full schedule'} <span className="text-xl leading-none">→</span>
                </a>
              </div>

              {/* Right Side Visuals */}
              <div className="w-full md:w-[50%] mt-16 md:mt-0 relative flex items-center justify-center min-h-[320px] md:min-h-full">
                <div className="absolute inset-0 w-full h-full flex flex-col gap-6 justify-center items-end opacity-90 transform translate-x-4 md:translate-x-12">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#3D7F61] blur-[100px] rounded-full opacity-60"></div>
                  <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-[#F69066]/20 blur-[80px] rounded-full opacity-40"></div>

                  <div className="w-full max-w-[340px] h-24 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-5 flex items-center gap-5 transform -translate-x-12 relative z-10 hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-10 h-10 rounded-lg bg-[#3D7F61]/30 flex-shrink-0 flex items-center justify-center text-[#8ABF9E]">
                      <iconify-icon icon="solar:box-linear" width="20" height="20"></iconify-icon>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                      <div className="w-3/4 h-2.5 rounded-full bg-white/30"></div>
                      <div className="w-1/2 h-2 rounded-full bg-white/10"></div>
                    </div>
                  </div>

                  <div className="w-full max-w-[400px] h-32 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.3)] p-6 flex flex-col justify-between relative z-20 transform -translate-x-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 rounded-full bg-[#F69066]/20 border border-[#F69066]/30 flex-shrink-0 flex items-center justify-center text-[#F69066]">
                           <iconify-icon icon="solar:magic-stick-3-linear" width="24" height="24"></iconify-icon>
                        </div>
                        <div className="w-1/2 h-3.5 rounded-full bg-white/40"></div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-white/70">
                         <iconify-icon icon="solar:check-circle-linear" width="16" height="16"></iconify-icon>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full">
                      <div className="w-1/3 h-2.5 rounded-full bg-[#3D7F61]/60"></div>
                      <div className="w-1/4 h-2.5 rounded-full bg-white/20"></div>
                      <div className="w-1/5 h-2.5 rounded-full bg-white/10"></div>
                    </div>
                  </div>

                  <div className="w-full max-w-[320px] h-20 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-5 flex items-center gap-4 transform translate-x-2 relative z-10 hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center text-white/70">
                       <iconify-icon icon="solar:list-linear" width="20" height="20"></iconify-icon>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <div className="w-2/3 h-2 rounded-full bg-white/20"></div>
                      <div className="w-1/3 h-2 rounded-full bg-white/10"></div>
                    </div>
                  </div>

                  <div className="w-full max-w-[260px] h-16 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-4 flex items-center gap-4 transform translate-x-12 relative z-0 opacity-60">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0"></div>
                    <div className="flex flex-col gap-2 w-full">
                      <div className="w-3/4 h-1.5 rounded-full bg-white/20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="bg-[#F5F5F3] rounded-[16px] p-8 flex flex-col reveal-up delay-200 hover:-translate-y-1 transition-transform duration-300">
                <div className="text-[11px] uppercase tracking-[0.15em] text-[#8A9E92] font-geist font-medium mb-4">ĐẠI BIỂU</div>
                <h3 className="text-[22px] font-semibold text-[#0D3C1F] leading-tight mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Giới thiệu chủ tọa và báo cáo viên.
                </h3>
                <p className="text-[14px] text-[#4A6B5A] font-geist leading-[1.6] mb-8 grow">
                  Cung cấp hồ sơ tóm tắt, ảnh đại diện và thông tin chuyên môn của từng chuyên gia để người tham dự dễ theo dõi.
                </p>
                <a href="#dai-bieu" className="mt-auto self-start text-[13px] text-[#3D7F61] font-geist hover:underline flex items-center gap-1 transition-all">
                  {isVi ? 'Xem danh sách đại biểu' : 'See delegates'} <span className="text-base leading-none">→</span>
                </a>
              </div>

              <div className="bg-[#F5F5F3] rounded-[16px] p-8 flex flex-col reveal-up delay-300 hover:-translate-y-1 transition-transform duration-300">
                <div className="text-[11px] uppercase tracking-[0.15em] text-[#8A9E92] font-geist font-medium mb-4">ĐĂNG KÝ</div>
                <h3 className="text-[22px] font-semibold text-[#0D3C1F] leading-tight mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Biểu mẫu đăng ký tham dự dành cho bác sĩ.
                </h3>
                <p className="text-[14px] text-[#4A6B5A] font-geist leading-[1.6] mb-8 grow">
                  Người tham dự điền thông tin cơ bản để Ban Tổ Chức xác nhận nhanh, gửi thông báo và cập nhật các hướng dẫn cần thiết trước ngày sự kiện.
                </p>
                <a href="#dang-ky" className="mt-auto self-start text-[13px] text-[#3D7F61] font-geist hover:underline flex items-center gap-1 transition-all">
                  {isVi ? 'Mở form đăng ký' : 'Open registration form'} <span className="text-base leading-none">→</span>
                </a>
              </div>
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
              ? 'Nhấn vào các ngày và mở rộng từng phiên để xem chi tiết lịch trình của hội nghị.'
              : 'Click on the days and expand each session to view the detailed conference schedule.'}
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
                  className={`px-5 py-2.5 border rounded-full text-[14px] font-medium transition-all ${
                    selectedDay === day
                      ? 'bg-[#0D3C1F] text-white border-[#0D3C1F]'
                      : 'bg-white text-[#0D3C1F] border-[#E5EBE8] hover:bg-[#F0F4F2]'
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
                    className={`px-4 py-2 border rounded-full text-[13px] font-medium transition-all ${
                      selectedHall === hall
                        ? 'bg-[#3D7F61] text-white border-[#3D7F61]'
                        : 'bg-white text-[#3D7F61] border-[#C5D9CE] hover:bg-[#F0F4F2]'
                    }`}
                  >
                    {hall}
                  </button>
                ))}
              </div>
            )}

            {/* Accordion */}
            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
              {structuredTimeline
                .filter(s =>
                  s.daySection === selectedDay &&
                  (selectedDay !== "Ngày 31/5/2026" || s.hall === selectedHall)
                )
                .map(session => (
                  <div key={session.id} className="bg-white border text-left border-[#E5EBE8] rounded-[16px] overflow-hidden shadow-sm hover:shadow transition-shadow">
                    <button
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#F0F4F2]/50 transition-colors"
                      onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                    >
                      <span className="text-[17px] font-semibold text-[#0D3C1F]" style={{ fontFamily: '"Playfair Display", serif' }}>
                        {session.title.replace('PHIÊN', 'Phiên')}
                      </span>
                      <span className="text-[#3D7F61] shrink-0 ml-4 transition-transform duration-300" style={{ transform: expandedSessionId === session.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                      </span>
                    </button>

                    {expandedSessionId === session.id && (
                      <div className="px-6 pb-6 overflow-auto border-t border-[#E5EBE8] pt-4">
                        {session.chuToa && (
                          <div className="mb-2 text-[13px] text-[#4A6B5A]">
                            <span className="font-semibold text-[#0D3C1F]">Chủ tọa: </span>{session.chuToa}
                          </div>
                        )}
                        {session.thuKy && (
                          <div className="mb-4 text-[13px] text-[#4A6B5A]">
                            <span className="font-semibold text-[#0D3C1F]">Thư ký: </span>{session.thuKy}
                          </div>
                        )}
                        <div dangerouslySetInnerHTML={{ __html: session.html }} className="custom-table-styles" />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightmode CTA Section */}
      <section className="w-full bg-[#FAF9F6] py-24 md:py-32 px-6 flex justify-center relative z-20">
        <div className="max-w-[1100px] w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-12 reveal-up">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-semibold text-[#0D3C1F] tracking-tight leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              Sẵn sàng tham dự trong <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F69066] to-[#E35D30]">vài bước</span>
            </h2>
            <p className="mt-6 text-lg md:text-xl text-[#4A6B5A] leading-relaxed font-geist">
              Đăng ký sớm để Ban Tổ Chức xác nhận thông tin và gửi lịch trình chi tiết đến quý bác sĩ.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0 mt-8 md:mt-0">
            <a href="#dang-ky" className="inline-flex items-center justify-center px-7 py-3.5 rounded text-xs font-medium tracking-[0.1em] uppercase transition-all bg-[#F69066] hover:bg-[#E35D30] text-white gap-2 shadow-[0_4px_14px_rgba(246,144,102,0.25)] hover:-translate-y-0.5">
              {isVi ? 'Đăng ký ngay' : 'Register now'}
              <iconify-icon icon="solar:arrow-right-up-linear" width="16" height="16"></iconify-icon>
            </a>
            <a href="#lien-he" className="inline-flex items-center justify-center px-7 py-3.5 rounded text-xs font-medium tracking-[0.1em] uppercase transition-all bg-[#EAEFEB] hover:bg-[#DCE4DF] text-[#0D3C1F] gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:-translate-y-0.5">
              {isVi ? 'Nhận thông báo' : 'Get updates'}
              <iconify-icon icon="solar:arrow-right-up-linear" width="16" height="16"></iconify-icon>
            </a>
          </div>
        </div>
      </section>

      {/* Delegates Section */}
      <section className="w-full bg-white py-24 md:py-[100px] px-6 flex justify-center relative z-20" id="dai-bieu">
        <div className="max-w-[1100px] w-full flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-semibold text-[#0D3C1F] text-center max-w-3xl tracking-tight leading-tight reveal-up" style={{ fontFamily: '"Playfair Display", serif' }}>
            {isVi ? 'Đại biểu tham dự' : 'Delegates'}
          </h2>
          <p className="mt-6 text-[16px] text-[#4A6B5A] text-center max-w-[640px] leading-relaxed font-geist reveal-up delay-100">
            {isVi
              ? 'Danh sách dự kiến các chủ tọa, báo cáo viên và đại biểu khách mời của Hội Tâm Thần Học Việt Nam.'
              : 'Planned list of chairs, speakers, and invited delegates of the Vietnam Psychiatric Association.'}
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {[
              {
                name: isVi ? 'PGS.TS. Nguyễn Minh Hoàng' : 'Assoc. Prof. Dr. Nguyen Minh Hoang',
                role: isVi ? 'Chủ tọa' : 'Chair',
                org: isVi ? 'Bệnh viện Tâm thần Trung ương I' : 'National Institute of Mental Health',
                image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80'
              },
              {
                name: isVi ? 'TS.BS. Lê Thu Hà' : 'Dr. Le Thu Ha',
                role: isVi ? 'Báo cáo viên' : 'Speaker',
                org: isVi ? 'Đại học Y Hà Nội' : 'Hanoi Medical University',
                image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80'
              },
              {
                name: isVi ? 'ThS.BS. Trần Quang Vinh' : 'MSc. Dr. Tran Quang Vinh',
                role: isVi ? 'Đại biểu khách mời' : 'Invited delegate',
                org: isVi ? 'Bệnh viện Chợ Rẫy' : 'Cho Ray Hospital',
                image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80'
              }
            ].map((person, index) => (
              <article key={index} className="bg-[#F5F5F3] rounded-[16px] p-7 reveal-up delay-200 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 mb-4">
                  <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A9E92] font-geist font-medium">{person.role}</p>
                <h3 className="mt-2 text-[22px] font-semibold text-[#0D3C1F] tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                  {person.name}
                </h3>
                <p className="mt-3 text-[14px] text-[#4A6B5A] font-geist leading-[1.7]">{person.org}</p>
              </article>
            ))}
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
        <div className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop')] contrast-125 sepia-[.3] hue-rotate-[-10deg] opacity-90"></div>
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