const { getTemplateEmail, getEmailURL } = require('./temp_email');

(async () => {
    const temp_email_address = await getTemplateEmail();
    console.log('temp_email_address', temp_email_address)

    const resulturl = await getEmailURL(temp_email_address);
    console.log('resulturl', resulturl)
})();
