-- Aurum Realty — seed.sql
-- Run with: psql $DATABASE_URL -f prisma/seed.sql

-- =============================================
-- USERS
-- Password for all seeded users: Password123!
-- =============================================
INSERT INTO "User" (name, email, password, role, "isActive", "createdAt", "lastActive") VALUES
  ('Admin User', 'admin@aurumrealty.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin', true, NOW(), NOW()),
  ('Sarah Johnson', 'sarah@aurumrealty.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Property Manager', true, NOW(), NOW()),
  ('Michael Chen', 'michael@aurumrealty.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Editor', true, NOW(), NOW()),
  ('Emily Brooks', 'emily@aurumrealty.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Support', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- SITE CONTENT
-- =============================================
INSERT INTO "SiteContent" (key, title, subtitle, body, image, "linkText", "linkUrl", "updatedAt") VALUES
  (
    'home_hero',
    'Find your dream property',
    'Discover luxury homes and investments in prime locations',
    NULL,
    NULL,
    'Explore properties',
    '/properties',
    NOW()
  ),
  (
    'about_story',
    'About our agency',
    'Trusted expertise in luxury real estate since 2010',
    'Aurum Realty was founded in 2010 with a singular vision: to elevate the standard of service in the luxury real estate market.' || E'\n\n' ||
    'What began as a boutique agency has grown into a globally recognised firm, facilitating some of the most significant residential transactions in the region.' || E'\n\n' ||
    'Our success is built on discretion, deep market intelligence, and an unwavering commitment to our clients'' best interests.',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    NULL,
    NULL,
    NOW()
  ),
  (
    'service_1',
    'Property sales',
    NULL,
    'Strategic marketing, pricing guidance and expert negotiation for premium residential sales.',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    NULL,
    NULL,
    NOW()
  ),
  (
    'service_2',
    'Property management',
    NULL,
    'Hands-on management for high-value assets, from tenant screening to maintenance oversight and reporting.',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    NULL,
    NULL,
    NOW()
  ),
  (
    'service_3',
    'Investment advisory',
    NULL,
    'Portfolio strategy and market intelligence for buyers building long-term real estate wealth.',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
    NULL,
    NULL,
    NOW()
  )
ON CONFLICT (key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  body = EXCLUDED.body,
  image = EXCLUDED.image,
  "linkText" = EXCLUDED."linkText",
  "linkUrl" = EXCLUDED."linkUrl",
  "updatedAt" = EXCLUDED."updatedAt";

-- =============================================
-- PROPERTIES
-- =============================================
INSERT INTO "Property" (
  title, price, address, neighbourhood, status, type, bedrooms, bathrooms, area,
  description, features, images, "agentName", "isPublished", "createdAt", "updatedAt"
) VALUES
  (
    'Penthouse at One Central',
    '$8,500,000',
    '1 Central Avenue, 52nd Floor',
    'Downtown',
    'For Sale',
    'Penthouse',
    4,
    4,
    '6,200 sq ft',
    'A trophy penthouse with panoramic skyline views, bespoke finishes and a private rooftop entertaining terrace.',
    ARRAY['Private rooftop terrace', 'Wine cellar', 'Smart home system', 'Chef''s kitchen'],
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
    '$4,200,000',
    '18 Riverside Crescent',
    'Riverside',
    'For Sale',
    'Estate',
    6,
    5,
    '7,800 sq ft',
    'A grand family estate overlooking the river with formal entertaining rooms, landscaped grounds and a heated pool.',
    ARRAY['Heated pool', 'Private garden', 'Library', 'Double garage'],
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
    '$6,800,000',
    '9 Hillside Drive',
    'Hillside',
    'For Sale',
    'Villa',
    5,
    5,
    '8,400 sq ft',
    'A dramatic contemporary villa with an infinity pool, double-height atrium and seamless indoor-outdoor living.',
    ARRAY['Infinity pool', 'Sauna', 'Underfloor heating', 'Outdoor kitchen'],
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
    '$31,000 / month',
    '280 Harbourfront Boulevard, Apt 28',
    'Harbourfront',
    'For Rent',
    'Apartment',
    3,
    2,
    '2,200 sq ft',
    'A premium waterfront apartment with concierge services, a wraparound terrace and uninterrupted harbour views.',
    ARRAY['Concierge', 'Valet parking', 'Wraparound terrace', 'Residents'' gym'],
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
    '$3,750,000',
    '42 Garden Quarter Lane',
    'Garden Quarter',
    'For Sale',
    'Villa',
    5,
    4,
    '5,100 sq ft',
    'A serene single-level villa behind private gates with landscaped gardens and a solar-heated pool.',
    ARRAY['Solar-heated pool', 'Outdoor entertaining', 'Triple garage', 'Solar panels'],
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
    'From $2,950,000',
    '77 Financial District Plaza',
    'Financial District',
    'New Development',
    'Apartment',
    3,
    3,
    '2,900 sq ft',
    'A new residential development with concierge, wellness amenities and panoramic city views.',
    ARRAY['Residents'' lounge', 'Spa', 'Private cinema', 'Smart access control'],
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
  title, slug, topic, author, subtitle, body, "pullQuote", "heroImage", "readTime",
  "isPublished", "publishedAt", "createdAt", "updatedAt"
) VALUES
  (
    'Future of Luxury Real Estate',
    'future-of-luxury-real-estate',
    'Market outlook',
    'Sarah Johnson',
    'What premium buyers now prioritise in top-tier residential markets.',
    'Luxury real estate continues to evolve as buyers place more weight on privacy, wellness and flexible living.' || E'\n\n' ||
    '## What is changing' || E'\n\n' ||
    'Today''s premium buyer is comparing service, technology and neighbourhood quality just as closely as square footage.',
    'Today''s premium buyer expects a home that supports lifestyle, wellness and long-term value.',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    '6 min read',
    true,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days'
  ),
  (
    'Building a Resilient Portfolio',
    'building-a-resilient-portfolio',
    'Investment',
    'Emily Brooks',
    'How strategic diversification helps long-term property investors.',
    'Resilient portfolios are built around strong fundamentals, liquidity planning and disciplined acquisition criteria.' || E'\n\n' ||
    '## Practical strategy' || E'\n\n' ||
    'The best investors understand both the income profile and the long-term growth story behind every acquisition.',
    'Diversification works best when every asset still fits a clear strategic thesis.',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80',
    '5 min read',
    true,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
  ),
  (
    'What Buyers Actually Want',
    'what-buyers-actually-want',
    'Buyer insight',
    'Michael Chen',
    'A practical look at the features that consistently drive interest.',
    'Buyers respond most strongly to clarity, condition and confidence in the quality of a home.' || E'\n\n' ||
    '## Standout features' || E'\n\n' ||
    'Natural light, privacy, intuitive layouts and strong presentation remain the common denominators.',
    'The homes that perform best are usually the ones that make decision-making easiest for the buyer.',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    '4 min read',
    true,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
  ),
  (
    'A Practical Guide to Off-Plan Purchases',
    'practical-guide-off-plan-purchases',
    'Guides',
    'Sarah Johnson',
    'The key risks and checks buyers should cover before they commit.',
    'Off-plan purchases can create excellent upside, but they also require disciplined due diligence.' || E'\n\n' ||
    '## Before you sign' || E'\n\n' ||
    'Developer track record, contract review and finance planning should be resolved before exchange.',
    'The strongest off-plan buyers prepare for delay, variation and finance risk before they commit.',
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
  title, slug, category, author, summary, body, "heroImage",
  "isPublished", "publishedAt", "createdAt", "updatedAt"
) VALUES
  (
    'Aurum Realty Miami Office Opens',
    'aurum-realty-miami-office',
    'Company news',
    'Aurum Realty',
    'Aurum Realty has opened a new Miami office to support cross-border buyers and sellers.',
    'The new Miami office expands Aurum Realty''s advisory coverage for international clients and strategic partnerships.' || E'\n\n' ||
    '## Why Miami' || E'\n\n' ||
    'The region continues to attract capital, relocations and premium residential demand.',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80',
    true,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'Interest Rates 2026 Outlook',
    'interest-rates-2026-outlook',
    'Market update',
    'Aurum Realty Research',
    'Rate expectations are stabilising, but buyers still need to plan for a selective financing environment.',
    'Buyers and investors are adapting to a slower path toward lower rates, with prime transactions remaining more resilient than the wider market.' || E'\n\n' ||
    '## What it means' || E'\n\n' ||
    'Preparation and lender relationships matter more than ever in a selective rate environment.',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&q=80',
    true,
    NOW() - INTERVAL '11 days',
    NOW() - INTERVAL '11 days',
    NOW() - INTERVAL '11 days'
  ),
  (
    'Aurum Realty Named Agency of the Year',
    'aurum-realty-agency-of-the-year',
    'Awards',
    'Aurum Realty',
    'The company received major industry recognition for client service and sales performance.',
    'Aurum Realty was named Agency of the Year after a strong year of growth, client results and brand expansion.' || E'\n\n' ||
    '## Recognition' || E'\n\n' ||
    'The award reflects excellence in advisory, marketing and execution across the luxury residential market.',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&q=80',
    true,
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days'
  ),
  (
    'Top Neighbourhoods to Watch in 2026',
    'top-neighbourhoods-2026',
    'Industry insight',
    'Aurum Realty Research',
    'Several emerging districts are showing the strongest mix of infrastructure, demand and value upside.',
    'Neighbourhood performance in 2026 is increasingly driven by transport access, lifestyle infrastructure and supply constraints.' || E'\n\n' ||
    '## Emerging demand' || E'\n\n' ||
    'Districts with high-quality new stock and strong amenity pipelines are attracting the most attention.',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    true,
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days'
  ),
  (
    'Record Sale Completed in Marina District',
    'record-sale-marina-district',
    'Transaction',
    'Aurum Realty',
    'Aurum Realty advised on a landmark waterfront sale in the Marina District.',
    'The transaction marks one of the strongest waterfront deals of the year and reflects continued appetite for premium inventory.' || E'\n\n' ||
    '## Market signal' || E'\n\n' ||
    'Best-in-class homes in supply-constrained micro-markets continue to command strong competition.',
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80',
    true,
    NOW() - INTERVAL '31 days',
    NOW() - INTERVAL '31 days',
    NOW() - INTERVAL '31 days'
  )
ON CONFLICT (slug) DO NOTHING;
