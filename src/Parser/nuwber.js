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
const link = 'https://nuwber.com';

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
        await page.waitForSelector('#show_tab1')



        await page.type('#search_name1', firstname+' '+lastname);
        await page.type('#search_state1', city +', '+state);

        await page.click('ul.address__autocomplete > li:eq(0)');

        await page.keyboard.press('Enter');

        await page.waitForSelector('div')


        await page.waitForSelector('div.fog-block')
        await page.click('div.fog-block > div.fog-block-content-outer > div.fog-block-content label');
        await page.click('div.fog-block > div.fog-block-content-outer > div.fog-block-content  button.button-submit');
        await page.waitForSelector('div.search__right-inner')


        await page.waitForTimeout(4000)

        const results = await page.evaluate(() => {
            let titleNodeList = Array.from(document.querySelectorAll('div.search__right-inner div.search-block'));
            let res = [];
            titleNodeList.map(td => {
                var linkd = td.querySelector('div.search-block__title  b  a').getAttribute('href');
                if(linkd.indexOf('/person/') === -1) {
                    return [];
                }

                if(td.querySelector('div.search-block__bottom-left div.search-block__column span a')) {
                    return [];
                }

                let name = td.querySelector('div.search-block__title  b  a').textContent.split(' ');
                let first = name[0] || '';
                let last = (name[1] || '') + ' ' + (name[2] || '');
                res.push({
                    firstname: first,
                    lastname: last,
                    link: 'https://nuwber.com' + linkd,
                    location: td.querySelector('div.search-block__bottom-left div.search-block__column').textContent.replace('Current & Previous Locations', ''),
                    age: td.querySelector('div.search-block__title').textContent.split(/\r?\n/).slice(-1)[0].trim(),
                    // gender: titleNodeList[i].querySelector('.col-md-9 > div.row > div.col-md-6 > p:nth-child(3)').textContent,
                    // race: titleNodeList[i].querySelector('.col-md-9 > div.row > div.col-md-6 > p:nth-child(4)').textContent,
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
