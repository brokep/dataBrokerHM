const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const funcs = require('./functions');

let rawdata = fs.readFileSync(path.resolve(__dirname, './config.json'));
let config = JSON.parse(rawdata);
let browser, page;
// let proxyNumber = funcs.randomInt(0, 1);
// 0 - cheaper proxy, 1 - expensive proxy
let proxyNumber = 0;
let firstname = process.argv[2];
let lastname = process.argv[3];
let city = process.argv[4];
let state = process.argv[5];

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

        page = await browser.newPage()

        await page.setJavaScriptEnabled(true);
        await page.setDefaultNavigationTimeout(0);
        await page.setDefaultTimeout(15000);
        await page.setRequestInterception(true);

        await page.setViewport({
            width: 1920 + Math.floor(Math.random() * 100),
            height: 3000 + Math.floor(Math.random() * 100),
            deviceScaleFactor: 1,
            hasTouch: false,
            isLandscape: false,
            isMobile: false,
        });

        page.on('request', (req) => {
            if (
                req.resourceType() === 'image'
                || req.resourceType() === 'stylesheet'
                || req.resourceType() === 'font'
                || req.url().includes('amazon')
                || req.url().includes('youtube')
                || req.url().includes('google')
                || req.url().includes('adservice')
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
                let name = titleNodeList[i].querySelector('.mb-5 > .d-flex > .h4 > a > span').textContent;
                let age = 0;
                let agenode = titleNodeList[i].querySelector('span.age');
                if(agenode) {
                    age = agenode.textContent.replace(', age', '').trim();
                }

                res[i] = {
                    name: name,
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
