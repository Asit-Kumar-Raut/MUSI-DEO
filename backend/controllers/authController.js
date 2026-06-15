const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getApps } = require('firebase-admin/app');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const localDbPath = path.join(__dirname, '../local_db.json');

// Helper to read/write local JSON file
function readLocalDb() {
    if (!fs.existsSync(localDbPath)) {
        return { users: {}, otps: {} };
    }
    try {
        return JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
    } catch (err) {
        return { users: {}, otps: {} };
    }
}

function writeLocalDb(data) {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf8');
}

// Mock Firebase Collections for Local JSON Database Fallback
const mockDb = {
    collection: (colName) => {
        return {
            doc: (docId) => {
                const id = docId.toLowerCase();
                return {
                    get: async () => {
                        const data = readLocalDb();
                        const record = data[colName]?.[id];
                        return {
                            exists: !!record,
                            data: () => record
                        };
                    },
                    set: async (obj) => {
                        const data = readLocalDb();
                        if (!data[colName]) data[colName] = {};
                        data[colName][id] = obj;
                        writeLocalDb(data);
                    },
                    update: async (obj) => {
                        const data = readLocalDb();
                        if (!data[colName]) data[colName] = {};
                        data[colName][id] = { ...(data[colName][id] || {}), ...obj };
                        writeLocalDb(data);
                    },
                    delete: async () => {
                        const data = readLocalDb();
                        if (data[colName]?.[id]) {
                            delete data[colName][id];
                            writeLocalDb(data);
                        }
                    }
                };
            },
            where: (field, op, value) => {
                return {
                    get: async () => {
                        const data = readLocalDb();
                        const records = data[colName] || {};
                        const results = [];
                        for (const id in records) {
                            if (records[id] && records[id][field] === value) {
                                results.push({ id, ...records[id] });
                            }
                        }
                        return {
                            empty: results.length === 0,
                            forEach: (callback) => {
                                results.forEach(r => callback({ data: () => r }));
                            }
                        };
                    }
                };
            }
        };
    }
};

const firebaseActive = getApps().length > 0;
const db = firebaseActive ? getFirestore() : mockDb;

const FieldValue = firebaseActive 
  ? require('firebase-admin/firestore').FieldValue 
  : { delete: () => undefined };

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

let transporter;
if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
    
    transporter.verify(function (error, success) {
        if (error) {
            console.log("❌ Email Service Error (Verification Failed):", error.message);
        } else {
            console.log("✅ Email Service is ready");
        }
    });
} else {
    console.log("⚠️ Email Service Warning: EMAIL_USER and EMAIL_PASS environment variables are missing. NodeMailer email verification will be simulated in server logs.");
    transporter = {
        sendMail: async (options) => {
            console.log(`\n================ MOCK EMAIL SENT ================`);
            console.log(`To: ${options.to}`);
            console.log(`Subject: ${options.subject}`);
            const cleanText = options.html.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
            console.log(`Body: ${cleanText}`);
            console.log(`=================================================\n`);
            return true;
        },
        verify: (callback) => {
            callback(null, true);
        }
    };
}

