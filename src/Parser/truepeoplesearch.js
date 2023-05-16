const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const funcs = require('./functions');

let rawdata = fs.readFileSync(path.resolve(__dirname, './config.json'));
let config = JSON.parse(rawdata);
let browser, page;
// 0 - cheaper proxy, 1 - expensive proxy
// let proxyNumber = funcs.randomInt(0, 1);
let proxyNumber = 0;
let firstname = process.argv[2];
let lastname = process.argv[3];
let city = process.argv[4];
let state = process.argv[5];

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

        await page.goto(`https://www.truepeoplesearch.com/results?Name=${firstname}+${lastname}&CityStateZip=${city}+${state}&PhoneNo=&StreetAddress=&CityStateZip=`);
        await page.waitForSelector('.card');

        let results = await page.evaluate(() => {
            let res = [];
            let nodeList = Array.from(document.querySelectorAll('.card')).slice(0, 10);

            nodeList.forEach((node) => {
                const name = node.querySelector('.h4')?.textContent?.replace('\n', '');
                const age = Array.from(node.querySelectorAll('.content-label'))
                    .find((elem) => elem.textContent?.includes('Age'))
                    ?.nextElementSibling
                    ?.textContent?.replace('\n', '');
                const location = Array.from(node.querySelectorAll('.content-label'))
                .find((elem) => elem.textContent?.includes('Lives in'))
                ?.nextElementSibling
                ?.textContent;
                const link = 'https://www.truepeoplesearch.com' + node.getAttribute('data-detail-link');
                res.push({name, age, location, link})
            })
            return res;
        });
        console.log(results);
        console.log(JSON.stringify({message: results, error: null}));
    } catch (e) {
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();
