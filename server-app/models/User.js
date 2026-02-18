import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema= new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        unique: true,
        trim: true,
        minLength: [3, 'Username must be at least 3 character long']
    },
    email: {
        type: String,
        required: [true, "Please enter email"],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minLength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    profileImage: {
        type: String,
        default: null
    }
}, {timestamps: true});

//Hash password before saving (Mongoose 6+ async hooks: no next; return/await is enough)
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User= mongoose.model("User", userSchema);
export default User;    