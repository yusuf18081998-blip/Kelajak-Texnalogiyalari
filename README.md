# «Kelajak Texnologiyalari» — To'liq sayt (Admin + O'quvchi panellari)

## Loyiha tuzilishi
```
index.html          → Bosh sahifa (ma'lumot sayti)
style.css, script.js, KT_logo.png
app/
  login.html + login.js       → Kirish sahifasi
  admin.html + admin.js       → Admin paneli
  student.html + student.js  → O'quvchi paneli
  firebase-config.js          → Firebase kalitlari (TO'LDIRISH SHART)
  firebase-init.js            → Firebase ulanishi (tegmang)
  app.css                     → Panel dizayni
```

## 1-QADAM: Firebase loyiha yaratish (bepul, ~10 daqiqa)

1. https://console.firebase.google.com ga Google akkaunt bilan kiring
2. **"Add project"** → nom bering (masalan `kelajak-texnologiyalari`) → davom eting
3. Chap menyudan **Build → Authentication** → **"Get started"** → **"Sign-in method"** bo'limida **Email/Password**ni yoqing (Enable)
4. **Build → Firestore Database** → **"Create database"** → **"Start in test mode"** → yaqin regionni tanlang
5. **Build → Storage** → **"Get started"** → **"Start in test mode"**
6. Chapdagi ⚙️ (Project settings) → pastda **"Your apps"** → **`</>`** (Web) belgisini bosing → nom bering → **"Register app"**
7. Chiqqan `firebaseConfig` obyektini to'liq nusxalab, `app/firebase-config.js` faylidagi shu nomdagi obyekt o'rniga qo'ying.

## 2-QADAM: Birinchi ADMIN hisobini qo'lda yaratish

Saytda "admin qo'shish" tugmasi yo'q (xavfsizlik uchun) — birinchi adminni Firebase Console orqali qo'lda yaratasiz:

1. **Authentication → Users → "Add user"**
   - Email: `admin@kt-portal.local`
   - Password: o'zingiz xohlagan parol (masalan `Admin2026#`)
2. Yaratilgan foydalanuvchining **User UID** qiymatini nusxalang (jadvalda ko'rinadi)
3. **Firestore Database → Start collection** → nomi: `users`
4. **Document ID** joyiga o'sha UID'ni qo'ying, quyidagi maydonlarni qo'shing:
   | Maydon | Turi | Qiymat |
   |---|---|---|
   | ism | string | Muhammad Yusuf |
   | familiya | string | Xo'jayev |
   | role | string | `admin` |
   | ball | number | 0 |

5. Saqlang. Endi saytda login sahifasida:
   - **ID:** `admin`
   - **Parol:** yuqorida qo'ygan parolingiz

   (Chunki tizim ID'ga avtomatik `@kt-portal.local` qo'shadi.)

Bundan keyingi barcha o'quvchilarni **Admin panel → "O'quvchi qo'shish"** orqali to'g'ridan-to'g'ri saytdan qo'sha olasiz — alohida Firebase Console kerak emas.

## 3-QADAM: Xavfsizlik qoidalari (Firestore va Storage)

"Test mode" 30 kundan keyin avtomatik yopiladi. Doimiy ishlashi uchun **Firestore Database → Rules** bo'limiga o'ting va quyidagini joylashtiring:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isAdmin();
      allow update: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }
    match /ishreja/{docId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}
```

**Storage → Rules** bo'limiga esa:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profiles/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4-QADAM: Saytni internetga joylashtirish

Eng oson yo'l — **Firebase Hosting** (bepul):
1. Kompyuteringizda: `npm install -g firebase-tools`
2. `firebase login`
3. Loyiha papkasida: `firebase init hosting` (public papka sifatida shu papkani ko'rsating)
4. `firebase deploy`

Yoki oddiyroq: barcha fayllarni **GitHub**ga yuklab, **GitHub Pages** orqali bepul joylashtirishingiz mumkin.

## Muhim eslatmalar

- `firebase-config.js` to'ldirilmaguncha sayt login sahifasida "Firebase sozlanmagan" xatosini beradi — bu normal holat.
- AI yordamchi hozircha oddiy (kalit so'zga asoslangan) javob beradi, real internetga ulanmagan. Kelajakda haqiqiy AI (Claude/ChatGPT) API kaliti bilan almashtirilishi mumkin — bu alohida ish talab qiladi va o'z narxi (API xarajati) bor.
- "Faoliyat monitoring" o'quvchi qaysi bo'limda ekanini ko'rsatadi (masalan "Reyting", "Profil"), lekin sahifadagi har bir bosishni emas — bu shaxsiy hayotni hurmat qilish uchun ataylab shunday qilingan.
