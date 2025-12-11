const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

class HotelMurahScraper {
    constructor() {
        this.baseUrl = 'https://www.hotelmurah.com/pulsa';
        const jar = new CookieJar();
        
        this.session = wrapper(axios.create({
            jar,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
            },
            timeout: 30000,
            maxRedirects: 5
        }));
    }

    getDefaultProducts() {
        return [
            { name: 'DANA 1000', value: 1000, displayPrice: 'Rp 1.000', id: '233' },
            { name: 'DANA 2000', value: 2000, displayPrice: 'Rp 2.000', id: '234' },
            { name: 'DANA 3000', value: 3000, displayPrice: 'Rp 3.000', id: '235' },
            { name: 'DANA 5000', value: 5000, displayPrice: 'Rp 5.000', id: '237' },
            { name: 'DANA 10.000', value: 10000, displayPrice: 'Rp 10.000', id: '238' },
            { name: 'DANA 20.000', value: 20000, displayPrice: 'Rp 20.000', id: '239' },
            { name: 'DANA 25.000', value: 25000, displayPrice: 'Rp 25.000', id: '240' },
            { name: 'DANA 50.000', value: 50000, displayPrice: 'Rp 50.000', id: '241' },
            { name: 'DANA 75.000', value: 75000, displayPrice: 'Rp 75.000', id: '242' },
            { name: 'DANA 100.000', value: 100000, displayPrice: 'Rp 100.000', id: '243' }
        ];
    }

    async bypassCloudflare() {
        try {
            await this.session.get(this.baseUrl);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return true;
        } catch (error) {
            return false;
        }
    }

    async getDanaProducts() {
        try {
            await this.bypassCloudflare();
            const response = await this.session.get(`${this.baseUrl}/top-up-dana`);
            const $ = cheerio.load(response.data);
            const products = [];

            $('.grid-kuota').each((i, el) => {
                const onclick = $(el).attr('onclick');
                const title = $(el).find('.title-kuota').text().trim();
                const price = $(el).find('.price-kuota span').text().trim();
                
                const idMatch = onclick?.match(/btnklik\("Rp ([\d.]+)", "(\d+)"/);
                if (idMatch) {
                    const value = parseInt(idMatch[1].replace(/\./g, ''));
                    products.push({
                        name: title,
                        value: value,
                        displayPrice: price,
                        id: idMatch[2]
                    });
                }
            });

            return products.length > 0 ? products : this.getDefaultProducts();
        } catch (error) {
            return this.getDefaultProducts();
        }
    }

    async createPayment(phoneNumber, amount) {
        try {
            const products = await this.getDanaProducts();
            const product = products.find(p => p.value === amount);
            
            if (!product) {
                return { success: false, error: 'Nominal tidak valid' };
            }

            const orderData = new URLSearchParams({
                phone_number: phoneNumber,
                product_id: product.id,
                nominal: amount
            });

            this.session.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            this.session.defaults.headers['Referer'] = `${this.baseUrl}/top-up-dana`;

            const orderResponse = await this.session.post(
                `${this.baseUrl}/Ewallet/detailOrder`,
                orderData
            );

            let $ = cheerio.load(orderResponse.data);

            this.session.defaults.headers['Referer'] = `${this.baseUrl}/Ewallet/detailOrder`;
            
            const paymentResponse = await this.session.post(
                `${this.baseUrl}/ewallet/finishxendit`,
                new URLSearchParams({ payment_method: 'qris' })
            );

            $ = cheerio.load(paymentResponse.data);

            const qrCodeUrl = $('.img-qris, img.bank-icon').attr('src');
            const orderNumber = $('td:contains("No. Order")').next().find('b').text().trim();
            const rrn = $('td:contains("RRN")').next().find('b').text().trim();
            const nominal = $('td:contains("Nominal")').next().find('b').text().trim();
            const totalPrice = $('td:contains("Total Harga")').next().find('b').text().trim();

            return {
                success: true,
                qrCodeUrl: qrCodeUrl?.startsWith('http') ? qrCodeUrl : `https://img.hotelmurah.com${qrCodeUrl}`,
                orderNumber: orderNumber,
                rrn: rrn,
                phoneNumber: phoneNumber,
                nominal: nominal,
                totalPrice: totalPrice,
                adminFee: 1000,
                expiry: '5 menit'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new HotelMurahScraper();