const pagination = require('./PaginateStrategies');
const { LINK, SCROLL, PAGE} = require('./PaginateStrategies').types;

module.exports = {
    techxplore,
    electronicsforu,
    ioeetimes,
    eetimes,
    sciencex,
    designnews,
    electronicspecifier,
    manufacturingglobal,
    automationmag,
    themanufacturer
}
function techxplore() {
    this.url = 'https://techxplore.com/';
    this.get = {
        items: 'article.sorted-article',
        title: el => el.find('.news-link').text(),
        url: el => el.find('h2>a').attr('href'),
        image: el => el.find('figure img').attr('src'),
        category: el => el.find('figcaption p').text(),
        loadMore: {clickToLoad: async page => await pagination.clickToLoad(page, "//a[contains(text(), 'More News')]", 1000)},
        paginationType: LINK,
        date: el => {
            const res = el.find('.article__info-item p').text().replace(/(\t|\n)/g, '');
            // TODO Verify this add 3 or 4 to month
            const [date] = res.match(/[a-zA-z]*\s\d{2}[,]\s\d{4}/) || [""]
    
            return date;  
        },
        content: el => el.find("p.mb-4").text().replace(/(\t|\n)/g, ''),
        containsAllInfosInList: true,
    }
}
function electronicsforu(){
    
    this.url = 'https://electronicsforu.com/category/technology-trends/tech-focus',
    this.get = {
        items: '.td_module_10',
        title: el => el.find('.entry-title > a').text(),
        url: el => el.find('.entry-title > a').attr('href'),
        image: el => el.find('img.entry-thumb').attr('src'),
        category: el => el.find('.td-post-category').text(),
        paginationType: SCROLL,
        loadMore: {
            clickToLoad: async page => await pagination.clickToLoad(page, "//a[contains(@class, 'td_ajax_load_more')]", 3000),
            endlessScroll: async page => await pagination.endlessScroll(page, 4000)
        },
        date: el => null,
        content: el => null,
        processContent: (newsItem, $) => {
            newsItem.content = $('.td-post-content>p, .article-main>p>em').text().replace(/(\t|\n)/g, '');
            newsItem.date = $('header.td-post-title time.entry-date').text();
            console.log(newsItem);
        },
        onPaginationSwitch: async page =>{
            try{

                await page.click('#pe_close_btn')   
            }catch(ex) {
                console.log("No Ads");
            }
        },
        allowStyle: true
          
    }
}
function ioeetimes(){
    this.url = 'https://iot.eetimes.com/category/technology-trends/',
    this.get = {
        items: 'li.infinite-post',
        title: el => el.find('h2').text(),
        url: el => el.find('a').attr('href'),
        image: el => el.find('.archive-list-img img').attr('src'),
        paginationType: LINK,
        loadMore: {
            clickToLoad: async page => pagination.clickToLoad(page, "//a[contains(@class, 'inf-more-but')]", 1000),
        },
        category: el => null,
        date: el => null,
        content: el => null,
        processContent: (newsItem, $) => {
            newsItem.category = $('.post-head-cat').text();
            newsItem.content = $('#content-main>p, #content-main>p>em, #content-main>p>h3,#content-main>p>strong,' 
                +'#content-main>p>b').text().replace(/(\t|\n)/g, '');
            newsItem.date = $('time.post-date').text();
            console.log(newsItem);
        }
    }

}
function eetimes(){
    this.url = 'https://www.eetimes.com/archives.asp?section_type=News+Analysis';
    this.paginationLink = '/archives.asp?section_type=News+Analysis&piddl_archivepage='
    this.pageIndex = 2;

    this.get = {
        items: '.block .card.-horizontal',
        title: el => el.find('.article-links').text(),

        url: el =>  {
            const url = el.find('.article-links').attr('href');
            return 'https://www.eetimes.com' + url;
        },
        image: el => el.find('.article-links img').attr('src'),
        paginationType: PAGE,
        loadMore: {
            paging: async page =>  {
                await pagination.paging(
                    page,
                    'https://www.eetimes.com' + this.paginationLink + this.pageIndex,
                    2000
                )
                this.pageIndex++;
            }
        },
        category: el => null,
        content: el => null,
        date: el => el.find('span.card-date').text(),
        closeAdd: async page => await page.click("#WelcomeAdCloseButton"),
        processContent: (newsItem, $) => {
            newsItem.category = $('.articleBadge-category').text();
            newsItem.content = $('.articleBody>p, .articleBody>p>em, .articleBody>p>h3>, .articleBody>p>strong,'
                +'.articleBody>p>b').text().replace(/(\t|\n)/g, '');
            console.log(newsItem);
        },
    }
}
function sciencex() {
    this.url = 'https://sciencex.com/news/';
    this.get = {
        items: '#news-content .card',
        title: el => el.find('a.link-blue').text(),

        url: el =>  el.find('a.link-blue').attr('href'),
        image: el => el.find('img.card-img-top').attr('src'),
        paginationType: SCROLL,
        loadMore: { endlessScroll: async page => pagination.endlessScroll(page, 4000)},
        category: el => el.find('.card-panel a').text(),
        date: el => null,
        content: el => null,
        processContent: (newsItem, $) => {
            const res = $('.news-article .article__info-item p').text().replace(/\t\n/g, '');
            const [date] = res.match(/[a-zA-z]*\s(\d{2}|\d{1})[,]\s\d{4}/) || [""];
            newsItem.date = date;
            newsItem.content = $('.article-main>p, .article-main>p>i, .article-main>p>a, .article-main>p>em, .article-main>p>h3, .article-main>p>strong, '
                +'.article-main>p>b').text().replace(/(\t|\n)/g, '');
            console.log(newsItem);
        },
    }
}

