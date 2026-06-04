/**
 * Single UI-string dictionary so we can toggle EN/ID. Bahasa Indonesia is the
 * primary locale; English is secondary. Every user-facing string lives here —
 * do not hardcode copy in components.
 */

export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "id";

export interface Dictionary {
  nav: { browse: string; howItWorks: string; partners: string; signIn: string };
  hero: { eyebrow: string; title: string; subtitle: string; cta: string; ctaSecondary: string };
  search: {
    city: string;
    date: string;
    color: string;
    size: string;
    occasion: string;
    price: string;
    submit: string;
  };
  valueProps: { title: string; items: { title: string; body: string }[] };
  home: {
    announce: string;
    hero: {
      eyebrow: string;
      titleLead: string;
      titleEm: string;
      subtitle: string;
      ctaPrimary: string;
      ctaSecondary: string;
      searchCity: string;
      searchOccasion: string;
      searchAny: string;
      searchCta: string;
    };
    stats: { value: string; label: string }[];
    occasions: { eyebrow: string; title: string; subtitle: string };
    featured: {
      eyebrow: string;
      title: string;
      subtitle: string;
      perDay: string;
      cta: string;
      items: { name: string; tag: string; city: string; price: string }[];
    };
    steps: {
      eyebrow: string;
      title: string;
      items: { n: string; title: string; body: string }[];
    };
    why: { eyebrow: string; title: string };
    partner: { eyebrow: string; title: string; body: string; cta: string };
    closing: { eyebrow: string; cta: string };
  };
  footer: { parentLine: string; rights: string; built: string };
  auth: {
    signIn: {
      title: string;
      subtitle: string;
      emailLabel: string;
      passwordLabel: string;
      submit: string;
      google: string;
      forgot: string;
      noAccount: string;
      signUpLink: string;
    };
    signUp: {
      title: string;
      subtitle: string;
      nameLabel: string;
      emailLabel: string;
      phoneLabel: string;
      phoneHint: string;
      passwordLabel: string;
      passwordHint: string;
      submit: string;
      google: string;
      haveAccount: string;
      signInLink: string;
      checkEmail: string;
    };
    forgot: {
      title: string;
      subtitle: string;
      emailLabel: string;
      submit: string;
      back: string;
      sent: string;
    };
    errors: {
      generic: string;
      invalidEmail: string;
      shortPassword: string;
      nameRequired: string;
      invalidCredentials: string;
      emailTaken: string;
    };
    legalNote: string;
  };
  partner: {
    nav: {
      dashboard: string;
      bookings: string;
      catalog: string;
      payouts: string;
      settings: string;
    };
    dashboard: {
      greeting: string;
      kpis: {
        bookingsThisMonth: string;
        gmvThisMonth: string;
        payoutPending: string;
        rating: string;
      };
      recentBookings: string;
      addDress: string;
    };
    bookings: {
      title: string;
      empty: string;
      tabAll: string;
      tabPending: string;
      tabConfirmed: string;
      tabInUse: string;
      tabReturned: string;
      tabCompleted: string;
      markInUse: string;
      markReturned: string;
      markCompleted: string;
      fileClaim: string;
      claimAmount: string;
      claimReason: string;
      claimReasonOptions: {
        stain: string;
        tear: string;
        late: string;
        lost: string;
        other: string;
      };
      claimDescription: string;
      claimSubmit: string;
      claimSubmitted: string;
      stateBlocked: string;
    };
    catalog: {
      title: string;
      addCta: string;
      empty: string;
      statusActive: string;
      statusDraft: string;
      statusArchived: string;
      toggleActivate: string;
      toggleDraft: string;
    };
    payouts: {
      title: string;
      pending: string;
      empty: string;
    };
  };
  checkout: {
    title: string;
    summary: string;
    daysLine: string;
    rentalLine: string;
    serviceLine: string;
    shippingLine: string;
    depositLine: string;
    depositTooltip: string;
    total: string;
    fulfillmentLabel: string;
    fulfillmentPickup: string;
    fulfillmentShipping: string;
    shippingAddressLabel: string;
    shippingCityLabel: string;
    phoneLabel: string;
    notesLabel: string;
    notesHint: string;
    agreementLabel: string;
    submit: string;
    invalidRange: string;
    minDays: string;
    maxDays: string;
    unavailable: string;
  };
  payment: {
    title: string;
    timeoutNote: string;
    timeoutBadge: string;
    tabBank: string;
    tabQris: string;
    bankAccount: string;
    bankAmount: string;
    bankCode: string;
    bankNote: string;
    qrisNote: string;
    copy: string;
    copied: string;
    uploadLabel: string;
    paidCta: string;
    paidAfter: string;
    whatsappCta: string;
    cancelled: string;
    awaiting: string;
  };
  bookings: {
    title: string;
    empty: string;
    tabActive: string;
    tabCompleted: string;
    detailCta: string;
    status: {
      pending_payment: string;
      confirmed: string;
      in_use: string;
      returned: string;
      completed: string;
      cancelled: string;
      disputed: string;
    };
    deposit: {
      held: string;
      refund_pending: string;
      refunded: string;
      partially_withheld: string;
      forfeited: string;
      not_required: string;
    };
  };
  catalog: {
    browse: {
      title: string;
      countLabel: string;
      empty: string;
      emptyHint: string;
      reset: string;
      sortLabel: string;
      sortOptions: { relevance: string; priceAsc: string; priceDesc: string; newest: string; rating: string };
      filterButton: string;
      filterClose: string;
    };
    filters: {
      city: string;
      dates: string;
      datesStart: string;
      datesEnd: string;
      category: string;
      categories: { dress: string; gown: string; kebaya: string; suit: string };
      occasion: string;
      occasions: { wedding: string; engagement: string; prom: string; birthday: string; photoshoot: string; traditional: string };
      color: string;
      size: string;
      sizeUseMine: string;
      sizeNeedProfile: string;
      price: string;
      perDay: string;
    };
    detail: {
      perDay: string;
      depositLine: string;
      depositTooltip: string;
      pickVariant: string;
      pickDates: string;
      fits: string;
      maybeFits: string;
      bookNow: string;
      unavailable: string;
      youMayLike: string;
      tabs: { description: string; measurements: string; reviews: string; partner: string };
      seeAllFromPartner: string;
    };
    wishlist: {
      title: string;
      empty: string;
      cta: string;
    };
  };
  account: {
    nav: {
      profile: string;
      sizing: string;
      bookings: string;
      wishlist: string;
      partnerDashboard: string;
      signOut: string;
    };
    profile: {
      title: string;
      subtitle: string;
      nameLabel: string;
      phoneLabel: string;
      cityLabel: string;
      cityPlaceholder: string;
      save: string;
      saved: string;
    };
    sizing: {
      title: string;
      subtitle: string;
      banner: string;
      empty: string;
      add: string;
      labelLabel: string;
      sizeLabel: string;
      bustLabel: string;
      waistLabel: string;
      hipLabel: string;
      shoulderLabel: string;
      lengthLabel: string;
      heightLabel: string;
      weightLabel: string;
      notesLabel: string;
      defaultToggle: string;
      defaultBadge: string;
      save: string;
      cancel: string;
      edit: string;
      delete: string;
      deleteConfirm: string;
      cmShort: string;
      kgShort: string;
    };
  };
}

