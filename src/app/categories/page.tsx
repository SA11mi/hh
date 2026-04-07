"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import styles from "./categories.module.css";

interface Category {
  id: number;
  name: string;
  icon: string;
  store_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      // Fetch categories
      const { data: cats, error } = await supabase
        .from('categories')
        .select('*, stores(id)');
      
      if (error) {
        console.error("Error fetching categories:", error);
      } else if (cats) {
        // Map and count stores
        const processed = cats.map(cat => ({
          ...cat,
          store_count: cat.stores ? cat.stores.length : 0
        }));
        setCategories(processed);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return (
    <main style={{ paddingBottom: '5rem', background: 'var(--background)' }}>
      {/* Header */}
      <header className={`container`} style={{ padding: '1.5rem 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
          <Link href="/">سوق الخصومات ✨</Link>
        </div>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontWeight: 'bold' }}>
          <Link href="/">الرئيسية</Link>
          <Link href="/stores">المتاجر</Link>
          <Link href="/categories" style={{ color: 'var(--primary)' }}>التصنيفات</Link>
        </nav>
      </header>

      {/* Page Title */}
      <div className="container" style={{ textAlign: 'center', padding: '3rem 0 0' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>تصفح حسب التصنيف</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          اعثر على كوبونات الخصم بسهولة عبر تحديد تصنيف مشترياتك المفضلة واستكشاف المتاجر.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>جاري التحميل...</div>
      ) : (
        /* Categories Grid */
        <div className={`container ${styles.grid}`}>
          {categories.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              لا توجد تصنيفات متوفرة حالياً.
            </div>
          ) : (
            categories.map((cat) => (
              <Link href={`/stores?category=${cat.id}`} key={cat.id} style={{ textDecoration: 'none' }}>
                <div className={styles.categoryCard}>
                  <div className={styles.iconWrapper}>
                    {cat.icon || '📁'}
                  </div>
                  <h2 className={styles.catName}>{cat.name}</h2>
                  <span className={styles.catCount}>{cat.store_count} متوفر</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </main>
  );
}
