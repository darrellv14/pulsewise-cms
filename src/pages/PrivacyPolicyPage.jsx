import { Globe2, Mail, ExternalLink, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PULSEWISE_LOGO_FULL_URL } from '../config.js';

const EFFECTIVE_DATE_ID = '12 Juni 2026';
const EFFECTIVE_DATE_EN = 'June 12, 2026';
const LEGAL_ENTITY = 'Penelitian Cak Shon';
const CONTACT_EMAIL = 'penelitian.cakshon@gmail.com';
const DELETE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSd54RdI8MhkUu92FJiY838oCNgubaF7X48I7f1CAcGLqONKDQ/viewform';

const POLICY_ID = [
  {
    title: 'Informasi yang Kami Kumpulkan',
    paragraphs: [
      'Kami dapat mengumpulkan informasi akun dan identitas seperti nama, alamat email, kata sandi, data verifikasi OTP, identifier akun internal, status akun, serta catatan autentikasi terkait.',
      'Jika Anda masuk dengan Google, kami dapat menerima detail akun Google tertentu yang diperlukan untuk menyelesaikan proses masuk, seperti nama, alamat email, foto profil, dan token autentikasi.',
      'Kami juga dapat memproses informasi profil yang Anda pilih untuk tambahkan, seperti tanggal lahir, jenis kelamin, alamat, tinggi badan, golongan darah, detail kebiasaan tertentu, avatar profil, dan preferensi terkait.'
    ],
    bullets: [
      'Catatan harian dan entri wellness seperti tidur, aktivitas, asupan, detail nutrisi, body metrics, rutinitas, status penyelesaian, dan catatan pribadi.',
      'Nilai body metrics yang Anda isi, termasuk tinggi badan, berat badan, BMI, detak jantung, tekanan darah, saturasi oksigen, dan nilai wellness sejenis.',
      'Informasi kontak dukungan yang Anda simpan, seperti nama kontak, nomor telepon, dan status prioritas.',
      'Interaksi edukasi di dalam aplikasi, termasuk likes, komentar, balasan, dan interaksi konten lain yang Anda kirimkan.',
      'Avatar profil, foto makanan, dan gambar lain yang Anda unggah untuk fitur estimasi nutrisi atau pencatatan wellness.',
      'Informasi perangkat, aplikasi, token FCM, locale, zona waktu, data sesi, serta data teknis yang wajar diperlukan untuk keamanan dan fungsi aplikasi.',
      'Informasi yang disimpan lokal di perangkat seperti token sesi, user ID, preferensi notifikasi, status persetujuan disclaimer, dan pengaturan aplikasi tertentu.',
      'Informasi yang Anda berikan saat menghubungi dukungan, melaporkan masalah, atau meminta penghapusan akun.'
    ]
  },
  {
    title: 'Cara Kami Menggunakan Informasi',
    bullets: [
      'Membuat, memverifikasi, mengamankan, dan mengelola akun Anda.',
      'Mengautentikasi pengguna melalui email dan password, OTP verification, dan Google Sign-In opsional.',
      'Menyediakan fitur PulseWise untuk diary, rutinitas, kontak dukungan, estimasi nutrisi, wellness summary, dan konten edukasi.',
      'Mencatat, menampilkan, mengatur, dan merangkum informasi yang Anda pilih untuk dicatat di aplikasi.',
      'Mengirim reminder rutinitas, notifikasi layanan, pemberitahuan keamanan, dan pesan terkait akun.',
      'Menyimpan dan menampilkan avatar profil serta memproses foto makanan untuk estimasi nutrisi dan fitur wellness terkait.',
      'Meningkatkan keandalan layanan, mendiagnosis masalah teknis, mencegah penyalahgunaan, menanggapi permintaan dukungan, dan memenuhi kewajiban hukum.'
    ],
    note: 'Kami tidak menjual data pribadi Anda dan tidak menggunakan data pribadi untuk iklan yang dipersonalisasi.'
  },
  {
    title: 'Izin Perangkat dan Fitur Opsional',
    bullets: [
      'Kamera, jika Anda memilih mengambil foto makanan atau gambar lain di dalam aplikasi.',
      'Foto, file, atau media akses, jika Anda memilih mengunggah avatar atau memilih gambar dari perangkat Anda.',
      'Kontak, hanya jika Anda memilih mengimpor kontak dukungan dari buku kontak perangkat.',
      'Notifikasi, untuk reminder rutinitas, pemberitahuan akun, dan pembaruan layanan.'
    ],
    paragraphs: [
      'Anda dapat menolak atau mencabut izin melalui pengaturan perangkat, tetapi beberapa fitur opsional mungkin tidak lagi berfungsi sebagaimana mestinya.',
      'Rilis Play Store PulseWise saat ini tidak meminta izin Health Connect dan tidak mengakses Health Connect, Google Fit, Apple Health, atau penyimpanan data kesehatan tingkat platform yang serupa.'
    ]
  },
  {
    title: 'Cara Kami Membagikan Informasi',
    paragraphs: [
      'Kami dapat membagikan informasi dengan penyedia backend, hosting, storage, notification, analytics, security, dan infrastruktur yang membantu mengoperasikan PulseWise.',
      'Kami juga dapat menggunakan layanan Google untuk autentikasi dan notifikasi, termasuk Google Sign-In dan Firebase Cloud Messaging, serta Cloudinary atau penyedia media serupa untuk penyimpanan avatar dan media lain yang didukung.'
    ],
    bullets: [
      'Dengan personel internal yang berwenang untuk operasional layanan, dukungan, keamanan, moderasi, atau kepatuhan.',
      'Jika diwajibkan oleh hukum, proses hukum, regulasi, atau permintaan pemerintah yang sah.',
      'Untuk melindungi hak, keselamatan, keamanan, pengguna, PulseWise, atau publik.',
      'Untuk mendeteksi, menyelidiki, atau menangani fraud, penyalahgunaan, insiden keamanan, atau masalah teknis.'
    ],
    note: 'Kami tidak membagikan data pribadi Anda kepada pihak ketiga untuk tujuan iklan yang dipersonalisasi milik mereka sendiri.'
  },
  {
    title: 'Pemberitahuan Tentang Scope Wellness',
    paragraphs: [
      'PulseWise ditujukan untuk wellness umum, self-tracking, reminder, dan dukungan edukatif. Ringkasan wellness pribadi, tampilan progres rutinitas, serta estimasi terkait nutrisi yang kami hasilkan bukan diagnosis medis, rekomendasi pengobatan, atau keputusan klinis.',
      'Jika versi PulseWise di masa depan menambahkan integrasi data atau izin opsional baru, kami akan memperbarui kebijakan ini dan pengungkapan platform terkait sebelum perubahan tersebut berlaku.'
    ]
  },
  {
    title: 'Penyimpanan Data',
    paragraphs: [
      'Kami menyimpan data pribadi selama diperlukan secara wajar untuk menyediakan PulseWise, menjaga akun Anda, memenuhi kewajiban hukum, menyelesaikan sengketa, menegakkan perjanjian, dan melindungi layanan serta pengguna kami.',
      'Jika Anda meminta penghapusan akun atau data, kami akan memproses permintaan tersebut sesuai hukum yang berlaku serta kewajiban operasional, keamanan, dan hukum kami. Dalam beberapa kasus, kami dapat menyimpan informasi terbatas untuk alasan yang sah seperti pencegahan fraud, keamanan, penyelesaian sengketa, atau kepatuhan hukum.',
      'Informasi yang disimpan secara lokal di perangkat Anda dapat tetap ada sampai Anda logout, menghapus penyimpanan aplikasi, mencabut izin, atau menghapus instalasi aplikasi.'
    ]
  },
  {
    title: 'Penghapusan Akun dan Data',
    paragraphs: [
      'PulseWise menyediakan alur penghapusan akun di dalam aplikasi. Anda juga dapat meminta penghapusan akun PulseWise dan data terkait dengan menghubungi kami melalui email atau menggunakan formulir permintaan penghapusan akun.',
      'Jika diperlukan verifikasi tambahan sebelum penghapusan demi alasan keamanan atau hukum, kami akan memberi tahu Anda selama proses penghapusan.'
    ]
  },
  {
    title: 'Keamanan',
    paragraphs: [
      'Kami menggunakan langkah administratif, teknis, dan organisasional yang wajar untuk melindungi data pribadi dan informasi terkait wellness. Sebagai contoh, akses ke area yang dilindungi akun memerlukan autentikasi, dan aplikasi dirancang untuk menggunakan koneksi jaringan yang aman jika didukung.',
      'Namun, tidak ada metode transmisi atau penyimpanan yang sepenuhnya aman, dan kami tidak dapat menjamin keamanan absolut.'
    ]
  },
  {
    title: 'Pilihan dan Hak Anda',
    bullets: [
      'Mengakses, memperbarui, atau memperbaiki informasi akun atau profil Anda.',
      'Mengelola izin kamera, kontak, notifikasi, dan akses media melalui pengaturan perangkat.',
      'Meminta penghapusan akun Anda atau data pribadi tertentu.',
      'Menghubungi kami untuk pertanyaan, permintaan, atau keluhan terkait privasi.'
    ],
    paragraphs: [
      'Anda juga dapat memilih untuk tidak menggunakan fitur opsional seperti Google Sign-In, unggah avatar, impor kontak, atau estimasi nutrisi berbasis foto makanan.'
    ]
  },
  {
    title: 'Privasi Anak',
    paragraphs: [
      'PulseWise tidak ditujukan untuk anak di bawah usia 13 tahun kecuali secara tegas dinyatakan lain oleh Penelitian Cak Shon dan didukung oleh perlindungan hukum serta persetujuan yang sesuai. Jika Anda yakin seorang anak telah memberikan data pribadi yang melanggar hukum yang berlaku, silakan hubungi kami melalui email yang tercantum di bawah.'
    ]
  },
  {
    title: 'Pemrosesan Internasional',
    paragraphs: [
      'Tergantung pada cara PulseWise dioperasikan, informasi Anda dapat diproses atau disimpan di negara selain negara Anda, termasuk negara tempat penyedia layanan kami beroperasi. Jika diwajibkan, kami akan mengambil langkah yang wajar untuk membantu melindungi data pribadi sesuai hukum yang berlaku.'
    ]
  },
  {
    title: 'Perubahan pada Kebijakan Privasi Ini',
    paragraphs: [
      'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Jika kami membuat perubahan material, kami dapat memperbarui Tanggal Berlaku di atas dan, jika sesuai, memberikan pemberitahuan tambahan di dalam aplikasi atau melalui cara lain yang wajar.'
    ]
  },
  {
    title: 'Hubungi Kami',
    paragraphs: [
      'Jika Anda memiliki pertanyaan, permintaan, atau kekhawatiran mengenai kebijakan ini atau praktik data kami, silakan hubungi kami melalui email yang tersedia di bawah.'
    ]
  }
];

