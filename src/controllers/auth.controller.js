import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { signToken } from "../utils/jwt.js";
import crypto from "crypto";
/**
 * TODO: Register a new user
 *
 * 1. Extract name, email, password from req.body
 * 2. Check if user with email already exists
 *    - If yes: return 409 with { error: { message: "Email already exists" } }
 * 3. Create new user (password will be hashed by pre-save hook)
 * 4. Return 201 with { user } (password excluded by default)
 */
export async function register(req, res, next) {
  try {
    // Your code here
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ error: { message: "Email Already Exists" } });
    }
    const user = await User.create({ name, email, password, role });
    const userObj = user.toObject();
    delete userObj.password;

    return res
      .status(201)
      .json({ message: "User Created Successfully", user: userObj });
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Login user
 *
 * 1. Extract email, password from req.body
 * 2. Find user by email (use .select('+password') to include password field)
 * 3. If no user found: return 401 with { error: { message: "Invalid credentials" } }
 * 4. Compare password using bcrypt.compare(password, user.password)
 * 5. If password wrong: return 401 with { error: { message: "Invalid credentials" } }
 * 6. Generate JWT token with payload: { userId: user._id, email: user.email, role: user.role }
 * 7. Return 200 with { token, user } (exclude password from user object)
 */

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function login(req, res, next) {
  try {
    // Your code here
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ error: { message: "/invalid.*credentials/i" } });
    }
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: { message: "/invalid.*credentials/i" } });
    }
    const signInToken = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    user.refreshToken = hashToken(signInToken);
    await user.save({ validateBeforeSave: false });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;
    res.cookie("jwtToken", signInToken, {
      httpOnly: true,
      secure: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(200)
      .json({
        message: "User Login Successfully",
        user: userObj,
        token: signInToken,
      });
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Get current user
 *
 * 1. req.user is already set by auth middleware
 * 2. Return 200 with { user: req.user }
 */
export async function me(req, res, next) {
  try {
    // Your code here
    if (req.user) {
      const user = await User.findById(req.user.id);
      return res.status(200).json({ user: req.user });
    }
  } catch (error) {
    next(error);
  }
}
