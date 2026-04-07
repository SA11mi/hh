"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.session) router.push('/admin');
    } catch (error: any) {
      setErrorMsg(error.message || "بيانات الدخول غير صحيحة");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setErrorMsg("");
      alert("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
      setIsSignUp(false);
    } catch (error: any) {
      setErrorMsg(error.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>سوق الخصومات ✨</h1>
          <p style={{ color: 'var(--text-muted)' }}>{isSignUp ? 'إنشاء حساب مدير جديد' : 'لوحة تحكم الإدارة'}</p>
        </div>

        {errorMsg && (
          <div className={styles.errorBox}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className={styles.formGroup}>
          <div>
            <label className={styles.label}>البريد الإلكتروني</label>
            <input 
              type="email" 
              className={styles.inputField} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required 
            />
          </div>
          <div>
            <label className={styles.label}>كلمة المرور</label>
            <input 
              type="password" 
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********" 
              required 
            />
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "جاري المعالجة..." : (isSignUp ? "إنشاء الحساب" : "تسجيل الدخول")}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            style={{ color: 'var(--primary)', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isSignUp ? 'لديّ حساب بالفعل — تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'underline' }}>
            العودة للموقع
          </Link>
        </div>
      </div>
    </main>
  );
}
