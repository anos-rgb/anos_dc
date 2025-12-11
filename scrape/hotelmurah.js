const axios = require('axios');
const cheerio = require('cheerio');

class HotelMurahScraper {
    constructor() {
        this.baseUrl = 'https://www.hotelmurah.com/pulsa';
        this.session = axios.create({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language': 'id-ID,id;q=0.9',
                'Referer': 'https://www.hotelmurah.com/'
            }
        });
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

    async getDanaProducts() {
        try {
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

            // Step 1: Submit order
            const orderData = new URLSearchParams({
                phone_number: phoneNumber,
                product_id: product.id,
                nominal: amount
            });

            const orderResponse = await this.session.post(
                `${this.baseUrl}/Ewallet/detailOrder`,
                orderData
            );

            let $ = cheerio.load(orderResponse.data);
            const totalHarga = $('#total_harga').text().trim();

            // Step 2: Lanjutkan pembayaran
            const paymentResponse = await this.session.post(
                `${this.baseUrl}/ewallet/finishxendit`,
                new URLSearchParams({ payment_method: 'qris' })
            );

            $ = cheerio.load(paymentResponse.data);

            // Extract data pembayaran
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