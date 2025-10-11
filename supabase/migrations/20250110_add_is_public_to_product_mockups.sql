-- Add is_public column to product_mockups table
ALTER TABLE product_mockups 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_product_mockups_is_public 
ON product_mockups(is_public);

-- Add comment for documentation
COMMENT ON COLUMN product_mockups.is_public IS 'Indicates if the product mockup is publicly visible';
