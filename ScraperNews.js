const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { LINK, SCROLL, PAGE} = require('./PaginateStrategies').types;

const extractBasicData = (news_items, get, $) => {
    const news = [];
    news_items.each(function(){
        news.push({
            title: get.title($(this)),
            url: get.url($(this)),
            image: get.image($(this)),
            category: get.category($(this)),
            date: get.date($(this)),
            content: get.content($(this)),
        });
    });
    if(get.containsAllInfosInList)
        console.log(news);
    
    return news;
}

const extractArticleContent = async (page, news, setNewsContents) => {
    let content;
    let item;
    for(let i in news){
        item = news[i];
        if(!item.url)
            continue;
        await page.goto(item.url);
        content = await page.evaluate(() => document.body.innerHTML);
        $ = cheerio.load(content);

        setNewsContents(item, $);
    }
}



const getNews = async (url, get, newsLimit=999, rowsOffset=0) => {
    console.log(`\n\nScraping news from: '${url}' it might take a few seconds to minutes.\n\n`);

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    await page.setViewport({
        width: 1200,
        height: 800
    });
    await page.setRequestInterception(true);
    
    page.on('request', (req) => {
        if((req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') && !get.allowStyle){
            req.abort();
        }
        else {
            req.continue();
        }
    });
    await page.goto(url);
    
    let content;
    let $;
    let news_items;
    let news = [];
    let moreExists = true;
    const twoPaginationMethods = Object.keys(get.loadMore).length > 1;
    let sliced_news_items;
    let offset = rowsOffset;
    let paginationType = get.paginationType;

    if(get.closeAdd) {
        await get.closeAdd(page);
    }

    do {
        content = await page.evaluate(() => document.body.innerHTML);
        $ = cheerio.load(content);
        news_items = $(get.items);
        
        if((paginationType === LINK || paginationType === SCROLL)) {
            sliced_news_items = news_items.slice(offset);
            
            offset = news_items.length > rowsOffset ? news_items : rowsOffset;
        }
        if(paginationType === PAGE){
            if(rowsOffset !== 0) {
                sliced_news_items = news_items.slice(rowsOffset);
                if(rowsOffset <= news_items.length){
                    rowsOffset = 0;
                }
                else {
                    rowsOffset -= news_items.length;
                }
            }
            else {
                sliced_news_items = news_items;
            }
        }

        const length = news.length + sliced_news_items.length;
        if( length > newsLimit) {
            const diff = length - newsLimit;
            sliced_news_items.splice(sliced_news_items.length - diff, diff);
        }

        news = news.concat(extractBasicData(sliced_news_items, get, $));

        try{
            if(paginationType === SCROLL){
                await get.loadMore.endlessScroll(page);
            }
            else if(paginationType === LINK) {
                moreExists = await get.loadMore.clickToLoad(page);
            }
            else if(paginationType === PAGE) {
                await get.loadMore.paging(page);
            }
        }
        catch(err) {
            if(twoPaginationMethods){
                paginationType = LINK;
                await get.onPaginationSwitch(page);
            }
            else
                moreExists = false;
        }
    } while(moreExists && news.length < newsLimit);
    if(!get.containsAllInfosInList)
        await extractArticleContent(page, news, get.processContent)

    await browser.close();
    return news;
}

module.exports = getNews;