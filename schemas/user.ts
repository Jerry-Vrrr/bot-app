// schemas/User.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: {
    type: String,
    unique: [true, "Email already exists!"],
    required: [true, "Email is required!"],
  },
  username: {
    type: String,
    required: [true, "username is required!"],
  },
  companyName: {
    type: String,
    required: [true, "Company name is required!"],
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
  },
  verificationStatus:  {
    type: Boolean,
    default: false
  }
});

const User = models.User || model("User", UserSchema);
export default User;
