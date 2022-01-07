const ChangeEmail = ({ link, email }) => {
  return `<h1>Bonjour ${email} ! </h1>
  <p>Votre modification d'email / identifiant a bien été enregistrée !</p>
  <p>Pour utiliser toutes les fonctionnalités du site, nous vous invitons à confirmer votre adresse email:</p>
  <a href=${link}><strong>Confirmer mon adresse mail</strong></a>
  <p>Si vous n'êtes pas à l'origine de cette demande, merci de ne pas prendre en compte ce mail & de contacter notre support : support@support.com</p>`;
};

module.exports = ChangeEmail;