function designnews() {
    this.url = 'https://www.designnews.com/all-content';
    this.pageIndex = 1;
    this.paginationLink = '/all-content?page=';

    this.get = {
        items: '.node.node--article',
        title: el => el.find('.article-teaser-title-ubm > a').text(),
        url:  el => 'https://www.designnews.com' +  el.find('.article-teaser-title-ubm > a').attr('href'),
        containsAllInfosInList: true,
        image: el => el.find('img').attr('src'),
        paginationType: PAGE,
        loadMore: { paging: async page => {
            await pagination.paging(
                page,
                'https://www.designnews.com' + this.paginationLink + (this.pageIndex++),
                2000
            )
        }},
        category: el => el.find('.field--name-field-main-topic .teaser-topics-item-ubm').text(),
        date: el =>el.find('.date-display-single').text(),
        content: el => el.find('.field--name-body.article-teaser-body-ubm').text().replace(/(\t|\n)/g, '')
    }
}

function electronicspecifier() {
    this.url = 'https://www.electronicspecifier.com/robotics/';
    this.pageIndex = 2;
    this.paginationLink = '/robotics/?page=';

    this.get = {
        items: '.row-fluid.post .span12',
        title: el => el.find('h2.title').text(),
        url: el =>  el.find('h2.title > a').attr('href'),
        image: el => 'https://www.electronicspecifier.com' + el.find('img.mediumImage').attr('src'),
        date: el => {
            const date = el.find('.span5.created').text().replace(/\t\n/g, '');
    
            return date.trim();  
        },
        //All categories on this endpoint are 'Robotics'
        category: el => 'Robotics',
        content: el => el.find('.synopsis').text().replace(/(\t|\n)/g, ''),
        paginationType: PAGE,
        containsAllInfosInList: true,
        loadMore: { paging: async page => {
            await pagination.paging(
                page,
                'https://www.electronicspecifier.com' + this.paginationLink + (this.pageIndex++),
                2000
            )
        }},
    }
}

function manufacturingglobal() {
    this.url = 'https://www.manufacturingglobal.com/topics/';
    this.get = {
        items: '#main-wrapper .social-row, .content-bottom .social-row',
        title: el => el.find('.mob-hide h3').text(),
        url: el =>  el.find('.mob-hide h3 > a').attr('href'),
        image: el => 'https://www.manufacturingglobal.com' + el.find('img').attr('src'),
        date: el => {
            const date = el.find('.span5.created').text().replace(/\t\n/g, '');
    
            return date.trim();  
        },
        //No categories specified'
        category: el => 'Unspecified',
        content: el => null,
        paginationType: LINK,
        loadMore: { clickToLoad: async page => await pagination.clickToLoad(page, "//a[contains(text(), 'More Stories')]", 1000)},
        processContent: (newsItem, $) => {
            newsItem.date = $('.authored-date').text();
            newsItem.content = $('main#content .content .content-body').text().replace(/(\t|\n)/g, '');
            console.log(newsItem);
        },
        
    }
}

function automationmag() {
    this.url = 'https://www.automationmag.com/products/sensors.html';
    this.pageIndex = 2;
    this.paginationLink = '/products/sensors/Page-';

    this.get = {
        items: '#itemListLeading .itemContainer.itemContainerLast',
        title: el => el.find('h3.catItemTitle').text().trim(),
        url: el =>  'https://www.automationmag.com' + el.find('.catItemTitle > a').attr('href'),
        image: el => 'https://www.automationmag.com' + el.find('.catItemImage img').attr('src'),
        category: el => 'Sensors',
        date: el => null,
        content: el => null,
        paginationType: PAGE,
        loadMore: { paging: async page => {
            await pagination.paging(
                page,
                'https://www.automationmag.com' + this.paginationLink + (this.pageIndex++) + '.html',
                2000
            )
        }},
        processContent: (newsItem, $) => {
            newsItem.date = $('#dateset .deckitemDateCreated').text().replace(/(\t|\n)/g, '');
            newsItem.content = $('.itemFullText ').text().replace(/(\t|\n)/g, '');
            console.log(newsItem);
        },
    }
}   


function themanufacturer() {
    this.url = 'https://www.themanufacturer.com/channel/industrial-automation/';
    this.pageIndex = 2;
    this.paginationLink = 'page/';

    this.get = {
        items: 'article.articles.has-post-thumbnail',
        title: el => el.find('h2.post-title').text(),
        url: el =>  el.find('h2.post-title > a').attr('href'),
        image: el => el.find('.post-thumb img').attr('src'),
        date: el =>{
             const [date] = el.find('.posted-by a').text().match(/\d*\s[a-zA-Z]*\s\d{4}/)
             return date;
        },
        //All categories on this endpoint are 'Robotics'
        category: el => 'Automation',
        content: el => el.find('.standfirst').text().replace(/(\t|\n)/g, ''),
        paginationType: PAGE,
        containsAllInfosInList: true,
        loadMore: { paging: async page => {
            await pagination.paging(
                page,
                this.url + this.paginationLink + (this.pageIndex++),
                2000
            )
        }},
    }
}