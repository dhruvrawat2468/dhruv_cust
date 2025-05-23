import mongoose from "mongoose"

const connectDB = async () => {
  const username=process.env.USER_NAME;
  const password=process.env.password;

 
  const link=`mongodb+srv://${username}:${password}@cluster0.5bjic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  
  try {
    await mongoose.connect('mongodb+srv://abcd:abcd@cluster0.yny37.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }); 
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;