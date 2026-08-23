-- brand.spot — demo catalogue
--
-- Run in the Supabase SQL editor to fill the storefront with something to
-- click through. Safe to re-run: everything keys off slugs and upserts.
-- Images are hot-linked from Unsplash, so nothing lands in your storage
-- bucket — replace them with real uploads through the admin.
--
-- To undo, see the block at the very bottom.

-- ── brands ──────────────────────────────────────────────────────────────
insert into public.brands (slug, name, name_ar, note_en, note_ar, sort_order, active) values
  ('zara',  'ZARA',   'زارا',        'Women · Men · Kids', 'نساء · رجال · أطفال', 1, true),
  ('hm',    'H&M',    'إتش آند إم',  'Women · Men · Kids', 'نساء · رجال · أطفال', 2, true),
  ('gap',   'GAP',    'غاب',         'Basics · Kids',      'أساسيات · أطفال',     3, true),
  ('next',  'NEXT',   'نكست',        'Classic · Kids',     'كلاسيك · أطفال',      4, true),
  ('levis', 'LEVI''S','ليفايس',      'Denim',              'دينم',                5, true),
  ('mango', 'MANGO',  'مانغو',       'Women',              'نساء',                6, true)
on conflict (slug) do update
  set name = excluded.name, name_ar = excluded.name_ar,
      note_en = excluded.note_en, note_ar = excluded.note_ar,
      sort_order = excluded.sort_order, active = true;

-- ── categories ──────────────────────────────────────────────────────────
insert into public.categories (slug, name_en, name_ar, dept, sort_order, active) values
  ('women-dresses', 'Dresses',  'فساتين',      'women', 1, true),
  ('women-tops',    'Tops',     'قطع علوية',   'women', 2, true),
  ('women-denim',   'Denim',    'دينم',        'women', 3, true),
  ('women-outer',   'Outerwear','معاطف',       'women', 4, true),
  ('men-shirts',    'Shirts',   'قمصان',       'men',   5, true),
  ('men-tees',      'T-shirts', 'تي شيرت',     'men',   6, true),
  ('men-trousers',  'Trousers', 'بناطيل',      'men',   7, true),
  ('kids-sets',     'Sets',     'أطقم',        'kids',  8, true),
  ('kids-tops',     'Tops',     'قطع علوية',   'kids',  9, true)
on conflict (slug) do update
  set name_en = excluded.name_en, name_ar = excluded.name_ar,
      dept = excluded.dept, sort_order = excluded.sort_order, active = true;

-- ── products ────────────────────────────────────────────────────────────
insert into public.products
  (slug, name_en, name_ar, description_en, description_ar, brand_id, category_id, dept, price, was_price, stock, active)
values
  ('long-sleeve-dress', 'Long-sleeve Dress', 'فستان بأكمام طويلة',
   'A soft midi in a relaxed cut, easy over boots or trainers.', 'فستان ميدي بقصّة مريحة يناسب كل يوم.',
   (select id from public.brands where slug='zara'), (select id from public.categories where slug='women-dresses'),
   'women', 24.90, 32.00, 12, true),

  ('ruffle-blouse', 'Ruffle Blouse', 'بلوزة كشكش',
   'Light woven blouse with a gathered shoulder.', 'بلوزة خفيفة بكتف مكشكش.',
   (select id from public.brands where slug='mango'), (select id from public.categories where slug='women-tops'),
   'women', 19.50, null, 20, true),

  ('high-rise-jeans', 'High-rise Jeans', 'جينز عالي الخصر',
   'Rigid denim with a straight leg and a high waist.', 'دينم بقصّة مستقيمة وخصر عالٍ.',
   (select id from public.brands where slug='levis'), (select id from public.categories where slug='women-denim'),
   'women', 39.00, null, 8, true),

  ('lightweight-coat', 'Lightweight Coat', 'معطف خفيف',
   'A between-seasons coat that folds into a bag.', 'معطف لما بين الفصول، خفيف وسهل الحمل.',
   (select id from public.brands where slug='next'), (select id from public.categories where slug='women-outer'),
   'women', 33.50, 45.00, 5, true),

  ('cotton-tee', 'Cotton Tee', 'تي شيرت قطن',
   'Heavyweight cotton, holds its shape after washing.', 'قطن سميك يحافظ على شكله بعد الغسيل.',
   (select id from public.brands where slug='hm'), (select id from public.categories where slug='men-tees'),
   'men', 9.90, null, 40, true),

  ('oxford-shirt', 'Oxford Shirt', 'قميص أوكسفورد',
   'Button-down collar, works under a jumper.', 'ياقة بأزرار، يناسب تحت الكنزة.',
   (select id from public.brands where slug='next'), (select id from public.categories where slug='men-shirts'),
   'men', 21.00, null, 16, true),

  ('denim-trousers', 'Denim Trousers', 'بنطال دينم',
   'Mid-weight denim with a tapered leg.', 'دينم متوسط السماكة بقصّة ضيّقة تدريجياً.',
   (select id from public.brands where slug='hm'), (select id from public.categories where slug='men-trousers'),
   'men', 27.00, 34.00, 10, true),

  ('boys-set', 'Boys Set', 'طقم أولاد',
   'Two pieces that already match, so mornings are quicker.', 'قطعتان منسّقتان، لتسهيل الصباح.',
   (select id from public.brands where slug='gap'), (select id from public.categories where slug='kids-sets'),
   'kids', 17.50, 22.00, 14, true),

  ('girls-blouse', 'Girls Blouse', 'بلوزة بنات',
   'Soft cotton with a small collar.', 'قطن ناعم بياقة صغيرة.',
   (select id from public.brands where slug='zara'), (select id from public.categories where slug='kids-tops'),
   'kids', 14.50, null, 18, true)
