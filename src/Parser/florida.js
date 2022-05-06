const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
let browser, page;
let firstname = process.argv[2];
let lastname = process.argv[3];
let city = process.argv[4];
let state = process.argv[5];

puppeteer.use(StealthPlugin());

const link = 'https://www.floridaresidentsdirectory.com';

(async () => {
    try {

        browser = await puppeteer.launch({
            slowMo: 100,
            headless: true,
            devtools: true,
            args: ['--no-sandbox'],
        });

        page = await browser.newPage()

        await page.setJavaScriptEnabled(true);
        await page.setDefaultNavigationTimeout(0);
        await page.setDefaultTimeout(30000);
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            if(
                req.resourceType() === 'image'
                || req.resourceType() === 'stylesheet'
                || req.resourceType() === 'font'
                || req.url().substring(0, 30) === 'amazon'
                || req.url().substring(0, 30) === 'youtube'
                || req.url().substring(0, 30) === 'google'
                || req.url().substring(0, 30) === 'adservice'
            ) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(link)
        await page.waitForSelector('.main')

        await page.type('input[name="q[full_name]"]', firstname+' '+lastname);
        await page.type('input[name="q[location]"]', city + ', ' + state);
        await page.keyboard.press('Enter');

        await page.waitForSelector('#search-results')

        let result = await page.evaluate(() => {
            let titleNodeList = document.querySelectorAll('.row.bb.element');
            let res = [];
            for (let i = 0; i < titleNodeList.length; i++) {
                if (i > 10) {
                    break;
                }
                let name = titleNodeList[i].querySelector('div a h3').innerText;
                res[i] = {
                    firstname: name,
                    lastname: name,
                    age: titleNodeList[i].querySelector('div div div p:nth-child(1)').innerText.replace(/\D/g, ""),
                    address: titleNodeList[i].querySelector('div div div p:nth-child(2) span').innerText,
                    link: titleNodeList[i].querySelector('div a').getAttribute('href'),
                };
            }
            return res;
        });

        console.log(JSON.stringify({message: result, error: null}));
    } catch(e){
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();
