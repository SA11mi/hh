import Link from "next/link";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>لوحة التحكم</h1>
        <Link href="/" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>العودة للرئيسية</Link>
      </header>

      <div className={styles.grid}>
        {/* Wallet Profile */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>رصيدي الحالي</h2>
          <div className={styles.balance}>
            120 <span>ريال</span>
          </div>
          <div className={styles.progressBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>المستوى الفضي</span>
              <span>المستوى الذهبي بانتظارك</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Referrals */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>برنامج الدعوة (Referral)</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            ادعُ أصدقاءك واربح 10 ريال عن كل صديق يسجل ويقوم بأول عملية شراء!
          </p>
          <div className={styles.inviteBox}>
            <code style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>TAW-5892</code>
            <button className="btn btn-primary">نسخ الرابط</button>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>5</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>أصدقاء مسجلين</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>50 ريال</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>أرباح الدعوات</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '3rem 0 1.5rem' }}>سجل المعاملات</h2>
      <div className={styles.transactions}>
        {[
          { id: 'TRX-001', store: 'نون', date: '2026-04-01', amount: '+15.50 ريال', status: 'مؤكد' },
          { id: 'TRX-002', store: 'أمازون', date: '2026-03-25', amount: '+22.00 ريال', status: 'قيد الانتظار' },
          { id: 'TRX-003', store: 'مكافأة دعوة', date: '2026-03-20', amount: '+10.00 ريال', status: 'مؤكد' },
        ].map(trx => (
          <div key={trx.id} className={styles.trxRow}>
            <div className={styles.trxInfo}>
              <h3 style={{ fontWeight: 'bold' }}>{trx.store}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{trx.date}</p>
            </div>
            <div className={styles.trxAmount} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{trx.amount}</span>
              <span className={`${styles.status} ${trx.status === 'مؤكد' ? styles.statusSuccess : styles.statusPending}`}>
                {trx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
