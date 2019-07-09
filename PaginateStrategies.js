const LINK = 'LINK';
const SCROLL = 'SCROLL';
const PAGE = 'PAGE';

const paging = async (page, nextPage, waitTime) => {
    await page.goto(nextPage, {waitUntil: 'networkidle0'});
    await page.waitFor(waitTime);

}

const clickToLoad = async (page, selector, waitSeconds) => {
    const linkHandlers = await page.$x(selector);

    if (linkHandlers.length === 0)
        return false;
    
    await linkHandlers[0].click();
    await page.waitFor(waitSeconds);
    return true;
}
const endlessScroll = async (page, waitTime) => {
    const previousHeight = await page.evaluate('document.body.scrollHeight');
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
    await page.waitFor(waitTime);
}

module.exports = {
    clickToLoad,
    endlessScroll,
    paging,
    types: {
        LINK, SCROLL, PAGE
    }
}