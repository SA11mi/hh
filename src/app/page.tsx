"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";
import Link from "next/link";

interface Store {
  id: number;
  name: string;
  icon: string;
  image_url: string;
  description: string;
}

interface Coupon {
  id: number;
  store_id: number;
  title: string;
  code: string;
  discount: string;
  stores?: { name: string; icon: string; image_url: string };
}

export default function Home() {
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const [stores, setStores] = useState<Store[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [matchingStores, setMatchingStores] = useState<Store[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [storesRes, couponsRes] = await Promise.all([
        supabase.from('stores').select('*').order('created_at', { ascending: false }),
        supabase.from('coupons').select('*, stores(name, icon, image_url)').order('created_at', { ascending: false }).limit(20),
      ]);
      if (storesRes.data) setStores(storesRes.data);
      if (couponsRes.data) {
        setCoupons(couponsRes.data);
        setFilteredCoupons(couponsRes.data);
      }
    };
    fetchData();
  }, []);

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setFilteredCoupons(coupons);
      setMatchingStores([]);
      setShowResults(false);
    } else {
      // Filter Coupons
      const filteredC = coupons.filter(coupon => 
        coupon.stores?.name.toLowerCase().includes(query.toLowerCase()) ||
        coupon.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCoupons(filteredC);

      // Filter Stores for Dropdown
      const filteredS = displayStores.filter(store => 
        store.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5); // limit to 5 results
      setMatchingStores(filteredS as Store[]);
      setShowResults(true);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsFooterVisible(true);
      },
      { threshold: 0.1 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => { if (footerRef.current) observer.unobserve(footerRef.current); };
  }, []);

  // Fallback data if DB is empty
  const displayStores = stores.length > 0 ? stores : [
    { id: 1, name: "نون", description: "أكواد خصم حتى 15%", icon: "🟡", image_url: "" },
    { id: 2, name: "أمازون", description: "كوبونات تصل لـ 50%", icon: "📦", image_url: "" },
    { id: 3, name: "نمشي", description: "خصم 20% وأكثر", icon: "👗", image_url: "" },
    { id: 4, name: "طلبات", description: "توصيل مجاني", icon: "🍔", image_url: "" },
  ];

  const displayCoupons = filteredCoupons.length > 0 || searchQuery !== "" ? filteredCoupons : [
    { id: 1, store_id: 1, title: "على كل الأزياء والإلكترونيات", discount: "خصم 10%", code: "SAVE10", stores: { name: "نون", icon: "🟡", image_url: "" } },
    { id: 2, store_id: 2, title: "شحن مجاني للعملاء الجدد", discount: "خصم 15%", code: "AMZ15", stores: { name: "أمازون", icon: "📦", image_url: "" } },
    { id: 3, store_id: 3, title: "على جميع المنتجات غير المخفضة", discount: "خصم 20%", code: "NAMSHI20", stores: { name: "نمشي", icon: "👗", image_url: "" } },
  ];

  return (
    <main>
      {/* Header */}
      <header className={`container ${styles.header}`} style={{ padding: '1.5rem 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
          سوق الخصومات ✨
        </div>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/" style={{ fontWeight: 'bold' }}>الرئيسية</Link>
          <Link href="/stores" style={{ fontWeight: 'bold' }}>المتاجر</Link>
          <Link href="/categories" style={{ fontWeight: 'bold' }}>التصنيفات</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className={`container ${styles.heroContent} animate-fade-in`}>
          <h1 className={styles.title}>أقوى أكواد الخصم بين يديك</h1>
          <p className={styles.subtitle}>اكتشف أحدث وأقوى الكوبونات المضمونة والفعالة لأكثر من 500+ متجر إلكتروني</p>
          <div className={styles.searchWrapper}>
            <div className={styles.searchBox}>
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="ابحث عن متجرك المفضل (مثال: نون، أمازون...)" 
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery.trim() !== "" && setShowResults(true)}
              />
              <button className={styles.searchBtn} onClick={() => {
                const element = document.getElementById('coupons-section');
                element?.scrollIntoView({ behavior: 'smooth' });
                setShowResults(false);
              }}>
                ابحث عن الكوبونات
              </button>
            </div>

            {showResults && searchQuery.trim() !== "" && (
              <div className={styles.searchResults}>
                {matchingStores.length > 0 ? (
                  matchingStores.map(store => (
                    <Link 
                      key={store.id} 
                      href={`/store/${store.id}`} 
                      className={styles.searchResultItem}
                      onClick={() => setShowResults(false)}
                    >
                      {store.image_url ? (
                        <img src={store.image_url} alt={store.name} className={styles.searchResultIcon} />
                      ) : (
                        <div className={styles.searchResultIcon} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: 'var(--background)' }}>
                          {store.icon || '🏪'}
                        </div>
                      )}
                      <div className={styles.searchResultText}>
                        <span className={styles.searchResultName}>{store.name}</span>
                        <span className={styles.searchResultDesc}>{store.description}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className={styles.noResults}>لا توجد نتائج لهذا المتجر..</div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>



      {/* Featured Stores - Marquee */}
      <section className={`container ${styles.section}`} style={{ maxWidth: '100vw', paddingLeft: 0, paddingRight: 0, overflow: 'hidden' }}>
        <h2 className={styles.sectionTitle}>المتاجر المميزة</h2>
        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeTrack}>
            {[...displayStores, ...displayStores, ...displayStores, ...displayStores].map((store, index) => (
              <Link href={`/store/${store.id}`} key={`${store.id}-${index}`} className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.cardInner}>
                  <div className={styles.storeIcon}>
                    {store.image_url ? (
                      <img src={store.image_url} alt={store.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (store.icon || '🏪')}
                  </div>
                  <h3 className={styles.storeName}>{store.name}</h3>
                  <p className={styles.storeOffer}>{store.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Coupons */}
      <section className={`container ${styles.section}`} id="coupons-section">
        <h2 className={styles.sectionTitle}>
          {searchQuery ? `نتائج البحث عن: ${searchQuery}` : 'أحدث الكوبونات'}
        </h2>
        <div className={styles.couponsGrid}>
          {displayCoupons.map((coupon) => (
            <div key={coupon.id} className={styles.couponCard}>
              <Link href={`/store/${coupon.store_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.couponTopCentered}>
                  <div className={styles.couponIconLarge}>
                    {coupon.stores?.image_url ? (
                      <img src={coupon.stores.image_url} alt={coupon.stores.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (coupon.stores?.icon || '🏪')}
                  </div>
                  <div className={styles.couponStoreCentered}>{coupon.stores?.name || 'متجر'}</div>
                </div>
              </Link>
              <h3 className={styles.couponTitleCentered}>{coupon.title}</h3>
              <div className={styles.couponDiscountBadgeCentered}>{coupon.discount}</div>
              <div className={styles.actionColumn}>
                <button 
                  onClick={() => handleCopy(coupon.id, coupon.code)}
                  className={`${styles.copyBtnFull} ${copiedId === coupon.id ? styles.copied : ''}`}
                  title={coupon.code}
                >
                  {copiedId === coupon.id ? `تم النسخ: ${coupon.code}` : 'نسخ الكود'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className={styles.section} style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className={styles.sectionTitle}>كيف تعمل المنصة؟</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. ابحث عن متجرك</h3>
              <p style={{ color: 'var(--text-muted)' }}>ابحث عن المتجر الذي ترغب بالتسوق منه.</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✂️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. انسخ الكود</h3>
              <p style={{ color: 'var(--text-muted)' }}>اختر الكوبون المناسب واضغط زر النسخ.</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. تسوق ووفر</h3>
              <p style={{ color: 'var(--text-muted)' }}>ألصق كود الخصم في صفحة الدفع واستمتع بالتوفير!</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ background: 'var(--surface)', padding: '4rem 0', marginTop: '3rem', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }} ref={footerRef}>
          <div className={`${styles.footerLogo} ${isFooterVisible ? styles.footerLogoVisible : ''}`}>
            سوق الخصومات ✨
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', transition: 'opacity 1s 0.3s', opacity: isFooterVisible ? 1 : 0 }}>
            المنصة الأولى للكوبونات المضمونة في العالم العربي.
          </p>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'opacity 1s 0.6s', opacity: isFooterVisible ? 1 : 0 }}>
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} سوق الخصومات
          </div>
        </div>
      </footer>
    </main>
  );
}
