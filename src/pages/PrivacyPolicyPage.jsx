import { ArrowLeft, ExternalLink, Mail, ShieldCheck } from 'lucide-react';
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
    title: '1. Informasi yang Kami Kumpulkan',
    paragraphs: [
      'Kami dapat mengumpulkan informasi akun dan identitas seperti nama, alamat email, kata sandi, data verifikasi OTP, pengidentifikasi akun internal, status akun, serta catatan autentikasi terkait.',
      'Jika Anda masuk dengan Google, kami dapat menerima detail akun Google tertentu yang diperlukan untuk menyelesaikan proses masuk, seperti nama, alamat email, foto profil, dan token autentikasi.',
      'Kami juga dapat memproses informasi profil yang Anda pilih untuk ditambahkan, seperti tanggal lahir, jenis kelamin, alamat, tinggi badan, golongan darah, detail kebiasaan tertentu, avatar profil, dan preferensi terkait.'
    ],
    bullets: [
      'Catatan harian dan entri wellness (kesehatan) seperti tidur, aktivitas, asupan makanan, detail nutrisi, metrik tubuh, rutinitas, status penyelesaian, dan catatan pribadi.',
      'Nilai metrik tubuh yang Anda isi, termasuk tinggi badan, berat badan, BMI, detak jantung, tekanan darah, saturasi oksigen, dan nilai pelacakan sejenis.',
      'Informasi kontak dukungan yang Anda simpan, seperti nama kontak, nomor telepon, dan status prioritas.',
      'Interaksi edukasi di dalam aplikasi, termasuk suka (likes), komentar, balasan, dan interaksi konten lain yang Anda kirimkan.',
      'Gambar avatar profil, foto makanan, dan gambar lain yang Anda unggah untuk fitur estimasi nutrisi atau pencatatan wellness.',
      'Informasi perangkat, aplikasi, token FCM, lokal (locale), zona waktu, data sesi, serta data teknis yang secara wajar diperlukan untuk keamanan dan fungsionalitas aplikasi.',
      'Informasi terbatas yang disimpan secara lokal di perangkat Anda seperti token sesi, ID pengguna, preferensi notifikasi, status persetujuan disclaimer, dan pengaturan aplikasi.',
      'Informasi yang Anda berikan saat menghubungi layanan dukungan, melaporkan masalah, atau meminta penghapusan akun.'
    ]
  },
  {
    title: '2. Cara Kami Menggunakan Informasi',
    bullets: [
      'Membuat, memverifikasi, mengamankan, dan mengelola akun Anda.',
      'Mengautentikasi pengguna melalui email dan kata sandi, verifikasi OTP, dan Google Sign-In (opsional).',
      'Menyediakan fitur PulseWise untuk catatan harian, rutinitas, kontak dukungan, estimasi nutrisi, ringkasan wellness, dan konten edukasi.',
      'Mencatat, menampilkan, mengatur, dan merangkum informasi yang Anda pilih untuk dicatat di dalam aplikasi.',
      'Mengirimkan pengingat rutinitas, notifikasi layanan, pemberitahuan keamanan, dan pesan terkait akun.',
      'Menyimpan dan menampilkan avatar profil serta memproses foto makanan untuk estimasi nutrisi dan fitur wellness terkait.',
      'Meningkatkan keandalan layanan, mendiagnosis masalah teknis, mencegah penyalahgunaan, menanggapi permintaan dukungan, dan memenuhi kewajiban hukum.'
    ],
    note: 'Kami tidak memperjualbelikan data pribadi Anda dan tidak menggunakan data pribadi Anda untuk tujuan periklanan yang dipersonalisasi.'
  },
  {
    title: '3. Izin Perangkat dan Fitur Opsional',
    bullets: [
      'Kamera: Jika Anda memilih untuk mengambil foto makanan atau gambar lain di dalam aplikasi.',
      'Foto, file, atau akses media: Jika Anda memilih untuk mengunggah avatar atau memilih gambar dari perangkat Anda.',
      'Kontak: Hanya jika Anda memilih untuk mengimpor kontak dukungan dari buku telepon perangkat Anda.',
      'Notifikasi: Untuk mengirimkan pengingat rutinitas, pemberitahuan akun, dan pembaruan layanan.'
    ],
    paragraphs: [
      'Anda dapat menolak atau mencabut izin tersebut melalui pengaturan perangkat, namun beberapa fitur opsional mungkin tidak akan berfungsi sebagaimana mestinya.',
      'Rilis PulseWise di Play Store saat ini tidak meminta izin Health Connect dan tidak mengakses Health Connect, Google Fit, Apple Health, atau penyimpanan data kesehatan tingkat platform yang serupa.'
    ]
  },
  {
    title: '4. Cara Kami Membagikan Informasi',
    paragraphs: [
      'Kami dapat membagikan informasi dengan penyedia backend, hosting, penyimpanan, notifikasi, analitik, keamanan, dan infrastruktur yang membantu mengoperasikan PulseWise.',
      'Kami juga dapat menggunakan layanan Google untuk autentikasi dan notifikasi, termasuk Google Sign-In dan Firebase Cloud Messaging, serta Cloudinary atau penyedia layanan media serupa untuk penyimpanan avatar dan media lain yang didukung.'
    ],
    bullets: [
      'Kepada personel internal yang berwenang untuk operasional layanan, dukungan, keamanan, moderasi, atau kepatuhan.',
      'Jika diwajibkan oleh hukum, proses hukum, regulasi, atau permintaan pemerintah yang sah.',
      'Untuk melindungi hak, keselamatan, keamanan, pengguna, PulseWise, atau publik.',
      'Untuk mendeteksi, menyelidiki, atau menangani kecurangan (fraud), penyalahgunaan, insiden keamanan, atau masalah teknis.'
    ],
    note: 'Kami tidak membagikan data pribadi Anda kepada pihak ketiga untuk tujuan periklanan yang dipersonalisasi milik mereka sendiri.'
  },
  {
    title: '5. Pemberitahuan Ruang Lingkup Layanan (Wellness Scope)',
    paragraphs: [
      'PulseWise ditujukan untuk pemantauan wellness secara umum, pencatatan mandiri (self-tracking), pengingat, dan dukungan edukatif. Ringkasan kesehatan pribadi, tampilan progres rutinitas, serta estimasi terkait nutrisi yang dihasilkan dari input Anda bukanlah diagnosis medis, rekomendasi pengobatan, atau keputusan klinis.',
      'Jika versi PulseWise di masa depan menambahkan integrasi data atau izin opsional baru, kami akan memperbarui kebijakan ini dan pengungkapan platform terkait sebelum perubahan tersebut berlaku.'
    ]
  },
  {
    title: '6. Penyimpanan Data',
    paragraphs: [
      'Kami menyimpan data pribadi selama diperlukan secara wajar untuk menyediakan PulseWise, mengelola akun Anda, memenuhi kewajiban hukum, menyelesaikan sengketa, menegakkan perjanjian, dan melindungi layanan serta pengguna kami.',
      'Jika Anda meminta penghapusan akun atau data, kami akan memproses permintaan tersebut sesuai dengan hukum yang berlaku serta kewajiban operasional, keamanan, dan hukum kami. Dalam beberapa kasus, kami dapat menyimpan informasi terbatas untuk alasan yang sah seperti pencegahan fraud, keamanan, penyelesaian sengketa, atau kepatuhan hukum.',
      'Informasi yang disimpan secara lokal di perangkat Anda dapat tetap ada sampai Anda keluar (logout), menghapus penyimpanan aplikasi (clear storage), mencabut izin, atau menghapus instalasi aplikasi.'
    ]
  },
  {
    title: '7. Penghapusan Akun dan Data',
    paragraphs: [
      'PulseWise menyediakan alur penghapusan akun di dalam aplikasi. Anda juga dapat meminta penghapusan akun PulseWise Anda dan data terkait dengan menghubungi kami melalui email atau menggunakan formulir permintaan penghapusan yang ditautkan di bawah ini.',
      'Jika diperlukan verifikasi tambahan sebelum penghapusan demi alasan keamanan atau hukum, kami akan memberi tahu Anda selama proses tersebut berlangsung.'
    ]
  },
  {
    title: '8. Keamanan',
    paragraphs: [
      'Kami menggunakan langkah-langkah administratif, teknis, dan organisasional yang wajar, yang dirancang untuk melindungi data pribadi dan informasi terkait wellness. Sebagai contoh, akses ke area yang dilindungi akun memerlukan autentikasi, dan aplikasi dirancang untuk menggunakan koneksi jaringan yang aman jika didukung.',
      'Namun, tidak ada metode transmisi atau penyimpanan yang sepenuhnya aman, dan kami tidak dapat menjamin keamanan yang absolut.'
    ]
  },
  {
    title: '9. Pilihan dan Hak Anda',
    bullets: [
      'Mengakses, memperbarui, atau memperbaiki informasi akun atau profil Anda.',
      'Mengelola izin untuk kamera, kontak, notifikasi, dan akses media melalui pengaturan perangkat Anda.',
      'Meminta penghapusan akun Anda atau data pribadi tertentu.',
      'Menghubungi kami terkait pertanyaan, permintaan, atau keluhan tentang privasi.'
    ],
    paragraphs: [
      'Anda juga dapat memilih untuk tidak menggunakan fitur opsional seperti Google Sign-In, unggahan avatar, impor kontak, atau estimasi nutrisi berbasis foto makanan.'
    ]
  },
  {
    title: '10. Privasi Anak-anak',
    paragraphs: [
      'PulseWise tidak ditujukan untuk anak-anak di bawah usia 13 tahun, kecuali secara tegas dinyatakan lain oleh Penelitian Cak Shon dan didukung oleh perlindungan hukum serta persetujuan yang sesuai. Jika Anda meyakini bahwa seorang anak telah memberikan data pribadi yang melanggar hukum yang berlaku, silakan hubungi kami melalui email di bawah ini.'
    ]
  },
  {
    title: '11. Pemrosesan Internasional',
    paragraphs: [
      'Tergantung pada cara PulseWise dioperasikan, informasi Anda dapat diproses atau disimpan di negara selain negara Anda, termasuk negara tempat penyedia layanan kami beroperasi. Jika diwajibkan, kami akan mengambil langkah-langkah yang wajar untuk melindungi data pribadi sesuai dengan hukum yang berlaku.'
    ]
  },
  {
    title: '12. Perubahan pada Kebijakan Privasi Ini',
    paragraphs: [
      'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Jika kami membuat perubahan material, kami dapat memperbarui Tanggal Berlaku di atas dan, jika sesuai, memberikan pemberitahuan tambahan di dalam aplikasi atau melalui cara lain yang wajar.'
    ]
  },
  {
    title: '13. Hubungi Kami',
    paragraphs: [
      'Jika Anda memiliki pertanyaan, permintaan, atau kekhawatiran mengenai Kebijakan Privasi ini atau praktik pengelolaan data kami, silakan hubungi kami melalui email yang tercantum di bawah ini.'
    ]
  }
];

