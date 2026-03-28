-- Aurum Realty — seed.sql
-- Run with: psql $DATABASE_URL -f prisma/seed.sql

-- =============================================
-- USERS
-- Password for all seeded users: Password123!
-- =============================================
INSERT INTO "User" (name, email, password, role, "isActive", "createdAt", "lastActive", "permissionsVersion") VALUES
  ('Admin User', 'admin@aurumrealty.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin', true, NOW(), NOW(), 0),
  ('Sarah Johnson', 'sarah@aurumrealty.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Property Manager', true, NOW(), NOW(), 0),
  ('Michael Chen', 'michael@aurumrealty.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Editor', true, NOW(), NOW(), 0),
  ('Emily Brooks', 'emily@aurumrealty.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Support', true, NOW(), NOW(), 0)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- SITE CONTENT
-- =============================================
INSERT INTO "SiteContent" (key, title, "titleAr", subtitle, "subtitleAr", body, "bodyAr", image, "linkText", "linkTextAr", "linkUrl", "updatedAt") VALUES
  (
    'home_hero',
    'Find your dream property',
    'ابحث عن عقارك الحلم',
    'Discover luxury homes and investments in prime locations',
    'اكتشف المنازل الفاخرة والاستثمارات في أفضل المواقع',
    NULL,
    NULL,
    NULL,
    'Explore properties',
    'استكشف العقارات',
    '/properties',
    NOW()
  ),
  (
    'about_story',
    'About our agency',
    'عن وكالتنا',
    'Trusted expertise in luxury real estate since 2010',
    'خبرة موثوقة في العقارات الفاخرة منذ عام 2010',
    'Aurum Realty was founded in 2010 with a singular vision: to elevate the standard of service in the luxury real estate market.' || E'\n\n' ||
    'What began as a boutique agency has grown into a globally recognised firm, facilitating some of the most significant residential transactions in the region.' || E'\n\n' ||
    'Our success is built on discretion, deep market intelligence, and an unwavering commitment to our clients'' best interests.',
    'تأسست أوروم ريالتي عام 2010 برؤية واحدة: رفع معايير الخدمة في سوق العقارات الفاخرة.' || E'\n\n' ||
    'بدأت كوكالة صغيرة متخصصة وأصبحت شركة معترفاً بها عالمياً، تنفذ بعضاً من أهم المعاملات السكنية في المنطقة.' || E'\n\n' ||
    'ينبني نجاحنا على السرية والذكاء السوقي العميق والالتزام الراسخ بمصالح عملائنا.',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    NULL,
    NULL,
    NULL,
    NOW()
  ),
  (
    'service_1',
    'Property sales',
    'بيع العقارات',
    NULL,
    NULL,
    'Strategic marketing, pricing guidance and expert negotiation for premium residential sales.',
    'التسويق الاستراتيجي والتوجيه السعري والتفاوض الخبير لبيع المنازل الفاخرة.',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    NULL,
    NULL,
    NULL,
    NOW()
  ),
  (
    'service_2',
    'Property management',
    'إدارة العقارات',
    NULL,
    NULL,
    'Hands-on management for high-value assets, from tenant screening to maintenance oversight and reporting.',
    'الإدارة الفعالة للأصول عالية القيمة، من فحص المستأجرين إلى الإشراف على الصيانة والتقارير.',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    NULL,
    NULL,
    NULL,
    NOW()
  ),
  (
    'service_3',
    'Investment advisory',
    'الاستشارات الاستثمارية',
    NULL,
    NULL,
    'Portfolio strategy and market intelligence for buyers building long-term real estate wealth.',
    'استراتيجية المحفظة والذكاء السوقي للمشترين الذين يبنون ثروة عقارية طويلة الأجل.',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
    NULL,
    NULL,
    NULL,
    NOW()
  ),
  (
    'about_team',
    'Meet the team',
    'قابل الفريق',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW()
  ),
  (
    'about_values',
    'Our values',
    'قيمنا',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW()
  ),
  (
    'about_cta',
    'Ready to begin your property journey?',
    'هل أنت مستعد لبدء رحلتك العقارية؟',
    'Let''s explore what''s possible for your real estate goals.',
    'دعنا نستكشف ما هو ممكن لأهدافك العقارية.',
    NULL,
    NULL,
    NULL,
    'Get in touch',
    'تواصل معنا',
    '/contact',
    NOW()
  ),
  (
    'home_cta',
    'Ready to find your next property?',
    'هل أنت مستعد للعثور على عقارك التالي؟',
    'Discover premium properties and expert guidance tailored to your goals.',
    'اكتشف العقارات الممتازة والتوجيه الخبير المصمم لأهدافك.',
    NULL,
    NULL,
    NULL,
    'Explore now',
    'اكتشف الآن',
    '/properties',
    NOW()
  )
