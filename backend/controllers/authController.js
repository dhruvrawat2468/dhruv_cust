import bcrypt from "bcrypt"
import User from'../models/user.js';

exports.signup = async (req, res) => {
  const { name, email, password, age, gender,address } = req.body;

  try {
    if (!name || !email || !password || !age || !gender || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      address
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
