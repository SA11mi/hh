"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./store.module.css";

interface Store {
  id: number;
  name: string;
  description: string;
  icon: string;
  image_url: string;
  article: string;
}

interface Coupon {
  id: number;
  title: string;
  code: string;
  discount: string;
  valid_until: string;
}

export default function StorePage() {
  const params = useParams();
  const storeId = params.id;
  const [store, setStore] = useState<Store | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      const { data: storeData } = await supabase.from('stores').select('*').eq('id', storeId).single();
      if (storeData) setStore(storeData);

      const { data: couponData } = await supabase.from('coupons').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
      if (couponData) setCoupons(couponData);
    };
    if (storeId) fetchStore();
  }, [storeId]);

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main style={{ paddingBottom: '5rem', background: 'var(--background)' }}>
      <header className={`container`} style={{ padding: '1.5rem 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
          <Link href="/">سوق الخصومات ✨</Link>
        </div>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontWeight: 'bold' }}>
          <Link href="/">الرئيسية</Link>
          <Link href="/stores">المتاجر</Link>
        </nav>
      </header>

      {store ? (
        <div className="container" style={{ maxWidth: '900px' }}>
          {/* Store Header */}
          <div className={styles.storeHeader}>
            <div className={styles.storeIcon}>
              {store.image_url ? (
                <img src={store.image_url} alt={store.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (store.icon || '🏪')}
            </div>
            <h1 className={styles.storeTitle}>{store.name}</h1>
            <p className={styles.storeDesc}>{store.description}</p>
          </div>

          {/* Coupons */}
          <h2 style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            الكوبونات المتاحة ({coupons.length})
          </h2>

          {coupons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              لا توجد كوبونات متاحة لهذا المتجر حالياً.
            </div>
          ) : (
            <div className={styles.couponList}>
              {coupons.map((coupon) => (
                <div key={coupon.id} className={styles.couponItem}>
                  <div className={styles.couponInfo}>
                    <h3 className={styles.couponTitle}>{coupon.title}</h3>
                    {coupon.discount && <span className={styles.discountBadge}>{coupon.discount}</span>}
                  </div>
                  <button
                    onClick={() => handleCopy(coupon.id, coupon.code)}
                    className={`${styles.copyBtn} ${copiedId === coupon.id ? styles.copied : ''}`}
                  >
                    {copiedId === coupon.id ? `✓ تم النسخ: ${coupon.code}` : 'نسخ الكود'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Article */}
          {store.article && (
            <div className={styles.articleSection}>
              <h2 className={styles.articleTitle}>عن متجر {store.name}</h2>
              <div className={styles.articleContent}>
                {store.article.split('\n').map((paragraph, i) => (
                  paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>جاري التحميل...</div>
      )}
    </main>
  );
}