ON CONFLICT (key) DO UPDATE SET
  title = EXCLUDED.title,
  "titleAr" = EXCLUDED."titleAr",
  subtitle = EXCLUDED.subtitle,
  "subtitleAr" = EXCLUDED."subtitleAr",
  body = EXCLUDED.body,
  "bodyAr" = EXCLUDED."bodyAr",
  image = EXCLUDED.image,
  "linkText" = EXCLUDED."linkText",
  "linkTextAr" = EXCLUDED."linkTextAr",
  "linkUrl" = EXCLUDED."linkUrl",
  "updatedAt" = EXCLUDED."updatedAt";

-- =============================================
-- PROPERTIES
-- =============================================
INSERT INTO "Property" (
  title, "titleAr", price, address, neighbourhood, status, type, bedrooms, bathrooms, area,
  description, "descriptionAr", features, "featuresAr", images, "agentName", "isPublished", "createdAt", "updatedAt"
) VALUES
  (
    'Penthouse at One Central',
    'بنتهاوس وان سنترال',
    '$8,500,000',
    '1 Central Avenue, 52nd Floor',
    'Downtown',
    'For Sale',
    'Penthouse',
    4,
    4,
    '6,200 sq ft',
    'A trophy penthouse with panoramic skyline views, bespoke finishes and a private rooftop entertaining terrace.',
    'بنتهاوس فخم بإطلالات بانورامية على خط السماء، وتشطيبات مخصصة وشرفة خاصة على السطح للترفيه.',
    ARRAY['Private rooftop terrace', 'Wine cellar', 'Smart home system', 'Chef''s kitchen'],
    ARRAY['شرفة خاصة على السطح', 'قبو النبيذ', 'نظام المنزل الذكي', 'مطبخ الشيف'],
    ARRAY[
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
    ],
    'Sarah Johnson',
    true,
    NOW() - INTERVAL '40 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'Riverview Manor',
    'عقار واجهة النهر',
    '$4,200,000',
    '18 Riverside Crescent',
    'Riverside',
    'For Sale',
    'Estate',
    6,
    5,
    '7,800 sq ft',
    'A grand family estate overlooking the river with formal entertaining rooms, landscaped grounds and a heated pool.',
    'عقار عائلي فخم بإطلالات على النهر مع غرف ترفيه رسمية وحدائق مصممة وحمام مدفأ.',
    ARRAY['Heated pool', 'Private garden', 'Library', 'Double garage'],
    ARRAY['حمام مدفأ', 'حديقة خاصة', 'مكتبة', 'مرآب مزدوج'],
    ARRAY[
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'
    ],
    'Michael Chen',
    true,
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'The Glass House',
    'منزل الزجاج',
    '$6,800,000',
    '9 Hillside Drive',
    'Hillside',
    'For Sale',
    'Villa',
    5,
    5,
    '8,400 sq ft',
    'A dramatic contemporary villa with an infinity pool, double-height atrium and seamless indoor-outdoor living.',
    'فيلا معاصرة درامية مع حمام سباحة لا نهائي وفناء مرتفع الارتفاع والمعيشة الداخلية والخارجية بسلاسة.',
    ARRAY['Infinity pool', 'Sauna', 'Underfloor heating', 'Outdoor kitchen'],
    ARRAY['حمام سباحة لا نهائي', 'حمام بخار', 'تدفئة أرضية', 'مطبخ خارجي'],
    ARRAY[
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'
    ],
    'Sarah Johnson',
    true,
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'Harbour View Apartment',
    'شقة إطلالة الميناء',
    '$31,000 / month',
    '280 Harbourfront Boulevard, Apt 28',
    'Harbourfront',
    'For Rent',
    'Apartment',
    3,
    2,
    '2,200 sq ft',
    'A premium waterfront apartment with concierge services, a wraparound terrace and uninterrupted harbour views.',
    'شقة واجهة مائية متقدمة مع خدمات كونسيرج وشرفة شاملة وإطلالات على الميناء دون انقطاع.',
    ARRAY['Concierge', 'Valet parking', 'Wraparound terrace', 'Residents'' gym'],
    ARRAY['كونسيرج', 'موقف سيارات فاليت', 'شرفة شاملة', 'صالة رياضية للسكان'],
    ARRAY[
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80'
    ],
    'Emily Brooks',
    true,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    'Garden Villa',
    'فيلا الحديقة',
    '$3,750,000',
    '42 Garden Quarter Lane',
    'Garden Quarter',
    'For Sale',
    'Villa',
    5,
    4,
    '5,100 sq ft',
    'A serene single-level villa behind private gates with landscaped gardens and a solar-heated pool.',
    'فيلا هادئة من مستوى واحد خلف بوابات خاصة مع حدائق مصممة وحمام سباحة مدفأ بالطاقة الشمسية.',
    ARRAY['Solar-heated pool', 'Outdoor entertaining', 'Triple garage', 'Solar panels'],
    ARRAY['حمام سباحة مدفأ بالطاقة الشمسية', 'منطقة ترفيه خارجية', 'مرآب ثلاثي', 'ألواح شمسية'],
    ARRAY[
      'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1200&q=80'
    ],
    'Michael Chen',
    true,
    NOW() - INTERVAL '16 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'Prestige Residences',
    'مجمع بريستيج السكني',
    'From $2,950,000',
    '77 Financial District Plaza',
    'Financial District',
    'New Development',
    'Apartment',
    3,
    3,
    '2,900 sq ft',
    'A new residential development with concierge, wellness amenities and panoramic city views.',
    'مشروع سكني جديد مع كونسيرج ومرافق الصحة والعافية وإطلالات بانورامية على المدينة.',
    ARRAY['Residents'' lounge', 'Spa', 'Private cinema', 'Smart access control'],
    ARRAY['صالة السكان', 'منتجع صحي', 'سينما خاصة', 'نظام تحكم الوصول الذكي'],
    ARRAY[
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&q=80'
    ],
    'Aurum Realty',
    true,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 hours'
  );