const sendOTPEmail = async (email, otp, type = 'register') => {
    let subject, htmlContent;
    
    const spamNote = `<p style="font-size: 13px; color: #facc15; margin-top: 20px; font-weight: bold;">⚠️ If you don't see this email in your inbox, please check your SPAM or JUNK folder and mark it as "Not Spam".</p>`;

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
                ${spamNote}
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
                ${spamNote}
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
        const normalizedEmail = email.toLowerCase();
        
        const userRef = db.collection('users').doc(normalizedEmail);
        const userSnap = await userRef.get();
        if (userSnap.exists) {
            return res.status(400).json({ message: 'Email already registered and verified.' });
        }

        const usernameQuery = await db.collection('users').where('username', '==', username).get();
        if (!usernameQuery.empty) {
            return res.status(400).json({ message: 'Username already taken.' });
        }

        await db.collection('otps').doc(normalizedEmail).delete();

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await db.collection('otps').doc(normalizedEmail).set({
            username,
            email: normalizedEmail,
            passwordHash: hashedPassword,
            plainPassword: password,
            otp,
            otpExpires
        });
        
        try {
            const emailSent = await sendOTPEmail(normalizedEmail, otp, 'register');
            if (!emailSent) {
                return res.status(500).json({ message: 'Email service error. Please try again later.' });
            }
        } catch (mailErr) {
            console.error("Mail Catch Error:", mailErr);
            return res.status(500).json({ message: 'Mail server unreachable. Please try again later.' });
        }

        res.status(201).json({ message: 'Verification OTP sent. Please check your email (including spam folder).', email: normalizedEmail });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = email.toLowerCase();
        
        const pendingRef = db.collection('otps').doc(normalizedEmail);
        const pendingSnap = await pendingRef.get();
        if (!pendingSnap.exists) return res.status(400).json({ message: 'No pending registration found for this email.' });
        
        const pendingData = pendingSnap.data();
        if (pendingData.otp !== otp || pendingData.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        
        // 1. Create User in Firebase Auth (if active)
        let firebaseUser;
        if (firebaseActive) {
            try {
                firebaseUser = await admin.auth().createUser({
                    email: normalizedEmail,
                    password: pendingData.plainPassword,
                    displayName: pendingData.username
                });
            } catch (authErr) {
                console.warn("Firebase Auth User creation warning:", authErr.message);
                try {
                    firebaseUser = await admin.auth().getUserByEmail(normalizedEmail);
                } catch (getErr) {
                    return res.status(500).json({ message: 'Firebase Auth creation failed', error: authErr.message });
                }
            }
        } else {
            console.log("ℹ️ Running in Local JSON Database Fallback mode. Skipped Firebase Auth creation.");
        }
        
        // 2. Save User Profile in Database
        await db.collection('users').doc(normalizedEmail).set({
            username: pendingData.username,
            email: normalizedEmail,
            passwordHash: pendingData.passwordHash,
            isVerified: true,
            createdAt: new Date().toISOString()
        });
        
        // 3. Clean up OTP record
        await pendingRef.delete();
        
        // Send Welcome Email
        const welcomeContent = `
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; text-align: center; border-radius: 12px;">
                <h1 style="color: #22c55e; margin-bottom: 10px;">MUSI-DEO</h1>
                <h2 style="color: #e2e8f0;">Thank You for Joining Us! ${pendingData.username}</h2>
                <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 30px;">Your account has been successfully verified. Dive into the world of limitless music and videos!</p>
                <a href="${req.protocol}://${req.get('host')}/login" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login Now</a>
            </div>
        `;
        try {
            await transporter.sendMail({
                from: `"MUSI-DEO" <${process.env.EMAIL_USER}>`,
                to: normalizedEmail,
                subject: 'Welcome to MUSI-DEO!',
                html: welcomeContent
            });
        } catch (welcomeErr) {
            console.error("Welcome email failed to send:", welcomeErr.message);
        }

        res.status(200).json({ message: 'Account verified successfully. You can now login.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        
        const userRef = db.collection('users').doc(normalizedEmail);
        const userSnap = await userRef.get();
        if (!userSnap.exists) return res.status(400).json({ message: 'Invalid credentials' });
        
        const user = userSnap.data();
        if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });
        
        if (user.passwordHash) {
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ userId: normalizedEmail }, process.env.JWT_SECRET || 'musideo_secret_key', { expiresIn: '7d' });
        
        res.status(200).json({ token, user: { id: normalizedEmail, username: user.username, email: user.email } });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.toLowerCase();
        
        const userRef = db.collection('users').doc(normalizedEmail);
        const userSnap = await userRef.get();
        if (!userSnap.exists) return res.status(404).json({ message: 'User not found' });
        
        const otp = generateOTP();
        await userRef.update({
            otp,
            otpExpires: Date.now() + 10 * 60 * 1000
        });
        
        const emailSent = await sendOTPEmail(normalizedEmail, otp, 'reset');
        if (!emailSent) return res.status(500).json({ message: 'Failed to send reset OTP' });
        
        res.status(200).json({ message: 'Password reset OTP sent to your email' });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const normalizedEmail = email.toLowerCase();
        
        const userRef = db.collection('users').doc(normalizedEmail);
        const userSnap = await userRef.get();
        if (!userSnap.exists) return res.status(404).json({ message: 'User not found' });
        
        const user = userSnap.data();
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // 1. Reset in Firebase Auth (if active)
        if (firebaseActive) {
            try {
                const firebaseUser = await admin.auth().getUserByEmail(normalizedEmail);
                await admin.auth().updateUser(firebaseUser.uid, {
                    password: newPassword
                });
            } catch (authErr) {
                console.warn("Firebase Auth password update warning:", authErr.message);
            }
        }
        
        // 2. Reset in database user record
        await userRef.update({
            passwordHash: hashedPassword,
            otp: FieldValue.delete(),
            otpExpires: FieldValue.delete()
        });
        
        res.status(200).json({ message: 'Password reset successfully' });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.contact = async (req, res) => {
    try {
        const { name, email, message, feedbackType } = req.body;
        
        const mailOptions = {
            from: `"MUSI-DEO Support" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `Contact/Feedback: ${feedbackType || 'General'} from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 10px;">
                    <h2 style="color: #22c55e;">New Feedback Received</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Type:</strong> ${feedbackType || 'General'}</p>
                    <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin-top: 20px;">
                        <p style="color: #cbd5e1;">${message}</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Message sent successfully. Thank you for your feedback!' });
        
    } catch (error) {
        console.error("Contact Email Error:", error);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
};
