Ekran Görünümü >>> [https://cehennemgibiyim.github.io/AlbionOnlineTools/index.html](https://cehennemgibiyim.github.io/AlbionOnlineTools/index.html) <<<

Resimli anlatım için bulunan adrese giriniz.>>> [https://cehennemgibiyim.github.io/AlbionOnlineTools/](https://cehennemgibiyim.github.io/AlbionOnlineTools/) <<<

# ⚔️ ALBION ONLINE TOOLS

Kapsamlı Albion Online Yardımcı Aracı — Kurulum ve Kullanım Kılavuzu

**v2.0.0 Güncel Eşya Veritabanı ve Pazar Analizi (West/East/Europe)**

---

## 📋 İçindekiler
1. [Kurulum — İki Çalışma Modu](#1-kurulum--iki-çalışma-modu)
2. [Arayüz Tanıtımı](#2-arayüz-tanıtımı)
3. [Pazar ve Kaynak Analizi](#3-pazar-ve-kaynak-analizi)
4. [Klavye Kısayolları](#4-klavye-kısayolları)
5. [Sorun Giderme](#5-sorun-giderme)

---

## 1. Kurulum — İki Çalışma Modu

Albion Online Tools iki farklı modda çalışabilir. Kullanım alanınıza göre seçebilirsiniz:

### 🌐 Mod 1: GitHub Pages (Statik Web Modu)
Hiçbir kurulum gerektirmez! Yukarıdaki bağlantıya tıklayarak projeyi doğrudan tarayıcınız (Chrome, Firefox, Safari vb.) üzerinden hızlıca kullanabilirsiniz.
API CORS politikalarına tam uyumlu olarak çalışan **Pazar Analizini** ve **Zanaat (Crafting)** hesaplamalarını anlık sunar. Killboard sayfası statik web yapılarına uyumlu olmadığı için bu modda aktif değildir.

### 💻 Mod 2: Yerel (Local) Node.js Modu
Geliştiriciler ve projeyi kendi sisteminde çalıştırmak isteyenler için tam sunucu desteği sağlar:
```bash
# Projeyi indirin
git clone https://github.com/cehennemgibiyim/AlbionOnlineTools.git

# Klasöre girin
cd AlbionOnlineTools

# Bağımlılıkları yükleyin
npm install

# Sunucuyu başlatın
npm start
```
Ardından tarayıcınızda veya açılan Electron penceresinde `http://localhost:3000` üzerinden her şeye erişebilirsiniz.

---

## 2. Arayüz Tanıtımı

- **Zanaat (Craft) Paneli:** Eşya ismine veya kategorisine göre listeleme yapar. "Kâr/Zarar" hesabı için eşya üretim masraflarını, geri dönüşleri ve pazar fiyatlarını hesaplar.
- **Pazar Analizi (Market):** Şehirlere göre (Caerleon, Bridgewatch, FortSterling vb.) anlık fiyat dalgalanmasını ve geçmiş değerleri detaylı bir Grafik (Chart.js) yardımıyla sunar.
- **Altın (Gold) Geçmişi:** Oyun içi altın fiyatının geçmiş zaman haritasını çizer.
- **Tasarım ve Ayarlar (Settings):** Dil değişimi, Tema ayarları ve Sunucu seçimini (Americas, Asia, Europe) anında aktif hale getirir. Tüm pazar verileri anında seçtiğiniz sunucuyla dinamik olarak senkronize olur!

---

## 3. Pazar ve Kaynak Analizi

Sistem güncel olarak **Albion Online Data Project (ao-data)** üzerinden çalışır ve **5800 üzerindeki üretilebilir/üretilemez** eşyayı destekler.
Oyundaki yeni "Awakened" silah teçhizatları ve metamorfik (Shape-shifter) silahlar tamamen entegredir. Tüm eşya grafikleri doğrudan resmi Albion Asset CDN sunucularından güncel şekliyle çekilmektedir.

---

## 4. Klavye Kısayolları

Platform içerisinde gezinmeyi hızlandırmak için eklenen komutlar:
- `Ctrl` + `K` = Hızlı Arama Kutusuna Odaklan
- `Ctrl` + `S` = Ayarlar'ı (Settings) açar
- `Ctrl` + `/` = Bu Kısayollar menüsünü gösterir

---

## 5. Sorun Giderme

- **"Pazar Verileri Yüklenmiyor" Hatası:** Seçtiğiniz sunucudaki Albion Data Project node'ları geçici süreyle veri alamıyor olabilir, sayfayı yenilemeyi veya başka bir şehir / eşya denemeyi ihmal etmeyin.
- **"KillBoard Ekranı Görünmüyor":** KillBoard CORS yapısı nedeniyle GitHub Pages gibi statik yapılar üzerinden gösterilemediğinden bu sürümde Pazar Analizi odaklı bir panel tasarlanmıştır. Tam randımanlı lokal çalışma (Mod 2) ile kullanılabilir.
