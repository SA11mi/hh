"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./admin.module.css";

interface Store {
  id: number;
  name: string;
  description: string;
  icon: string;
  image_url: string;
  article: string;
  category_id: number | null;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  count?: number;
}

interface Coupon {
  id: number;
  store_id: number;
  title: string;
  code: string;
  discount: string;
  valid_until: string;
  stores?: { name: string };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddStore, setShowAddStore] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [storeImagePreview, setStoreImagePreview] = useState<string | null>(null);

  // Data states
  const [stores, setStores] = useState<Store[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeCount, setStoreCount] = useState(0);
  const [couponCount, setCouponCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);

  // Form states
  const [storeName, setStoreName] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [storeArticle, setStoreArticle] = useState('');
  const [storeCategoryId, setStoreCategoryId] = useState('');
  const [editingStoreId, setEditingStoreId] = useState<number | null>(null);
  
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('📁');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  const [couponStoreId, setCouponStoreId] = useState('');
  const [couponTitle, setCouponTitle] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponDate, setCouponDate] = useState('');
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
      } else {
        setLoading(false);
        fetchData();
      }
    };
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    const [storesRes, couponsRes, catsRes] = await Promise.all([
      supabase.from('stores').select('*').order('created_at', { ascending: false }),
      supabase.from('coupons').select('*, stores(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('created_at', { ascending: false }),
    ]);
    if (storesRes.data) { setStores(storesRes.data); setStoreCount(storesRes.data.length); }
    if (couponsRes.data) { setCoupons(couponsRes.data); setCouponCount(couponsRes.data.length); }
    if (catsRes.data) { setCategories(catsRes.data); setCategoryCount(catsRes.data.length); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('stores').insert({
      name: storeName,
      description: storeDesc,
      image_url: storeImagePreview || '',
      article: storeArticle,
      category_id: storeCategoryId ? parseInt(storeCategoryId) : null,
    });
    setSaving(false);
    if (error) { alert('حدث خطأ: ' + error.message); return; }
    alert('تمت إضافة المتجر بنجاح!');
    resetStoreForm();
    setShowAddStore(false);
    fetchData();
  };

  const handleEditStore = (store: Store) => {
    setEditingStoreId(store.id);
    setStoreName(store.name);
    setStoreDesc(store.description || '');
    setStoreImagePreview(store.image_url || null);
    setStoreArticle(store.article || '');
    setStoreCategoryId(store.category_id ? String(store.category_id) : '');
    setShowAddStore(true);
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStoreId) return;
    setSaving(true);
    const { error } = await supabase.from('stores').update({
      name: storeName,
      description: storeDesc,
      image_url: storeImagePreview || '',
      article: storeArticle,
      category_id: storeCategoryId ? parseInt(storeCategoryId) : null,
    }).eq('id', editingStoreId);
    setSaving(false);
    if (error) { alert('حدث خطأ: ' + error.message); return; }
    alert('تم تحديث المتجر بنجاح!');
    resetStoreForm();
    setShowAddStore(false);
    fetchData();
  };

  const resetStoreForm = () => {
    setStoreName(''); setStoreDesc(''); setStoreImagePreview(null); setEditingStoreId(null); setStoreArticle(''); setStoreCategoryId('');
  };

  const handleDeleteStore = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المتجر؟ سيتم حذف جميع كوبوناته أيضاً.')) return;
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) { alert('حدث خطأ: ' + error.message); return; }
    fetchData();
  };

  const presetEmojis = ['📁', '📱', '👗', '🎮', '🍕', '💄', '✈️', '🌿', '🏢', '🚕', '📦', '🎁', '🛋️', '🍴', '⚽', '🚗', '🧴', '🛍️', '💡', '🏡'];

  // Category Logic
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('categories').insert({
      name: categoryName,
      icon: categoryIcon,
    });
    setSaving(false);
    if (error) { alert('حدث خطأ: ' + error.message); return; }
    alert('تمت إضافة التصنيف بنجاح!');
    resetCategoryForm();
    setShowAddCategory(false);
    fetchData();
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryName(cat.name);
    setCategoryIcon(cat.icon);
    setShowAddCategory(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryId) return;
    setSaving(true);
    const { error } = await supabase.from('categories').update({
      name: categoryName,
      icon: categoryIcon,
    }).eq('id', editingCategoryId);
    setSaving(false);
    if (error) { alert('حدث خطأ: ' + error.message); return; }
    alert('تم تحديث التصنيف بنجاح!');
    resetCategoryForm();
    setShowAddCategory(false);
    fetchData();
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟ لن يتم حذف المتاجر، بل ستصبح بدون تصنيف.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { alert('حدث خطأ: ' + error.message); return; }
    fetchData();
  };

  const resetCategoryForm = () => {
    setCategoryName(''); setCategoryIcon('📁'); setEditingCategoryId(null);
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('coupons').insert({
      store_id: parseInt(couponStoreId),
      title: couponTitle,
      code: couponCode.toUpperCase(),
      discount: couponDiscount,
      valid_until: couponDate || null,
    });
    setSaving(false);
    if (error) { alert('حدث خطأ: ' + error.message); return; }
    alert('تمت إضافة الكوبون بنجاح!');
    resetCouponForm();
    setShowAddCoupon(false);
    fetchData();
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setCouponStoreId(String(coupon.store_id));
    setCouponTitle(coupon.title);
    setCouponCode(coupon.code);
    setCouponDiscount(coupon.discount || '');
    setCouponDate(coupon.valid_until || '');
    setShowAddCoupon(true);
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCouponId) return;
    setSaving(true);
    const { error } = await supabase.from('coupons').update({
      store_id: parseInt(couponStoreId),
      title: couponTitle,
      code: couponCode.toUpperCase(),
      discount: couponDiscount,
      valid_until: couponDate || null,
    }).eq('id', editingCouponId);
    setSaving(false);
    if (error) { alert('حدث خطأ: ' + error.message); return; }
    alert('تم تحديث الكوبون بنجاح!');
    resetCouponForm();
    setShowAddCoupon(false);
    fetchData();
  };

  const resetCouponForm = () => {
    setCouponStoreId(''); setCouponTitle(''); setCouponCode(''); setCouponDiscount(''); setCouponDate(''); setEditingCouponId(null);
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) { alert('حدث خطأ: ' + error.message); return; }
    fetchData();
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)', fontSize: '1.2rem' }}>جاري التحميل...</div>;
  }

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 style={{ color: 'var(--primary)', fontWeight: 900 }}>سوق الخصومات</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>لوحة التحكم</span>
        </div>
        
        <nav className={styles.navMenu}>
          <button onClick={() => setActiveTab('overview')} className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}>الإحصائيات</button>
          <button onClick={() => setActiveTab('categories')} className={`${styles.navItem} ${activeTab === 'categories' ? styles.active : ''}`}>تصنيفات المتاجر</button>
          <button onClick={() => setActiveTab('stores')} className={`${styles.navItem} ${activeTab === 'stores' ? styles.active : ''}`}>إدارة المتاجر</button>
          <button onClick={() => setActiveTab('coupons')} className={`${styles.navItem} ${activeTab === 'coupons' ? styles.active : ''}`}>إدارة الكوبونات</button>
        </nav>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          تسجيل الخروج
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>مرحباً بك أيها المدير 👋</h1>
          <Link href="/" className="btn btn-outline" target="_blank">عرض الموقع</Link>
        </header>

        {/* === الإحصائيات === */}
        {activeTab === 'overview' && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>إجمالي المتاجر</h3>
                <div className={styles.statValue}>{storeCount}</div>
              </div>
              <div className={styles.statCard}>
                <h3>التصنيفات</h3>
                <div className={styles.statValue}>{categoryCount}</div>
              </div>
              <div className={styles.statCard}>
                <h3>الكوبونات الفعالة</h3>
                <div className={styles.statValue}>{couponCount}</div>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>🟢 النظام يعمل بشكل ممتاز</h2>
              <p style={{ color: 'var(--text-muted)' }}>قاعدة البيانات متصلة. يمكنك إضافة المتاجر والكوبونات من التبويبات الجانبية.</p>
            </div>
          </>
        )}

        {/* === إدارة التصنيفات === */}
        {activeTab === 'categories' && (
          <div className={styles.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>تصنيفات المتاجر ({categoryCount})</h2>
              <button onClick={() => { if (showAddCategory) resetCategoryForm(); setShowAddCategory(!showAddCategory); }} className={styles.addBtn}>
                {showAddCategory ? 'رجوع للقائمة' : '+ إضافة تصنيف جديد'}
              </button>
            </div>

            {showAddCategory ? (
              <form className={styles.formContainer} onSubmit={editingCategoryId ? handleUpdateCategory : handleAddCategory}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                  {editingCategoryId ? '✏️ تعديل التصنيف' : '➕ إضافة تصنيف جديد'}
                </h3>
                <div className={styles.formGroup}>
                  <label className={styles.label}>اسم التصنيف *</label>
                  <input type="text" className={styles.input} placeholder="مثال: إلكترونيات، أزياء..." required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>أيقونة التصنيف مميزة *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '0.5rem', marginTop: '1rem', background: 'var(--surface)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                    {presetEmojis.map(emoji => (
                      <button 
                        key={emoji} 
                        type="button" 
                        onClick={() => setCategoryIcon(emoji)}
                        style={{ 
                          fontSize: '1.5rem', 
                          padding: '0.5rem', 
                          borderRadius: '0.5rem', 
                          border: categoryIcon === emoji ? '2px solid var(--primary)' : '1px solid transparent', 
                          background: categoryIcon === emoji ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>الأيقونة المختارة:</span>
                    <span style={{ fontSize: '2rem' }}>{categoryIcon}</span>
                  </div>
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <button type="submit" className={styles.submitBtn} disabled={saving}>
                    {saving ? 'جاري الحفظ...' : (editingCategoryId ? 'تحديث التصنيف' : 'حفظ التصنيف')}
                  </button>
                </div>
              </form>
            ) : (
              categories.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>لا توجد تصنيفات بعد.</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>الأيقونة</th>
                      <th>اسم التصنيف</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td style={{ fontSize: '1.5rem' }}>{cat.icon}</td>
                        <td style={{ fontWeight: 'bold' }}>{cat.name}</td>
                        <td>
                          <button onClick={() => handleEditCategory(cat)} className={styles.editBtn}>تعديل</button>
                          <button onClick={() => handleDeleteCategory(cat.id)} className={styles.deleteBtn}>حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        )}

        {/* === إدارة المتاجر === */}
        {activeTab === 'stores' && (
          <div className={styles.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>إدارة المتاجر ({storeCount})</h2>
              <button onClick={() => { if (showAddStore) resetStoreForm(); setShowAddStore(!showAddStore); }} className={styles.addBtn}>
                {showAddStore ? 'رجوع للقائمة' : '+ إضافة متجر جديد'}
              </button>
            </div>

            {showAddStore ? (
              <form className={styles.formContainer} onSubmit={editingStoreId ? handleUpdateStore : handleAddStore}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                  {editingStoreId ? '✏️ تعديل المتجر' : '➕ إضافة متجر جديد'}
                </h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>اسم المتجر *</label>
                  <input type="text" className={styles.input} placeholder="مثال: نون، أمازون..." required value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>رابط صورة / شعار المتجر (اختياري)</label>
                  <input type="url" className={styles.input} placeholder="https://example.com/logo.png" value={storeImagePreview || ''} onChange={(e) => setStoreImagePreview(e.target.value)} />
                  {storeImagePreview && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <img src={storeImagePreview} alt="Preview" className={styles.previewImage} />
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>وصف المتجر (اختياري)</label>
                  <textarea className={styles.input} rows={3} placeholder="اكتب وصفاً قصيراً..." value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)}></textarea>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>تصنيف المتجر *</label>
                  <select className={styles.input} required value={storeCategoryId} onChange={(e) => setStoreCategoryId(e.target.value)}>
                    <option value="" disabled>-- اختر التصنيف --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>مقالة المتجر (اختياري — تظهر فقط في صفحة المتجر)</label>
                  <textarea className={styles.input} rows={8} placeholder="اكتب مقالة تفصيلية عن المتجر، عروضه، مميزاته، نصائح التسوق..." value={storeArticle} onChange={(e) => setStoreArticle(e.target.value)} style={{ lineHeight: '1.8' }}></textarea>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <button type="submit" className={styles.submitBtn} disabled={saving}>
                    {saving ? 'جاري الحفظ...' : (editingStoreId ? 'تحديث المتجر' : 'حفظ المتجر')}
                  </button>
                </div>
              </form>
            ) : (
              stores.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>لا توجد متاجر بعد. اضغط على "إضافة متجر جديد" للبدء!</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>الصورة</th>
                      <th>اسم المتجر</th>
                      <th>الوصف</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => (
                      <tr key={store.id}>
                        <td>
                          {store.image_url ? (
                            <img src={store.image_url} alt={store.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                          ) : (
                            <div className={styles.mockIcon}>🏪</div>
                          )}
                        </td>
                        <td style={{ fontWeight: 'bold' }}>{store.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{store.description || '—'}</td>
                        <td>
                          <button onClick={() => handleEditStore(store)} className={styles.editBtn}>تعديل</button>
                          <button onClick={() => handleDeleteStore(store.id)} className={styles.deleteBtn}>حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        )}

        {/* === إدارة الكوبونات === */}
        {activeTab === 'coupons' && (
          <div className={styles.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>إدارة الكوبونات ({couponCount})</h2>
              <button onClick={() => { if (showAddCoupon) resetCouponForm(); setShowAddCoupon(!showAddCoupon); }} className={styles.addBtn}>
                {showAddCoupon ? 'رجوع للقائمة' : '+ إضافة كوبون جديد'}
              </button>
            </div>

            {showAddCoupon ? (
              <form className={styles.formContainer} onSubmit={editingCouponId ? handleUpdateCoupon : handleAddCoupon}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                  {editingCouponId ? '✏️ تعديل الكوبون' : '➕ إضافة كوبون جديد'}
                </h3>
                <div className={styles.formGroup}>
                  <label className={styles.label}>اختر المتجر *</label>
                  <select className={styles.input} required value={couponStoreId} onChange={(e) => setCouponStoreId(e.target.value)}>
                    <option value="" disabled>-- الرجاء اختيار المتجر --</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>عنوان العرض *</label>
                  <input type="text" className={styles.input} placeholder="مثال: خصم 20% على منتجات العناية" required value={couponTitle} onChange={(e) => setCouponTitle(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>كود الخصم *</label>
                    <input type="text" className={styles.input} placeholder="مثال: SAVE20" style={{ textTransform: 'uppercase' }} required value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>نسبة الخصم</label>
                    <input type="text" className={styles.input} placeholder="مثال: خصم 20%" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)} />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>تاريخ الانتهاء (اختياري)</label>
                  <input type="date" className={styles.input} value={couponDate} onChange={(e) => setCouponDate(e.target.value)} />
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <button type="submit" className={styles.submitBtn} disabled={saving}>
                    {saving ? 'جاري الحفظ...' : (editingCouponId ? 'تحديث الكوبون' : 'نشر الكوبون')}
                  </button>
                </div>
              </form>
            ) : (
              coupons.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>لا توجد كوبونات بعد. أضف متجراً أولاً ثم أضف كوبوناته!</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>المتجر</th>
                      <th>الكود</th>
                      <th>الوصف</th>
                      <th>الخصم</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon.id}>
                        <td>{coupon.stores?.name || '—'}</td>
                        <td><span style={{ background: 'var(--background)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{coupon.code}</span></td>
                        <td>{coupon.title}</td>
                        <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{coupon.discount || '—'}</td>
                        <td>
                          <button onClick={() => handleEditCoupon(coupon)} className={styles.editBtn}>تعديل</button>
                          <button onClick={() => handleDeleteCoupon(coupon.id)} className={styles.deleteBtn}>حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
