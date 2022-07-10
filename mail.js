const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')// line 1-4 all the imports
const axios = require('axios');
var fs = require("fs");


puppeteer.use(StealthPlugin()) // use stealth plugin 

var text = fs.readFileSync("./email.txt").toString();//txt email to list
var email = text.split("\n")
// console.log(email)

var text = fs.readFileSync("./password.txt").toString();//txt password to list
var password = text.split("\n")
// console.log(password)

var text = fs.readFileSync("./recovery.txt").toString();//txt recovery email to list
var recovery = text.split("\n")
// console.log(recovery)




// buys the sms
async function buy() {
    const idphone = await axios.get('https://public.sms-gen.com/v1/sms/number?country=US&service=Google&channel=1&apikey=ENTERAPIKEY', {
        headers: {
            Accept: 'application/json',
        }
    })
    var id = idphone.data.id
    var phone = idphone.data.number
    return[id, phone]
}

async function main(){
    for (let step = 0; step < email.length; step++) {
        const [id,phone] = await buy()
        console.log(id,phone)
        console.log('https://public.sms-gen.com/v1/sms/code?id='+ id +'&apikey=ENTERAPIKEY')
        puppeteer.launch({
             headless: false, 
             args:[
                '--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"',
                '--disable-gpu',
                '--use-mobile-user-agent',
                'ignore-certificate-errors',
                '--disable-blink-features=AutomationControlled',
                '--unlimited-storage',
                '--lang=en-US,en;q=0.9',
                '--disable-features=site-per-process'
            ],
             ignoreDefaultArgs:["--enable-automation"] 
            }).then(async browser => { // puppeteer script (types and clicks)
        const page = (await browser.pages())[0];
        await page.goto('https://accounts.google.com/signin/v2/identifier?hl=en&passive=true&continue=https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dgmail%2Blogin%26rlz%3D1C1VDKB_enUS943US943%26oq%3Dgmail%2Blogin%26aqs%3Dchrome..69i57j0i271l2.1400j0j1%26sourceid%3Dchrome%26ie%3DUTF-8&ec=GAZAAQ&flowName=GlifWebSignIn&flowEntry=ServiceLoginhttps://accounts.google.com/signin/v2/identifier?hl=en&passive=true&continue=https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dgmail%2Blogin%26rlz%3D1C1VDKB_enUS943US943%26oq%3Dgmail%2Blogin%26aqs%3Dchrome..69i57j0i271l2.1400j0j1%26sourceid%3Dchrome%26ie%3DUTF-8&ec=GAZAAQ&flowName=GlifWebSignIn&flowEntry=ServiceLogin')
        await page.type('input[type=email]', email[step]);
        await page.waitForTimeout(2000);
        await page.click('button[jsname=LgbsSe]');
        await page.waitForTimeout(2000);
        await page.type('input[type=password]', password[step]);
        await page.click('button[jsname=LgbsSe]');
        await page.waitForTimeout(2000);
        const element = (await page.$x("/html[1]/body[1]/div[1]/div[1]/div[2]/div[1]/div[2]/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]/form[1]/span[1]/section[1]/div[1]/div[1]/div[1]/ul[1]/li[3]/div[1]/div[2]"))[0];
        element.click();
        await page.waitForTimeout(2000);
        await page.type('input[type=email]', recovery[step]);
        await page.click('button[jsname=LgbsSe]');
        await page.waitForTimeout(2000);
        await page.type('input[id=deviceAddress]', phone);
        await page.click('input[id=next-button]');
        await page.waitForTimeout(20000);
        const response = await axios.get('https://public.sms-gen.com/v1/sms/code?id='+ id +'&apikey=ENTERAPIKEY', {
            headers: {
                Accept: 'application/json',
            }
        })
        var verify = response.data.retry
        if (verify === False){
            var sms = response.data.sms
            await page.type('input[id=sms-code]', sms);
            await page.click('input[id=next-button]');
            await browser.close();
            console.log('done')
        } else if (verify === True){
            const rep = await axios.get('https://public.sms-gen.com/v1/sms/cancelnumber?id='+ id +'&apikey=ENTERAPIKEY', {
            headers: {
                Accept: 'application/json',
            }
        })
            // await browser.close();
            console.log('invalid',email[step])
        }
        });
    }
}

main()