const id: Dictionary = {
  nav: {
    browse: "Jelajahi Koleksi",
    howItWorks: "Cara Kerja",
    partners: "Untuk Partner",
    signIn: "Masuk",
  },
  hero: {
    eyebrow: "Sewa busana di Jakarta, Surabaya, Bali & Bandung",
    title: "Rent the look. Own the moment.",
    subtitle:
      "Satu tempat untuk menemukan, memesan, dan menyewa busana dari penyewa independen pilihan — dengan deposit yang aman.",
    cta: "Mulai Jelajahi",
    ctaSecondary: "Cara Kerja",
  },
  search: {
    city: "Kota",
    date: "Tanggal",
    color: "Warna",
    size: "Ukuran",
    occasion: "Acara",
    price: "Harga",
    submit: "Cari Busana",
  },
  valueProps: {
    title: "Kenapa LOVEW Style",
    items: [
      {
        title: "Kurasi terpercaya",
        body: "Penyewa independen terbaik di kotamu, dalam satu platform yang mudah dicari.",
      },
      {
        title: "Deposit aman",
        body: "Deposit ditahan LOVEW dan otomatis dikembalikan setelah busana dikembalikan.",
      },
      {
        title: "Pesan online",
        body: "Pilih tanggal, simpan ukuranmu, dan pesan tanpa repot chat bolak-balik.",
      },
    ],
  },
  home: {
    announce: "Kini hadir di Jakarta · Surabaya · Bali · Bandung",
    hero: {
      eyebrow: "Sewa busana, dengan rasa",
      titleLead: "Rent the look.",
      titleEm: "Own the moment.",
      subtitle:
        "Satu tempat untuk menemukan, memesan, dan menyewa busana pilihan dari penyewa independen terbaik — dengan deposit yang aman dan otomatis kembali.",
      ctaPrimary: "Jelajahi koleksi",
      ctaSecondary: "Cara kerja",
      searchCity: "Kota",
      searchOccasion: "Acara",
      searchAny: "Semua",
      searchCta: "Cari busana",
    },
    stats: [
      { value: "4", label: "Kota" },
      { value: "120+", label: "Busana pilihan" },
      { value: "100%", label: "Deposit dikembalikan" },
      { value: "3 hari", label: "Refund deposit" },
    ],
    occasions: {
      eyebrow: "Belanja per acara",
      title: "Untuk setiap momen penting.",
      subtitle: "Dari pelaminan sampai pemotretan — temukan look-nya.",
    },
    featured: {
      eyebrow: "Sedang naik daun",
      title: "Pilihan minggu ini.",
      subtitle: "Sebagian kecil dari koleksi yang menanti.",
      perDay: "/ hari",
      cta: "Lihat semua koleksi",
      items: [
        { name: "Aurora Gown", tag: "Sutra eucalyptus · panjang", city: "Jakarta", price: "Rp 450rb" },
        { name: "Selene Kebaya", tag: "Payet tangan · tradisional", city: "Bali", price: "Rp 380rb" },
        { name: "Noir Column", tag: "Beludru wine · malam", city: "Surabaya", price: "Rp 520rb" },
        { name: "Marble Suit", tag: "Ivory tailored · dua potong", city: "Bandung", price: "Rp 410rb" },
      ],
    },
    steps: {
      eyebrow: "Cara kerja",
      title: "Empat langkah, tanpa repot.",
      items: [
        { n: "01", title: "Temukan", body: "Filter berdasarkan kota, tanggal, dan ukuran. Simpan ukuranmu sekali, kami tampilkan yang muat." },
        { n: "02", title: "Pesan tanggal", body: "Pilih tanggal pakai dan booking online. Sewa + deposit dalam satu transaksi aman." },
        { n: "03", title: "Pakai", body: "Ambil di tempat partner atau dikirim ke rumah. Tampil memukau di harimu." },
        { n: "04", title: "Kembalikan", body: "Kembalikan ke partner. Deposit otomatis kembali dalam 3 hari." },
      ],
    },
    why: {
      eyebrow: "Kenapa LOVEW Style",
      title: "Sewa yang terasa seperti milik sendiri.",
    },
    partner: {
      eyebrow: "Untuk partner",
      title: "Punya koleksi? Sewakan bersama kami.",
      body: "Jangkau penyewa baru di empat kota, kelola booking dengan mudah, dan biarkan kami yang mengurus pembayaran serta deposit.",
      cta: "Jadi partner",
    },
    closing: {
      eyebrow: "LOVEW Style",
      cta: "Mulai jelajahi",
    },
  },
  footer: {
    parentLine: "Sebuah produk dari LOVEW Studio",
    rights: "Hak cipta dilindungi.",
    built: "Style & Spaces untuk momen yang berarti.",
  },
  auth: {
    signIn: {
      title: "Masuk",
      subtitle: "Selamat datang kembali di LOVEW Style.",
      emailLabel: "Email",
      passwordLabel: "Kata sandi",
      submit: "Masuk",
      google: "Lanjut dengan Google",
      forgot: "Lupa kata sandi?",
      noAccount: "Belum punya akun?",
      signUpLink: "Daftar di sini",
    },
    signUp: {
      title: "Buat akun",
      subtitle: "Daftar untuk simpan ukuran, wishlist, dan pesan tanpa repot.",
      nameLabel: "Nama lengkap",
      emailLabel: "Email",
      phoneLabel: "Nomor WhatsApp",
      phoneHint: "Untuk konfirmasi booking. Contoh: 0812xxxxxxxx",
      passwordLabel: "Kata sandi",
      passwordHint: "Minimal 8 karakter.",
      submit: "Daftar",
      google: "Daftar dengan Google",
      haveAccount: "Sudah punya akun?",
      signInLink: "Masuk di sini",
      checkEmail:
        "Cek emailmu untuk link konfirmasi. Setelah dikonfirmasi, kamu otomatis masuk.",
    },
    forgot: {
      title: "Lupa kata sandi",
      subtitle: "Kami kirim link untuk reset ke emailmu.",
      emailLabel: "Email",
      submit: "Kirim link reset",
      back: "Kembali ke Masuk",
      sent: "Link reset sudah dikirim. Cek inbox (dan folder spam) ya.",
    },
    errors: {
      generic: "Terjadi kesalahan. Coba lagi sebentar.",
      invalidEmail: "Format email tidak valid.",
      shortPassword: "Kata sandi minimal 8 karakter.",
      nameRequired: "Nama tidak boleh kosong.",
      invalidCredentials: "Email atau kata sandi salah.",
      emailTaken: "Email sudah terdaftar. Coba masuk atau reset kata sandi.",
    },
    legalNote:
      "Dengan melanjutkan, kamu menyetujui Syarat & Ketentuan dan Kebijakan Privasi LOVEW Style.",
  },
  partner: {
    nav: {
      dashboard: "Dashboard",
      bookings: "Booking",
      catalog: "Katalog",
      payouts: "Payout",
      settings: "Pengaturan",
    },
    dashboard: {
      greeting: "Halo",
      kpis: {
        bookingsThisMonth: "Booking bulan ini",
        gmvThisMonth: "GMV bulan ini",
        payoutPending: "Payout menanti",
        rating: "Rating",
      },
      recentBookings: "Booking terbaru",
      addDress: "Tambah dress",
    },
    bookings: {
      title: "Booking",
      empty: "Belum ada booking.",
      tabAll: "Semua",
      tabPending: "Menunggu",
      tabConfirmed: "Dikonfirmasi",
      tabInUse: "Sedang dipakai",
      tabReturned: "Dikembalikan",
      tabCompleted: "Selesai",
      markInUse: "Tandai sedang dipakai",
      markReturned: "Tandai dikembalikan",
      markCompleted: "Tandai selesai",
      fileClaim: "Klaim deposit",
      claimAmount: "Jumlah klaim (Rp)",
      claimReason: "Alasan",
      claimReasonOptions: {
        stain: "Noda",
        tear: "Robek",
        late: "Terlambat dikembalikan",
        lost: "Hilang",
        other: "Lainnya",
      },
      claimDescription: "Penjelasan detail",
      claimSubmit: "Kirim klaim",
      claimSubmitted: "Klaim sudah dikirim. Tim LOVEW akan memutuskan.",
      stateBlocked: "Aksi ini tidak tersedia untuk status saat ini.",
    },
    catalog: {
      title: "Katalog dress",
      addCta: "+ Tambah dress",
      empty: "Belum ada dress di katalog. Yuk tambahkan yang pertama.",
      statusActive: "Aktif",
      statusDraft: "Draft",
      statusArchived: "Arsip",
      toggleActivate: "Aktifkan",
      toggleDraft: "Jadikan draft",
    },
    payouts: {
      title: "Payout",
      pending: "Payout menanti (booking selesai, belum di-batch)",
      empty: "Belum ada payout.",
    },
  },
  checkout: {
    title: "Konfirmasi booking",
    summary: "Ringkasan pesanan",
    daysLine: "hari",
    rentalLine: "Sewa",
    serviceLine: "Biaya layanan (3%)",
    shippingLine: "Ongkir",
    depositLine: "Deposit (dikembalikan)",
    depositTooltip:
      "Deposit ditahan LOVEW dan dikembalikan dalam 3 hari setelah dress dikembalikan aman.",
    total: "Total bayar",
    fulfillmentLabel: "Pengambilan",
    fulfillmentPickup: "Ambil di tempat partner",
    fulfillmentShipping: "Kirim ke alamat saya",
    shippingAddressLabel: "Alamat lengkap",
    shippingCityLabel: "Kota pengiriman",
    phoneLabel: "Nomor WhatsApp",
    notesLabel: "Catatan untuk partner (opsional)",
    notesHint: "Misal: butuh tambahan asesori, request waktu fitting, dll.",
    agreementLabel:
      "Saya setuju dengan Syarat & Ketentuan dan Kebijakan Deposit LOVEW Style.",
    submit: "Konfirmasi booking",
    invalidRange: "Tanggal tidak valid.",
    minDays: "Minimal sewa",
    maxDays: "Maksimal sewa",
    unavailable: "Ada tanggal yang sudah dibooking di rentang ini.",
  },
  payment: {
    title: "Selesaikan pembayaran",
    timeoutNote:
      "Selesaikan pembayaran dalam 30 menit, kalau tidak booking otomatis dibatalkan.",
    timeoutBadge: "Sisa waktu",
    tabBank: "Transfer Bank",
    tabQris: "QRIS",
    bankAccount: "Transfer ke",
    bankAmount: "Jumlah transfer",
    bankCode: "Kode booking (cantumkan di catatan transfer)",
    bankNote:
      "Pakai kode booking di catatan transfer biar tim kami cepat mencocokkannya.",
    qrisNote: "Scan QR berikut dengan aplikasi e-wallet apapun.",
    copy: "Salin",
    copied: "Tersalin",
    uploadLabel: "Upload bukti transfer (opsional)",
    paidCta: "Saya sudah bayar",
    paidAfter:
      "Terima kasih! Tim LOVEW akan konfirmasi pembayaran kamu dalam 1 jam.",
    whatsappCta: "Kontak via WhatsApp",
    cancelled:
      "Booking ini sudah dibatalkan karena melewati batas waktu pembayaran.",
    awaiting:
      "Pembayaran sedang dikonfirmasi tim kami. Kamu akan dapat notifikasi via WhatsApp & email.",
  },
  bookings: {
    title: "Booking",
    empty: "Belum ada booking.",
    tabActive: "Aktif",
    tabCompleted: "Selesai",
    detailCta: "Detail",
    status: {
      pending_payment: "Menunggu pembayaran",
      confirmed: "Dikonfirmasi",
      in_use: "Sedang dipakai",
      returned: "Dikembalikan",
      completed: "Selesai",
      cancelled: "Dibatalkan",
      disputed: "Dalam tinjauan",
    },
    deposit: {
      held: "Deposit dipegang",
      refund_pending: "Refund diproses",
      refunded: "Refund selesai",
      partially_withheld: "Dipotong sebagian",
      forfeited: "Hilang",
      not_required: "—",
    },
  },
  catalog: {
    browse: {
      title: "Jelajahi koleksi",
      countLabel: "dress ditemukan",
      empty: "Belum ada yang cocok.",
      emptyHint: "Coba ubah filter atau hapus beberapa pilihan.",
      reset: "Reset filter",
      sortLabel: "Urutkan",
      sortOptions: {
        relevance: "Paling relevan",
        priceAsc: "Harga: termurah",
        priceDesc: "Harga: termahal",
        newest: "Terbaru",
        rating: "Rating tertinggi",
      },
      filterButton: "Filter",
      filterClose: "Selesai",
    },
    filters: {
      city: "Kota",
      dates: "Tanggal pakai",
      datesStart: "Mulai",
      datesEnd: "Selesai",
      category: "Kategori",
      categories: {
        dress: "Dress",
        gown: "Gown",
        kebaya: "Kebaya",
        suit: "Jas",
      },
      occasion: "Acara",
      occasions: {
        wedding: "Pernikahan",
        engagement: "Tunangan",
        prom: "Prom",
        birthday: "Ulang tahun",
        photoshoot: "Pemotretan",
        traditional: "Tradisional",
      },
      color: "Warna",
      size: "Ukuran",
      sizeUseMine: "Pakai ukuranku",
      sizeNeedProfile: "Simpan ukuranmu dulu →",
      price: "Harga / hari",
      perDay: "per hari",
    },
    detail: {
      perDay: "/ hari",
      depositLine: "Deposit (dikembalikan)",
      depositTooltip:
        "Deposit ditahan LOVEW sebagai jaminan dan dikembalikan dalam 3 hari setelah dress dikembalikan dengan aman.",
      pickVariant: "Pilih ukuran",
      pickDates: "Pilih tanggal pakai",
      fits: "Cocok dengan ukuranmu",
      maybeFits: "Perlu disesuaikan",
      bookNow: "Booking sekarang",
      unavailable: "Variant ini tidak tersedia di tanggal yang dipilih.",
      youMayLike: "Kamu mungkin suka",
      tabs: {
        description: "Deskripsi",
        measurements: "Ukuran",
        reviews: "Ulasan",
        partner: "Partner",
      },
      seeAllFromPartner: "Lihat semua dress dari partner ini",
    },
    wishlist: {
      title: "Wishlist",
      empty: "Belum ada yang disimpan.",
      cta: "Jelajahi koleksi",
    },
  },
  account: {
    nav: {
      profile: "Profil",
      sizing: "Ukuran",
      bookings: "Booking",
      wishlist: "Wishlist",
      partnerDashboard: "Dashboard Partner",
      signOut: "Keluar",
    },
    profile: {
      title: "Profil",
      subtitle: "Informasi dasar akunmu.",
      nameLabel: "Nama lengkap",
      phoneLabel: "Nomor WhatsApp",
      cityLabel: "Kota",
      cityPlaceholder: "Pilih kota",
      save: "Simpan",
      saved: "Tersimpan.",
    },
    sizing: {
      title: "Ukuranku",
      subtitle: "Simpan ukuran sekali, nanti kami filter dress yang muat otomatis.",
      banner:
        "Tambahkan ukuran tubuhmu di sini. Bisa simpan lebih dari satu — misal satu untuk kamu, satu untuk Mama. Yang ditandai bintang dipakai default.",
      empty: "Belum ada ukuran. Tambahkan yang pertama 👇",
      add: "Tambah ukuran baru",
      labelLabel: "Nama label",
      sizeLabel: "Ukuran umum",
      bustLabel: "Lingkar dada",
      waistLabel: "Lingkar pinggang",
      hipLabel: "Lingkar pinggul",
      shoulderLabel: "Lebar bahu",
      lengthLabel: "Panjang dress",
      heightLabel: "Tinggi badan",
      weightLabel: "Berat badan",
      notesLabel: "Catatan (opsional)",
      defaultToggle: "Pakai sebagai default",
      defaultBadge: "Default",
      save: "Simpan ukuran",
      cancel: "Batal",
      edit: "Edit",
      delete: "Hapus",
      deleteConfirm: "Hapus ukuran ini?",
      cmShort: "cm",
      kgShort: "kg",
    },
  },
};

