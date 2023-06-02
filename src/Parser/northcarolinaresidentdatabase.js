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

const webpageURL = `https://www.northcarolinaresidentdatabase.com/name/${firstname}-${lastname}`;

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
        await page.setDefaultTimeout(30000 * 2);
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
        await page.waitForSelector('#search-results');

        const results = await page.evaluate(() => {
            let profileList = Array.from(document.querySelectorAll('.element')).slice(0, 10);
            let res = [];
            profileList.forEach((profile) => {
                let name = profile.querySelector('h2[itemprop=name]')?.textContent?.trim();
                let link = profile.querySelector('a')?.href;
                const age = Array.from(profile.querySelectorAll('p'))
                    .find((elem) => elem.textContent.includes('Age'))
                    ?.textContent?.replace('Age: ', '')
                let address = profile.querySelector('span[itemprop=address]')?.textContent?.trim();
                res.push({name, address, link, age});
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
