const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const funcs = require('./functions');

let rawdata = fs.readFileSync(path.resolve(__dirname, './config.json'));
let config = JSON.parse(rawdata);
let browser, page;
let proxyNumber = funcs.randomInt(0, 2);
let firstname = process.argv[2];
let lastname = process.argv[3];
let city = process.argv[4];
let state = process.argv[5];

(async () => {
    try {
        browser = await puppeteer.launch({
            slowMo: 100,
            headless: false,
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
        await page.setDefaultTimeout(30000);
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

        await page.goto('https://www.peekyou.com/usa/florida/john_smith')
        await page.waitForTimeout(2000)
        await page.waitForSelector('div#resultsContainerProfiles')
        await page.waitForTimeout(2000)

        const results = await page.evaluate(() => {
            let titleNodeList = Array.from(document.querySelectorAll('div.resultsContainerProfiles div.teaser-card'));
            let res = [];
            titleNodeList.map(td => {
                let linkd = td.querySelector('a.card-title').getAttribute('href');
                res.push({
                    name: td.querySelector('a.card-title').textContent,
                    link: 'https://www.peekyou.com' + linkd,
                    location: td.querySelector('p.res-in span.many-links-item').textContent,
                    age: td.querySelector('div.age').textContent,
                });
            });
            return res;
        });

        console.log(JSON.stringify({message: results, error: null}));
    } catch (e) {
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();
