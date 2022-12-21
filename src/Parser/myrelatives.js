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

// John Smith Jasper IN
// div.card.teaser-card

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
        await page.setDefaultTimeout(60000 * 10);
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

        await page.goto(`https://www.peoplefinders.com/people/${firstname}-${lastname}/${state}/${city}?landing=all`)

        await page.waitForSelector('#content-vue');

        const results = await page.evaluate(() => {
            let titleNodeList = Array.from(document.querySelectorAll('a.record'));
            let res = [];
            titleNodeList.map((td, index) => {
                const nameAndAgeNode = td.querySelector('h4.record__title');
                // const locationNode = td.querySelector('li.category.location > ul');
                // const linkNode = td.querySelector('a');

                const nameAndAge = nameAndAgeNode? nameAndAgeNode.textContent.trim().split(','): [];
                const name = nameAndAge[0] ? nameAndAge[0].trim() : '';
                const age = nameAndAge[1] ? nameAndAge[1].trim() : '';
                // const location = locationNode? locationNode.textContent.trim() : '';
                const link = td.href;
                res.push({name, age, link});
            });
            return res;
        });
        // await page.waitForSelector('#blocker');
        console.log(JSON.stringify({message: results, error: null}));
    } catch(e){
        console.error(e);
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();
