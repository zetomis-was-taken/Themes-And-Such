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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #f9fafb;">
      <div style="background-color: #0d9488; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Portal Helper</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #111827;"><strong>Chào bạn,</strong></p>
        <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">
          Bạn vừa yêu cầu mã xác thực để đăng ký trên hệ thống hỗ trợ học tập thông minh <strong>FITUSocial</strong>. Vui lòng sử dụng mã OTP dưới đây:
        </p>
        <div style="margin: 30px 0; padding: 20px; text-align: center; background-color: #f0fdfa; border: 2px dashed #14b8a6; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; color: #0f766e; letter-spacing: 8px;">${otp.split("").join(" ")}</span>
        </div>
        <p style="text-align: center; font-size: 14px; color: #4b5563;">
          Mã này có hiệu lực trong vòng <strong>5 phút</strong>.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="text-align: center; font-size: 14px; color: #d97706; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span style="font-size: 16px;">⚠️</span> Tuyệt đối không chia sẻ mã này với bất kỳ ai để bảo vệ tài khoản của bạn.
        </p>
      </div>
    </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