on conflict (slug) do update
  set name_en = excluded.name_en, name_ar = excluded.name_ar,
      description_en = excluded.description_en, description_ar = excluded.description_ar,
      brand_id = excluded.brand_id, category_id = excluded.category_id, dept = excluded.dept,
      price = excluded.price, was_price = excluded.was_price, stock = excluded.stock, active = true;

-- ── product images ──────────────────────────────────────────────────────
-- Rewritten each run so re-seeding never piles up duplicates.
delete from public.product_images
where product_id in (select id from public.products where slug in (
  'long-sleeve-dress','ruffle-blouse','high-rise-jeans','lightweight-coat',
  'cotton-tee','oxford-shirt','denim-trousers','boys-set','girls-blouse'));

insert into public.product_images (product_id, url, sort_order)
select p.id, i.url, i.sort_order
from (values
  ('long-sleeve-dress', 'https://images.unsplash.com/photo-1560506840-ec148e82a604?q=80&w=900&auto=format&fit=crop', 0),
  ('ruffle-blouse',     'https://images.unsplash.com/photo-1622218286192-95f6a20083c7?q=80&w=900&auto=format&fit=crop', 0),
  ('high-rise-jeans',   'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=900&auto=format&fit=crop', 0),
  ('high-rise-jeans',   'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?q=80&w=900&auto=format&fit=crop', 1),
  ('lightweight-coat',  'https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?q=80&w=900&auto=format&fit=crop', 0),
  ('cotton-tee',        'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=900&auto=format&fit=crop', 0),
  ('oxford-shirt',      'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=900&auto=format&fit=crop', 0),
  ('denim-trousers',    'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=900&auto=format&fit=crop', 0),
  ('boys-set',          'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=900&auto=format&fit=crop', 0),
  ('girls-blouse',      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=900&auto=format&fit=crop', 0)
) as i(slug, url, sort_order)
join public.products p on p.slug = i.slug;

-- ── sizes ───────────────────────────────────────────────────────────────
delete from public.product_variants
where product_id in (select id from public.products where dept in ('women','men','kids'));

insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, 5, s.ord
from public.products p
cross join lateral (
  select * from (values ('S',1),('M',2),('L',3),('XL',4)) as v(size, ord)
  where p.dept in ('women','men')
  union all
  select * from (values ('2-3Y',1),('4-5Y',2),('6-7Y',3)) as v(size, ord)
  where p.dept = 'kids'
) s;

-- ── looks ───────────────────────────────────────────────────────────────
insert into public.looks (slug, title_en, title_ar, image_url, sort_order, active) values
  ('daytime', 'Daytime Look', 'إطلالة نهارية',
   'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=1400&auto=format&fit=crop', 1, true),
  ('casual',  'Casual Look',  'إطلالة كاجوال',
   'https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=1400&auto=format&fit=crop', 2, true)
on conflict (slug) do update
  set title_en = excluded.title_en, title_ar = excluded.title_ar,
      image_url = excluded.image_url, sort_order = excluded.sort_order, active = true;

delete from public.look_items
where look_id in (select id from public.looks where slug in ('daytime','casual'));

-- x/y are percentages from the inline start, the same values the admin's
-- click-to-place editor writes.
insert into public.look_items (look_id, product_id, x, y, sort_order)
select l.id, p.id, v.x, v.y, v.ord
from (values
  ('daytime', 'ruffle-blouse',    52.0, 30.0, 0),
  ('daytime', 'high-rise-jeans',  46.0, 62.0, 1),
  ('daytime', 'lightweight-coat', 62.0, 46.0, 2),
  ('casual',  'cotton-tee',       50.0, 34.0, 0),
  ('casual',  'denim-trousers',   48.0, 58.0, 1),
  ('casual',  'oxford-shirt',     44.0, 80.0, 2)
) as v(look_slug, product_slug, x, y, ord)
join public.looks    l on l.slug = v.look_slug
join public.products p on p.slug = v.product_slug;

-- ── a sample order, so /admin/orders is not empty ───────────────────────
insert into public.orders (customer_name, phone, city, address, notes, subtotal, delivery_fee, total, status)
select 'Sample Customer', '0791234567', 'Amman', 'Abdoun, building 12, flat 3',
       'Please call before delivery.', 48.90, 2.00, 50.90, 'new'
where not exists (select 1 from public.orders where customer_name = 'Sample Customer');

insert into public.order_items (order_id, product_id, product_name, brand_name, size, unit_price, quantity, image_url)
select o.id, p.id, p.name_en, b.name, 'M', p.price, 1,
       (select url from public.product_images pi where pi.product_id = p.id order by sort_order limit 1)
from public.orders o
join public.products p on p.slug in ('long-sleeve-dress','cotton-tee')
left join public.brands b on b.id = p.brand_id
where o.customer_name = 'Sample Customer'
  and not exists (select 1 from public.order_items oi where oi.order_id = o.id);

-- ── undo ────────────────────────────────────────────────────────────────
-- Removes everything above and nothing else. Uncomment and run.
--
-- delete from public.orders  where customer_name = 'Sample Customer';
-- delete from public.looks   where slug in ('daytime','casual');
-- delete from public.products where slug in (
--   'long-sleeve-dress','ruffle-blouse','high-rise-jeans','lightweight-coat',
--   'cotton-tee','oxford-shirt','denim-trousers','boys-set','girls-blouse');
-- delete from public.categories where slug like 'women-%' or slug like 'men-%' or slug like 'kids-%';
-- delete from public.brands where slug in ('zara','hm','gap','next','levis','mango');
