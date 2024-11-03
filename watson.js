import puppeteer from 'puppeteer';

const getSephoraProductDetails = async (link) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Kullanıcı aracını gerçek bir tarayıcı gibi ayarlıyoruz
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'
    );

    // Sayfa konsolundaki tüm mesajları loglamak
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

    // Sayfaya gidiyoruz ve sayfanın tam olarak yüklendiğinden emin oluyoruz
    await page.goto(link, { waitUntil: 'networkidle2' });

    // Çerez bildirimini kabul etme
    try {
      await page.waitForSelector('#footer_tc_privacy_button_3', { timeout: 5000 });
      await page.click('#footer_tc_privacy_button_3');
      console.log("Çerez bildirimi kapatıldı.");
    } catch (error) {
      console.log('Çerez bildirimi bulunamadı veya kapatılamadı.');
    }

    // Ekstra bekleme süresi
    await new Promise((r) => setTimeout(r, 5000));

    // `schema.org` yapısından ürün bilgilerini çekiyoruz
    const productDetails = await page.evaluate(() => {
      const getItemPropContent = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.getAttribute('content') : null;
      };

      return {
        name: getItemPropContent('meta[itemprop="name"]'),
        price: getItemPropContent('meta[itemprop="price"]'),
        currency: getItemPropContent('meta[itemprop="priceCurrency"]'),
        sku: getItemPropContent('meta[itemprop="sku"]'),
        availability: getItemPropContent('meta[itemprop="availability"]') === 'https://schema.org/InStock',
        url: getItemPropContent('meta[itemprop="url"]'),
      };
    });

    await browser.close();

    if (!productDetails) {
      throw new Error('Product details not found');
    }

    return productDetails;
  } catch (error) {
    console.error("Error:", error.message);
    return { error: error.message };
  }
};

// Test case
(async () => {
  const link = 'https://www.sephora.com.tr/p/mini-hydro-grip-primer-P3988085.html';
  const data = await getSephoraProductDetails(link);
  console.log('Product Details:', data);
})();