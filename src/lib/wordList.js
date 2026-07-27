// Curated list of common 5-letter Indonesian words for "Tebak Kata".
// Used both as the answer pool and to validate guesses (a guess must be
// one of these words) — small enough to hand-curate and verify, unlike a
// full dictionary.
export const WORD_LIST = [
  'AMBIL', 'ANGIN', 'ANGKA', 'ARANG', 'BADAI', 'BAKAR', 'BAKSO', 'BANTU', 'BEBEK', 'BECAK',
  'BENCI', 'BENUA', 'BERAS', 'BESOK', 'BETIS', 'BIASA', 'BIBIR', 'BODOH', 'BOROS', 'BOSAN',
  'BUAYA', 'BUBUR', 'BUGAR', 'BULAN', 'BUNYI', 'BURUK', 'BUSUK', 'CABAI', 'CATUR', 'CEMAS',
  'CERIA', 'CINTA', 'DAMAI', 'DANAU', 'DARAH', 'DETIK', 'DOMBA', 'DUDUK', 'DUSTA', 'ELANG',
  'EMBER', 'EMBUN', 'EMPUK', 'FAJAR', 'GAGAH', 'GAGAK', 'GAJAH', 'GALAK', 'GARAM', 'GARPU',
  'GELAS', 'GEMPA', 'GOSOK', 'GURIH', 'HAKIM', 'HALUS', 'HARGA', 'HEMAT', 'HIJAU', 'HITAM',
  'HOTEL', 'HUJAN', 'HURUF', 'HUTAN', 'IRAMA', 'ISTRI', 'JAKET', 'JAKSA', 'JALAN', 'JAMBU',
  'JANJI', 'JELEK', 'JEMUR', 'JUJUR', 'KABAR', 'KABEL', 'KABUT', 'KADAL', 'KAKAK', 'KAKEK',
  'KAPAL', 'KARTU', 'KASAR', 'KASUR', 'KATAK', 'KEBUN', 'KELAS', 'KERAS', 'KERJA', 'KESAL',
  'KILAT', 'KIPAS', 'KIRIM', 'KOALA', 'KOLAM', 'KOLOM', 'KORAN', 'KULIT', 'KUNCI', 'KURSI',
  'LALAT', 'LAMPU', 'LAPAR', 'LARON', 'LARVA', 'LAYAR', 'LEBAH', 'LEHER', 'LELAH', 'LEMAH',
  'LEZAT', 'LIBUR', 'LIDAH', 'LIHAT', 'LUTUT', 'MAKAN', 'MALAM', 'MALAS', 'MANDI', 'MANIS',
  'MARAH', 'MASAK', 'MASUK', 'MELON', 'MENIT', 'MERAH', 'MIMPI', 'MINTA', 'MINUM', 'MOBIL',
  'MODAL', 'MOTOR', 'MURID', 'MUSIK', 'MUSIM', 'NAKAL', 'NANAS', 'NANTI', 'NENEK', 'NILAI',
  'NOVEL', 'OMBAK', 'PAGAR', 'PAHIT', 'PAMAN', 'PANAH', 'PANCI', 'PANDA', 'PANIK', 'PAPAN',
  'PASAR', 'PASIR', 'PEDAS', 'PERAK', 'PERGI', 'PERUT', 'PESAN', 'PESTA', 'PETIR', 'PILOT',
  'PINTU', 'PISAU', 'PUISI', 'PUKUL', 'PULAU', 'PUSAR', 'PUTIH', 'PUTRA', 'PUTRI', 'RADIO',
  'RAJIN', 'RAMAH', 'RAMAI', 'RAPOR', 'REBUS', 'RESAH', 'RIANG', 'RIMBA', 'RINDU', 'RUBAH',
  'RUMAH', 'SABAR', 'SABUN', 'SAKIT', 'SALAK', 'SALJU', 'SARAF', 'SAWAH', 'SEDIH', 'SEGAR',
  'SEHAT', 'SEMUT', 'SENJA', 'SEPAK', 'SEROK', 'SETIA', 'SIANG', 'SIBUK', 'SIKAT', 'SILAT',
  'SINGA', 'SIPUT', 'SIRUP', 'SISIR', 'SOLAR', 'SOPIR', 'SUAMI', 'SUARA', 'SUBUH', 'SUMUR',
  'SURAT', 'SURUT', 'TAHUN', 'TAKSI', 'TAKUT', 'TAMAN', 'TANAH', 'TARIK', 'TEGAS', 'TELUR',
  'TEMPE', 'TIDUR', 'TIKUS', 'TINJU', 'TINTA', 'TOMAT', 'TUANG', 'TUGAS', 'TURUN', 'TUTUP',
  'UDANG', 'UJIAN', 'UTANG', 'VIDEO', 'WAJAN', 'WAKTU', 'WARNA', 'ZAMAN', 'ZEBRA',
];

export const WORD_SET = new Set(WORD_LIST);

export function pickRandomWord() {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}
