#!/usr/bin/env node

/**
 * Database Connection Test Script
 *
 * This script tests the database connection with your current configuration
 * and provides helpful debugging information.
 *
 * Usage:
 *   node scripts/test-db.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing Database Connection...');
  console.log('=====================================');

  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    database: process.env.DB_DATABASE || 'food_delivery'
  };

  // Only add password if it's provided and not empty
  if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
    config.password = process.env.DB_PASSWORD;
    console.log(`📡 Connecting with password: ${config.user}@${config.host}:${config.port}/${config.database}`);
  } else {
    console.log(`📡 Connecting without password: ${config.user}@${config.host}:${config.port}/${config.database}`);
  }

  try {
    console.log('\n🔗 Attempting connection...');
    const connection = await mysql.createConnection(config);

    console.log('✅ Connection successful!');

    // Test database existence
    try {
      const [rows] = await connection.execute(`SELECT DATABASE() as current_db`);
      console.log(`✅ Connected to database: ${rows[0].current_db}`);
    } catch (error) {
      console.log(`⚠️ Database '${config.database}' might not exist`);
      console.log('💡 Try creating it with: CREATE DATABASE food_delivery;');
    }

    // Test a simple query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful');

    await connection.end();

    console.log('\n🎉 Database connection is working correctly!');
    console.log('You can now run: npm run migrate');

  } catch (error) {
    console.log('\n❌ Connection failed:');
    console.log(`Error: ${error.message}`);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Possible solutions:');

      if (process.env.DB_PASSWORD) {
        console.log('1. Check if your password is correct');
        console.log('2. Try connecting manually: mysql -u root -p');
      } else {
        console.log('1. Set up passwordless root access:');
        console.log('   mysql -u root -p');
        console.log('   ALTER USER \'root\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'\';');
        console.log('   FLUSH PRIVILEGES;');
        console.log('');
        console.log('2. Or set a password in .env:');
        console.log('   DB_PASSWORD=your_password_here');
      }

      console.log('3. Make sure MySQL is running');
      console.log('4. Check if user exists and has proper permissions');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 MySQL server is not running');
      console.log('Start it with:');
      console.log('- macOS: brew services start mysql');
      console.log('- Linux: sudo systemctl start mysql');
      console.log('- Windows: net start mysql');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n🔧 Database does not exist');
      console.log('Create it with:');
      console.log(`mysql -u ${config.user} ${config.password ? '-p' : ''} -e "CREATE DATABASE ${config.database};"`);
    }

    process.exit(1);
  }
}

// Show current configuration
console.log('📋 Current Configuration:');
console.log(`Host: ${process.env.DB_HOST || '127.0.0.1'}`);
console.log(`Port: ${process.env.DB_PORT || 3306}`);
console.log(`Username: ${process.env.DB_USERNAME || 'root'}`);
console.log(`Password: ${process.env.DB_PASSWORD ? '[SET]' : '[EMPTY]'}`);
console.log(`Database: ${process.env.DB_DATABASE || 'food_delivery'}`);
console.log('');

testConnection().catch(error => {
  console.error('💥 Script error:', error.message);
  process.exit(1);
});