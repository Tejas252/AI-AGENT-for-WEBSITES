import dotenv from 'dotenv'
import {  scrapeRecusively } from '../services/scraping';

dotenv.config();

scrapeRecusively("https://piyushgarg.dev","/").then((data) => {
    console.log("done");
})





