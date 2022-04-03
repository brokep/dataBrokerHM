const fs = require('fs');
const path = require('path');
const randomUseragent = require('random-useragent');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');


let rawdata = fs.readFileSync(path.resolve(__dirname, './config.json'));
let config = JSON.parse(rawdata);
let page;

let firstname = process.argv[2]; //Chaitram Samuel Davenport
let lastname = process.argv[3];

puppeteer.use(StealthPlugin());

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
const link = 'https://www.advancedbackgroundchecks.com';

(async () => {
    try {
        if (config.browser.WS !== null) {
            var browserWS = config.browser.WS;

            try{
                browser = await puppeteer.connect(browserWS);
            }catch(e){
                // console.log(e);
            }
        }
        let proxyNumber = 1; // residental

        if (typeof browser === 'undefined') {
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

        await page.setViewport({
            width: 1920 + Math.floor(Math.random() * 100),
            height: 1080 + Math.floor(Math.random() * 100),
            deviceScaleFactor: 1,
            hasTouch: false,
            isLandscape: false,
            isMobile: false,
        })
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
        await page.waitForTimeout(2000)
        await page.screenshot({path: './screenshot_ad1.png', fullPage: true});
        console.log(1)

        await page.waitForSelector('#form-search-name')
        await page.type('#search-name-name', firstname+' '+lastname);
        // await page.type('#search-name-address', location);
        await page.keyboard.press('Enter');
        // // await page.click('#search');

        await page.waitForTimeout(2000)
        await page.screenshot({path: './screenshot_ad2.png', fullPage: true});

        await page.waitForSelector('#peoplelist2')



        const results = await page.evaluate(() => {
            let titleNodeList = Array.from(document.querySelectorAll('#peoplelist2 > div.card'));
            let res = [];
            titleNodeList.map(td => {
                let name = '';
                let age = '';

                let nd = document.querySelectorAll('#peoplelist2 > div.card')[0].querySelector('div.card-block > h4');
                if(nd) {
                    nd = nd.split('Age');
                    name = nd[0].trim();
                    age = nd[1].trim();

                }
                res.push({
                    name: name,
                    link: '',
                    location: td.querySelector('p.card-text').textContent,
                    age: age,
                });
            });

            return res;
        });



        console.log(JSON.stringify({message: results, error: null}));
    } catch(e){
        console.log(JSON.stringify({message: null, error: e.message}));
    } finally {
        page.close();
        process.exit(0);
    }
})();
