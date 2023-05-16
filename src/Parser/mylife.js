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
let proxyNumber = 0;
let firstname = process.argv[2];
let lastname = process.argv[3];
let city = process.argv[4];
let state = process.argv[5];

const link = `https://www.mylife.com/pub-multisearch.pubview?searchFirstName=${firstname}&searchLastName=${lastname}&searchLocation=${city}%2C+${state}&whyReg=peoplesearch&whySub=Member+Profile+Sub&pageType=ps`;

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
        await page.waitForSelector('.ais-InfiniteHits-item');

        let items = await page.evaluate(() => {
            let titleNodeList = Array.from(document.querySelectorAll('.ais-InfiniteHits-item')).slice(0, 10);
            let res = [];

            titleNodeList.forEach((node) => {
                let [name, age] = node.querySelector('.hit-name')?.textContent?.split(',');
                name = name?.replace('\n', '')?.trim();
                age = age?.replace(' ', '');
                const link = node.querySelector('.hit-name')?.href;
                const location = node.querySelector('.hit-location')?.textContent?.replace('\n', '').trim();
                res.push({name, age, link, location});
            })
            return res;
        });
        console.log(items);
        console.log(JSON.stringify({message: items, error: null}));
    } catch(e){
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();
