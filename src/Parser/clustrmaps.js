const fs = require('fs');
const path = require('path');
const randomUseragent = require('random-useragent');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

let rawdata = fs.readFileSync(path.resolve(__dirname, './config.json'));
let config = JSON.parse(rawdata);
let browser, page;
let proxyNumber = 0;
let firstname = process.argv[2];
let lastname = process.argv[3];
let city = process.argv[4];
let state = process.argv[5];

puppeteer.use(StealthPlugin());

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
const link = 'https://clustrmaps.com';

(async () => {
    try {
        browser = await puppeteer.launch({
            slowMo: 100,
            headless: true,
            devtools: true,
            args: [
                '--proxy-server=' + config.proxy[proxyNumber].host,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                "--disable-gpu",
                "--disable-dev-shm-usage"
            ],
        });

        const userAgent = randomUseragent.getRandom();
        const UA = userAgent || USER_AGENT;
        page = await browser.newPage()

        await page.setUserAgent(UA);
        await page.setJavaScriptEnabled(true);
        await page.setDefaultNavigationTimeout(0);
        await page.setDefaultTimeout(15000);
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

        await page.authenticate({
            username: config.proxy[proxyNumber].user,
            password: config.proxy[proxyNumber].pass
        });

        await page.goto(link);
        await page.waitForSelector('#main-people-form > div.form-input > input[type=text]');
        await page.type('#main-people-form > div.form-input > input[type=text]', firstname + ' ' + lastname);
        // await page.click('#main-people-form > div.form-button > button');
        await page.keyboard.press('Enter');
        await page.waitForSelector('.container')
        let result = await page.evaluate((link) => {
            let titleNodeList = document.querySelectorAll('.container > .row > .col-12 > .row > .col-md-8 > div.mb-5');
            let res = [];
            for (let i = 0; i < titleNodeList.length; i++) {
                if (i > 10) {
                    break;
                }
                let name = titleNodeList[i].querySelector('.mb-5 > .d-flex > .h4 > a > span').textContent.split(' ');
                let first = name[0] || '';
                let last = (name[1] || '') + ' ' + (name[2] || '');
                let age = 0;
                let agenode = titleNodeList[i].querySelector('span.age');
                if(agenode) {
                    age = agenode.textContent.replace(', age', '').trim();
                }

                res[i] = {
                    firstname: first,
                    lastname: last,
                    link: link + titleNodeList[i].querySelector('.mb-5 > .d-flex > .h4 > a').getAttribute('href'),
                    location: titleNodeList[i].querySelector('.mb-5 > .mb-1 > a > span').textContent,
                    age: age
                    };
            }
            return res;
        }, link);

        console.log(JSON.stringify({message: result, error: null}));
    } catch(e){
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();
