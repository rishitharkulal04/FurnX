-- Update product images to match categories based on product names
-- This ensures all furniture products have relevant furniture images

UPDATE products SET image_url =
CASE
  -- Sofas - living room seating
  WHEN name ILIKE '%sofa%' OR name ILIKE '%couch%' OR name ILIKE '%sectional%'
    THEN 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop'
  
  -- Chairs - individual seating
  WHEN name ILIKE '%chair%' OR name ILIKE '%armchair%' OR name ILIKE '%accent%'
    THEN 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=600&fit=crop'
  
  -- Tables - dining and coffee tables
  WHEN name ILIKE '%table%' OR name ILIKE '%dining%' OR name ILIKE '%desk%'
    THEN 'https://images.unsplash.com/photo-1616627454075-4e6f2c4cfd43?w=600&h=600&fit=crop'
  
  -- Beds - bedroom furniture
  WHEN name ILIKE '%bed%' OR name ILIKE '%bedroom%' OR name ILIKE '%mattress%'
    THEN 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop'
  
  -- Storage - wardrobes, dressers, storage units
  WHEN name ILIKE '%wardrobe%' OR name ILIKE '%dresser%' OR name ILIKE '%cabinet%' OR name ILIKE '%storage%'
    THEN 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=600&fit=crop'
  
  -- Shelving - bookcases and shelves
  WHEN name ILIKE '%bookshelf%' OR name ILIKE '%shelf%' OR name ILIKE '%shelving%'
    THEN 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&h=600&fit=crop'
  
  -- Decor and other furniture
  WHEN name ILIKE '%lamp%' OR name ILIKE '%lighting%'
    THEN 'https://images.unsplash.com/photo-1565636192335-14f0aeb7bebc?w=600&h=600&fit=crop'
  
  -- Outdoor/Garden
  WHEN name ILIKE '%outdoor%' OR name ILIKE '%garden%' OR name ILIKE '%patio%'
    THEN 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=600&fit=crop'
  
  -- Default fallback for unmapped items
  ELSE 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop'
END
WHERE image_url IS NULL OR image_url = '' OR image_url LIKE '%people%' OR image_url LIKE '%person%';
