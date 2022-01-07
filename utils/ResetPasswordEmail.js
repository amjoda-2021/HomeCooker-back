const ResetPasswordEmail = ({ link, email }) => {
  return `<h1>Bonjour ${email}</h1>
  <p>Vous avez demandé une réinitialisation de votre mot de passe</p>
  <a href=${link}><strong>Réinitialiser mon mot de passe</strong></a>
  <p>Si vous n'êtes pas à l'origine de cette demande, merci de ne pas prendre en compte ce mail & de contacter notre support : support@support.com</p>`;
};
module.exports = ResetPasswordEmail;