const POLICY_EN = [
  {
    title: 'Information We Collect',
    paragraphs: [
      'We may collect account and identity information such as name, email address, password, OTP verification data, internal account identifiers, account status, and related authentication records.',
      'If you sign in with Google, we may receive certain Google account details needed to complete sign-in, such as your name, email address, profile photo, and authentication token.',
      'We may also process profile information you choose to add, such as date of birth, sex or gender, address, height, blood type, selected habit-related details, profile photo or avatar, and related preferences.'
    ],
    bullets: [
      'Daily logs and wellness entries such as sleep, activity, food intake, nutrition details, body metrics, routines, completion status, and personal notes.',
      'Body metric values you choose to enter, including height, weight, BMI, heart rate, blood pressure, oxygen saturation, and similar wellness tracking values.',
      'Support contact information you choose to save, such as contact name, phone number, and priority status.',
      'Education interactions in the app, including likes, comments, replies, and other content interactions you submit.',
      'Profile avatar images, food photos, and other images you upload for nutrition estimation or wellness logging features.',
      'Device, app, token FCM, locale, time zone, session, and technical data reasonably necessary for security and app functionality.',
      'Limited information stored locally on your device such as session token, user ID, notification preferences, disclaimer acknowledgment status, and app settings.',
      'Information you provide when contacting support, reporting an issue, or requesting account deletion.'
    ]
  },
  {
    title: 'How We Use Information',
    bullets: [
      'Create, verify, secure, and manage your account.',
      'Authenticate users through email and password, OTP verification, and optional Google Sign-In.',
      'Provide PulseWise features for daily logs, routines, support contacts, nutrition estimation, wellness summaries, and educational content.',
      'Record, display, organize, and summarize information you choose to log in the app.',
      'Send routine reminders, service notifications, security notices, and account-related messages.',
      'Store and display profile avatars and process food images for nutrition estimation and related wellness features.',
      'Improve service reliability, diagnose technical problems, prevent misuse, respond to support requests, and comply with legal obligations.'
    ],
    note: 'We do not sell your personal data and we do not use your personal data for personalized advertising.'
  },
  {
    title: 'Permissions and Optional Features',
    bullets: [
      'Camera, if you choose to capture a food photo or other image inside the app.',
      'Photos, files, or media access, if you choose to upload an avatar image or select an image from your device.',
      'Contacts, only if you choose to import a support contact from your device contacts.',
      'Notifications, to deliver routine reminders, account notifications, and service updates.'
    ],
    paragraphs: [
      'You may deny or revoke these permissions through your device settings, but some optional features may no longer work as intended.',
      'The current Play Store release of PulseWise does not request Health Connect permissions and does not access Health Connect, Google Fit, Apple Health, or a similar platform-level health data store.'
    ]
  },
  {
    title: 'How We Share Information',
    paragraphs: [
      'We may share information with backend, hosting, storage, notification, analytics, security, and infrastructure providers that help operate PulseWise.',
      'We may also use Google services for authentication and notifications, including Google Sign-In and Firebase Cloud Messaging, and Cloudinary or similar media providers for avatars and other supported media.'
    ],
    bullets: [
      'With authorized internal personnel for service operations, support, security, moderation, or compliance.',
      'If required by law, legal process, regulation, or a valid governmental request.',
      'To protect rights, safety, security, users, PulseWise, or the public.',
      'To detect, investigate, or address fraud, abuse, security incidents, or technical issues.'
    ],
    note: 'We do not share your personal data with third parties for their own personalized advertising purposes.'
  },
  {
    title: 'Wellness Scope Notice',
    paragraphs: [
      'PulseWise is intended for general wellness, self-tracking, reminders, and educational support. Personal wellness summaries, routine progress views, and nutrition-related estimates generated from your inputs are not medical diagnoses, treatment recommendations, or clinical decisions.',
      'If future versions of PulseWise introduce additional optional data integrations or permissions, we will update this policy and related platform disclosures before those changes apply.'
    ]
  },
  {
    title: 'Data Retention',
    paragraphs: [
      'We retain personal data for as long as reasonably necessary to provide PulseWise, maintain your account, comply with legal obligations, resolve disputes, enforce agreements, and protect the service and our users.',
      'If you request account or data deletion, we will process the request in accordance with applicable law and our operational, security, and legal obligations. In some cases, we may retain limited information for lawful reasons such as fraud prevention, security, dispute resolution, or legal compliance.',
      'Information stored locally on your device may remain until you log out, clear app storage, revoke permissions, or uninstall the app.'
    ]
  },
  {
    title: 'Account and Data Deletion',
    paragraphs: [
      'PulseWise includes an in-app account deletion flow. You may also request deletion of your account and associated data by contacting us through email or by using the deletion request form linked below.',
      'If additional verification is needed before deletion for security or legal reasons, we will let you know during the deletion process.'
    ]
  },
  {
    title: 'Security',
    paragraphs: [
      'We use reasonable administrative, technical, and organizational measures designed to protect personal data and wellness-related information. For example, access to account-protected areas requires authentication, and the app is designed to use secure network connections where supported.',
      'However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.'
    ]
  },
  {
    title: 'Your Choices and Rights',
    bullets: [
      'Access, update, or correct your account or profile information.',
      'Manage permissions for camera, contacts, notifications, and media access through your device settings.',
      'Request deletion of your account or certain personal data.',
      'Contact us with privacy-related questions, requests, or complaints.'
    ],
    paragraphs: [
      'You may also choose not to use optional features such as Google Sign-In, avatar upload, contact import, or food photo-based nutrition estimation.'
    ]
  },
  {
    title: 'Children\'s Privacy',
    paragraphs: [
      'PulseWise is not intended for children under 13 unless expressly stated otherwise by Penelitian Cak Shon and supported by appropriate legal safeguards and consent. If you believe a child has provided personal data in violation of applicable law, please contact us using the email below.'
    ]
  },
  {
    title: 'International Processing',
    paragraphs: [
      'Depending on how PulseWise is operated, your information may be processed or stored in countries other than your own, including countries where our service providers operate. Where required, we will take reasonable steps intended to protect personal data in accordance with applicable law.'
    ]
  },
  {
    title: 'Changes to This Privacy Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. If we make material changes, we may update the Effective Date above and, where appropriate, provide additional notice within the app or through other reasonable means.'
    ]
  },
  {
    title: 'Contact Us',
    paragraphs: [
      'If you have questions, requests, or concerns about this Privacy Policy or our data practices, please contact us using the email listed below.'
    ]
  }
];

