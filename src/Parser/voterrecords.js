const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const funcs = require('./functions');

let rawdata = fs.readFileSync(path.resolve(__dirname, './config.json'));
let config = JSON.parse(rawdata);
let browser, page;
let proxyNumber = 0;
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
        await page.setDefaultTimeout(15000);
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
        // await page.waitForSelector('#searchForm')
        // await page.type('#searchtxt', firstname+' '+lastname);
        // await page.keyboard.press('Enter');
        // await page.click('#search');
        await page.waitForSelector('#page-content-wrapper')

        let result = await page.evaluate(() => {
            let titleNodeList = document.querySelectorAll('table.table.table-striped tbody tr');
            let res = [];
            console.log('TEST');
            //because first element 0 is not valid
            for (let i = 1; i < titleNodeList.length - 1; i++) {
                if (i > 10) {
                    break;
                }

                console.log('TEST');
                console.log('td:nth-child(1) > span > span.lead > a > span');
                res[i-1] = {
                    name: titleNodeList[i].querySelector('td:nth-child(1) > span > span.lead > a > span').textContent,
                    // location: titleNodeList[i].querySelector('tr td:nth-child(2) p').textContent,
                    link: titleNodeList[i].getAttribute('data-href')
                    // location: document.querySelector('table.table.table-striped tbody tr:nth-child('+(i+1)+') td:nth-child(2) span').textContent,
                    // gender: document.querySelector('table.table.table-striped tbody tr:nth-child('+(i+1)+') td:nth-child(1) span.hidden-xs span[itemprop="gender"]').textContent
                };
            }
            return res;
        });

        console.log(JSON.stringify({message: result, error: null}));
    } catch(e){
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        // process.exit(0);
    }
})();
