# 📝 QuickCV — Akıllı CV Oluşturma Uygulaması

QuickCV, kullanıcıların profesyonel CV'lerini saniyeler içinde oluşturmasını sağlayan modern bir **React Native (Expo Router)** tabanlı mobil uygulamadır.  
Uygulama, kullanıcı dostu adım adım CV sihirbazı, özelleştirilebilir temalar, gerçek zamanlı önizleme ve **Google Cloud üzerinde çalışan HTML-to-PDF render servisi** ile profesyonel kalitede çıktılar sunar.

---

## 🚀 Özellikler

### 📌 CV Oluşturma Sihirbazı  
- Kişisel bilgiler  
- Eğitim geçmişi  
- İş deneyimleri  
- Yetenekler  
- Sertifikalar  
- Diller  
- Özet / Hakkımda bölümü  
- Ek iletişim bilgileri  
- Profil fotoğrafı yükleme

### 🎨 Premium CV Şablonları  
Uygulama içerisinde sunulan profesyonel tasarımlar:

- **Classic Blue**
- **Modern Gray**
- **Minimal White**
- **Pink Modern**
- **Teal Wave**
- + Yeni premium temalar…

### 🖨️ PDF Oluşturma (Server Side Rendering)  
QuickCV çıktıları, cihaz üzerinde değil **Google Cloud Run** üzerinde çalışan özel bir sunucuda HTML’den PDF’e dönüştürülür.  

Bu mimari sayesinde:

- Şablon tutarlılığı %100  
- Pixel-perfect PDF çıktısı (iOS + Android)  
- Hızlı render süresi  
- Cihaz performansından bağımsız çalışma  

### ☁️ Google Cloud & Firebase Entegrasyonu  
- Firestore: CV kayıtları  
- Storage: Profil fotoğrafları  
- Firebase Auth: Google + Email/Password giriş  
- Cloud Run: HTML → PDF servisi  

### 🔍 CV Önizleme  
- Tek bir `PreviewCV` bileşeni  
- Dinamik, gerçek zamanlı veri gösterimi  
- Tüm temalarla uyumlu yapı  

### 📂 “CV’lerim” Sayfası  
- CV listeleme  
- Düzenleme  
- PDF’e dönüştürme  
- Silme  

---

## 🏗️ Kullanılan Teknolojiler

### Frontend
- **React Native + Expo**
- **Expo Router**
- **TypeScript**
- **Context API**
- **React Native UI Components**

### Backend (Render Sunucusu)
- **Node.js**
- **Playwright** (HTML-to-PDF)
- **Docker**
- **Google Cloud Run**

### Database & Authentication
- **Firebase Firestore**
- **Firebase Storage**
- **Firebase Auth**

---

## 📁 Proje Yapısı

```bash
/app
  /auth
  /newcv
  /components
    /cvThemes
  /lib
  /assets
/src
  /templates   # HTML CV şablonları
  /fonts


Kurulum
1️⃣ Depoyu Klonla
git clone https://github.com/kullaniciadi/quickcv.git
cd quickcv

2️⃣ Bağımlılıkları Kur
npm install

3️⃣ Ortam Değişkenlerini Ayarla

Proje dizinine .env ekleyin:

EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_RENDER_API_KEY=
EXPO_PUBLIC_RENDER_ENDPOINT=

4️⃣ Uygulamayı Başlat
npm run start
# veya
npx expo start

🖥️ Render Sunucusu (Cloud Run)

Uygulama, PDF oluşturmak için özel bir HTML-to-PDF sunucusu kullanır.
Sunucu:

HTML şablonları alır

Kullanıcı verilerini işler

Playwright ile kaliteli A4 PDF üretir

Binary olarak geri gönderir

Render API Örneği
await fetch(`${endpoint}/render`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/pdf",
    "x-api-key": API_KEY
  },
  body: JSON.stringify({ data, theme })
});

🧩 Yapılacaklar (Roadmap)

 Yeni premium temalar

 Tema renk & font kişiselleştirme

 CV TR → EN otomatik çeviri

 CV’yi LinkedIn’e aktarma

 Örnek CV galerisi

 PDF kalite/boyut optimizasyonu

 Kullanıcı profil sayfası

🤝 Katkıda Bulunma

Repoyu fork'layın

Yeni bir branch açın: feature/ozellik-adi

Değişikliklerinizi commit'leyin

Pull Request gönderin

📄 Lisans

Bu proje MIT License ile lisanslanmıştır.
Detaylar için LICENSE dosyasına göz atabilirsiniz.
