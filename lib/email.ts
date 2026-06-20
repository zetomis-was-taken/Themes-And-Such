import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTP(email: string, otp: string) {
  const mailOptions = {
    from: `"Portal Helper" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Mã xác thực đăng ký Portal Helper",
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #d97706 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Portal Helper</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Xác thực tài khoản của bạn</p>
      </div>
      <div style="padding: 40px 30px;">
        <p style="font-size: 16px; color: #1f2937; margin-top: 0;"><strong>Chào bạn,</strong></p>
        <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
          Chúng tôi nhận được yêu cầu lấy mã xác thực để tiếp tục quá trình đăng ký tài khoản trên hệ thống <strong>Portal Helper</strong>. Vui lòng nhập mã OTP dưới đây để hoàn tất:
        </p>
        
        <div style="margin: 35px 0; padding: 4px; background: linear-gradient(135deg, #0d9488, #d97706); border-radius: 12px;">
          <div style="background-color: #ffffff; padding: 25px 15px; border-radius: 8px; text-align: center;">
            <span style="font-size: 36px; font-weight: 900; color: #0d9488; letter-spacing: 8px;">${otp.trim()}</span>
          </div>
        </div>
        
        <p style="text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 0;">
          Mã xác thực này chỉ có hiệu lực trong vòng <strong>5 phút</strong>.
        </p>
      </div>
      
      <div style="background-color: #fffbeb; padding: 20px 30px; border-top: 1px solid #fde68a;">
        <p style="margin: 0; text-align: center; font-size: 13px; color: #b45309; line-height: 1.5;">
          <strong>⚠️ Cảnh báo bảo mật:</strong> Tuyệt đối không chia sẻ mã này với bất kỳ ai (kể cả nhân viên quản trị) để tránh rủi ro mất tài khoản.
        </p>
      </div>
    </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
