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

const link = 'https://www.mylife.com';

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


        await page.goto(link)

        await page.waitForSelector('#single-search-input');
        await page.type('#single-search-input', firstname + ' ' + lastname +' '+city + ' ' + state);
        await page.keyboard.press('Enter');
        // await page.waitForSelector('ul.ais-InfiniteHits-list')
        // await page.$eval('ul.ais-InfiniteHits-list', (el) => el.scrollIntoView())
        await page.waitForSelector('.ais-InfiniteHits-item');

        let items = await page.evaluate(() => {
            let titleNodeList = document.querySelectorAll('.ais-InfiniteHits-item');
            let res = [];
            let input;
            for (let i = 0; i < titleNodeList.length; i++) {
                if (i > 10) {
                    break;
                }
                input = titleNodeList[i].querySelector(
                    '.ais-InfiniteHits-item > .hit-container > .hit-container-left > .hit-profile > .hit-profile-name > a'
                ).textContent;
                input = input.split(',');

                let name = input[0] || ' ';
                res[i] = {
                    name: name,
                    age: input[1],
                    location: titleNodeList[i].querySelector(
                        '.ais-InfiniteHits-item > .hit-container > .hit-container-left > .hit-profile > .hit-profile-name > p'
                    ).textContent,
                    link: titleNodeList[i].querySelector(
                        '.ais-InfiniteHits-item > .hit-container > .hit-container-left > .hit-profile > .hit-profile-name > a'
                    ).getAttribute('href'),};
            }
            return res;
        });
        console.log(JSON.stringify({message: items, error: null}));
    } catch(e){
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();
