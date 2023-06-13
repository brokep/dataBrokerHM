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
// 0 - cheaper proxy, 1 - expensive proxy
// let proxyNumber = funcs.randomInt(0, 1);
let proxyNumber = 1;
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

        page = await browser.newPage();
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

        await page.goto('https://www.fastpeoplesearch.com/name/'+firstname+'-'+lastname+'_'+city+'-'+state)
        await page.waitForSelector('div.people-list')

        const results = await page.evaluate(() => {
            let res = [];
            let allProfileList = Array.from(document.querySelectorAll('div.people-list div.card'));
            if(!allProfileList.length) {
                return res;
            }
            let profileList = allProfileList.slice(0, 10);
            profileList.map(td => {
                let link = td.querySelector('h2.card-title a').getAttribute('href')
                let name = td.querySelector('h2.card-title span.larger').textContent;
                let location = td.querySelector('div strong a').textContent.split(/\r?\n/)[0]
                var age     = false;
                var patt    = /<h3>Age:<\/h3>([^"']*)<br>/g;
                while (match = patt.exec(td.outerHTML)) {
                    age = match[1];
                }
                if(age) {
                    age = age.split('<br>')[0].trim()
                }

                res.push({
                    name: name,
                    link: 'https://www.fastpeoplesearch.com/' + link,
                    location: location.trim(),
                    age: age
                });
            });
            return res;
        });

        console.log(JSON.stringify({message: results, error: null}));
    } catch (e) {
        console.log(JSON.stringify({message: null, error: e.message}));
        logger.error(JSON.stringify(e, Object.getOwnPropertyNames(e)));
    } finally {
        process.exit(0);
    }
})();
