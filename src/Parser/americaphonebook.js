const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const funcs = require('./functions');
const logger = require('./other/logger');

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

const webpageURL = `http://americaphonebook.com/`;

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
        await page.setDefaultTimeout(30000 * 10);
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

        await page.goto(webpageURL)
        await page.waitForSelector('input[name=first]')
        if(firstname) {
            await page.type('input[name=first]', firstname);
        }
        if(lastname) {
            await page.type('input[name=last]', lastname);
        }
        if(city) {
            await page.type('input[name=city]', city);
        }
        if(state) {
            await page.type('input[name=state]', state);
        }
        await page.click('input[type=submit]');

        await page.waitForSelector('tr');

        const results = await page.evaluate(() => {
            let profileList = Array.from(document.querySelectorAll('tr')).slice(5, 15);
            let res = [];
            profileList.forEach((profile) => {
                let name = profile.querySelector('td:nth-child(2)')?.textContent?.trim();
                let location = profile.querySelector('td:nth-child(3)')?.textContent?.trim();
                let link = Array.from(profile.querySelectorAll('a')).find((elem) => elem.textContent.includes('BACKGROUND'))?.href;
                res.push({name, location, link})
            })
            return res;
        });
        console.log(JSON.stringify({message: results, error: null}));
    } catch(e){
        console.log(JSON.stringify({message: null, error: e.message}));
        logger.error(JSON.stringify(e, Object.getOwnPropertyNames(e)));
    } finally {
        process.exit(0);
    }
})();