const POLICY_EN = [
  {
    title: '1. Information We Collect',
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
    title: '2. How We Use Information',
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
    title: '3. Permissions and Optional Features',
    bullets: [
      'Camera: If you choose to capture a food photo or other image inside the app.',
      'Photos, files, or media access: If you choose to upload an avatar image or select an image from your device.',
      'Contacts: Only if you choose to import a support contact from your device contacts.',
      'Notifications: To deliver routine reminders, account notifications, and service updates.'
    ],
    paragraphs: [
      'You may deny or revoke these permissions through your device settings, but some optional features may no longer work as intended.',
      'The current Play Store release of PulseWise does not request Health Connect permissions and does not access Health Connect, Google Fit, Apple Health, or a similar platform-level health data store.'
    ]
  },
  {
    title: '4. How We Share Information',
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
    title: '5. Wellness Scope Notice',
    paragraphs: [
      'PulseWise is intended for general wellness, self-tracking, reminders, and educational support. Personal wellness summaries, routine progress views, and nutrition-related estimates generated from your inputs are not medical diagnoses, treatment recommendations, or clinical decisions.',
      'If future versions of PulseWise introduce additional optional data integrations or permissions, we will update this policy and related platform disclosures before those changes apply.'
    ]
  },
  {
    title: '6. Data Retention',
    paragraphs: [
      'We retain personal data for as long as reasonably necessary to provide PulseWise, maintain your account, comply with legal obligations, resolve disputes, enforce agreements, and protect the service and our users.',
      'If you request account or data deletion, we will process the request in accordance with applicable law and our operational, security, and legal obligations. In some cases, we may retain limited information for lawful reasons such as fraud prevention, security, dispute resolution, or legal compliance.',
      'Information stored locally on your device may remain until you log out, clear app storage, revoke permissions, or uninstall the app.'
    ]
  },
  {
    title: '7. Account and Data Deletion',
    paragraphs: [
      'PulseWise includes an in-app account deletion flow. You may also request deletion of your account and associated data by contacting us through email or by using the deletion request form linked below.',
      'If additional verification is needed before deletion for security or legal reasons, we will let you know during the deletion process.'
    ]
  },
  {
    title: '8. Security',
    paragraphs: [
      'We use reasonable administrative, technical, and organizational measures designed to protect personal data and wellness-related information. For example, access to account-protected areas requires authentication, and the app is designed to use secure network connections where supported.',
      'However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.'
    ]
  },
  {
    title: '9. Your Choices and Rights',
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
    title: "10. Children's Privacy",
    paragraphs: [
      'PulseWise is not intended for children under 13 unless expressly stated otherwise by Penelitian Cak Shon and supported by appropriate legal safeguards and consent. If you believe a child has provided personal data in violation of applicable law, please contact us using the email below.'
    ]
  },
  {
    title: '11. International Processing',
    paragraphs: [
      'Depending on how PulseWise is operated, your information may be processed or stored in countries other than your own, including countries where our service providers operate. Where required, we will take reasonable steps intended to protect personal data in accordance with applicable law.'
    ]
  },
  {
    title: '12. Changes to This Privacy Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. If we make material changes, we may update the Effective Date above and, where appropriate, provide additional notice within the app or through other reasonable means.'
    ]
  },
  {
    title: '13. Contact Us',
    paragraphs: [
      'If you have questions, requests, or concerns about this Privacy Policy or our data practices, please contact us using the email listed below.'
    ]
  }
];

