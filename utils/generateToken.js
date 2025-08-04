import jwt from "jsonwebtoken";

const generateToken = (res, user, message) => {
  console.log("Generating token for user:", user);
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000,
  }); // 1 day expiration
  res.status(200).json({
    message,
    user: { id: user._id, email: user.email, role: user.role, token },
  });
};

export default generateToken;
