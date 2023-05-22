// loads selenium
const { Builder, By, until } = require('selenium-webdriver')
const chrome = require("chromedriver");

async function main() {
    let driver = await new Builder().forBrowser('chrome').build()
    let username = "albtony21"
    let profile = await getProfile(driver, username)
    console.log(`Profile:\n ${profile}`)
    driver.quit()
}

async function getProfile(driver, username) {
    const url = `https://www.instagram.com/${username}/`
    const bodyPath = '//*[contains(@id, "mount_0_0_")]/div/div/div[1]/div/div/div/div[1]'
    const profileHeaderPath = `${bodyPath}/div[2]/section/main/div/header`
    const profileBodyPath = `${bodyPath}/div[2]/section/main/div/div[2]/article/div`
    const xpaths = {
        availability: `${bodyPath}/section/main/div/div/span`,
        profileName: `${profileHeaderPath}/section/div[3]/div/span`,
        profilePhoto: `${profileHeaderPath}/div/div/span/img`,
        numberOfPost: `${profileHeaderPath}/section/ul/li[1]/button/span/span`,
        followerCount: `${profileHeaderPath}/section/ul/li[2]/button/span/span`,
        followingCount: `${profileHeaderPath}/section/ul/li[3]/button/span/span`,
        profileType: `${profileBodyPath}/div/h2`
    }

    let profile = {}
    const profileReader = new ProfileXPathReader(driver, url)
    profileReader.initialize()

    const isAvailable = await profileReader.determineAvailability(xpaths.availability, 'innerHTML');
    if(isAvailable) {
        console.log("Fetching profile, please wait...")
        profile = {
            profileName: await profileReader.getAttribute(xpaths.profileName, 'innerHTML'),
            profilePhoto: await profileReader.getAttribute(xpaths.profilePhoto, 'src'),
            numberOfPost: await profileReader.getAttribute(xpaths.numberOfPost, 'innerHTML'),
            followerCount: await profileReader.getAttribute(xpaths.followerCount, 'innerHTML'),
            followingCount: await profileReader.getAttribute(xpaths.followingCount, 'innerHTML'),
            profileType: await profileReader.determineVisibility(xpaths.profileType, 'innerHTML')
        }
        console.log("Profile fetched!")
    } else {
        console.log("Profile can't be accessed or not available")
    }
  
    return profile
}

class XPathReader {
    constructor(driver, url, timeout = 5) {
        this.driver = driver
        this.url = url
        this.element = ""
        this.timeout = this.timeout * 1000
    }

    async initialize(xpath) {
        await this.driver.get(this.url)
    }

    async getAttribute(xpath, attr) {
        try {
            this.content = ""
            await this.driver.wait(until.elementLocated(By.xpath(xpath), this.timeout))
            this.element = await this.driver.findElement(By.xpath(xpath))
            this.content = await this.element.getAttribute(attr)
        } catch(error) {
            if (error.name === 'TimeoutError') {
                console.log('Element not found within the timeout.')
            } else {
                console.log('An error occurred:', error)
            }
            this.content = error.name
        }
        return this.content
    }
}

class ProfileXPathReader extends XPathReader {
    async determineVisibility(profileXpath) {
        this.content = await this.getAttribute(profileXpath, 'innerHTML')
        console.log(this.content)

        // WIP
        if(this.content.includes("private")) {
            this.content = "private"
        } else {
            this.content = "public"
        }
        
        return this.content
    }

    async determineAvailability(profileXpath) {
        this.content = await this.getAttribute(profileXpath, 'innerHTML')

        if(this.content === "Sorry, this page isn't available.") {
            this.content = false
        } else {
            this.content = true
        }
        
        return this.content
    }
}

main()