export function PrivacyPolicyPage() {
  const [language, setLanguage] = useState('id');

  const policy = useMemo(() => {
    return language === 'id'
      ? {
          title: 'Kebijakan Privasi',
          badgeLabel: 'Dokumen Hukum',
          dateLabel: 'Tanggal Berlaku',
          effectiveDate: EFFECTIVE_DATE_ID,
          intro: [
            `PulseWise disediakan oleh ${LEGAL_ENTITY} ("kami", "kita", atau "milik kami"). Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, membagikan, menyimpan, dan melindungi data pribadi serta informasi terkait wellness saat Anda menggunakan aplikasi PulseWise, layanan terkait, dan saluran dukungan.`,
            'PulseWise adalah aplikasi kesehatan dan wellness untuk konsumen. Aplikasi ini dirancang untuk membantu pengguna membuat catatan harian, mengelola rutinitas, menyimpan kontak dukungan, melihat ringkasan wellness, dan mengakses konten edukasi. PulseWise bukanlah alat kesehatan dan tidak memberikan diagnosis, pengobatan, respons darurat, atau nasihat medis profesional.',
            'Dengan menggunakan PulseWise, Anda memahami bahwa informasi Anda akan diproses sebagaimana dijelaskan dalam Kebijakan Privasi ini.'
          ],
          sections: POLICY_ID,
          contactTitle: 'Kontak Privasi',
          deleteLabel: 'Form Permintaan Penghapusan',
          loginLabel: 'Kembali ke Login'
        }
      : {
          title: 'Privacy Policy',
          badgeLabel: 'Legal Document',
          dateLabel: 'Effective Date',
          effectiveDate: EFFECTIVE_DATE_EN,
          intro: [
            `PulseWise is provided by ${LEGAL_ENTITY} ("we", "us", or "our"). This Privacy Policy explains how we collect, use, disclose, store, and protect personal data and wellness-related information when you use the PulseWise application, related services, and support channels.`,
            'PulseWise is a consumer wellness app. It is designed to help users keep daily logs, manage routines, save support contacts, view wellness summaries, and access educational content. PulseWise is not a medical device and does not provide diagnosis, treatment, emergency response, or professional medical advice.',
            'By using PulseWise, you acknowledge that your information will be handled as described in this Privacy Policy.'
          ],
          sections: POLICY_EN,
          contactTitle: 'Privacy Contact',
          deleteLabel: 'Account Deletion Request',
          loginLabel: 'Back to Login'
        };
  }, [language]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Main Document Container */}
      <main className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Document Header */}
        <header className="border-b border-slate-200 bg-slate-50/50 p-6 sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                <ArrowLeft size={16} />
                {policy.loginLabel}
              </Link>

              <div>
                <img
                  src={PULSEWISE_LOGO_FULL_URL}
                  alt="PulseWise"
                  className="mb-4 h-8 w-auto object-contain"
                />
                {/* Badge Label dinamis (Dokumen Hukum / Legal Document) */}
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  <ShieldCheck size={14} />
                  {policy.badgeLabel}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {policy.title}
                </h1>
                {/* Tanggal Berlaku dinamis (Tanggal Berlaku / Effective Date) */}
                <p className="mt-2 text-sm text-slate-500">
                  {policy.dateLabel}: {policy.effectiveDate}
                </p>
              </div>
            </div>

            {/* Language Toggle Control */}
            <div className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  language === 'id'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Bahasa Indonesia
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  language === 'en'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </header>

        {/* Document Body */}
        <div className="p-6 sm:p-10">
          {/* Intro Section */}
          <div className="prose prose-slate max-w-none prose-p:leading-relaxed">
            {policy.intro.map((paragraph, idx) => (
              <p key={idx} className="text-slate-600">
                {paragraph}
              </p>
            ))}
          </div>

          <hr className="my-10 border-slate-200" />

          {/* Policy Sections */}
          <div className="space-y-12">
            {policy.sections.map((section) => (
              <section key={section.title} className="scroll-mt-8">
                <h2 className="mb-4 text-xl font-semibold tracking-tight text-slate-900">
                  {section.title}
                </h2>

                <div className="space-y-4 text-slate-600 leading-relaxed">
                  {section.paragraphs?.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}

                  {section.bullets?.length > 0 && (
                    <ul className="list-outside list-disc space-y-2 pl-5 marker:text-slate-400">
                      {section.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  )}

                  {section.note && (
                    <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 border border-slate-200">
                      <strong className="text-slate-900">Catatan: </strong>
                      {section.note}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>

          <hr className="my-10 border-slate-200" />

          {/* Contact & Legal Entity Footer */}
          <div className="rounded-xl bg-slate-50 p-6 sm:p-8 border border-slate-100">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              {policy.contactTitle}
            </h2>
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end">
              <div className="text-slate-600">
                <p className="font-medium text-slate-900">{LEGAL_ENTITY}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>

              <a
                href={DELETE_FORM_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <ExternalLink size={16} className="text-slate-400" />
                {policy.deleteLabel}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
