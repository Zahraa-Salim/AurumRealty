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
      key:       'service_1',
      title:     'Property sales',
      titleAr:   'بيع العقارات',
      subtitle:  null,
      subtitleAr:null,
      body:      'Strategic marketing, pricing guidance and expert negotiation for premium residential sales.',
      bodyAr:    'التسويق الاستراتيجي والتوجيه السعري والتفاوض الخبير لبيع المنازل الفاخرة.',
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
      bodyAr:    'الإدارة الفعالة للأصول عالية القيمة، من فحص المستأجرين إلى الإشراف على الصيانة والتقارير.',
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
      bodyAr:    'استراتيجية المحفظة والذكاء السوقي للمشترين الذين يبنون ثروة عقارية طويلة الأجل.',
      image:     'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
      linkText:  null,
      linkTextAr:null,
      linkUrl:   null,
    },
    {
      key:       'about_team',
      title:     'Meet the team',
      titleAr:   'قابل الفريق',
      subtitle:  null, subtitleAr: null, body: null, bodyAr: null,
      image: null, linkText: null, linkTextAr: null, linkUrl: null,
    },
    {
      key:       'about_values',
      title:     'Our values',
      titleAr:   'قيمنا',
      subtitle:  null, subtitleAr: null, body: null, bodyAr: null,
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
  ]

  for (const sc of siteContent) {
    await prisma.siteContent.upsert({
      where:  { key: sc.key },
      update: {
        title: sc.title, titleAr: sc.titleAr,
        subtitle: sc.subtitle, subtitleAr: sc.subtitleAr,
        body: sc.body, bodyAr: sc.bodyAr,
        image: sc.image,
        linkText: sc.linkText, linkTextAr: sc.linkTextAr,
        linkUrl: sc.linkUrl,
      },
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
  console.log('  ✓ Site content')

  // ── PROPERTIES ─────────────────────────────────────────────────────────────
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000)

  const properties = [
    {
      title:          'Penthouse at One Central',
      titleAr:        'بنتهاوس وان سنترال',
      price:          '$8,500,000',
      address:        '1 Central Avenue, 52nd Floor',
      neighbourhood:  'Downtown',
      status:         'For Sale',
      type:           'Penthouse',
      bedrooms:       4,
      bathrooms:      4,
      area:           '6,200 sq ft',
      description:    'A trophy penthouse with panoramic skyline views, bespoke finishes and a private rooftop entertaining terrace.',
      descriptionAr:  'بنتهاوس فخم بإطلالات بانورامية على خط السماء، وتشطيبات مخصصة وشرفة خاصة على السطح للترفيه.',
      features:       ['Private rooftop terrace', 'Wine cellar', 'Smart home system', "Chef's kitchen"],
      featuresAr:     ['شرفة خاصة على السطح', 'قبو النبيذ', 'نظام المنزل الذكي', 'مطبخ الشيف'],
      images:         ['https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1200&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
      agentName:      'Sarah Johnson',
      createdAt:      daysAgo(40),
    },
    {
      title:          'Riverview Manor',
      titleAr:        'عقار واجهة النهر',
      price:          '$4,200,000',
      address:        '18 Riverside Crescent',
      neighbourhood:  'Riverside',
      status:         'For Sale',
      type:           'Estate',
      bedrooms:       6,
      bathrooms:      5,
      area:           '7,800 sq ft',
      description:    'A grand family estate overlooking the river with formal entertaining rooms, landscaped grounds and a heated pool.',
      descriptionAr:  'عقار عائلي فخم بإطلالات على النهر مع غرف ترفيه رسمية وحدائق مصممة وحمام مدفأ.',
      features:       ['Heated pool', 'Private garden', 'Library', 'Double garage'],
      featuresAr:     ['حمام مدفأ', 'حديقة خاصة', 'مكتبة', 'مرآب مزدوج'],
      images:         ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'],
      agentName:      'Michael Chen',
      createdAt:      daysAgo(35),
    },
    {
      title:          'The Glass House',
      titleAr:        'منزل الزجاج',
      price:          '$6,800,000',
      address:        '9 Hillside Drive',
      neighbourhood:  'Hillside',
      status:         'For Sale',
      type:           'Villa',
      bedrooms:       5,
      bathrooms:      5,
      area:           '8,400 sq ft',
      description:    'A dramatic contemporary villa with an infinity pool, double-height atrium and seamless indoor-outdoor living.',
      descriptionAr:  'فيلا معاصرة درامية مع حمام سباحة لا نهائي وفناء مرتفع الارتفاع والمعيشة الداخلية والخارجية بسلاسة.',
      features:       ['Infinity pool', 'Sauna', 'Underfloor heating', 'Outdoor kitchen'],
      featuresAr:     ['حمام سباحة لا نهائي', 'حمام بخار', 'تدفئة أرضية', 'مطبخ خارجي'],
      images:         ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'],
      agentName:      'Sarah Johnson',
      createdAt:      daysAgo(28),
    },
    {
      title:          'Harbour View Apartment',
      titleAr:        'شقة إطلالة الميناء',
      price:          '$31,000 / month',
      address:        '280 Harbourfront Boulevard, Apt 28',
      neighbourhood:  'Harbourfront',
      status:         'For Rent',
      type:           'Apartment',
      bedrooms:       3,
      bathrooms:      2,
      area:           '2,200 sq ft',
      description:    'A premium waterfront apartment with concierge services, a wraparound terrace and uninterrupted harbour views.',
      descriptionAr:  'شقة واجهة مائية متقدمة مع خدمات كونسيرج وشرفة شاملة وإطلالات على الميناء دون انقطاع.',
      features:       ['Concierge', 'Valet parking', 'Wraparound terrace', "Residents' gym"],
      featuresAr:     ['كونسيرج', 'موقف سيارات فاليت', 'شرفة شاملة', 'صالة رياضية للسكان'],
      images:         ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80'],
      agentName:      'Emily Brooks',
      createdAt:      daysAgo(20),
    },
    {
      title:          'Garden Villa',
      titleAr:        'فيلا الحديقة',
      price:          '$3,750,000',
      address:        '42 Garden Quarter Lane',
      neighbourhood:  'Garden Quarter',
      status:         'For Sale',
      type:           'Villa',
      bedrooms:       5,
      bathrooms:      4,
      area:           '5,100 sq ft',
      description:    'A serene single-level villa behind private gates with landscaped gardens and a solar-heated pool.',
      descriptionAr:  'فيلا هادئة من مستوى واحد خلف بوابات خاصة مع حدائق مصممة وحمام سباحة مدفأ بالطاقة الشمسية.',
      features:       ['Solar-heated pool', 'Outdoor entertaining', 'Triple garage', 'Solar panels'],
      featuresAr:     ['حمام سباحة مدفأ بالطاقة الشمسية', 'منطقة ترفيه خارجية', 'مرآب ثلاثي', 'ألواح شمسية'],
      images:         ['https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1200&q=80'],
      agentName:      'Michael Chen',
      createdAt:      daysAgo(16),
    },
    {
      title:          'Prestige Residences',
      titleAr:        'مجمع بريستيج السكني',
      price:          'From $2,950,000',
      address:        '77 Financial District Plaza',
      neighbourhood:  'Financial District',
      status:         'New Development',
      type:           'Apartment',
      bedrooms:       3,
      bathrooms:      3,
      area:           '2,900 sq ft',
      description:    'A new residential development with concierge, wellness amenities and panoramic city views.',
      descriptionAr:  'مشروع سكني جديد مع كونسيرج ومرافق الصحة والعافية وإطلالات بانورامية على المدينة.',
      features:       ["Residents' lounge", 'Spa', 'Private cinema', 'Smart access control'],
      featuresAr:     ['صالة السكان', 'منتجع صحي', 'سينما خاصة', 'نظام تحكم الوصول الذكي'],
      images:         ['https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&q=80'],
      agentName:      'Aurum Realty',
      createdAt:      daysAgo(12),
    },
  ]

  for (const p of properties) {
    const existing = await prisma.property.findFirst({ where: { title: p.title } })
    if (!existing) {
      await prisma.property.create({
        data: {
          ...p,
          isPublished: true,
          updatedAt:   new Date(),
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
