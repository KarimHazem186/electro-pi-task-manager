import dotenv from 'dotenv';
import { cloudinary, verifyCloudinaryConfig } from '../config/cloudinary.js';

// Load environment variables
dotenv.config();

const testCloudinaryConnection = async () => {
  console.log('\n🧪 Testing Cloudinary Configuration...\n');

  // Step 1: Verify configuration
  console.log('Step 1: Verifying configuration...');
  const isConfigured = verifyCloudinaryConfig();
  
  if (!isConfigured) {
    console.error('\n❌ Cloudinary configuration is incomplete!');
    console.log('\nPlease add these to your .env file:');
    console.log('CLOUDINARY_CLOUD_NAME=your-cloud-name');
    console.log('CLOUDINARY_API_KEY=your-api-key');
    console.log('CLOUDINARY_API_SECRET=your-api-secret');
    process.exit(1);
  }

  // Step 2: Test API connection
  console.log('\nStep 2: Testing API connection...');
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Successfully connected to Cloudinary!');
    console.log(`   Status: ${result.status}`);
  } catch (error) {
    console.error('❌ Failed to connect to Cloudinary');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Get account info
  console.log('\nStep 3: Fetching account information...');
  try {
    const usage = await cloudinary.api.usage();
    console.log('✅ Account information retrieved:');
    console.log(`   Cloud Name: ${cloudinary.config().cloud_name}`);
    console.log(`   Plan: ${usage.plan || 'Free'}`);
    console.log(`   Credits Used: ${usage.credits?.usage || 0}`);
    console.log(`   Storage: ${(usage.storage?.used_gb || 0).toFixed(2)} GB`);
    console.log(`   Bandwidth: ${(usage.bandwidth?.used_gb || 0).toFixed(2)} GB`);
  } catch (error) {
    console.error('❌ Failed to fetch account info');
    console.error(`   Error: ${error.message}`);
  }

  // Step 4: List folders
  console.log('\nStep 4: Listing folders...');
  try {
    const folders = await cloudinary.api.root_folders();
    console.log('✅ Folders in your Cloudinary account:');
    if (folders.folders.length === 0) {
      console.log('   No folders yet (they will be created on first upload)');
    } else {
      folders.folders.forEach((folder) => {
        console.log(`   - ${folder.name}`);
      });
    }
  } catch (error) {
    console.error('⚠️  Could not list folders');
    console.error(`   Error: ${error.message}`);
  }

  console.log('\n✅ All tests completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Start your server: npm run dev');
  console.log('   2. Test the upload endpoints with Postman');
  console.log('   3. Check CLOUDINARY_SETUP_GUIDE.md for API documentation');
  console.log('\n');
};

// Run the test
testCloudinaryConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
