// https://www.ussearch.com

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
const USER_AGENT_DEFAULT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
const userAgent = randomUseragent.getRandom();
const UA = userAgent || USER_AGENT_DEFAULT;

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

        await page.setUserAgent(UA);
        await page.setJavaScriptEnabled(true);
        await page.setDefaultNavigationTimeout(0);
        await page.setDefaultTimeout(30000);
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            if (
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

        await page.goto('https://www.ussearch.com/results/?firstName='+firstname+'&middleInitial=&lastName='+lastname+'&city='+city+'&state='+state+'&age=')
        await page.waitForSelector('section#people')
        await page.screenshot({path: './screenshot_err.png', fullPage: true});

        const results = await page.evaluate(() => {
            let res = [];
            let allProfileList = Array.from(document.querySelectorAll('div.person'))
            if(!allProfileList.length) {
                return res;
            }
            let profileList = allProfileList.slice(0, 10);
            profileList.map(td => {
                let linkd = td.querySelector('li.name').getAttribute('href');
                res.push({
                    name: td.querySelector('h4.link-name').textContent.trim(),
                    link: 'https://www.ussearch.com/' + linkd,
                    location: td.querySelector('li.location').textContent.replace('Locations','').trim(),
                    age: td.querySelector('li.age').textContent.replace('years old', '').trim(),
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