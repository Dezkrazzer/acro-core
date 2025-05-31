const ServerHosting = require('../database/Schema/serverHosting');
const StarsPoint = require('../database/Schema/starsPoint');

// controllers/adminController.js

// Controller ini sekarang diekspor sebagai fungsi
// yang menerima model-model Mongoose sebagai argumen.
module.exports = (ServerHosting, StarsPoint) => {

    // Fungsi pembantu untuk format mata uang
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Mengambil semua data yang dibutuhkan untuk dashboard
    const getDashboard = async (req, res) => {
        try {
            // Statistik Global
            const totalServerHosting = await ServerHosting.countDocuments();
            const totalStarsPoint = await StarsPoint.countDocuments();
            const totalProducts = totalServerHosting + totalStarsPoint;

            // Anda perlu model untuk Orders dan Customers untuk statistik ini
            // Contoh data dummy
            const totalOrders = 250;
            const totalCustomers = 80;
            const totalRevenue = 10500000;

            const recentActivities = [
                { id: 1, type: 'Pembelian Baru', description: 'John Doe membeli Stars Point (500)', time: '5 menit lalu', icon: 'shopping-basket', color: 'text-secondary' },
                { id: 2, type: 'Produk Ditambahkan', description: 'Hosting Platinum telah ditambahkan', time: '1 jam lalu', icon: 'plus-circle', color: 'text-green-500' },
                { id: 3, type: 'Status Pesanan', description: 'Pesanan #12345 selesai', time: '2 jam lalu', icon: 'check-circle', color: 'text-blue-500' },
                { id: 4, type: 'Pelanggan Baru', description: 'Pelanggan baru terdaftar: Jane Smith', time: '3 jam lalu', icon: 'user-plus', color: 'text-purple-500' },
                { id: 5, type: 'Produk Diedit', description: 'Produk diedit: Stars Point (2000)', time: 'Kemarin', icon: 'edit', color: 'text-orange-500' },
            ];

            // Ambil semua produk untuk daftar di bawah
            const serverHostings = await ServerHosting.find().sort({ createdAt: -1 });
            const starsPoints = await StarsPoint.find().sort({ createdAt: -1 });

            res.render('index', {
                title: 'Dashboard Admin',
                totalProducts,
                totalOrders,
                totalCustomers,
                totalRevenue: formatCurrency(totalRevenue),
                recentActivities,
                serverHostings,
                starsPoints,
                currentProduct: null,
                productType: null,
                action: 'add'
            });
        } catch (err) {
            console.error('Error in getDashboard:', err);
            res.status(500).send('Terjadi kesalahan saat memuat dashboard: ' + err.message);
        }
    };

    // Menampilkan Halaman Manajemen Produk
    const getProductsPage = async (req, res) => {
        try {
            const serverHostings = await ServerHosting.find().sort({ createdAt: -1 });
            const starsPoints = await StarsPoint.find().sort({ createdAt: -1 });

            res.render('index', {
                title: 'Manajemen Produk',
                totalProducts: 0, // Dummy for this page
                totalOrders: 0,
                totalCustomers: 0,
                totalRevenue: formatCurrency(0),
                recentActivities: [],
                serverHostings,
                starsPoints,
                currentProduct: null,
                productType: null,
                action: 'add'
            });
        } catch (err) {
            console.error('Error in getProductsPage:', err);
            res.status(500).send('Terjadi kesalahan saat memuat halaman produk: ' + err.message);
        }
    };

    // Menampilkan Form Edit Produk (atau Tambah Produk baru)
    const getEditProductPage = async (req, res) => {
        try {
            const { id, type } = req.params;
            let currentProduct = null;
            let Model;

            if (type === 'hosting') {
                Model = ServerHosting;
            } else if (type === 'stars') {
                Model = StarsPoint;
            } else {
                return res.status(400).send('Tipe produk tidak valid.');
            }

            currentProduct = await Model.findById(id);

            if (!currentProduct) {
                return res.status(404).send('Produk tidak ditemukan.');
            }

            const serverHostings = await ServerHosting.find().sort({ createdAt: -1 });
            const starsPoints = await StarsPoint.find().sort({ createdAt: -1 });

            res.render('index', {
                title: `Edit Produk ${type === 'hosting' ? 'Hosting' : 'Stars Point'}`,
                totalProducts: 0, totalOrders: 0, totalCustomers: 0, totalRevenue: formatCurrency(0), recentActivities: [],
                serverHostings,
                starsPoints,
                currentProduct,
                productType: type,
                action: 'edit'
            });

        } catch (err) {
            console.error('Error in getEditProductPage:', err);
            res.status(500).send('Terjadi kesalahan saat memuat form edit produk: ' + err.message);
        }
    };

    // Menambahkan Produk Baru
    const addProduct = async (req, res) => {
        const { productType, productID, productName, location, amountRAM, amountCPU, amountStorage, price, starsAmount, starsBonus, redirectFrom } = req.body;
        try {
            if (productType === 'hosting') {
                const newProduct = new ServerHosting({
                    productID, productName, location, amountRAM, amountCPU, amountStorage, price
                });
                await newProduct.save();
            } else if (productType === 'stars') {
                const newProduct = new StarsPoint({
                    productID, starsAmount, starsBonus, price
                });
                await newProduct.save();
            } else {
                return res.status(400).send('Tipe produk tidak valid.');
            }
            
            if (redirectFrom === 'dashboard') {
                res.redirect('/dashboard/store');
            } else {
                res.redirect('/dashboard/products');
            }
        } catch (err) {
            console.error('Error in addProduct:', err);
            res.status(400).send('Gagal menambahkan produk: ' + err.message);
        }
    };

    // Memperbarui Produk
    const updateProduct = async (req, res) => {
        const { id, type } = req.params;
        const { productID, productName, location, amountRAM, amountCPU, amountStorage, price, starsAmount, starsBonus, redirectFrom } = req.body;
        try {
            let product;
            if (type === 'hosting') {
                product = await ServerHosting.findById(id);
                if (!product) return res.status(404).send('Produk Hosting tidak ditemukan.');
                Object.assign(product, { productID, productName, location, amountRAM, amountCPU, amountStorage, price });
            } else if (type === 'stars') {
                product = await StarsPoint.findById(id);
                if (!product) return res.status(404).send('Produk Stars Point tidak ditemukan.');
                Object.assign(product, { productID, starsAmount, starsBonus, price });
            } else {
                return res.status(400).send('Tipe produk tidak valid.');
            }

            await product.save();
            
            if (redirectFrom === 'dashboard') {
                res.redirect('/dashboard/store');
            } else {
                res.redirect('/dashboard/products');
            }
        } catch (err) {
            console.error('Error in updateProduct:', err);
            res.status(400).send('Gagal memperbarui produk: ' + err.message);
        }
    };

    // Menghapus Produk
    const deleteProduct = async (req, res) => {
        const { id, type } = req.params;
        try {
            let result;
            if (type === 'hosting') {
                result = await ServerHosting.findByIdAndDelete(id);
            } else if (type === 'stars') {
                result = await StarsPoint.findByIdAndDelete(id);
            } else {
                return res.status(400).send('Tipe produk tidak valid.');
            }

            if (!result) {
                return res.status(404).send('Produk tidak ditemukan.');
            }
            
            const redirectFrom = req.query.redirectFrom || req.body.redirectFrom;
            if (redirectFrom === 'dashboard') {
                res.redirect('/dashboard/store');
            } else {
                res.redirect('/dashboard/products');
            }
        } catch (err) {
            console.error('Error in deleteProduct:', err);
            res.status(500).send('Gagal menghapus produk: ' + err.message);
        }
    };

    // Mengembalikan objek yang berisi semua fungsi controller
    return {
        getDashboard,
        getProductsPage,
        getEditProductPage,
        addProduct,
        updateProduct,
        deleteProduct
    };
};