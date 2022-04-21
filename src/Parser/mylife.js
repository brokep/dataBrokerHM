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
const link = 'https://www.mylife.com';

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

        await page.authenticate({
            username: config.proxy[proxyNumber].user,
            password: config.proxy[proxyNumber].pass
        });


        await page.goto(link)
        // let cloudflare = (await page.$('#cf-wrapper')) || false;
        // if (cloudflare !== false) {
        //     solve(page)
        // }

        await page.waitForSelector('#single-search-input');
        await page.type('#single-search-input', firstname + ' ' + lastname +' '+city + ' ' + state);
        await page.keyboard.press('Enter');
        // await page.waitForSelector('ul.ais-InfiniteHits-list')
        // await page.$eval('ul.ais-InfiniteHits-list', (el) => el.scrollIntoView())
        await page.waitForSelector('.ais-InfiniteHits-item');

        let items = await page.evaluate(() => {
            let allProfileList = document.querySelectorAll('.ais-InfiniteHits-item');
            let res = [];
            let input;
            if(!allProfileList.length) {
                return res;
            }
            let profileList = allProfileList.slice(0, 10);
            profileList.map(td => {
                input = td.querySelector(
                    '.ais-InfiniteHits-item > .hit-container > .hit-container-left > .hit-profile > .hit-profile-name > a'
                ).textContent;
                input = input.split(',');
                let name = input[0].split(' ');
                let first = name[0] || '';
                let last = (name[1] || '') + ' ' + (name[2] || '');
                res[i] = {
                    firstname: first,
                    lastname: last,
                    age: input[1],
                    location: td.querySelector(
                        '.ais-InfiniteHits-item > .hit-container > .hit-container-left > .hit-profile > .hit-profile-name > p'
                    ).textContent,
                    link: td.querySelector(
                        '.ais-InfiniteHits-item > .hit-container > .hit-container-left > .hit-profile > .hit-profile-name > a'
                    ).getAttribute('href'),};
            });
            return res;
        });
        console.log(JSON.stringify({message: items, error: null}));
    } catch(e){
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();