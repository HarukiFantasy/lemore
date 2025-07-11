import { Vonage } from '@vonage/server-sdk'

export const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY, 
  apiSecret: process.env.VONAGE_API_SECRET
} as any)

const from = "Vonage APIs"
const to = "66929250116"
const text = 'A text message sent using the Vonage SMS API'

async function sendSMS() {
    await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

sendSMS();