const fs = require('fs');
const path = require('path');
const randomUseragent = require('random-useragent');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const solve = require(path.resolve(__dirname, './captcha.js'));


let rawdata = fs.readFileSync(path.resolve(__dirname, './config.json'));
let config = JSON.parse(rawdata);
let browser, page;
let firstname = process.argv[2]; //Chaitram Samuel Davenport
let lastname = process.argv[3];
let location = process.argv[4];

puppeteer.use(StealthPlugin());

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
const link = 'https://www.spokeo.com';

(async () => {
    try {
        if (config.browser.WS !== null) {
            var browserWS = config.browser.WS;

            try{
                browser = await puppeteer.connect({
                    browserWSEndpoint: browserWS
                });
            } catch(e){
                // console.log(e.message);
            }
        }
        let proxyNumber = 1;
        if (typeof browser === 'undefined') {
            browser = await puppeteer.launch({
                slowMo: 100,
                headless: true,
                devtools: true,
                args: ['--proxy-server=' + config.proxy[proxyNumber].host, '--no-sandbox'],
                userDataDir:  path.resolve(__dirname, './puppeter_cache'),
            })
            config.browser.WS = browser.wsEndpoint();

            await fs.writeFileSync(path.resolve(__dirname, './config.json'), JSON.stringify(config));
            // console.log(config);
            // fs.writeFileSync('./config.json', config);
            // fs.writeFileSync('./config.json', config);
        }

        const userAgent = randomUseragent.getRandom();
        const UA = userAgent || USER_AGENT;
        page = await browser.newPage()

        await page.setUserAgent(UA);
        await page.setJavaScriptEnabled(true);
        await page.setDefaultNavigationTimeout(0);
        await page.setDefaultTimeout(15000);
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
        await page.waitForSelector('#homepage_hero_form')

        await page.type('#homepage_hero_form  input[name="q"]', firstname+' '+lastname+' '+location);
        await page.keyboard.press('Enter');

        await page.waitForSelector('.list-view')

        let result = await page.evaluate((link) => {
            let titleNodeList = document.querySelectorAll('.list-view div.single-column-list a');
            let res = [];
            for (let i = 0; i < titleNodeList.length; i++) {
                if (i > 10) {
                    break;
                }
                res[i] = {
                    name: titleNodeList[i].querySelector('.title').textContent.split(', ')[0],
                    link: link + titleNodeList[i].getAttribute('href'),
                    location: titleNodeList[i].querySelector('div > div > span').textContent,
                    age: titleNodeList[i].querySelector('.title').textContent.split(', ')[1],
                };
            }
            return res;
        }, link);

        console.log(JSON.stringify({message: result, error: null}));
    } catch(e){
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        page.close();
        process.exit(0);
    }
})();