const en: Dictionary = {
  nav: {
    browse: "Browse Collection",
    howItWorks: "How it works",
    partners: "For Partners",
    signIn: "Sign in",
  },
  hero: {
    eyebrow: "Dress rental in Jakarta, Surabaya, Bali & Bandung",
    title: "Rent the look. Own the moment.",
    subtitle:
      "One place to discover, book, and rent looks from hand-picked independent providers — with a deposit that's held safely.",
    cta: "Start browsing",
    ctaSecondary: "How it works",
  },
  search: {
    city: "City",
    date: "Date",
    color: "Color",
    size: "Size",
    occasion: "Occasion",
    price: "Price",
    submit: "Find a look",
  },
  valueProps: {
    title: "Why LOVEW Style",
    items: [
      {
        title: "Trusted curation",
        body: "The best independent providers in your city, in one searchable platform.",
      },
      {
        title: "Safe deposit",
        body: "LOVEW holds your deposit and auto-refunds it after the look is returned.",
      },
      {
        title: "Book online",
        body: "Pick your dates, save your sizing, and book without the back-and-forth.",
      },
    ],
  },
  home: {
    announce: "Now serving Jakarta · Surabaya · Bali · Bandung",
    hero: {
      eyebrow: "Dress rental, considered",
      titleLead: "Rent the look.",
      titleEm: "Own the moment.",
      subtitle:
        "One place to discover, reserve, and rent looks from the best independent providers — with a deposit that's held safely and refunded automatically.",
      ctaPrimary: "Browse the collection",
      ctaSecondary: "How it works",
      searchCity: "City",
      searchOccasion: "Occasion",
      searchAny: "Any",
      searchCta: "Find a look",
    },
    stats: [
      { value: "4", label: "Cities" },
      { value: "120+", label: "Curated looks" },
      { value: "100%", label: "Refundable deposit" },
      { value: "3 days", label: "Deposit refund" },
    ],
    occasions: {
      eyebrow: "Shop by occasion",
      title: "For every moment that matters.",
      subtitle: "From the aisle to the studio — find the look for the day.",
    },
    featured: {
      eyebrow: "Trending now",
      title: "This week's picks.",
      subtitle: "A small taste of the collection waiting for you.",
      perDay: "/ day",
      cta: "See the full collection",
      items: [
        { name: "Aurora Gown", tag: "Eucalyptus silk · floor length", city: "Jakarta", price: "Rp 450K" },
        { name: "Selene Kebaya", tag: "Hand-beaded · traditional", city: "Bali", price: "Rp 380K" },
        { name: "Noir Column", tag: "Wine velvet · evening", city: "Surabaya", price: "Rp 520K" },
        { name: "Marble Suit", tag: "Ivory tailored · two-piece", city: "Bandung", price: "Rp 410K" },
      ],
    },
    steps: {
      eyebrow: "How it works",
      title: "Four steps, no back-and-forth.",
      items: [
        { n: "01", title: "Discover", body: "Filter by city, dates, and size. Save your measurements once and we'll only show you what fits." },
        { n: "02", title: "Reserve your dates", body: "Pick your wear dates and book online. Rental and deposit in one secure transaction." },
        { n: "03", title: "Wear it", body: "Pick up from the provider or have it delivered to your door. Turn heads on the day." },
        { n: "04", title: "Send it back", body: "Return it to the provider. Your deposit is refunded automatically within three days." },
      ],
    },
    why: {
      eyebrow: "Why LOVEW Style",
      title: "A rental that feels like it's yours.",
    },
    partner: {
      eyebrow: "For partners",
      title: "Have a collection? Rent it with us.",
      body: "Reach new renters across four cities, manage bookings with ease, and let us handle the payments and the deposit.",
      cta: "Become a partner",
    },
    closing: {
      eyebrow: "LOVEW Style",
      cta: "Start browsing",
    },
  },
  footer: {
    parentLine: "A LOVEW Studio product",
    rights: "All rights reserved.",
    built: "Style & Spaces for the moments that matter.",
  },
  auth: {
    signIn: {
      title: "Sign in",
      subtitle: "Welcome back to LOVEW Style.",
      emailLabel: "Email",
      passwordLabel: "Password",
      submit: "Sign in",
      google: "Continue with Google",
      forgot: "Forgot password?",
      noAccount: "Don't have an account?",
      signUpLink: "Sign up",
    },
    signUp: {
      title: "Create account",
      subtitle: "Save your size, wishlist, and book without the back-and-forth.",
      nameLabel: "Full name",
      emailLabel: "Email",
      phoneLabel: "WhatsApp number",
      phoneHint: "For booking confirmations. e.g. 0812xxxxxxxx",
      passwordLabel: "Password",
      passwordHint: "Minimum 8 characters.",
      submit: "Sign up",
      google: "Sign up with Google",
      haveAccount: "Already have an account?",
      signInLink: "Sign in",
      checkEmail:
        "Check your email for the confirmation link. Once confirmed, you'll be signed in.",
    },
    forgot: {
      title: "Forgot password",
      subtitle: "We'll send a reset link to your email.",
      emailLabel: "Email",
      submit: "Send reset link",
      back: "Back to sign in",
      sent: "Reset link sent. Check your inbox (and spam folder).",
    },
    errors: {
      generic: "Something went wrong. Please try again.",
      invalidEmail: "Invalid email format.",
      shortPassword: "Password must be at least 8 characters.",
      nameRequired: "Name is required.",
      invalidCredentials: "Incorrect email or password.",
      emailTaken: "Email already registered. Try signing in or resetting your password.",
    },
    legalNote:
      "By continuing, you agree to LOVEW Style's Terms of Service and Privacy Policy.",
  },
  partner: {
    nav: {
      dashboard: "Dashboard",
      bookings: "Bookings",
      catalog: "Catalog",
      payouts: "Payouts",
      settings: "Settings",
    },
    dashboard: {
      greeting: "Hi",
      kpis: {
        bookingsThisMonth: "Bookings this month",
        gmvThisMonth: "GMV this month",
        payoutPending: "Payout pending",
        rating: "Rating",
      },
      recentBookings: "Recent bookings",
      addDress: "Add dress",
    },
    bookings: {
      title: "Bookings",
      empty: "No bookings yet.",
      tabAll: "All",
      tabPending: "Pending",
      tabConfirmed: "Confirmed",
      tabInUse: "In use",
      tabReturned: "Returned",
      tabCompleted: "Completed",
      markInUse: "Mark in use",
      markReturned: "Mark returned",
      markCompleted: "Mark completed",
      fileClaim: "File deposit claim",
      claimAmount: "Claim amount (Rp)",
      claimReason: "Reason",
      claimReasonOptions: {
        stain: "Stain",
        tear: "Tear",
        late: "Late return",
        lost: "Lost",
        other: "Other",
      },
      claimDescription: "Detailed description",
      claimSubmit: "Submit claim",
      claimSubmitted: "Claim submitted. LOVEW will review.",
      stateBlocked: "This action isn't available for the current status.",
    },
    catalog: {
      title: "Dress catalog",
      addCta: "+ Add dress",
      empty: "No dresses yet. Add your first one.",
      statusActive: "Active",
      statusDraft: "Draft",
      statusArchived: "Archived",
      toggleActivate: "Activate",
      toggleDraft: "Set as draft",
    },
    payouts: {
      title: "Payouts",
      pending: "Pending payout (completed bookings, not yet batched)",
      empty: "No payouts yet.",
    },
  },
  checkout: {
    title: "Confirm booking",
    summary: "Order summary",
    daysLine: "days",
    rentalLine: "Rental",
    serviceLine: "Service fee (3%)",
    shippingLine: "Shipping",
    depositLine: "Deposit (refundable)",
    depositTooltip:
      "The deposit is held by LOVEW and refunded within 3 days after the dress is safely returned.",
    total: "Total to pay",
    fulfillmentLabel: "Fulfillment",
    fulfillmentPickup: "Pick up at partner",
    fulfillmentShipping: "Ship to my address",
    shippingAddressLabel: "Full address",
    shippingCityLabel: "Shipping city",
    phoneLabel: "WhatsApp number",
    notesLabel: "Notes for the partner (optional)",
    notesHint: "e.g. need extra accessories, request a fitting time, etc.",
    agreementLabel:
      "I agree to LOVEW Style's Terms and Deposit Policy.",
    submit: "Confirm booking",
    invalidRange: "Invalid dates.",
    minDays: "Minimum rental",
    maxDays: "Maximum rental",
    unavailable: "Some dates in this range are already booked.",
  },
  payment: {
    title: "Complete payment",
    timeoutNote:
      "Please complete payment within 30 minutes or the booking will be cancelled automatically.",
    timeoutBadge: "Time left",
    tabBank: "Bank transfer",
    tabQris: "QRIS",
    bankAccount: "Transfer to",
    bankAmount: "Amount",
    bankCode: "Booking code (add to transfer notes)",
    bankNote:
      "Use the booking code in your transfer notes so our team can match it quickly.",
    qrisNote: "Scan this QR with any e-wallet app.",
    copy: "Copy",
    copied: "Copied",
    uploadLabel: "Upload transfer proof (optional)",
    paidCta: "I've paid",
    paidAfter:
      "Thank you! Our team will confirm your payment within an hour.",
    whatsappCta: "Contact via WhatsApp",
    cancelled: "This booking was cancelled because the payment window expired.",
    awaiting:
      "Payment is being verified by our team. You'll get a WhatsApp + email notification.",
  },
  bookings: {
    title: "Bookings",
    empty: "No bookings yet.",
    tabActive: "Active",
    tabCompleted: "Completed",
    detailCta: "Details",
    status: {
      pending_payment: "Awaiting payment",
      confirmed: "Confirmed",
      in_use: "In use",
      returned: "Returned",
      completed: "Completed",
      cancelled: "Cancelled",
      disputed: "Under review",
    },
    deposit: {
      held: "Deposit held",
      refund_pending: "Refund in progress",
      refunded: "Refunded",
      partially_withheld: "Partially withheld",
      forfeited: "Forfeited",
      not_required: "—",
    },
  },
  catalog: {
    browse: {
      title: "Browse the collection",
      countLabel: "results",
      empty: "No matches.",
      emptyHint: "Try changing or clearing some filters.",
      reset: "Reset filters",
      sortLabel: "Sort",
      sortOptions: {
        relevance: "Most relevant",
        priceAsc: "Price: low to high",
        priceDesc: "Price: high to low",
        newest: "Newest",
        rating: "Top rated",
      },
      filterButton: "Filter",
      filterClose: "Done",
    },
    filters: {
      city: "City",
      dates: "Rental dates",
      datesStart: "Start",
      datesEnd: "End",
      category: "Category",
      categories: {
        dress: "Dress",
        gown: "Gown",
        kebaya: "Kebaya",
        suit: "Suit",
      },
      occasion: "Occasion",
      occasions: {
        wedding: "Wedding",
        engagement: "Engagement",
        prom: "Prom",
        birthday: "Birthday",
        photoshoot: "Photoshoot",
        traditional: "Traditional",
      },
      color: "Color",
      size: "Size",
      sizeUseMine: "Fits my size",
      sizeNeedProfile: "Save your size first →",
      price: "Price / day",
      perDay: "per day",
    },
    detail: {
      perDay: "/ day",
      depositLine: "Deposit (refundable)",
      depositTooltip:
        "The deposit is held by LOVEW as a guarantee and refunded within 3 days after the dress is safely returned.",
      pickVariant: "Pick a size",
      pickDates: "Pick dates",
      fits: "Fits your size",
      maybeFits: "May need adjustment",
      bookNow: "Book now",
      unavailable: "This variant is not available for the selected dates.",
      youMayLike: "You may also like",
      tabs: {
        description: "Description",
        measurements: "Measurements",
        reviews: "Reviews",
        partner: "Partner",
      },
      seeAllFromPartner: "See all from this partner",
    },
    wishlist: {
      title: "Wishlist",
      empty: "Nothing saved yet.",
      cta: "Browse the collection",
    },
  },
  account: {
    nav: {
      profile: "Profile",
      sizing: "Sizing",
      bookings: "Bookings",
      wishlist: "Wishlist",
      partnerDashboard: "Partner Dashboard",
      signOut: "Sign out",
    },
    profile: {
      title: "Profile",
      subtitle: "Basic account information.",
      nameLabel: "Full name",
      phoneLabel: "WhatsApp number",
      cityLabel: "City",
      cityPlaceholder: "Choose city",
      save: "Save",
      saved: "Saved.",
    },
    sizing: {
      title: "My sizing",
      subtitle: "Save your size once; we'll only show you dresses that fit.",
      banner:
        "Add your body measurements here. You can save more than one — e.g. one for you, one for Mom. The starred profile is used by default.",
      empty: "No sizing profiles yet. Add your first one 👇",
      add: "Add a new size",
      labelLabel: "Label",
      sizeLabel: "Common size",
      bustLabel: "Bust",
      waistLabel: "Waist",
      hipLabel: "Hip",
      shoulderLabel: "Shoulder",
      lengthLabel: "Dress length",
      heightLabel: "Height",
      weightLabel: "Weight",
      notesLabel: "Notes (optional)",
      defaultToggle: "Use as default",
      defaultBadge: "Default",
      save: "Save sizing",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      deleteConfirm: "Delete this sizing profile?",
      cmShort: "cm",
      kgShort: "kg",
    },
  },
};

const dictionaries: Record<Locale, Dictionary> = { id, en };

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
