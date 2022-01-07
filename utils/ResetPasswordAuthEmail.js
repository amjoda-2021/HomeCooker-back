const ResetPasswordAuthEmail = ({ email }) => {
  return `<h1>Bonjour ${email}</h1>
  <p>Votre mot de passe a bien été réinitialisé ! </p>
  <p>Si vous n'êtes pas à l'origine de cette demande, merci de ne pas prendre en compte ce mail & de contacter notre support : support@support.com</p>`;
};
module.exports = ResetPasswordAuthEmail;
