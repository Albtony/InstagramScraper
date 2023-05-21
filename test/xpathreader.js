// loads selenium
const { Builder, By, until } = require('selenium-webdriver')
const readline = require('readline');
const chrome = require('selenium-webdriver/chrome');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

//*[@id="mount_0_0_dW"]/div/div/div[1]/div/div/div/div[1]
// section/main/div/div/span/text()

async function main() {
    

    const options = new chrome.Options();
    const useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    options.addArguments(`--user-agent=${useragent}`);

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()

    let username = "tistaetr"
    const url = `https://www.instagram.com/${username}/`
    const bodyPath = '//*[contains(@id, "mount_0_0_")]/div/div/div[1]/div/div/div/div[1]'
    const profileHeaderPath = `${bodyPath}/div[2]/section/main/div/header`
    const profileBodyPath = `${bodyPath}/div[2]/section/main/div/div[2]/article/div`
    const xpath = `${profileHeaderPath}/section/div[3]/div/span`
    const result = await readXPath(driver, url, xpath)
    console.log(`result = "${result}"`)

    await new Promise((resolve) => {
        rl.question('Press any key and Enter to close the browser:', () => {
            rl.close();
            resolve();
            driver.quit()
        });
    });     
}

async function readXPath(driver, url, xpath) {
    let result = "Empty"
    try {
        await driver.get(url)
        await driver.wait(until.elementLocated(By.xpath(xpath)))
        let element = await driver.findElement(By.xpath(xpath))
        result = await element.getAttribute('innerHTML')
    } catch(error) {
        if (error.name === 'TimeoutError') {
            console.log('Element not found within the timeout.')
        } else {
            console.log('An error occurred:', error)
        }
        result = error.name
    } 
    return result
}

main()