/**
 * prisma/seed.ts
 *
 * Prisma seed script — run with:
 *   npx prisma db seed
 *
 * Requires the following in package.json:
 *   "prisma": { "seed": "tsx prisma/seed.ts" }
 *
 * All upserts use unique keys so re-running is safe (idempotent).
 * Password for all seeded users: Password123!
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱  Seeding database…')

  // ── USERS ──────────────────────────────────────────────────────────────────
  const users = [
    { name: 'Admin User',    email: 'admin@aurumrealty.com',   role: 'Super Admin' },
    { name: 'Sarah Johnson', email: 'sarah@aurumrealty.com',   role: 'Property Manager' },
    { name: 'Michael Chen',  email: 'michael@aurumrealty.com', role: 'Editor' },
    { name: 'Emily Brooks',  email: 'emily@aurumrealty.com',   role: 'Support' },
  ]
  // bcrypt hash of "Password123!" with salt rounds 10
  const HASHED_PW = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'

  for (const u of users) {
    await prisma.user.upsert({
      where:  { email: u.email },
      update: {},
      create: {
        name:               u.name,
        email:              u.email,
        password:           HASHED_PW,
        role:               u.role,
        isActive:           true,
        permissionsVersion: 0,
        lastActive:         new Date(),
      },
    })
  }
  console.log('  ✓ Users')

  // ── SITE CONTENT ───────────────────────────────────────────────────────────
  const siteContent = [
    {
      key:       'home_hero',
      title:     'Find your dream property',
      titleAr:   'ابحث عن عقارك الحلم',
      subtitle:  'Discover luxury homes and investments in prime locations',
      subtitleAr:'اكتشف المنازل الفاخرة والاستثمارات في أفضل المواقع',
      body:      null,
      bodyAr:    null,
      image:     null,
      linkText:  'Explore properties',
      linkTextAr:'استكشف العقارات',
      linkUrl:   '/properties',
    },
    {
      key:       'about_story',
      title:     'About our agency',
      titleAr:   'عن وكالتنا',
      subtitle:  'Trusted expertise in luxury real estate since 2010',
      subtitleAr:'خبرة موثوقة في العقارات الفاخرة منذ عام 2010',
      body:
        'Aurum Realty was founded in 2010 with a singular vision: to elevate the standard of service in the luxury real estate market.\n\n' +
        'What began as a boutique agency has grown into a globally recognised firm, facilitating some of the most significant residential transactions in the region.\n\n' +
        'Our success is built on discretion, deep market intelligence, and an unwavering commitment to our clients\' best interests.',
      bodyAr:
        'تأسست أوروم ريالتي عام 2010 برؤية واحدة: رفع معايير الخدمة في سوق العقارات الفاخرة.\n\n' +
        'بدأت كوكالة صغيرة متخصصة وأصبحت شركة معترفاً بها عالمياً، تنفذ بعضاً من أهم المعاملات السكنية في المنطقة.\n\n' +
        'ينبني نجاحنا على السرية والذكاء السوقي العميق والالتزام الراسخ بمصالح عملائنا.',
      image:     'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
      linkText:  null,
      linkTextAr:null,
      linkUrl:   null,
    },
    {
      key:       'home_services',
      title:     'How we can help',
      titleAr:   'كيف يمكننا المساعدة',
      subtitle:  'Comprehensive luxury real estate services tailored to your needs',
      subtitleAr:'خدمات عقارية فاخرة شاملة مصممة لتلبية احتياجاتك',
      body:      null,
      bodyAr:    null,
      image:     null,
      linkText:  null,
      linkTextAr:null,
      linkUrl:   null,
    },
    {
      key:       'home_about',
      title:     'A trusted name in luxury real estate',
      titleAr:   'اسم موثوق في العقارات الفاخرة',
      subtitle:  null,
      subtitleAr:null,
      body:      'Founded in 2010, Aurum Realty has built a reputation for discretion, deep market knowledge, and unparalleled client service across the world\'s most sought-after residential markets.',
      bodyAr:    'تأسست أوروم ريالتي عام 2010 وبنت سمعة راسخة في السرية والمعرفة العميقة بالسوق وخدمة العملاء التي لا مثيل لها في أرقى الأسواق السكنية في العالم.',
      image:     'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
      linkText:  'Our story',
      linkTextAr:'قصتنا',
      linkUrl:   '/about',
    },
    {
      key:       'services_header',
      title:     'Our services',
      titleAr:   'خدماتنا',
      subtitle:  'Expert guidance across every stage of the luxury property journey',
      subtitleAr:'توجيه خبير في كل مرحلة من مراحل رحلة العقارات الفاخرة',
      body:      null,
      bodyAr:    null,
      image:     null,
      linkText:  null,
      linkTextAr:null,
      linkUrl:   null,
    },
    {
      key:       'services_cta',
      title:     'Ready to get started?',
      titleAr:   'هل أنت مستعد للبدء؟',
      subtitle:  'Our advisors are ready to help you find the right solution.',
      subtitleAr:'مستشارونا مستعدون لمساعدتك في إيجاد الحل المناسب.',
      body:      null,
      bodyAr:    null,
      image:     null,
      linkText:  'Contact us',
      linkTextAr:'تواصل معنا',
      linkUrl:   '/contact',
    },
    {
      key:       'service_1',
      title:     'Property sales',
      titleAr:   'بيع العقارات',
      subtitle:  null,
      subtitleAr:null,
      body:      'Strategic marketing, pricing guidance and expert negotiation for premium residential sales.',
      bodyAr:    JSON.stringify({
        paragraphs: ['التسويق الاستراتيجي والتوجيه السعري والتفاوض الخبير لبيع المنازل الفاخرة.'],
        points: ['تسويق استراتيجي متكامل', 'توجيه دقيق في التسعير', 'تفاوض احترافي لصالح العميل', 'إدارة كاملة لعملية البيع'],
      }),
      image:     'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      linkText:  null,
      linkTextAr:null,
      linkUrl:   null,
    },
    {
      key:       'service_2',
      title:     'Property management',
      titleAr:   'إدارة العقارات',
      subtitle:  null,
      subtitleAr:null,
      body:      'Hands-on management for high-value assets, from tenant screening to maintenance oversight and reporting.',
      bodyAr:    JSON.stringify({
        paragraphs: ['الإدارة الفعالة للأصول عالية القيمة، من فحص المستأجرين إلى الإشراف على الصيانة والتقارير.'],
        points: ['فحص شامل للمستأجرين', 'إشراف على الصيانة الدورية', 'تقارير مالية دقيقة', 'إدارة العلاقة مع المستأجرين'],
      }),
      image:     'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
      linkText:  null,
      linkTextAr:null,
      linkUrl:   null,
    },
    {
      key:       'service_3',
      title:     'Investment advisory',
      titleAr:   'الاستشارات الاستثمارية',
      subtitle:  null,
      subtitleAr:null,
      body:      'Portfolio strategy and market intelligence for buyers building long-term real estate wealth.',
      bodyAr:    JSON.stringify({
        paragraphs: ['استراتيجية المحفظة والذكاء السوقي للمشترين الذين يبنون ثروة عقارية طويلة الأجل.'],
        points: ['تحليل السوق والفرص الاستثمارية', 'بناء محافظ عقارية متوازنة', 'تقييم العوائد طويلة الأجل', 'استشارات التوقيت والتسعير'],
      }),
      image:     'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
      linkText:  null,
      linkTextAr:null,
      linkUrl:   null,
    },
    {
      key:       'about_team',
      title:     'Meet the team',
      titleAr:   'قابل الفريق',
      subtitle:  null, subtitleAr: null,
      body: JSON.stringify({
        title: 'Meet the team',
        members: [
          { name: 'Sarah Johnson',  role: 'Managing Director',      bio: 'With over 20 years in luxury real estate, Sarah has facilitated some of the most significant residential transactions in the region. Her expertise spans acquisitions, disposals, and investment strategy.', image: '' },
          { name: 'Michael Chen',   role: 'Senior Agent',           bio: 'Michael specialises in the premium residential market, with particular focus on new development and off-plan acquisitions. He works closely with a select group of domestic and international clients.', image: '' },
          { name: 'Emily Brooks',   role: 'Investment Specialist',  bio: 'Emily brings institutional investment expertise to our private client advisory practice, advising high-net-worth individuals on portfolio construction and strategic real estate allocation.', image: '' },
        ],
      }),
      bodyAr: JSON.stringify({
        title: 'قابل الفريق',
        members: [
          { name: 'سارة جونسون',   role: 'المدير العام',           bio: 'بخبرة تتجاوز 20 عامًا في العقارات الفاخرة، أشرفت سارة على بعض أهم المعاملات السكنية في المنطقة. تمتد خبرتها لتشمل عمليات الاستحواذ والتصرف واستراتيجية الاستثمار.', image: '' },
          { name: 'مايكل تشن',     role: 'وكيل أول',               bio: 'يتخصص مايكل في سوق السكن الفاخر، مع تركيز خاص على التطويرات الجديدة وعمليات الاستحواذ على المخطط. يعمل عن كثب مع مجموعة مختارة من العملاء المحليين والدوليين.', image: '' },
          { name: 'إيملي بروكس',   role: 'متخصص استثمار',          bio: 'تقدم إيملي خبرة استثمارية مؤسسية إلى ممارستنا الاستشارية للعملاء الخاصين، إذ تقدم المشورة للأفراد ذوي الثروات العالية حول بناء المحافظ الاستثمارية وتخصيص العقارات الاستراتيجية.', image: '' },
        ],
      }),
      image: null, linkText: null, linkTextAr: null, linkUrl: null,
    },
    {
      key:       'about_values',
      title:     'Our values',
      titleAr:   'قيمنا',
      subtitle:  null, subtitleAr: null,
      body: JSON.stringify({
        title: 'Our values',
        items: [
          { label: 'Integrity',     desc: 'We act in our clients\' best interests, always. Our advice is honest, even when it is not what clients want to hear.' },
          { label: 'Excellence',    desc: 'Every instruction, regardless of scale, receives the same level of attention and rigour that has defined our reputation.' },
          { label: 'Client focus',  desc: 'We measure our success by our clients\' outcomes, not transaction volumes. Long-term relationships are the foundation of our practice.' },
        ],
      }),
      bodyAr: JSON.stringify({
        title: 'قيمنا',
        items: [
          { label: 'النزاهة',       desc: 'نتصرف دائمًا وفق أفضل مصالح عملائنا. نصيحتنا صادقة حتى عندما لا تكون ما يريد العميل سماعه.' },
          { label: 'التميز',        desc: 'كل تعليمات، بغض النظر عن حجمها، تحظى بنفس مستوى الاهتمام والصرامة الذي ميّز سمعتنا.' },
          { label: 'التركيز على العميل', desc: 'نقيس نجاحنا بنتائج عملائنا، وليس بأحجام المعاملات. العلاقات طويلة الأمد هي أساس ممارستنا.' },
        ],
      }),
      image: null, linkText: null, linkTextAr: null, linkUrl: null,
    },
    {
      key:       'about_cta',
      title:     'Ready to begin your property journey?',
      titleAr:   'هل أنت مستعد لبدء رحلتك العقارية؟',
      subtitle:  "Let's explore what's possible for your real estate goals.",
      subtitleAr:'دعنا نستكشف ما هو ممكن لأهدافك العقارية.',
      body: null, bodyAr: null, image: null,
      linkText:  'Get in touch',
      linkTextAr:'تواصل معنا',
      linkUrl:   '/contact',
    },
    {
      key:       'home_cta',
      title:     'Ready to find your next property?',
      titleAr:   'هل أنت مستعد للعثور على عقارك التالي؟',
      subtitle:  'Discover premium properties and expert guidance tailored to your goals.',
      subtitleAr:'اكتشف العقارات الممتازة والتوجيه الخبير المصمم لأهدافك.',
      body: null, bodyAr: null, image: null,
      linkText:  'Explore now',
      linkTextAr:'اكتشف الآن',
      linkUrl:   '/properties',
    },
    {
      key:       'home_journal',
      title:     'From the journal',
      titleAr:   'من المجلة',
      subtitle:  null, subtitleAr: null, body: null, bodyAr: null, image: null,
      linkText:  'Read all articles',
      linkTextAr:'اقرأ جميع المقالات',
      linkUrl:   '/blog',
    },
    {
      key:       'services_index',
      title:     null, titleAr: null, subtitle: null, subtitleAr: null,
      body:      JSON.stringify({ keys: ['service_1', 'service_2', 'service_3'] }),
      bodyAr:    null, image: null, linkText: null, linkTextAr: null, linkUrl: null,
    },
    {
      key:       'site_settings_general',
      title:     null, titleAr: null, subtitle: null, subtitleAr: null,
      body:      JSON.stringify({
        companyName:   'Aurum Realty',
        tagline:       'Founded 2010. Luxury properties for discerning buyers.',
        contactEmail:  'hello@aurumrealty.com',
        phone:         '+1 (555) 123-4567',
        addressLines:  ['123 Luxury Avenue', 'Suite 400', 'New York, NY 10022'],
      }),
      bodyAr: null, image: null, linkText: null, linkTextAr: null, linkUrl: null,
    },
    {
      key:       'site_settings_hours',
      title:     null, titleAr: null, subtitle: null, subtitleAr: null,
      body:      JSON.stringify({
        rows: [
          { day: 'Mon – Fri',   hours: '9am – 6pm'         },
          { day: 'Saturday',    hours: '10am – 4pm'         },
          { day: 'Sunday',      hours: 'By appointment'     },
        ],
      }),
      bodyAr: null, image: null, linkText: null, linkTextAr: null, linkUrl: null,
    },
    {
      key:       'site_settings_social',
      title:     null, titleAr: null, subtitle: null, subtitleAr: null,
      body:      JSON.stringify({
        links: [
          { label: 'Instagram', url: '#' },
          { label: 'LinkedIn',  url: '#' },
          { label: 'Facebook',  url: '#' },
        ],
      }),
      bodyAr: null, image: null, linkText: null, linkTextAr: null, linkUrl: null,
    },
    {
      key:       'contact_page',
      title:     'Get in touch',
      titleAr:   'تواصل معنا',
      subtitle:  'Our advisors are available Monday to Saturday. We respond to all enquiries within 24 hours.',
      subtitleAr:'مستشارونا متاحون من الاثنين إلى السبت. نرد على جميع الاستفسارات خلال 24 ساعة.',
      body: null, bodyAr: null, image: null, linkText: null, linkTextAr: null, linkUrl: null,
    },
  ]

  for (const sc of siteContent) {
    await prisma.siteContent.upsert({
      where:  { key: sc.key },
      update: {}, // DO NOTHING on conflict — preserve any live edits already in the DB
      create: {
        key: sc.key,
        title: sc.title, titleAr: sc.titleAr,
        subtitle: sc.subtitle, subtitleAr: sc.subtitleAr,
        body: sc.body, bodyAr: sc.bodyAr,
        image: sc.image,
        linkText: sc.linkText, linkTextAr: sc.linkTextAr,
        linkUrl: sc.linkUrl,
      },
    })
  }

  // Always sync Arabic JSON bodies for about_team and about_values
  // (these are structured JSON blobs the dashboard populates — safe to overwrite
  //  because the dashboard editor will re-save them if the team edits content)
  const arBodyUpdates: { key: string; bodyAr: string; titleAr: string }[] = siteContent
    .filter(sc => ['about_team', 'about_values'].includes(sc.key) && sc.bodyAr != null)
    .map(sc => ({ key: sc.key, bodyAr: sc.bodyAr as string, titleAr: sc.titleAr ?? '' }))

  for (const upd of arBodyUpdates) {
    await prisma.siteContent.updateMany({
      where: { key: upd.key },
      data:  { bodyAr: upd.bodyAr, titleAr: upd.titleAr },
    })
  }

  console.log('  ✓ Site content')

  // ── PROPERTIES ─────────────────────────────────────────────────────────────
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000)

  const properties = [
    {
      title:         'Modern luxury estate',
      titleAr:       'عقار فاخر عصري',
      price:         '$4,500,000',
      address:       '1 Prestige Avenue, Downtown Premium',
      neighbourhood: 'Downtown Premium',
      status:        'For Sale',
      type:          'Estate',
      bedrooms:      5,
      bathrooms:     4,
      area:          '5,200 sqft',
      yearBuilt:     '2022',
      lotSize:       '1.2 acres',
      description:   "Located in the heart of the city's most prestigious neighbourhood, this stunning residence combines contemporary elegance with timeless architecture. Floor-to-ceiling windows showcase breathtaking panoramic views while flooding the interior with natural light.",
      descriptionAr: 'يقع في قلب أرقى أحياء المدينة، يجمع هذا المسكن الرائع بين الأناقة المعاصرة والهندسة المعمارية الخالدة. نوافذ تمتد من الأرض حتى السقف تعرض مناظر بانورامية خلابة وتغمر المساحة الداخلية بالضوء الطبيعي.',
      features:      ['Smart home automation system', 'Temperature-controlled wine cellar', 'Zero-edge infinity pool', 'State-of-the-art home theater', '4-car subterranean garage', 'Private elevator', 'Radiant heated floors', 'Custom architectural lighting'],
      featuresAr:    ['نظام أتمتة منزلية ذكي', 'قبو نبيذ مكيّف الحرارة', 'حمام سباحة لا نهائي', 'مسرح منزلي متطور', 'مرآب تحت الأرض لـ4 سيارات', 'مصعد خاص', 'أرضيات ساخنة إشعاعية', 'إضاءة معمارية مخصصة'],
      images:        ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
      agentName:     'Michael Chen',
      createdAt:     daysAgo(60),
    },
    {
      title:         'Waterfront villa',
      titleAr:       'فيلا الواجهة المائية',
      price:         '$3,800,000',
      address:       '12 Ocean Drive, Beachfront District',
      neighbourhood: 'Beachfront District',
      status:        'For Sale',
      type:          'Villa',
      bedrooms:      4,
      bathrooms:     3.5,
      area:          '4,200 sqft',
      yearBuilt:     '2019',
      lotSize:       '0.8 acres',
      description:   'A breathtaking waterfront retreat offering unobstructed ocean views from every principal room. This meticulously designed villa seamlessly blends indoor and outdoor living with retractable glass walls that open to an expansive terrace, infinity-edge pool, and private beach access.',
      descriptionAr: 'ملاذ على الواجهة المائية يقدم إطلالات بحرية واسعة غير محجوبة من كل غرفة رئيسية. هذه الفيلا المصممة بعناية تمزج المعيشة الداخلية والخارجية بسلاسة من خلال جدران زجاجية قابلة للطي تفتح على شرفة واسعة وحمام سباحة لا نهائي ومنفذ خاص للشاطئ.',
      features:      ['Private beach access', 'Infinity-edge pool', 'Boat dock', 'Retractable glass walls', "Chef's kitchen", 'Home automation', 'Guest cottage', 'Outdoor kitchen'],
      featuresAr:    ['منفذ مباشر للشاطئ', 'حمام سباحة لا نهائي', 'رصيف للقوارب', 'جدران زجاجية قابلة للطي', 'مطبخ الشيف', 'نظام أتمتة منزلية', 'استراحة للضيوف', 'مطبخ خارجي'],
      images:        ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80'],
      agentName:     'Michael Chen',
      createdAt:     daysAgo(55),
    },
    {
      title:         'Contemporary penthouse',
      titleAr:       'بنتهاوس معاصر',
      price:         '$2,200,000',
      address:       '88 Gallery Tower, Arts Quarter',
      neighbourhood: 'Arts Quarter',
      status:        'For Sale',
      type:          'Penthouse',
      bedrooms:      3,
      bathrooms:     2,
      area:          '2,800 sqft',
      yearBuilt:     '2021',
      lotSize:       null,
      description:   "A stunning full-floor penthouse crowning one of the city's most architecturally celebrated towers. With 270-degree views and interiors by an award-winning designer, this residence represents the pinnacle of urban luxury living.",
      descriptionAr: 'بنتهاوس مذهل يشغل طابقاً كاملاً في واحدة من أكثر الأبراج الأيقونية معمارياً في المدينة. بإطلالات بزاوية 270 درجة وتصميم داخلي من مصمم حائز على جوائز، يمثل هذا المسكن قمة الرفاهية الحضرية الراقية.',
      features:      ['360-degree rooftop terrace', 'Private elevator', 'Concierge service', 'Temperature-controlled wine room', 'Custom Italian kitchen', 'Smart home system'],
      featuresAr:    ['شرفة سطحية بزاوية 360 درجة', 'مصعد خاص', 'خدمة كونسيرج', 'غرفة نبيذ مكيّفة الحرارة', 'مطبخ إيطالي مخصص', 'نظام منزل ذكي'],
      images:        ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'],
      agentName:     'Sarah Johnson',
      createdAt:     daysAgo(50),
    },
    {
      title:         'Urban loft apartment',
      titleAr:       'شقة لوفت حضرية',
      price:         '$1,850,000',
      address:       '14 Warehouse Lane, Historic District',
      neighbourhood: 'Historic District',
      status:        'For Rent',
      type:          'Apartment',
      bedrooms:      2,
      bathrooms:     2,
      area:          '2,100 sqft',
      yearBuilt:     '2018',
      lotSize:       null,
      description:   'A masterfully converted warehouse loft that preserves the industrial character of the original building while delivering contemporary luxury throughout. Soaring 14-foot ceilings, original exposed brick, and polished concrete floors form the backdrop for a refined residential experience.',
      descriptionAr: 'شقة لوفت محوّلة من مستودع بشكل احترافي تحافظ على الطابع الصناعي للمبنى الأصلي مع تقديم الفخامة المعاصرة في كل مكان. أسقف مرتفعة 14 قدماً وطوب مكشوف أصلي وأرضيات خرسانية مصقولة تشكل خلفية لتجربة سكنية راقية.',
      features:      ['14-foot ceilings', 'Exposed brick walls', 'Polished concrete floors', "Chef's kitchen", 'Private parking', 'Rooftop terrace access'],
      featuresAr:    ['أسقف ارتفاعها 14 قدماً', 'جدران طوب مكشوف', 'أرضيات خرسانية مصقولة', 'مطبخ الشيف', 'موقف سيارات خاص', 'إمكانية الوصول إلى الشرفة السطحية'],
      images:        ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
      agentName:     'Emily Brooks',
      createdAt:     daysAgo(48),
    },
    {
      title:         'Hillside retreat',
      titleAr:       'ملاذ التلال',
      price:         '$5,100,000',
      address:       '7 Summit Ridge, Mountain View Estates',
      neighbourhood: 'Mountain View Estates',
      status:        'For Sale',
      type:          'Estate',
      bedrooms:      6,
      bathrooms:     5.5,
      area:          '6,800 sqft',
      yearBuilt:     '2020',
      lotSize:       '2.4 acres',
      description:   "Perched at the apex of the city's most exclusive hillside enclave, this extraordinary estate commands sweeping panoramic views across the valley and coastline. The architecture responds to its dramatic topography, with the residence cascading across multiple levels to maximize views from every room.",
      descriptionAr: 'يتربع على قمة أرقى تلال المدينة الحصرية، تعلو هذا العقار الاستثنائية بإطلالات بانورامية شاملة على الوادي والساحل. الهندسة المعمارية تستجيب لطبوغرافيتها الدرامية، مع انسياب المسكن عبر مستويات متعددة لتعظيم المشاهد من كل غرفة.',
      features:      ['Panoramic valley views', 'Negative-edge pool and spa', 'Home theater', 'Wine cellar with tasting room', '6-car garage', 'Staff quarters', 'Tennis court', 'Helipad'],
      featuresAr:    ['إطلالات بانورامية على الوادي', 'حمام سباحة وسبا بحافة مائية', 'مسرح منزلي', 'قبو نبيذ مع غرفة تذوق', 'مرآب لـ6 سيارات', 'سكن للموظفين', 'ملعب تنس', 'منصة هليكوبتر'],
      images:        ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', 'https://images.unsplash.com/photo-1597047084897-51e81819a499?w=800&q=80'],
      agentName:     'Sarah Johnson',
      createdAt:     daysAgo(45),
    },
    {
      title:         'Garden townhouse',
      titleAr:       'تاون هاوس الحديقة',
      price:         '$1,450,000',
      address:       '22 Blossom Street, Westside Premium',
      neighbourhood: 'Westside Premium',
      status:        'For Sale',
      type:          'Townhouse',
      bedrooms:      3,
      bathrooms:     2.5,
      area:          '2,400 sqft',
      yearBuilt:     '2017',
      lotSize:       '0.1 acres',
      description:   "A beautifully proportioned townhouse occupying a coveted position on one of the neighbourhood's most sought-after streets. The property has been comprehensively refurbished to an exceptional standard, with bespoke joinery, underfloor heating throughout, and a south-facing garden.",
      descriptionAr: 'تاون هاوس ذو نسب جميلة يحتل موقعاً متميزاً في أحد أكثر شوارع الحي رواجاً. تمت تجديد العقار بشكل شامل بمعايير استثنائية، مع نجارة مخصصة وتدفئة أرضية وحديقة مشمسة.',
      features:      ['South-facing private garden', 'Underfloor heating', 'Bespoke kitchen', 'Off-street parking', 'Original period features', 'Recently refurbished'],
      featuresAr:    ['حديقة خاصة مشمسة', 'تدفئة أرضية', 'مطبخ مخصص', 'موقف سيارات', 'عناصر أصلية من الحقبة التاريخية', 'تم تجديده مؤخراً'],
      images:        ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'],
      agentName:     'Michael Chen',
      createdAt:     daysAgo(42),
    },
    {
      title:         'Sky penthouse suite',
      titleAr:       'جناح بنتهاوس السماء',
      price:         '$6,800,000',
      address:       '1 Summit Tower, Downtown Premium',
      neighbourhood: 'Downtown Premium',
      status:        'New Development',
      type:          'Penthouse',
      bedrooms:      4,
      bathrooms:     4,
      area:          '4,600 sqft',
      yearBuilt:     '2025',
      lotSize:       null,
      description:   'The crown jewel of Summit Tower — a brand new full-floor penthouse occupying the entire 45th floor. Designed by internationally acclaimed architects, this residence establishes a new benchmark for ultra-luxury urban living.',
      descriptionAr: 'جوهرة برج سوميت — بنتهاوس جديد يشغل طابقاً كاملاً في الطابق 45. صمّمه معماريون ذوو شهرة دولية، يرسي هذا المسكن معياراً جديداً للمعيشة الفائقة الفخامة في المناطق الحضرية.',
      features:      ['Full-floor private residence', 'Private elevator lobby', 'Wraparound terrace', 'Pool and spa', 'Catering kitchen', 'Smart home by Savant', 'Private storage vault', 'Two dedicated parking spaces'],
      featuresAr:    ['مسكن خاص يشغل طابقاً كاملاً', 'ردهة مصعد خاصة', 'شرفة ملتفة', 'حمام سباحة وسبا', 'مطبخ تموين', 'منزل ذكي بنظام Savant', 'خزينة تخزين خاصة', 'موقفان مخصصان للسيارات'],
      images:        ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'],
      agentName:     'Sarah Johnson',
      createdAt:     daysAgo(38),
    },
    {
      title:         'Coastal villa',
      titleAr:       'فيلا ساحلية',
      price:         '$4,200,000',
      address:       '5 Shore Road, Beachfront District',
      neighbourhood: 'Beachfront District',
      status:        'For Sale',
      type:          'Villa',
      bedrooms:      5,
      bathrooms:     4,
      area:          '4,900 sqft',
      yearBuilt:     '2018',
      lotSize:       '1.1 acres',
      description:   'A magnificent coastal villa combining the relaxed elegance of beach living with the amenities of a luxury resort. Set within mature grounds with direct beach access, the property offers exceptional entertaining spaces both inside and out.',
      descriptionAr: 'فيلا ساحلية رائعة تجمع بين أناقة الحياة الشاطئية المريحة ومرافق المنتجع الفاخر. تقع في أرض ناضجة مع منفذ مباشر للشاطئ، وتوفر مساحات ترفيهية استثنائية في الداخل والخارج.',
      features:      ['Direct beach access', 'Pool and pool house', 'Outdoor entertaining pavilion', 'Guest suite', 'Solar power system', 'Beach equipment storage'],
      featuresAr:    ['منفذ مباشر للشاطئ', 'حمام سباحة ومنزل حمام السباحة', 'جناح ترفيه خارجي', 'جناح الضيوف', 'نظام طاقة شمسية', 'مخزن معدات الشاطئ'],
      images:        ['https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80'],
      agentName:     'Michael Chen',
      createdAt:     daysAgo(36),
    },
    {
      title:         'Heritage townhouse',
      titleAr:       'تاون هاوس التراث',
      price:         '$1,750,000',
      address:       '9 Georgian Row, Historic District',
      neighbourhood: 'Historic District',
      status:        'For Rent',
      type:          'Townhouse',
      bedrooms:      3,
      bathrooms:     2,
      area:          '2,200 sqft',
      yearBuilt:     '1890',
      lotSize:       null,
      description:   'A beautifully restored Georgian townhouse in the heart of the conservation area. Original period features have been sensitively preserved — including the ornate cornicing, original fireplaces, and wide-plank timber floors — while the property has been fully modernised behind the scenes.',
      descriptionAr: 'تاون هاوس جورجي مُرمَّم بشكل جميل في قلب منطقة الحفاظ على التراث. تم الحفاظ على العناصر الأصلية من الحقبة التاريخية بحساسية — بما فيها الزخارف الرفيعة والمداخئ الأصلية وأرضيات الخشب العريضة — بينما جُدِّد العقار بالكامل خلف الكواليس.',
      features:      ['Original period features', 'Four fireplaces', 'Private courtyard garden', 'Cellar', 'Modern kitchen extension', 'Recently rewired and replumbed'],
      featuresAr:    ['عناصر أصلية من الحقبة التاريخية', 'أربعة مداخئ', 'حديقة فناء خاصة', 'قبو', 'توسعة مطبخ حديثة', 'تم إعادة التمديدات الكهربائية والسباكة مؤخراً'],
      images:        ['https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80'],
      agentName:     'Emily Brooks',
      createdAt:     daysAgo(33),
    },
    {
      title:         'Lakeview apartment',
      titleAr:       'شقة إطلالة البحيرة',
      price:         '$980,000',
      address:       'Lakeside Residences 301, Arts Quarter',
      neighbourhood: 'Arts Quarter',
      status:        'For Rent',
      type:          'Apartment',
      bedrooms:      1,
      bathrooms:     1,
      area:          '850 sqft',
      yearBuilt:     '2022',
      lotSize:       null,
      description:   'A beautifully designed one-bedroom apartment in the sought-after Lakeside Residences development. The property benefits from uninterrupted lake views, accessed through full-height glazing that floods the interior with light.',
      descriptionAr: 'شقة بغرفة نوم واحدة مصممة بعناية في مشروع ليكسايد ريزيدنسز المرغوب فيه. تستفيد العقار من إطلالات بحيرية غير منقطعة، يمكن الوصول إليها من خلال زجاجيات كاملة الارتفاع تغمر المساحة الداخلية بالضوء.',
      features:      ['Uninterrupted lake views', 'Concierge service', 'Gym and spa access', 'Underground parking', 'Balcony', 'Porter service'],
      featuresAr:    ['إطلالات بحيرية غير منقطعة', 'خدمة كونسيرج', 'إمكانية الوصول إلى صالة رياضية وسبا', 'موقف تحت الأرض', 'شرفة', 'خدمة بواب'],
      images:        ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
      agentName:     'Emily Brooks',
      createdAt:     daysAgo(30),
    },
    {
      title:         'Grand manor estate',
      titleAr:       'عقار المانور الكبير',
      price:         '$9,200,000',
      address:       '1 Manor Gate, Mountain View Estates',
      neighbourhood: 'Mountain View Estates',
      status:        'For Sale',
      type:          'Estate',
      bedrooms:      7,
      bathrooms:     6,
      area:          '9,100 sqft',
      yearBuilt:     '2015',
      lotSize:       '5.2 acres',
      description:   'One of the most significant private residences to come to market this decade. This extraordinary manor estate commands a premier position within an exclusive gated enclave, offering a level of privacy, scale, and architectural quality that is exceptionally rare.',
      descriptionAr: 'أحد أبرز المساكن الخاصة التي طُرحت في السوق هذا العقد. يحتل عقار المانور الاستثنائي هذا موقعاً متميزاً داخل حي مسوّر حصري، ويقدم مستوى من الخصوصية والحجم والجودة المعمارية نادر بشكل استثنائي.',
      features:      ['Gated private estate', '5.2 acres of landscaped grounds', 'Indoor swimming pool', 'Squash court', 'Home cinema', 'Staff wing', '8-car garage with charging', 'Helipad'],
      featuresAr:    ['عقار خاص مسوّر', '5.2 فدان من الأراضي المنسّقة', 'حمام سباحة داخلي', 'ملعب إسكواش', 'سينما منزلية', 'جناح الموظفين', 'مرآب لـ8 سيارات مع شحن', 'منصة هليكوبتر'],
      images:        ['https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80'],
      agentName:     'Sarah Johnson',
      createdAt:     daysAgo(28),
    },
    {
      title:         'Beachfront bungalow',
      titleAr:       'بانغالو الواجهة البحرية',
      price:         '$2,700,000',
      address:       '3 Dune Road, Beachfront District',
      neighbourhood: 'Beachfront District',
      status:        'New Development',
      type:          'Villa',
      bedrooms:      3,
      bathrooms:     2,
      area:          '2,600 sqft',
      yearBuilt:     '2024',
      lotSize:       '0.6 acres',
      description:   'A rare new-build beachfront bungalow offering direct sand access and unobstructed ocean views from a single-storey layout designed for effortless beach living. The architecture is contemporary coastal, with cedar cladding, a living sedum roof, and expansive glazing.',
      descriptionAr: 'بانغالو نادر على الواجهة البحرية يوفر وصولاً مباشراً للرمال وإطلالات بحرية غير محجوبة من تصميم أحادي الطابق صُمِّم لحياة شاطئية سلسة. الهندسة المعمارية ساحلية معاصرة مع كسوة الأرز وسقف نباتي حي وزجاجيات واسعة.',
      features:      ['Direct beach access', 'Living sedum roof', 'Cedar cladding', 'Outdoor shower', 'Covered deck', 'Solar and battery storage', 'Underfloor heating'],
      featuresAr:    ['وصول مباشر للشاطئ', 'سقف نباتي حي', 'كسوة أرز', 'دش خارجي', 'سطح مظلل', 'طاقة شمسية وتخزين بطاريات', 'تدفئة أرضية'],
      images:        ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80'],
      agentName:     'Michael Chen',
      createdAt:     daysAgo(25),
    },
    {
      title:         'Downtown studio loft',
      titleAr:       'لوفت استوديو وسط المدينة',
      price:         '$750,000',
      address:       '40 Financial Square, Downtown Premium',
      neighbourhood: 'Downtown Premium',
      status:        'For Sale',
      type:          'Apartment',
      bedrooms:      1,
      bathrooms:     1,
      area:          '680 sqft',
      yearBuilt:     '2023',
      lotSize:       null,
      description:   'A considered and compact studio loft in the heart of the financial district. Designed by an award-winning interior architect, every element of this residence has been maximised for both livability and aesthetic quality.',
      descriptionAr: 'لوفت استوديو مدروس وأنيق في قلب الحي المالي. صممه معماري داخلي حائز على جوائز، تم تحسين كل عنصر في هذا المسكن لتحقيق أقصى قدر من السكنية والجودة الجمالية.',
      features:      ['Award-winning interior design', 'Bespoke storage solutions', 'Premium appliances', 'Concierge building', 'Cycle storage', 'Ground rent free'],
      featuresAr:    ['تصميم داخلي حائز على جوائز', 'حلول تخزين مخصصة', 'أجهزة متقدمة', 'مبنى مع كونسيرج', 'مخزن دراجات', 'إيجار أرض مجاني'],
      images:        ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
      agentName:     'Emily Brooks',
      createdAt:     daysAgo(22),
    },
    {
      title:         'Westside garden villa',
      titleAr:       'فيلا حديقة الجانب الغربي',
      price:         '$3,300,000',
      address:       '18 Elm Close, Westside Premium',
      neighbourhood: 'Westside Premium',
      status:        'For Sale',
      type:          'Villa',
      bedrooms:      4,
      bathrooms:     3,
      area:          '3,800 sqft',
      yearBuilt:     '2016',
      lotSize:       '0.7 acres',
      description:   'An exceptional family villa set within beautifully landscaped gardens in one of the most desirable residential streets on the west side. The property has been extensively upgraded by the current owners, with particular attention paid to the kitchen, primary suite, and garden.',
      descriptionAr: 'فيلا عائلية استثنائية تقع في حدائق منسّقة بجمال في أحد أكثر الشوارع السكنية رواجاً في الجانب الغربي. قام المالكون الحاليون بتطوير العقار بشكل مكثف، مع اهتمام خاص بالمطبخ والجناح الرئيسي والحديقة.',
      features:      ['Landscaped gardens', 'Outdoor kitchen and dining', 'Swimming pool', 'Detached home office', 'Double garage', 'Kitchen garden'],
      featuresAr:    ['حدائق منسّقة', 'مطبخ وغرفة طعام خارجية', 'حمام سباحة', 'مكتب منزلي منفصل', 'مرآب مزدوج', 'حديقة مطبخ'],
      images:        ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'],
      agentName:     'Michael Chen',
      createdAt:     daysAgo(19),
    },
    {
      title:         'Arts Quarter penthouse',
      titleAr:       'بنتهاوس حي الفنون',
      price:         '$3,100,000',
      address:       '1 Gallery Tower, Arts Quarter',
      neighbourhood: 'Arts Quarter',
      status:        'For Rent',
      type:          'Penthouse',
      bedrooms:      3,
      bathrooms:     3,
      area:          '3,200 sqft',
      yearBuilt:     '2020',
      lotSize:       null,
      description:   "A striking penthouse in the iconic Gallery Tower, the centrepiece of the Arts Quarter's cultural renaissance. Interiors by a noted designer combine gallery-quality finishes with a livable warmth that is rare at this level.",
      descriptionAr: 'بنتهاوس لافت للنظر في برج الغاليري الأيقوني، محور نهضة حي الفنون الثقافية. الطراز الداخلي المنفذ بواسطة مصمم بارز يجمع بين تشطيبات بجودة المعرض ودفء قابل للعيش نادر في هذا المستوى.',
      features:      ['Private roof terrace with hot tub', 'Gallery-quality finishes', 'Private lift', 'Concierge and porter', '2 secure parking spaces', 'Storage unit'],
      featuresAr:    ['شرفة سطحية خاصة مع حوض سبا', 'تشطيبات بجودة المعرض', 'مصعد خاص', 'كونسيرج وبواب', 'موقفان مؤمَّنان للسيارات', 'وحدة تخزين'],
      images:        ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'],
      agentName:     'Sarah Johnson',
      createdAt:     daysAgo(16),
    },
    {
      title:         'Riverside townhouse',
      titleAr:       'تاون هاوس ضفة النهر',
      price:         '$1,650,000',
      address:       '11 Riverside Walk, Historic District',
      neighbourhood: 'Historic District',
      status:        'For Sale',
      type:          'Townhouse',
      bedrooms:      3,
      bathrooms:     2.5,
      area:          '2,300 sqft',
      yearBuilt:     '2019',
      lotSize:       null,
      description:   'A beautifully finished townhouse occupying a prime position on Riverside Walk, with views across the water from the principal rooms. The property has been designed to maximise natural light and the connection to the river.',
      descriptionAr: 'تاون هاوس مشطّب بجمال يحتل موقعاً متميزاً في ممشى ضفة النهر، مع إطلالات على المياه من الغرف الرئيسية. صُمِّم العقار لتعظيم الضوء الطبيعي والارتباط بالنهر.',
      features:      ['River views', 'Private terrace', 'Open-plan kitchen and dining', 'Utility room', 'Allocated parking', 'Bicycle storage'],
      featuresAr:    ['إطلالات على النهر', 'شرفة خاصة', 'مطبخ وغرفة طعام مفتوحان', 'غرفة خدمات', 'موقف مخصص', 'مخزن دراجات'],
      images:        ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'],
      agentName:     'Emily Brooks',
      createdAt:     daysAgo(13),
    },
    {
      title:         'Summit view estate',
      titleAr:       'عقار إطلالة القمة',
      price:         '$7,400,000',
      address:       '3 Pinnacle Drive, Mountain View Estates',
      neighbourhood: 'Mountain View Estates',
      status:        'New Development',
      type:          'Estate',
      bedrooms:      6,
      bathrooms:     5,
      area:          '7,200 sqft',
      yearBuilt:     '2025',
      lotSize:       '3.1 acres',
      description:   'A brand new contemporary estate occupying one of the last remaining premier plots in the Mountain View enclave. Designed by an award-winning studio, the residence makes a powerful architectural statement while delivering the privacy and functionality expected at this level.',
      descriptionAr: 'عقار معاصر جديد يحتل أحد آخر المواقع المتبقية المتميزة في مجمع ماونتن فيو. صمّمه استوديو معماري حائز على جوائز، يمثل المسكن تصريحاً معمارياً قوياً مع تقديم الخصوصية والوظائف المتوقعة في هذا المستوى.',
      features:      ['Newly completed 2025', 'Negative-edge pool and spa', 'Outdoor cinema', 'Gym and wellness suite', 'Smart home by Control4', '6-car heated garage', 'Staff accommodation', 'Charging for 6 EVs'],
      featuresAr:    ['مكتمل حديثاً 2025', 'حمام سباحة وسبا بحافة مائية', 'سينما خارجية', 'صالة رياضية وجناح عافية', 'منزل ذكي بنظام Control4', 'مرآب مدفأ لـ6 سيارات', 'سكن للموظفين', 'شحن لـ6 سيارات كهربائية'],
      images:        ['https://images.unsplash.com/photo-1597047084897-51e81819a499?w=800&q=80'],
      agentName:     'Sarah Johnson',
      createdAt:     daysAgo(10),
    },
    {
      title:         'Historic quarter apartment',
      titleAr:       'شقة الحي التاريخي',
      price:         '$1,200,000',
      address:       '6 Edwardian Place, Historic District',
      neighbourhood: 'Historic District',
      status:        'For Sale',
      type:          'Apartment',
      bedrooms:      2,
      bathrooms:     1,
      area:          '1,400 sqft',
      yearBuilt:     '1920',
      lotSize:       null,
      description:   'A characterful apartment occupying the principal floor of a handsome Edwardian building on one of the historic quarter\'s finest streets. The property retains exceptional original features while being comprehensively modernised throughout.',
      descriptionAr: 'شقة ذات طابع مميز تحتل الطابق الرئيسي لمبنى إدواردي أنيق في أحد أجمل شوارع الحي التاريخي. تحتفظ العقار بعناصر أصلية استثنائية مع تحديث شامل في كل مكان.',
      features:      ['Original Edwardian features', 'High ceilings', 'Period fireplaces', 'Private entrance', 'Communal gardens', 'Permit parking'],
      featuresAr:    ['عناصر إدواردية أصلية', 'أسقف مرتفعة', 'مداخئ من الحقبة التاريخية', 'مدخل خاص', 'حدائق مشتركة', 'تصريح موقف سيارات'],
      images:        ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'],
      agentName:     'Emily Brooks',
      createdAt:     daysAgo(7),
    },
  ]

  for (const p of properties) {
    const existing = await prisma.property.findFirst({ where: { title: p.title } })
    if (!existing) {
      await prisma.property.create({
        data: {
          ...p,
          isPublished:      true,
          updatedAt:        new Date(),
          listingExpiresAt: new Date(now.getTime() + 90 * 86_400_000),
        },
      })
    } else {
      // Always sync Arabic fields so re-running seed fills in translations
      await prisma.property.update({
        where: { id: existing.id },
        data: {
          titleAr:       p.titleAr       ?? existing.titleAr,
          descriptionAr: p.descriptionAr ?? existing.descriptionAr,
          featuresAr:    p.featuresAr && p.featuresAr.length > 0 ? p.featuresAr : existing.featuresAr,
        },
      })
    }
  }
  console.log('  ✓ Properties')

  // ── BLOG POSTS ─────────────────────────────────────────────────────────────
  const blogPosts = [
    {
      title:      'Future of Luxury Real Estate',
      titleAr:    'مستقبل العقارات الفاخرة',
      slug:       'future-of-luxury-real-estate',
      topic:      'Market outlook',
      author:     'Sarah Johnson',
      subtitle:   'What premium buyers now prioritise in top-tier residential markets.',
      subtitleAr: 'ما يعطيه المشترون الفاخرون الأولوية الآن في أسواق المساكن من الدرجة الأولى.',
      body:
        'Luxury real estate continues to evolve as buyers place more weight on privacy, wellness and flexible living.\n\n' +
        '## What is changing\n\n' +
        "Today's premium buyer is comparing service, technology and neighbourhood quality just as closely as square footage.",
      bodyAr:
        'تستمر العقارات الفاخرة في التطور حيث يركز المشترون أكثر على الخصوصية والصحة والعيش المرن.\n\n' +
        '## ما يتغير\n\n' +
        'يقارن مشتري اليوم الفاخرون الخدمة والتكنولوجيا وجودة الحي بنفس دقة المساحة المربعة.',
      pullQuote:   "Today's premium buyer expects a home that supports lifestyle, wellness and long-term value.",
      pullQuoteAr: 'يتوقع مشتري اليوم الفاخر منزلاً يدعم نمط الحياة والصحة والقيمة طويلة الأجل.',
      heroImage:   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
      readTime:    '6 min read',
      publishedAt: daysAgo(12),
    },
    {
      title:      'Building a Resilient Portfolio',
      titleAr:    'بناء محفظة قوية',
      slug:       'building-a-resilient-portfolio',
      topic:      'Investment',
      author:     'Emily Brooks',
      subtitle:   'How strategic diversification helps long-term property investors.',
      subtitleAr: 'كيف يساعد التنويع الاستراتيجي المستثمرين العقاريين على المدى الطويل.',
      body:
        'Resilient portfolios are built around strong fundamentals, liquidity planning and disciplined acquisition criteria.\n\n' +
        '## Practical strategy\n\n' +
        'The best investors understand both the income profile and the long-term growth story behind every acquisition.',
      bodyAr:
        'تُبنى المحافظ القوية حول أساسيات قوية وتخطيط السيولة ومعايير الاستحواذ المنضبطة.\n\n' +
        '## الاستراتيجية العملية\n\n' +
        'أفضل المستثمرين يفهمون ملف الدخل وقصة النمو طويلة الأجل خلف كل عملية استحواذ.',
      pullQuote:   'Diversification works best when every asset still fits a clear strategic thesis.',
      pullQuoteAr: 'ينجح التنويع بشكل أفضل عندما تتناسب كل أصول مع أطروحة استراتيجية واضحة.',
      heroImage:   'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
      readTime:    '5 min read',
      publishedAt: daysAgo(20),
    },
    {
      title:      'What Buyers Actually Want',
      titleAr:    'ما يريده المشترون فعلاً',
      slug:       'what-buyers-actually-want',
      topic:      'Buyer insight',
      author:     'Michael Chen',
      subtitle:   'A practical look at the features that consistently drive interest.',
      subtitleAr: 'نظرة عملية على الميزات التي تحرك الاهتمام باستمرار.',
      body:
        'Buyers respond most strongly to clarity, condition and confidence in the quality of a home.\n\n' +
        '## Standout features\n\n' +
        'Natural light, privacy, intuitive layouts and strong presentation remain the common denominators.',
      bodyAr:
        'يستجيب المشترون بقوة للوضوح والحالة والثقة في جودة المنزل.\n\n' +
        '## الميزات المميزة\n\n' +
        'الضوء الطبيعي والخصوصية والتخطيطات البديهية والعرض القوي تبقى القواسم المشتركة.',
      pullQuote:   'The homes that perform best are usually the ones that make decision-making easiest for the buyer.',
      pullQuoteAr: 'المنازل التي تؤدي بشكل أفضل عادة ما تكون تلك التي تجعل اتخاذ القرار أسهل للمشتري.',
      heroImage:   'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
      readTime:    '4 min read',
      publishedAt: daysAgo(30),
    },
    {
      title:      'A Practical Guide to Off-Plan Purchases',
      titleAr:    'دليل عملي لشراء العقارات قيد الإنشاء',
      slug:       'practical-guide-off-plan-purchases',
      topic:      'Guides',
      author:     'Sarah Johnson',
      subtitle:   'The key risks and checks buyers should cover before they commit.',
      subtitleAr: 'المخاطر الرئيسية والفحوصات التي يجب على المشترين تغطيتها قبل الالتزام.',
      body:
        'Off-plan purchases can create excellent upside, but they also require disciplined due diligence.\n\n' +
        '## Before you sign\n\n' +
        'Developer track record, contract review and finance planning should be resolved before exchange.',
      bodyAr:
        'يمكن لشراء العقارات قيد الإنشاء أن تخلق فرصة ممتازة، لكنها تتطلب العناية الواجبة.\n\n' +
        '## قبل التوقيع\n\n' +
        'يجب حل السجل التاريخي للمطور ومراجعة العقد وتخطيط التمويل قبل الاتفاق.',
      pullQuote:   'The strongest off-plan buyers prepare for delay, variation and finance risk before they commit.',
      pullQuoteAr: 'يستعد أقوى مشترو العقارات قيد الإنشاء للتأخير والتغيير ومخاطر التمويل قبل الالتزام.',
      heroImage:   'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
      readTime:    '7 min read',
      publishedAt: daysAgo(38),
    },
  ]

  for (const bp of blogPosts) {
    await prisma.blogPost.upsert({
      where:  { slug: bp.slug },
      update: {
        title: bp.title, titleAr: bp.titleAr,
        topic: bp.topic, author: bp.author,
        subtitle: bp.subtitle, subtitleAr: bp.subtitleAr,
        body: bp.body, bodyAr: bp.bodyAr,
        pullQuote: bp.pullQuote, pullQuoteAr: bp.pullQuoteAr,
        heroImage: bp.heroImage, readTime: bp.readTime,
      },
      create: {
        ...bp,
        isPublished: true,
        createdAt:   bp.publishedAt,
        updatedAt:   new Date(),
      },
    })
  }
  console.log('  ✓ Blog posts')

  // ── NEWS ARTICLES ──────────────────────────────────────────────────────────
  const newsArticles = [
    {
      title:       'Aurum Realty Miami Office Opens',
      titleAr:     'افتتاح مكتب أوروم ريالتي في ميامي',
      slug:        'aurum-realty-miami-office',
      category:    'Company news',
      author:      'Aurum Realty',
      summary:     'Aurum Realty has opened a new Miami office to support cross-border buyers and sellers.',
      summaryAr:   'افتتحت أوروم ريالتي مكتباً جديداً في ميامي لدعم المشترين والبائعين عبر الحدود.',
      body:
        "The new Miami office expands Aurum Realty's advisory coverage for international clients and strategic partnerships.\n\n" +
        '## Why Miami\n\n' +
        'The region continues to attract capital, relocations and premium residential demand.',
      bodyAr:
        'يوسع مكتب ميامي الجديد نطاق الاستشارات في أوروم ريالتي للعملاء الدوليين والشراكات الاستراتيجية.\n\n' +
        '## لماذا ميامي\n\n' +
        'تستمر المنطقة في جذب رأس المال والانتقالات والطلب على المساكن الفاخرة.',
      heroImage:   'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80',
      publishedAt: daysAgo(5),
    },
    {
      title:       'Interest Rates 2026 Outlook',
      titleAr:     'توقعات أسعار الفائدة لعام 2026',
      slug:        'interest-rates-2026-outlook',
      category:    'Market update',
      author:      'Aurum Realty Research',
      summary:     'Rate expectations are stabilising, but buyers still need to plan for a selective financing environment.',
      summaryAr:   'تتوازن توقعات الأسعار، لكن المشترين لا يزالون بحاجة إلى التخطيط لبيئة تمويل انتقائية.',
      body:
        'Buyers and investors are adapting to a slower path toward lower rates, with prime transactions remaining more resilient than the wider market.\n\n' +
        '## What it means\n\n' +
        'Preparation and lender relationships matter more than ever in a selective rate environment.',
      bodyAr:
        'يتكيف المشترون والمستثمرون مع مسار أبطأ نحو أسعار أقل، مع بقاء المعاملات الرئيسية أكثر مرونة من السوق الأوسع.\n\n' +
        '## ماذا يعني هذا\n\n' +
        'الإعداد وعلاقات المقرضين مهمة أكثر من أي وقت مضى في بيئة أسعار انتقائية.',
      heroImage:   'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&q=80',
      publishedAt: daysAgo(11),
    },
    {
      title:       'Aurum Realty Named Agency of the Year',
      titleAr:     'أوروم ريالتي تُختار وكالة العام',
      slug:        'aurum-realty-agency-of-the-year',
      category:    'Awards',
      author:      'Aurum Realty',
      summary:     'The company received major industry recognition for client service and sales performance.',
      summaryAr:   'حصلت الشركة على اعتراف صناعي كبير لخدمة العملاء والأداء في المبيعات.',
      body:
        'Aurum Realty was named Agency of the Year after a strong year of growth, client results and brand expansion.\n\n' +
        '## Recognition\n\n' +
        'The award reflects excellence in advisory, marketing and execution across the luxury residential market.',
      bodyAr:
        'سميت أوروم ريالتي وكالة العام بعد عام قوي من النمو ونتائج العملاء وتوسع العلامة التجارية.\n\n' +
        '## الاعتراف\n\n' +
        'يعكس الجائزة التميز في الاستشارات والتسويق والتنفيذ في سوق العقارات السكنية الفاخرة.',
      heroImage:   'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&q=80',
      publishedAt: daysAgo(18),
    },
    {
      title:       'Top Neighbourhoods to Watch in 2026',
      titleAr:     'أفضل الأحياء المراقبة في عام 2026',
      slug:        'top-neighbourhoods-2026',
      category:    'Industry insight',
      author:      'Aurum Realty Research',
      summary:     'Several emerging districts are showing the strongest mix of infrastructure, demand and value upside.',
      summaryAr:   'تظهر عدة مناطق ناشئة أقوى مزيج من البنية التحتية والطلب والقيمة.',
      body:
        'Neighbourhood performance in 2026 is increasingly driven by transport access, lifestyle infrastructure and supply constraints.\n\n' +
        '## Emerging demand\n\n' +
        'Districts with high-quality new stock and strong amenity pipelines are attracting the most attention.',
      bodyAr:
        'يتم تحديد أداء الحي في عام 2026 بشكل متزايد من خلال إمكانية الوصول للنقل والبنية التحتية لنمط الحياة وقيود الإمدادات.\n\n' +
        '## الطلب الناشئ\n\n' +
        'تجتذب المناطق التي بها أسهم جديدة عالية الجودة وخطوط مرافق قوية أكثر الاهتمام.',
      heroImage:   'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
      publishedAt: daysAgo(25),
    },
    {
      title:       'Record Sale Completed in Marina District',
      titleAr:     'اكتمال بيع قياسي في حي الميناء',
      slug:        'record-sale-marina-district',
      category:    'Transaction',
      author:      'Aurum Realty',
      summary:     'Aurum Realty advised on a landmark waterfront sale in the Marina District.',
      summaryAr:   'قدمت أوروم ريالتي استشارات بشأن بيع واجهة مائية تاريخي في حي الميناء.',
      body:
        'The transaction marks one of the strongest waterfront deals of the year and reflects continued appetite for premium inventory.\n\n' +
        '## Market signal\n\n' +
        'Best-in-class homes in supply-constrained micro-markets continue to command strong competition.',
      bodyAr:
        'تشير المعاملة إلى أحد أقوى صفقات الواجهة المائية للعام وتعكس الشهية المستمرة للمخزون الفاخر.\n\n' +
        '## إشارة السوق\n\n' +
        'تستمر المنازل على المستوى العالمي في الأسواق الجزئية المقيدة الإمدادات في جذب منافسة قوية.',
      heroImage:   'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80',
      publishedAt: daysAgo(31),
    },
  ]

  for (const na of newsArticles) {
    await prisma.newsArticle.upsert({
      where:  { slug: na.slug },
      update: {
        title: na.title, titleAr: na.titleAr,
        category: na.category, author: na.author,
        summary: na.summary, summaryAr: na.summaryAr,
        body: na.body, bodyAr: na.bodyAr,
        heroImage: na.heroImage,
      },
      create: {
        ...na,
        isPublished: true,
        createdAt:   na.publishedAt,
        updatedAt:   new Date(),
      },
    })
  }
  console.log('  ✓ News articles')

  console.log('\n✅  Seed complete.')
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
