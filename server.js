const scrapeNews = require('./ScraperNews');
const sourcesData = require('./SourcesData');
const readline = require('readline');
const ObjectsToCsv = require('objects-to-csv');


function readInput(text) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    return new Promise(resolve => rl.question(text, ans => {
        rl.close();
        resolve(ans);
    }))
}

getNews = async () => {
    let input = "";
    let scraper = null;
    let numberOfItems;
    
    do {
        console.log("\n\nChoose website to scrape: \n\n");
        console.log("1- techxplore.com");
        console.log("2- electronicsforu.com/category/technology-trends/tech-focus");
        console.log("3- iot.eetimes.com/category/technology-trends");
        console.log("4- eetimes.com/archives.asp?section_type=News+Analysis");
        console.log("5- sciencex.com/news");
        console.log("6- designnews.com/all-content");
        console.log("7- electronicspecifier.com/robotics");
        console.log("8- manufacturingglobal.com/topics");
        console.log("9- automationmag.com/products/sensors.html");
        console.log("10- themanufacturer.com/channel/industrial-automation");
        console.log("0- To quit \n");

        input = await readInput('Your choice: ');
        switch(input) {
            case "1":
                scraper = new sourcesData.techxplore();
                break;
            case "2":
                scraper = new sourcesData.electronicsforu();
                break;
            case "3":
                scraper = new sourcesData.ioeetimes();
                break;
            case "4":
                scraper = new sourcesData.eetimes();
                break;
            case "5":
                scraper = new sourcesData.sciencex();
                    break;
            case "6":
                scraper = new sourcesData.designnews();
                    break;
            case "7":
                scraper = new sourcesData.electronicspecifier()
                    break;                    
            case "8":
                scraper = new sourcesData.manufacturingglobal()
                    break;
            case "9":
                scraper = new sourcesData.automationmag()
                    break;
            case "10":
                scraper = new sourcesData.themanufacturer()
                    break;
            case "0":
                console.log("\nGoodbye!\n\n");
                scraper = null;
                return;
            default: 
                console.log("\n\nInvalid input.\n\n")
        }

        if(input !== "0" && scraper !== null) {
            numberOfItems = await readInput("\nNumber of rows: ");
            if(isNaN(numberOfItems)) {
                console.log("Please provide a valid number");
                continue;
            }
            numberOfItems = parseInt(numberOfItems);
    
            if(numberOfItems <=0) {
                console.log("\n\nInvalid number of news\n\n");
                continue;
            }
            let offset = await readInput("Offset: ")
            
            while(isNaN(offset)){
                offset = await readInput("Please enter a valid offset number.");
            }
            offset = parseInt(offset);

            const news = await scrapeNews(
                scraper.url,
                scraper.get,
                numberOfItems,
                offset
            );
            console.log("\n\nScraping done!");
            
            console.log("\nSaving..");

            await (async() =>{
                let csv = new ObjectsToCsv(news);
                const filename = scraper.url.replace(/\//g, '').split(':')[1] + "|" + new Date() + ".csv";
                
                await csv.toDisk("./exports/" + filename);
                
                console.log("\nSaved as ", filename)
                scraper = null;
            })();
        }
        
    }while(input !== "0")
}
getNews();
