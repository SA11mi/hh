"use client";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./stores.module.css";

interface Store {
  id: number;
  name: string;
  description: string;
  icon: string;
  image_url: string;
  category_id: number | null;
}

interface Category {
  id: number;
  name: string;
}

function StoresList() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  
  const [stores, setStores] = useState<Store[]>([]);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let query = supabase.from('stores').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
        
        // Fetch category name
        const { data: catData } = await supabase
          .from('categories')
          .select('name')
          .eq('id', categoryId)
          .single();
        if (catData) setCategoryName(catData.name);
      } else {
        setCategoryName(null);
      }

      const { data } = await query.order('created_at', { ascending: false });
      if (data) setStores(data);
      setLoading(false);
    };
    
    fetchData();
  }, [categoryId]);

  const displayStores = stores;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>جاري التحميل...</div>;
  }

  return (
    <>
      <div className="container" style={{ textAlign: 'center', padding: '3rem 0 2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>
          {categoryName ? `متاجر ${categoryName}` : 'جميع المتاجر'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          {categoryName 
            ? `استكشف أفضل كوبونات الخصم والعروض لمتاجر القسم: ${categoryName}`
            : 'اكتشف التوفير الكبير مع أفضل المتاجر الإلكترونية في العالم العربي.'}
        </p>
      </div>

      <div className={`container ${styles.storesGrid}`}>
        {displayStores.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            لا توجد متاجر في هذا القسم حالياً.
          </div>
        ) : (
          displayStores.map((store) => (
            <Link href={`/store/${store.id}`} key={store.id} style={{ textDecoration: 'none' }}>
              <div className={styles.storeCard}>
                <div className={styles.iconBox}>
                  {store.image_url ? (
                    <img src={store.image_url} alt={store.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (store.icon || '🏪')}
                </div>
                <h2 className={styles.storeName}>{store.name}</h2>
                <p className={styles.storeDiscount}>{store.description}</p>
                <div className={styles.visitArrow}>← عرض الكوبونات</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}

export default function StoresPage() {
  return (
    <main style={{ paddingBottom: '5rem', background: 'var(--background)' }}>
      <header className={`container`} style={{ padding: '1.5rem 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
          <Link href="/">سوق الخصومات ✨</Link>
        </div>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontWeight: 'bold' }}>
          <Link href="/">الرئيسية</Link>
          <Link href="/stores" style={{ color: 'var(--primary)' }}>المتاجر</Link>
          <Link href="/categories">التصنيفات</Link>
        </nav>
      </header>

      <Suspense fallback={<div style={{ textAlign: 'center', padding: '5rem' }}>جاري التحميل...</div>}>
        <StoresList />
      </Suspense>
    </main>
  );
}
