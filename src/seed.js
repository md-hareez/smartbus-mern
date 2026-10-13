import 'dotenv/config';
import mongoose from 'mongoose';
import Bus from './models/Bus.js';

const sampleBuses = [
  { busNumber: 'S101', routeName: 'Central to Tech Park', startPoint: 'Central Bus Stand', endPoint: 'Tech Park', stops: ['Central Bus Stand', 'Market Road', 'College Junction', 'Tech Park'] },
  { busNumber: 'S204', routeName: 'Railway Station to University', startPoint: 'Railway Station', endPoint: 'University', stops: ['Railway Station', 'New Bus Stand', 'Hospital Stop', 'University'] },
  { busNumber: 'S315', routeName: 'Lake Road to Industrial Estate', startPoint: 'Lake Road', endPoint: 'Industrial Estate', stops: ['Lake Road', 'Library', 'Main Junction', 'Industrial Estate'] },
  { busNumber: 'S408', routeName: 'Old Town to City Hospital', startPoint: 'Old Town', endPoint: 'City Hospital', stops: ['Old Town', 'Clock Tower', 'Market Road', 'City Hospital'] },
  { busNumber: 'S512', routeName: 'College Junction to Airport Road', startPoint: 'College Junction', endPoint: 'Airport Road', stops: ['College Junction', 'Sports Complex', 'Metro Link', 'Airport Road'] }
];

try {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const bus of sampleBuses) {
    await Bus.updateOne({ busNumber: bus.busNumber }, { $set: bus }, { upsert: true });
  }
  console.log(`Seeded ${sampleBuses.length} sample buses.`);
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
