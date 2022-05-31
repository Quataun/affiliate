const express = require("express")
const fetch = require("node-fetch")
const app = express()

require('dotenv').config()

const cookie = process.env.COOKIE
const userId = process.env.USER

var recentAffiliateSales = []

var isAffiliateSaleCheckDown = false

app.get("/isSystemDown", async (req, res) => {
    return res.json({
        down: isAffiliateSaleCheckDown
    })
})

app.get("/recentAffiliateSales/:assetId", async (req, res) => {
    return res.json(recentAffiliateSales.filter(sale => {
        return sale.details.id == req.params.assetId || req.params.assetId == undefined
    }))
})

app.get("/recentAffiliateSales", async (req, res) => {
    return res.json(recentAffiliateSales)
})

setInterval(() => {
    fetch(`https://economy.roblox.com/v2/users/${userId}/transactions?transactionType=AffiliateSale&limit=10`, {
        headers: {
            cookie: `.ROBLOSECURITY=${cookie}`
        }
    })
    .then(result => {
        if(result.status == 200){
            isAffiliateSaleCheckDown = false
            return result.json()
        }else{
            throw new Error("Request failed.")
        }
    })
    .then(json => {
        if(json.data){
            const data = json.data

            data.forEach(element => {
                if(recentAffiliateSales.find(ele => ele.id) == undefined){
                    recentAffiliateSales.unshift(element)
                }
                recentAffiliateSales.length = Math.min(recentAffiliateSales.length, 1000)
            })
        }
    })
    .catch((e) => {
        console.log(e)
        isAffiliateSaleCheckDown = true
    })
}, 200);

app.listen(process.env.PORT || 3030);
