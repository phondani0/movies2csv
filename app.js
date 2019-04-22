const puppeteer = require('puppeteer-core');
const request = require('request');
const fs = require('fs');
const json2csv = require('json2csv');


async function getData(movieName) {
    const browser = await puppeteer.launch({
        // Path linux
        executablePath: '/usr/bin/chromium',
        headless: true
    });
    try {
        const page = await browser.newPage();
        await page.goto(`https://www.imdb.com/find?q=${movieName}&s=tt&ttype=ft&ref_=fn_ft`);
        await page.waitForSelector('.findList .findResult a');
        await page.click('.findList .findResult a');
        await page.waitForNavigation();
        const data = await page.evaluate(()=>{
          return {
            name: document.querySelector('.title_wrapper h1').innerText,
            imdbRating: document.querySelector('.title_block .imdbRating span[itemprop=ratingValue]').innerText
          }
        });
        await browser.close();
        return data;
    } catch (err) {
        await browser.close();
        // console.log('Error: '+err.message);
	throw new Error('');
    }
}

(async() => {
  const files = fs.readdirSync('./');
      const movies = files.map((file)=>{
        return file.replace(/[)].*/g,')');
      });

      let data=[];
      for(let i in movies) {
	try {
	  console.log('\x1b[33m%s\x1b[0m',`Fetching ${movies[i]} from IMDB...`);
          const movie = await getData(movies[i]);
          data.push(movie);
          console.log(movie);
	} catch(err) {
	    console.log('\x1b[31m%s\x1b[0m', `Cannot find ${movies[i]} in IMDB...`);
	}
      }
      console.log('\x1b[33m%s\x1b[0m','Writing to the csv file....')
      const csv = json2csv.parse(data);
      fs.writeFile('data.csv',csv,(err)=>{
        if(err) {
          console.log('\x1b[31m%s\x1b[0m', `Error: ${err.message}`);
        } else {
	  console.log('\x1b[32m%s\x1b[0m', 'SCRAPING DONE!');	
	}	
      });
})();