function PolicySection({ index, section }) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-sm font-bold text-rose-600">
          {index + 1}
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            {section.title}
          </h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-slate-600">
              {paragraph}
            </p>
          ))}
          {section.bullets?.length ? (
            <ul className="space-y-2 text-sm leading-7 text-slate-600">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {section.note ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
              {section.note}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function PrivacyPolicyPage() {
  const [language, setLanguage] = useState('id');

  const policy = useMemo(() => {
    return language === 'id'
      ? {
          title: 'Kebijakan Privasi PulseWise',
          effectiveDate: EFFECTIVE_DATE_ID,
          intro: [
            `PulseWise disediakan oleh ${LEGAL_ENTITY} ("kami", "kita", atau "milik kami"). Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, membagikan, menyimpan, dan melindungi data pribadi serta informasi terkait wellness saat Anda menggunakan aplikasi PulseWise, layanan terkait, dan saluran dukungan.`,
            'PulseWise adalah aplikasi wellness untuk konsumen. Aplikasi ini dirancang untuk membantu pengguna membuat catatan harian, mengelola rutinitas, menyimpan kontak dukungan, melihat ringkasan wellness, dan mengakses konten edukasi. PulseWise bukan alat kesehatan dan tidak menyediakan diagnosis, pengobatan, respons darurat, atau nasihat medis profesional.',
            'Dengan menggunakan PulseWise, Anda memahami bahwa informasi Anda akan diproses sebagaimana dijelaskan dalam Kebijakan Privasi ini.'
          ],
          sections: POLICY_ID,
          contactTitle: 'Kontak Privasi',
          deleteLabel: 'Form Permintaan Penghapusan Akun',
          loginLabel: 'Kembali ke Login',
          policyLabel: 'Bahasa Indonesia'
        }
      : {
          title: 'PulseWise Privacy Policy',
          effectiveDate: EFFECTIVE_DATE_EN,
          intro: [
            `PulseWise is provided by ${LEGAL_ENTITY} ("we", "us", or "our"). This Privacy Policy explains how we collect, use, disclose, store, and protect personal data and wellness-related information when you use the PulseWise application, related services, and support channels.`,
            'PulseWise is a consumer wellness app. It is designed to help users keep daily logs, manage routines, save support contacts, view wellness summaries, and access educational content. PulseWise is not a medical device and does not provide diagnosis, treatment, emergency response, or professional medical advice.',
            'By using PulseWise, you acknowledge that your information will be handled as described in this Privacy Policy.'
          ],
          sections: POLICY_EN,
          contactTitle: 'Privacy Contact',
          deleteLabel: 'Account Deletion Request Form',
          loginLabel: 'Back to Login',
          policyLabel: 'English'
        };
  }, [language]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-50 blur-3xl" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-600"
                >
                  <ArrowLeft size={16} />
                  {policy.loginLabel}
                </Link>
                <img
                  src={PULSEWISE_LOGO_FULL_URL}
                  alt="PulseWise"
                  className="h-10 w-auto object-contain"
                />
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-rose-600">
                    <ShieldCheck size={14} />
                    Privacy Policy
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.05]">
                    {policy.title}
                  </h1>
                  <p className="text-sm font-medium text-slate-500 sm:text-base">
                    Effective Date: {policy.effectiveDate}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setLanguage('id')}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${language === 'id' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${language === 'en' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    EN
                  </button>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm sm:max-w-xs">
                  <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    <Globe2 size={14} />
                    {policy.policyLabel}
                  </div>
                  <p className="leading-6">
                    Kebijakan ini disediakan untuk membantu pengguna memahami cara PulseWise memproses data akun dan data wellness secara transparan.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Legal Entity
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {LEGAL_ENTITY}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                  Contact Email
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-rose-600 transition-colors hover:text-rose-700"
                >
                  <Mail size={16} />
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>

            <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
              {policy.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          {policy.sections.map((section, index) => (
            <PolicySection key={section.title} index={index} section={section} />
          ))}
        </section>

        <section className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {policy.contactTitle}
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                {LEGAL_ENTITY}
                <br />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold text-rose-600 transition-colors hover:text-rose-700"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end sm:justify-center">
              <a
                href={DELETE_FORM_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose-700"
              >
                <ExternalLink size={16} />
                {policy.deleteLabel}
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-200 hover:text-rose-600"
              >
                <Mail size={16} />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
