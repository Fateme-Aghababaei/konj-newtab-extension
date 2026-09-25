const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 try {
 const page = await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[]; page.on('pageerror', e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL || 'http://localhost:5173');
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('konj-state'));s.data.preferences.language='en';localStorage.setItem('konj-state',JSON.stringify(s));});
 await page.reload();
 await page.getByRole('button',{name:'Add widget',exact:true}).click();
 for(const title of ['Pomodoro timer','Calendar & occasions','Weather','Countdown','Ambient sounds']) await page.locator('.catalog-item').filter({has:page.getByRole('heading',{name:title,exact:true})}).getByRole('button').click();
 await page.locator('dialog').getByRole('button',{name:'Close',exact:true}).click();
 const timer=page.locator('.widget-pomodoro');
 await timer.getByRole('button',{name:'Start',exact:true}).click();
 await page.reload();
 await timer.getByRole('button',{name:'Pause',exact:true}).click();
 await timer.getByRole('button',{name:'Short break',exact:true}).click();
 assert.equal(await timer.getByRole('timer').textContent(),'05:00');
 await timer.getByRole('button',{name:'Start',exact:true}).click();
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('konj-state'));s.data.instances.find(w=>w.type==='pomodoro').settings.endsAt=Date.now()-1000;localStorage.setItem('konj-state',JSON.stringify(s));});
 await page.reload(); await timer.getByRole('status').filter({hasText:'Session complete'}).waitFor();
 const countdown=page.locator('.widget-countdown');
 await countdown.getByLabel('Event name').fill('Our trip'); await countdown.getByLabel('Date (Gregorian input)').fill('2030-01-01'); await countdown.getByRole('button',{name:'Save',exact:true}).click();
 const calendar=page.locator('.widget-calendar');
 await calendar.getByRole('button',{name:'Add occasion',exact:true}).click(); await calendar.getByLabel('Event name').fill('Birthday');await calendar.getByLabel('Date (Gregorian input)').fill('2030-01-01');await calendar.getByRole('button',{name:'Save',exact:true}).click();
 await calendar.getByRole('button',{name:'Persian',exact:true}).click(); const heading=await calendar.locator('.calendar-nav strong').textContent(); await calendar.getByRole('button',{name:'Next month'}).click();assert.notEqual(await calendar.locator('.calendar-nav strong').textContent(),heading);
 await page.route('https://geocoding-api.open-meteo.com/**',r=>r.fulfill({json:{results:[{id:1,name:'Tehran',country:'Iran',latitude:35.7,longitude:51.4}]}}));
 await page.route('https://api.open-meteo.com/**',r=>r.fulfill({json:{current:{temperature_2m:24,weather_code:0,wind_speed_10m:8}}}));
 const weather=page.locator('.widget-weather');await weather.getByLabel('City',{exact:true}).fill('Tehran');await weather.getByRole('button',{name:'Search',exact:true}).click();await weather.getByRole('button',{name:'Tehran, Iran'}).click();await weather.getByText('Clear sky',{exact:true}).waitFor();
 await page.route('https://api.open-meteo.com/**',r=>r.abort());await weather.getByRole('button',{name:'Refresh',exact:true}).click();await weather.getByRole('alert').waitFor();
 const ambient=page.locator('.widget-ambient');await ambient.getByRole('button',{name:'Play',exact:true}).click();await ambient.getByRole('button',{name:'Pause',exact:true}).waitFor();await ambient.getByRole('button',{name:'Sea',exact:true}).click();await ambient.getByRole('button',{name:'Pause',exact:true}).click();
 await page.reload();await countdown.getByText('Our trip',{exact:true}).waitFor();await calendar.locator('.occasion').filter({hasText:'Birthday'}).waitFor();assert.equal(await ambient.getByRole('button',{name:'Sea',exact:true}).getAttribute('aria-pressed'),'true');await ambient.getByRole('button',{name:'Play',exact:true}).waitFor();
 for(const width of [390,1440]){await page.setViewportSize({width,height:844});await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('konj-state'));s.data.preferences.language='fa';localStorage.setItem('konj-state',JSON.stringify(s));});await page.reload();await page.locator('html[dir="rtl"]').waitFor();assert.equal(await page.locator('.widget-calendar .calendar-grid button').count()>=29,true);assert.equal(await page.locator('.widget').count(),10);
 assert.deepEqual(errors,[]);console.log('PASS: catalog, timer persistence/completion, countdown, occasions, calendar navigation, weather success/failure (mocked), audio controls, persistence, mobile, Persian');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
