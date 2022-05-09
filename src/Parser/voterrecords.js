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
let proxyNumber = funcs.randomInt(0, 1);
// let proxyNumber = 0;
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
        await page.setDefaultTimeout(120 * 30000);
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

        await page.goto('https://voterrecords.com/voters/'+city+'-us/'+firstname+'+'+lastname+'/1');
        // await page.waitForSelector('#blocker-selector')
        await page.waitForSelector('#page-content-wrapper')

        let result = await page.evaluate(() => {
            let res = [];

            const voterList = Array.from(document.querySelectorAll('table > tbody > tr'));

            for (let i = 1; i < voterList.length; i++) {
                const tr = voterList[i];
                const r = [];
                const tds = Array.from(tr.querySelectorAll('td'));
                const personalDetails = tds[0].textContent;
                const splitedPersonalDetails = personalDetails.split('\n');
                let name;
                for (let i = 0; i < splitedPersonalDetails.length; i ++) {
                    if (splitedPersonalDetails[i]) {
                        name = splitedPersonalDetails[i].trim();
                        break;
                    }
                }
                // const indexOfAge = personalDetails.indexOf('Age')
                // const age = (personalDetails.slice(indexOfAge, indexOfAge + 7)).replace('Age:', ' ').trim();
                const splitedResidentialDetails = (tds[1].textContent).split('\n');
                let location;
                for (let i = 0; i < splitedResidentialDetails.length; i++) {
                    if (splitedResidentialDetails[i] === 'Residential Address:') {
                        location = splitedResidentialDetails[i + 1];
                        break;
                    }
                }
                const linkd = tr.getAttribute('data-href')
                res.push({
                    name,
                    location,
                    link: 'https://voterrecords.com' + linkd,
                });
            }
            return res;
        });
        console.log(JSON.stringify({message: result, error: null}));
    } catch(e){
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();