-- =============================================
-- BLOG POSTS
-- =============================================
INSERT INTO "BlogPost" (
  title, "titleAr", slug, topic, author, subtitle, "subtitleAr", body, "bodyAr", "pullQuote", "pullQuoteAr", "heroImage", "readTime",
  "isPublished", "publishedAt", "createdAt", "updatedAt"
) VALUES
  (
    'Future of Luxury Real Estate',
    'مستقبل العقارات الفاخرة',
    'future-of-luxury-real-estate',
    'Market outlook',
    'Sarah Johnson',
    'What premium buyers now prioritise in top-tier residential markets.',
    'ما يعطيه المشترون الفاخرون الأولوية الآن في أسواق المساكن من الدرجة الأولى.',
    'Luxury real estate continues to evolve as buyers place more weight on privacy, wellness and flexible living.' || E'\n\n' ||
    '## What is changing' || E'\n\n' ||
    'Today''s premium buyer is comparing service, technology and neighbourhood quality just as closely as square footage.',
    'تستمر العقارات الفاخرة في التطور حيث يركز المشترون أكثر على الخصوصية والصحة والعيش المرن.' || E'\n\n' ||
    '## ما يتغير' || E'\n\n' ||
    'يقارن مشتري اليوم الفاخرون الخدمة والتكنولوجيا وجودة الحي بنفس دقة المساحة المربعة.',
    'Today''s premium buyer expects a home that supports lifestyle, wellness and long-term value.',
    'يتوقع مشتري اليوم الفاخر منزلاً يدعم نمط الحياة والصحة والقيمة طويلة الأجل.',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    '6 min read',
    true,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days'
  ),
  (
    'Building a Resilient Portfolio',
    'بناء محفظة قوية',
    'building-a-resilient-portfolio',
    'Investment',
    'Emily Brooks',
    'How strategic diversification helps long-term property investors.',
    'كيف يساعد التنويع الاستراتيجي المستثمرين العقاريين على المدى الطويل.',
    'Resilient portfolios are built around strong fundamentals, liquidity planning and disciplined acquisition criteria.' || E'\n\n' ||
    '## Practical strategy' || E'\n\n' ||
    'The best investors understand both the income profile and the long-term growth story behind every acquisition.',
    'تُبنى المحافظ القوية حول أساسيات قوية وتخطيط السيولة ومعايير الاستحواذ المنضبطة.' || E'\n\n' ||
    '## الاستراتيجية العملية' || E'\n\n' ||
    'أفضل المستثمرين يفهمون ملف الدخل وقصة النمو طويلة الأجل خلف كل عملية استحواذ.',
    'Diversification works best when every asset still fits a clear strategic thesis.',
    'ينجح التنويع بشكل أفضل عندما تتناسب كل أصول مع أطروحة استراتيجية واضحة.',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
    '5 min read',
    true,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
  ),
  (
    'What Buyers Actually Want',
    'ما يريده المشترون فعلاً',
    'what-buyers-actually-want',
    'Buyer insight',
    'Michael Chen',
    'A practical look at the features that consistently drive interest.',
    'نظرة عملية على الميزات التي تحرك الاهتمام باستمرار.',
    'Buyers respond most strongly to clarity, condition and confidence in the quality of a home.' || E'\n\n' ||
    '## Standout features' || E'\n\n' ||
    'Natural light, privacy, intuitive layouts and strong presentation remain the common denominators.',
    'يستجيب المشترون بقوة للوضوح والحالة والثقة في جودة المنزل.' || E'\n\n' ||
    '## الميزات المميزة' || E'\n\n' ||
    'الضوء الطبيعي والخصوصية والتخطيطات البديهية والعرض القوي تبقى القواسم المشتركة.',
    'The homes that perform best are usually the ones that make decision-making easiest for the buyer.',
    'المنازل التي تؤدي بشكل أفضل عادة ما تكون تلك التي تجعل اتخاذ القرار أسهل للمشتري.',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    '4 min read',
    true,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
  ),
  (
    'A Practical Guide to Off-Plan Purchases',
    'دليل عملي لشراء العقارات قيد الإنشاء',
    'practical-guide-off-plan-purchases',
    'Guides',
    'Sarah Johnson',
    'The key risks and checks buyers should cover before they commit.',
    'المخاطر الرئيسية والفحوصات التي يجب على المشترين تغطيتها قبل الالتزام.',
    'Off-plan purchases can create excellent upside, but they also require disciplined due diligence.' || E'\n\n' ||
    '## Before you sign' || E'\n\n' ||
    'Developer track record, contract review and finance planning should be resolved before exchange.',
    'يمكن لشراء العقارات قيد الإنشاء أن تخلق فرصة ممتازة، لكنها تتطلب العناية الواجبة.' || E'\n\n' ||
    '## قبل التوقيع' || E'\n\n' ||
    'يجب حل السجل التاريخي للمطور ومراجعة العقد وتخطيط التمويل قبل الاتفاق.',
    'The strongest off-plan buyers prepare for delay, variation and finance risk before they commit.',
    'يستعد أقوى مشترو العقارات قيد الإنشاء للتأخير والتغيير ومخاطر التمويل قبل الالتزام.',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    '7 min read',
    true,
    NOW() - INTERVAL '38 days',
    NOW() - INTERVAL '38 days',
    NOW() - INTERVAL '38 days'
  )
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- NEWS ARTICLES
-- =============================================
INSERT INTO "NewsArticle" (
  title, "titleAr", slug, category, author, summary, "summaryAr", body, "bodyAr", "heroImage",
  "isPublished", "publishedAt", "createdAt", "updatedAt"
) VALUES
  (
    'Aurum Realty Miami Office Opens',
    'افتتاح مكتب أوروم ريالتي في ميامي',
    'aurum-realty-miami-office',
    'Company news',
    'Aurum Realty',
    'Aurum Realty has opened a new Miami office to support cross-border buyers and sellers.',
    'افتتحت أوروم ريالتي مكتباً جديداً في ميامي لدعم المشترين والبائعين عبر الحدود.',
    'The new Miami office expands Aurum Realty''s advisory coverage for international clients and strategic partnerships.' || E'\n\n' ||
    '## Why Miami' || E'\n\n' ||
    'The region continues to attract capital, relocations and premium residential demand.',
    'يوسع مكتب ميامي الجديد نطاق الاستشارات في أوروم ريالتي للعملاء الدوليين والشراكات الاستراتيجية.' || E'\n\n' ||
    '## لماذا ميامي' || E'\n\n' ||
    'تستمر المنطقة في جذب رأس المال والانتقالات والطلب على المساكن الفاخرة.',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80',
    true,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'Interest Rates 2026 Outlook',
    'توقعات أسعار الفائدة لعام 2026',
    'interest-rates-2026-outlook',
    'Market update',
    'Aurum Realty Research',
    'Rate expectations are stabilising, but buyers still need to plan for a selective financing environment.',
    'تتوازن توقعات الأسعار، لكن المشترين لا يزالون بحاجة إلى التخطيط لبيئة تمويل انتقائية.',
    'Buyers and investors are adapting to a slower path toward lower rates, with prime transactions remaining more resilient than the wider market.' || E'\n\n' ||
    '## What it means' || E'\n\n' ||
    'Preparation and lender relationships matter more than ever in a selective rate environment.',
    'يتكيف المشترون والمستثمرون مع مسار أبطأ نحو أسعار أقل، مع بقاء المعاملات الرئيسية أكثر مرونة من السوق الأوسع.' || E'\n\n' ||
    '## ماذا يعني هذا' || E'\n\n' ||
    'الإعداد وعلاقات المقرضين مهمة أكثر من أي وقت مضى في بيئة أسعار انتقائية.',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&q=80',
    true,
    NOW() - INTERVAL '11 days',
    NOW() - INTERVAL '11 days',
    NOW() - INTERVAL '11 days'
  ),
  (
    'Aurum Realty Named Agency of the Year',
    'أوروم ريالتي تُختار وكالة العام',
    'aurum-realty-agency-of-the-year',
    'Awards',
    'Aurum Realty',
    'The company received major industry recognition for client service and sales performance.',
    'حصلت الشركة على اعتراف صناعي كبير لخدمة العملاء والأداء في المبيعات.',
    'Aurum Realty was named Agency of the Year after a strong year of growth, client results and brand expansion.' || E'\n\n' ||
    '## Recognition' || E'\n\n' ||
    'The award reflects excellence in advisory, marketing and execution across the luxury residential market.',
    'سميت أوروم ريالتي وكالة العام بعد عام قوي من النمو ونتائج العملاء وتوسع العلامة التجارية.' || E'\n\n' ||
    '## الاعتراف' || E'\n\n' ||
    'يعكس الجائزة التميز في الاستشارات والتسويق والتنفيذ في سوق العقارات السكنية الفاخرة.',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&q=80',
    true,
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days'
  ),
  (
    'Top Neighbourhoods to Watch in 2026',
    'أفضل الأحياء المراقبة في عام 2026',
    'top-neighbourhoods-2026',
    'Industry insight',
    'Aurum Realty Research',
    'Several emerging districts are showing the strongest mix of infrastructure, demand and value upside.',
    'تظهر عدة مناطق ناشئة أقوى مزيج من البنية التحتية والطلب والقيمة.',
    'Neighbourhood performance in 2026 is increasingly driven by transport access, lifestyle infrastructure and supply constraints.' || E'\n\n' ||
    '## Emerging demand' || E'\n\n' ||
    'Districts with high-quality new stock and strong amenity pipelines are attracting the most attention.',
    'يتم تحديد أداء الحي في عام 2026 بشكل متزايد من خلال إمكانية الوصول للنقل والبنية التحتية لنمط الحياة وقيود الإمدادات.' || E'\n\n' ||
    '## الطلب الناشئ' || E'\n\n' ||
    'تجتذب المناطق التي بها أسهم جديدة عالية الجودة وخطوط مرافق قوية أكثر الاهتمام.',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    true,
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days'
  ),
  (
    'Record Sale Completed in Marina District',
    'اكتمال بيع قياسي في حي الميناء',
    'record-sale-marina-district',
    'Transaction',
    'Aurum Realty',
    'Aurum Realty advised on a landmark waterfront sale in the Marina District.',
    'قدمت أوروم ريالتي استشارات بشأن بيع واجهة مائية تاريخي في حي الميناء.',
    'The transaction marks one of the strongest waterfront deals of the year and reflects continued appetite for premium inventory.' || E'\n\n' ||
    '## Market signal' || E'\n\n' ||
    'Best-in-class homes in supply-constrained micro-markets continue to command strong competition.',
    'تشير المعاملة إلى أحد أقوى صفقات الواجهة المائية للعام وتعكس الشهية المستمرة للمخزون الفاخر.' || E'\n\n' ||
    '## إشارة السوق' || E'\n\n' ||
    'تستمر المنازل على المستوى العالمي في الأسواق الجزئية المقيدة الإمدادات في جذب منافسة قوية.',
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80',
    true,
    NOW() - INTERVAL '31 days',
    NOW() - INTERVAL '31 days',
    NOW() - INTERVAL '31 days'
  )
ON CONFLICT (slug) DO NOTHING;
