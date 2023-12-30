import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const register = async (req, res) => {
  try {
    const { firstname, lastname, email, phoneNumber, password, eduyear } =
      req.body;

    const userExists = await User.findOne({ phoneNumber: phoneNumber });

    if (userExists) {
      res.status(409).json("user already exists");
    }

    if (!firstname || !lastname || !phoneNumber || !email || !eduyear) {
      return res.status(404).json("Some data is missing");
    }

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      phoneNumber,
      password,
      eduyear,
    });

    await generateToken(res, newUser._id);

    res.status(200).json({
      _id: newUser._id,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      eduyear: newUser.eduyear,
    });
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("Please Provide The Email And the Password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(400).json("Incorrect Username or Password");
  }

  user.password = undefined;

  const { accessToken } = await generateToken(res, user._id);

  return res.status(200).json({ user, accessToken });
};

const logout = async (req, res) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(201).json("User Logged Out");
};

export { register, login, logout };
