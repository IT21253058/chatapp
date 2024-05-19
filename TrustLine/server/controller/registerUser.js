const UserModel = require("../models/UserModel");
const bcryptjs = require("bcryptjs");

async function registerUser(request, response) {
  try {
    const { name, email, password, profile_pic } = request.body;

    // if user exists
    const checkEmail = await UserModel.findOne({ email });

    if (checkEmail) {
      return response.status(400).json({
        message: "User already exists",
        error: true,
      });
    }

    // validate pw
    const errors = [];
    if (password.length < 8) {
      errors.push("at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("at least 1 uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("at least 1 lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("at least 1 number");
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push("at least 1 special character (@$!%*?&)");
    }

    if (errors.length > 0) {
      return response.status(400).json({
        message: `Password must be ${errors.join(", ")}`,
        error: true,
      });
    }

    // hash password
    const salt = await bcryptjs.genSalt(10);
    const hashpassword = await bcryptjs.hash(password, salt);

    const payload = {
      name,
      email,
      profile_pic,
      password: hashpassword,
    };

    const user = new UserModel(payload);
    const userSave = await user.save();

    return response.status(201).json({
      message: "User created successfully",
      data: userSave,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

module.exports = registerUser;
