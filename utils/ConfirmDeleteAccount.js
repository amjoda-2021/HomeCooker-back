const ConfirmDeleteAccount = ({ email }) => {
  return `<h1>Bonjour ${email}</h1>
  <p>L'utilisateur lié à votre email :${email}, a bien été supprimé ainsi que toutes les données liées à ce compte!</p>
  <p>Nous espérons vous retrouver vite sur notre site ... Vous allez nous manquer !</p>
  <p>Si vous n'êtes pas à l'origine de cette demande, merci de ne pas prendre en compte ce mail & de contacter notre support : support@support.com</p>`;
};
module.exports = ConfirmDeleteAccount;
