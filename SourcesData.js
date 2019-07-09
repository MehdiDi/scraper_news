const pagination = require('./PaginateStrategies');
const { LINK, SCROLL, PAGE} = require('./PaginateStrategies').types;

module.exports = {
    techxplore,
    electronicsforu,
    ioeetimes,
    eetimes,
    sciencex
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
            const res = el.find('.article__info-item p').text().replace(/\t\n/g, '');
            const [date] = res.match(/[a-zA-z]{3}\s\d{2}[,]\s\d{4}/) || [""]
    
            return date;  
        },
        processContent: (newsItem, $) => {
            newsItem.content = $('.article-main>p:not([class]), .article-main>p[class=""]>strong, '
            +'.article-main>ul>li, .article-main>p:not([class])>em, .article-main>p[class=""]>b').text();
            
            console.log(newsItem);
        }
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
            clickToLoad: async page => pagination.clickToLoad(page, "//a[contains(@class, 'td_ajax_load_more')]", 3000),
            endlessScroll: async page => pagination.endlessScroll(page, 4000)
        },
        date: el => null,
        processContent: (newsItem, $) => {
            newsItem.content = $('.td-post-content>p, .article-main>p>em').text();
            newsItem.date = $('header.td-post-title time.entry-date').text();
            console.log(newsItem);
        }
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
        processContent: (newsItem, $) => {
            newsItem.category = $('.post-head-cat').text();
            newsItem.content = $('#content-main>p, #content-main>p>em, #content-main>p>h3,#content-main>p>strong,' 
                +'#content-main>p>b').text();
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
                    1500
                )
                this.pageIndex++;
            }
        },
        category: el => null,
        date: el => el.find('span.card-date').text(),
        processContent: (newsItem, $) => {
            newsItem.category = $('.articleBadge-category').text();
            newsItem.content = $('.articleBody>p, .articleBody>p>em, .articleBody>p>h3>, .articleBody>p>strong,'
                +'.articleBody>p>b').text();
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
        processContent: (newsItem, $) => {
            const res = $('.news-article .article__info-item p').text().replace(/\t\n/g, '');
            const [date] = res.match(/[a-zA-z]{4}\s(\d{2}||\d{1})[,]\s\d{4}/) || [""];
            newsItem.date = date;
            newsItem.content = $('.article-main>p, .article-main>p>i, .article-main>p>a, .article-main>p>em, .article-main>p>h3, .article-main>p>strong, '
                +'.article-main>p>b').text();
            console.log(newsItem);
        },
    }
}

