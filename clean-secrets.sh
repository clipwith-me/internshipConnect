#!/bin/bash
# Script to remove all sensitive keys from documentation files

files=(
  "READY_TO_LAUNCH.md"
  "SCALABILITY_IMPLEMENTATION_GUIDE.md"
  "RENDER_DEPLOYMENT_FIXES.md"
  "PRE_DEPLOYMENT_STATUS.md"
  "DEPLOY_CHECKLIST.txt"
  "API_KEYS_STATUS.md"
  "ENV_QUICK_REFERENCE.md"
  "DEPLOYMENT_GUIDE.md"
  "PRODUCTION_FIXES_APPLIED.md"
  "PRICING_PLANS_COMPLETE.md"
  "FINAL_FIX_REPORT.md"
  "DEPLOYMENT_CHECKLIST.md"
  "SYSTEM_AUDIT_COMPLETE.md"
  "SECURITY.md"
  "DEPLOYMENT.md"
  "CLAUDE.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Cleaning $file..."
    # Replace Stripe test API key with placeholder
    sed -i 's/sk_test_[a-zA-Z0-9]*/sk_test_your_stripe_secret_key/g' "$file"
    # Replace SMTP password with placeholder
    sed -i 's/[a-z]{4} [a-z]{4} [a-z]{4} [a-z]{4}/your-app-password/g' "$file"
    # Replace Cloudinary credentials with placeholders (using regex patterns)
    sed -i 's/CLOUDINARY_CLOUD_NAME=[a-z]*/CLOUDINARY_CLOUD_NAME=your_cloud_name/g' "$file"
    sed -i 's/CLOUDINARY_API_KEY=[0-9]*/CLOUDINARY_API_KEY=your_api_key/g' "$file"
    sed -i 's/CLOUDINARY_API_SECRET=[a-zA-Z0-9_-]*/CLOUDINARY_API_SECRET=your_api_secret/g' "$file"
    # Replace email address with placeholder
    sed -i 's/internshipconnects@gmail\.com/your-email@gmail.com/g' "$file"
  fi
done

echo "Done! All sensitive keys removed from documentation files."
