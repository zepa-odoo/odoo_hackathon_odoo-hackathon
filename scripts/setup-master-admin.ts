import dbConnect from '../lib/mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';

async function setupMasterAdmin() {
  try {
    await dbConnect();
    
    // Check if master admin already exists
    const existingMaster = await User.findOne({ email: 'mohilp03437@gmail.com' });
    
    if (existingMaster) {
      console.log('Master admin already exists. Updating role to master...');
      existingMaster.role = 'master';
      await existingMaster.save();
      console.log('Master admin role updated successfully!');
      return;
    }
    
    // Create master admin account
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Parth@007', salt);
    
    const masterAdmin = new User({
      username: 'master_admin',
      email: 'mohilp03437@gmail.com',
      password: hashedPassword,
      role: 'master',
      reputation: 1000,
      bio: 'Master Administrator of StackIt',
    });
    
    await masterAdmin.save();
    console.log('Master admin account created successfully!');
    console.log('Email: mohilp03437@gmail.com');
    console.log('Password: Parth@007');
    
  } catch (error) {
    console.error('Error setting up master admin:', error);
  } finally {
    process.exit(0);
  }
}

setupMasterAdmin(); 