const nodemailer = require("nodemailer");
var sgTransport = require("nodemailer-sendgrid-transport");
const sendEmail = async (email, subject, html) => {
  var options = {
    auth: {
      api_key: process.env.PASS,
    },
  };
  try {
    const transporter = nodemailer.createTransport(sgTransport(options));

    await transporter.sendMail({
      from: "loulergueamelie@gmail.com",
      to: email,
      subject: subject,
      html: html,
    });

    console.log("email sent sucessfully");
  } catch (error) {
    console.log(error, "email not sent");
  }
};

module.exports = sendEmail;
