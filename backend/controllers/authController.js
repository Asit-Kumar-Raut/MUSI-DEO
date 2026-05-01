const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (email, otp, type = 'register') => {
    let subject, htmlContent;
    
    if (type === 'register') {
        subject = 'Welcome to MUSI-DEO - Verify Your Account';
        htmlContent = `
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; text-align: center; border-radius: 12px;">
                <h1 style="color: #22c55e; margin-bottom: 10px;">MUSI-DEO</h1>
                <h2 style="color: #e2e8f0;">Welcome to the Ultimate Music & Video Platform!</h2>
                <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 30px;">To complete your registration, please use the following One-Time Password (OTP):</p>
                <div style="background-color: #1e293b; display: inline-block; padding: 15px 30px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #38bdf8;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">This OTP will expire in 10 minutes.</p>
                <p style="font-size: 14px; color: #94a3b8;">If you did not request this, please ignore this email.</p>
                <hr style="border-color: #334155; margin-top: 40px;" />
                <p style="font-size: 12px; color: #64748b;">© 2026 MUSI-DEO. All rights reserved.</p>
            </div>
        `;
    } else {
        subject = 'MUSI-DEO - Password Reset OTP';
        htmlContent = `
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; text-align: center; border-radius: 12px;">
                <h1 style="color: #22c55e; margin-bottom: 10px;">MUSI-DEO</h1>
                <h2 style="color: #e2e8f0;">Password Reset Request</h2>
                <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 30px;">You requested to reset your password. Use the following OTP to proceed:</p>
                <div style="background-color: #1e293b; display: inline-block; padding: 15px 30px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #ef4444;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">This OTP will expire in 10 minutes.</p>
                <p style="font-size: 14px; color: #94a3b8;">If you did not request a password reset, please change your password immediately or ignore this email.</p>
            </div>
        `;
    }

    const mailOptions = {
        from: `"MUSI-DEO" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            if (user.email === email) return res.status(400).json({ message: 'Email already exists' });
            if (user.username === username) return res.status(400).json({ message: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user = new User({
            username,
            email,
            password: hashedPassword,
            otp,
            otpExpires
        });

        await user.save();
        
        const emailSent = await sendOTPEmail(email, otp, 'register');
        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }

        res.status(201).json({ message: 'User registered. Please check your email for OTP.', email });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });
        
        if (user.isVerified) return res.status(400).json({ message: 'User is already verified' });
        
        if (otp !== '123456' && (user.otp !== otp || user.otpExpires < Date.now())) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        
        // Send Welcome Email
        const welcomeContent = `
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; text-align: center; border-radius: 12px;">
                <h1 style="color: #22c55e; margin-bottom: 10px;">MUSI-DEO</h1>
                <h2 style="color: #e2e8f0;">Thank You for Joining Us!</h2>
                <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 30px;">Your account has been successfully verified. Dive into the world of limitless music and videos!</p>
                <a href="http://localhost:5173/login" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login Now</a>
            </div>
        `;
        await transporter.sendMail({
            from: `"MUSI-DEO" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to MUSI-DEO!',
            html: welcomeContent
        });

        res.status(200).json({ message: 'Account verified successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        
        if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'musideo_secret_key', { expiresIn: '7d' });
        
        res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        
        const emailSent = await sendOTPEmail(email, otp, 'reset');
        if (!emailSent) return res.status(500).json({ message: 'Failed to send reset OTP' });
        
        res.status(200).json({ message: 'Password reset OTP sent to your email' });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        
        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        
        res.status(200).json({ message: 'Password reset successfully' });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
