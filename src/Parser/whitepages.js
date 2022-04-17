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
const link = 'https://www.whitepages.com';

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
        page = await browser.newPage();

        await page.setUserAgent(UA);
        await page.setJavaScriptEnabled(true);
        await page.setDefaultNavigationTimeout(0);
        await page.setDefaultTimeout(300000);
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
        await page.waitForSelector('#desktopSearchBar')

        await page.type('#desktopSearchBar', firstname+' '+lastname);
        await page.type('.pa-3', location);

        await page.waitForTimeout(1000)

        await page.screenshot({path: './screenshot_0.png', fullPage: true});

       // await page.click('div.suggestions-wrapper div.suggestion-item:nth-child(0)');

        await page.keyboard.press('Enter');
        // await page.click('#search');

        await page.waitForSelector('.container')

        await page.click('a.ash--text:eq(0)');

        await page.waitForTimeout(5000)

        await page.waitForSelector('#person-serp-content')


        const results = await page.evaluate(() => {
            let titleNodeList = Array.from(document.querySelectorAll('#person-serp-content > div:nth-child(3) > div:nth-child(1) > div > a[rel="nofollow"]'));
            let res = [];
            titleNodeList.map(td => {
                var linkd = td.querySelector('a.pos-rl').getAttribute('href');
                if(linkd.indexOf('/checkout/') > -1) {
                    return [];
                }

                res.push({
                    name: td.querySelector('div.display-1').textContent,
                    link: 'https://www.whitepages.com/' + linkd,
                    location: td.querySelector('div.body-1').textContent,
                    age: td.querySelector('div.subtitle-1').textContent,
                });
            });

            return res;
        });

        console.log(JSON.stringify({message: results, error: null}));
    } catch(e){
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();
