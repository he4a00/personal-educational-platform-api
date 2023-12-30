import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "user must have a first name"],
    },
    lastname: {
      type: String,
      required: [true, "user must have a last name"],
    },
    email: {
      type: String,
      required: [true, "user must have an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "account must have a passowrd"],
      minLength: 8,
      select: false,
    },

    eduyear: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: function (value) {
          return /^01[0-2]{1}[0-9]{8}$/.test(value);
        },
        message: "Please provide a valid Egyptian phone number",
      },
    },

    type: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

export default User;
