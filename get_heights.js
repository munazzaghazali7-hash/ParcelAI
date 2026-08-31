import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  const heights = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('main, section, footer')).map(el => {
      const style = getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id,
        className: el.className,
        height: style.height,
        display: style.display,
        paddingTop: style.paddingTop,
        paddingBottom: style.paddingBottom
      };
    });
  });

  console.log('LANDING PAGE HEIGHTS:');
  console.table(heights);

  await browser.close();
})();
