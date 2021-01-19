const Discord = require('discord.js')
const puppeteer = require('puppeteer')
const config = require('./config.json')
const fs = require('fs')

const client = new Discord.Client()

const PREFIX = '.chegg'
const CHANNEL_NAME = 'chegg'
const IMAGE_FOLDER = './screenshots/'

const screenshot = (url, callback, error) => {
    (async () => {

        const browser = await puppeteer.connect({
            browserWSEndpoint: config.ENDPOINT
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        try {
            await page.goto(url);
        } catch ($e) {
            error($e)
            return
        }

        image_name = url.replace(/\W/g, '') + '.png'

        await page.screenshot({ path: (IMAGE_FOLDER + image_name), fullPage: true });

        callback(image_name)
    })()
}

client.login(config.BOT_TOKEN)

client.on('message', message => {

    if (message.author.bot) return
    if (!message.content.startsWith(PREFIX)) return
    if (message.channel.name != CHANNEL_NAME) return

    message.reply('working on it')

    let url

    try {
        url = new URL(message.content.split(' ')[1])
    } catch ($e) {
        message.reply('that is just not a valid url')
        return
    }

    if (url.hostname != 'www.chegg.com') {
        message.reply('url is not from chegg')
        return
    }

    if (!url.pathname.startsWith('/homework-help/questions-and-answers/')) {
        message.reply('no stealing credit card info bitch')
        return
    }

    screenshot('http://' + url.hostname + url.pathname,
        imageName => {
            message.reply('', {
                files: [IMAGE_FOLDER + imageName]
            })

            fs.readdir(IMAGE_FOLDER, (err, files) => {

                if (err) throw err;

                for (const file of files) {
                    fs.unlink(IMAGE_FOLDER + file, err => {
                        if (err) throw err;
                    });
                }
            });
        },
        ($e) => {
            message.reply('you broke my bot: ' + $e.message)
        }
    )
})


