const fs = require('fs');
const path = require('path');
const randomUseragent = require('random-useragent');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

let rawdata = fs.readFileSync(path.resolve(__dirname, './config.json'));
let config = JSON.parse(rawdata);
let page;
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
            args: [
                '--proxy-server=' + config.proxy[proxyNumber].host,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                "--disable-gpu",
                "--disable-dev-shm-usage"
            ],
            userDataDir: path.resolve(__dirname, './puppeter_cache'),
        })

        page = await browser.newPage()
        await page.setViewport({
            width: 1900 + Math.floor(Math.random() * 100),
            height: 1080 + Math.floor(Math.random() * 100),
            deviceScaleFactor: 1,
            hasTouch: true,
            isLandscape: false,
            isMobile: false,
        })
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

        await page.goto('https://www.whitepages.com/name/'+firstname+'-'+lastname+'/'+city+'-'+state)
        await page.waitForTimeout(1000)
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
    } catch (e) {
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();
