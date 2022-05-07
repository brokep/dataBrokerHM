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
        await page.setDefaultTimeout(45000);
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

        await page.goto('https://www.truepeoplesearch.com');
        await page.waitForSelector('#divSearchFormContainer');
        // await page.waitForSelector('#blocker-selector');
        // await page.waitForTimeout(6000);
        // await page.evaluate(() => window.stop());

        await page.type('#id-d-n', firstname + ' ' + lastname);
        await page.type('#id-d-loc-name', state);
        await page.click('#btnSubmit-d-n');

        // await page.waitForSelector('#blocker-selector');
        await page.waitForSelector('div.content-center');
        await page.waitForTimeout(5000);

        let results = await page.evaluate(() => {
            let res = [];
            let allProfileList = Array.from(document.querySelectorAll('div.content-center div.card'));
            if(!allProfileList.length) {
                return res;
            }
            let profileList = allProfileList.slice(0, 10);
            profileList.map(td => {
                const parseNameAgeLocation = (str) => {
                    const splitByNewLine = str.split('\n');
                    const freshArray = [];
                    let age;
                    let location;
                    let name;
                    for (const el of splitByNewLine) {
                        if (el) freshArray.push(el.trim());
                    }

                    name = freshArray[0];

                    for (let i = 0; i < freshArray.length; i++) {
                        if (freshArray[i] == 'Age') age = freshArray[i + 1];
                        if (freshArray[i] == 'Lives in') location = freshArray[i + 1];
                    }

                    return {name, age, location};
                }

                const parseLink = (str) => {
                    const hrefIndex = str.indexOf('href');
                    const start = str.indexOf('"', hrefIndex);
                    const end = str.indexOf('"', start + 1);
                    const linkd = str.slice(start + 1, end);
                    return linkd;
                }
                const linkData = td.querySelector('div:nth-child(1)').innerHTML;
                const cardData = td.querySelector('div:nth-child(1)').textContent;
                const {name, age, location} = parseNameAgeLocation(cardData);
                const linkd = parseLink(linkData);
                res.push({
                    name,
                    age,
                    location,
                    link: 'https://www.truepeoplesearch.com' + linkd
                });
            });
            return res;
        });
        results = results.slice(2);
        console.log(results);
        console.log(JSON.stringify({message: results, error: null}));
    } catch (e) {
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        process.exit(0);
    }
})();
