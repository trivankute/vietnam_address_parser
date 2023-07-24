// const importUrl = "../data/processed/"
const importUrl = "../data/processedButVars/"

// // const provinces = require(`${importUrl}province.json`)
// const cities = require(`${importUrl}city.json`)
// const districts = require(`${importUrl}district.json`)
// const wards = require(`${importUrl}ward.json`)
// const streets = require(`${importUrl}street.json`)
// const names = require(`${importUrl}name.json`)
// const housenumbers = require(`${importUrl}housenumber.json`)


const cities = require(`${importUrl}city.js`)
const districts = require(`${importUrl}district.js`)
const wards = require(`${importUrl}ward.js`)
const streets = require(`${importUrl}street.js`)
const names = require(`${importUrl}name.js`)
const housenumbers = require(`${importUrl}housenumber.js`)

const Fuse = require('fuse.js')
var levenshtein = require('fast-levenshtein');

// const fuseForProvinces = new Fuse(provinces, {
//     includeScore: true,
//     threshold: 0.5
// })
const fuseForCities = new Fuse(cities, {
    includeScore: true,
    threshold: 0.5,
})
const fuseForDistricts = new Fuse(districts, {
    includeScore: true,
    threshold: 0.5
})
const fuseForWards = new Fuse(wards, {
    includeScore: true,
    threshold: 0.5
})
const fuseForStreets = new Fuse(streets, {
    includeScore: true,
    threshold: 0.3
})
const fuseForNames = new Fuse(names, {
    includeScore: true,
    threshold: 0.3
})
const fuseForHousenumbers = new Fuse(housenumbers, {
    includeScore: true,
    threshold: 0.3
})

async function useFuses(string, signal) {
    let res = []
    // must be in order like this so that when regconize equal 0 will correct the type
    if (signal.housename === false) {
        res.push({ type: 'housename', data: await fuseForNames.search(string, { limit: 1 }) })
    }

    if (signal.housenumber === false) {
        res.push({ type: 'housenumber', data: await fuseForHousenumbers.search(string, { limit: 1 }) })
    }

    if (signal.street === false) {
        res.push({ type: 'street', data: await fuseForStreets.search(string, { limit: 1 }) })
    }

    if (signal.district === false) {
        res.push({ type: 'district', data: await fuseForDistricts.search(string, { limit: 1 }) })
    }

    if (signal.ward === false) {
        res.push({ type: 'ward', data: await fuseForWards.search(string, { limit: 1 }) })
    }

    if (signal.city === false) {
        res.push({ type: 'city', data: await fuseForCities.search(string, { limit: 1 }) })
    }

    // if (signal.province === false) {
    //     res.push({ type: 'province', data: await fuseForProvinces.search(string, { limit: 1 }) })
    // }
    return res
}

async function addressParser(fullAddress) {
    let result = {
        housenumber: false,
        housename: false,
        street: false,
        ward: false,
        district: false,
        city: false,
        // province: false
    }
    if (fullAddress === '') return {
        housenumber: "",
        housename: "",
        street: "",
        ward: "",
        district: "",
        city: "",
        // province: ""
    }
    // delete all ','; '.';
    fullAddress = fullAddress.replace(/,/g, '')
    // split fullAddress into array of tokens
    let addressTokens = fullAddress.split(' ')
    let curString = ""
    let indexStart = 0
    let curType = false
    let onlyBackwardOneTime = false
    /////////////////////////////////////// old version nothing here
    let typeChange = false
    let rightString = ''
    for (let i = 0; i < addressTokens.length; i++) {
        curString = addressTokens.slice(indexStart, i + 1).join(' ')
        console.log(curString)
        let res = await useFuses(curString, result)
        let curScore = 1
        // count number != [] or score not big in res
        let countCompatible = 0
        for (let j = 0; j < res.length; j++) {
            if (res[j].data.length > 0 && res[j].data[0].score < 0.2) {
                countCompatible++
            }
        }
        // console.log(countCompatible)
        if (countCompatible > 0) {
            //////////////////////////////////////// old version nothing here
            // find the smallest score in res
            let tempType = curType
            let tempScore = curScore
            let tempString = rightString
            for (let j = 0; j < res.length; j++) {
                //////////////////////////////////////////////// old version
                // if (res[j].data.length > 0 && res[j].data[0].score < curScore) {
                if (res[j].data.length > 0 && res[j].data[0].score < tempScore) {
                    tempType = res[j].type
                    tempScore = res[j].data[0].score
                    tempString = res[j].data[0].item

                    ///////////////////////////////////// old version
                    // curType = res[j].type
                    // curScore = res[j].data[0].score
                    // rightString = res[j].data[0].item
                }
            }
            if (curType !== false && tempType !== curType) {
                typeChange = true
            }
            else {
                curType = tempType
                curScore = tempScore
                rightString = tempString
            }
            console.log(curString, tempType, tempScore, tempString)
        }
        //////////////////////////////////////old version
        // else 
        if (countCompatible === 0 || typeChange === true) {

            // for autocomplete
            if (curType !== false) {
                // cut the last word of curString if(want to use curString)
                // curString = addressTokens.slice(indexStart, i).join(' ')
                // result[curType] = curString
                result[curType] = rightString
            }
            ////////////////////////////////////////// test for rules check
            if (curType === 'street') {
                if (result['housename'] === false)
                    result['housename'] = true
                if (result['housenumber'] === false)
                    result['housenumber'] = true
            }
            if (curType === 'ward') {
                if (result['housename'] === false)
                    result['housename'] = true
                if (result['housenumber'] === false)
                    result['housenumber'] = true
                if (result['street'] === false)
                    result['street'] = true
            }
            if (curType === 'district') {
                if (result['housename'] === false)
                    result['housename'] = true
                if (result['housenumber'] === false)
                    result['housenumber'] = true
                if (result['street'] === false)
                    result['street'] = true
                if (result['ward'] === false)
                    result['ward'] = true
            }
            if (curType === 'city') {
                if (result['housename'] === false)
                    result['housename'] = true
                if (result['housenumber'] === false)
                    result['housenumber'] = true
                if (result['street'] === false)
                    result['street'] = true
                if (result['ward'] === false)
                    result['ward'] = true
                if (result['district'] === false)
                    result['district'] = true
            }
            // if (curType === 'province') {
            //     if (result['housename'] === false)
            //         result['housename'] = true
            //     if (result['housenumber'] === false)
            //         result['housenumber'] = true
            //     if (result['street'] === false)
            //         result['street'] = true
            //     if (result['ward'] === false)
            //         result['ward'] = true
            //     if (result['district'] === false)
            //         result['district'] = true
            //     if (result['city'] === false)
            //         result['city'] = true
            // }
            // /////////////////////////////////////////////// test for every where search
            // if (curType === 'housenumber') {
            //     if (result['housename'] === false)
            //         result['housename'] = true
            // }
            // if (curType === 'housename') {
            //     if (result['housenumber'] === false)
            //         result['housenumber'] = true
            // }
            // if (curType === 'street') {
            //     if (result['street'] === false)
            //         result['street'] = true
            // }
            // if (curType === 'ward') {
            //     if (result['ward'] === false)
            //         result['ward'] = true
            // }
            // if (curType === 'district') {
            //     if (result['district'] === false)
            //         result['district'] = true
            // }



            indexStart = i
            if (countCompatible === 0 && onlyBackwardOneTime === false) {
                i--
                onlyBackwardOneTime = true
            }
            else if (countCompatible === 0 && onlyBackwardOneTime === true) {
                onlyBackwardOneTime = false
            }
            curType = false
            // /////////////////////////////// old version nothing
            typeChange = false
            rightString = ''
            continue
        }

    }

    if (curType !== false) {
        // no need to cut the last word of curString if want to use curString
        result[curType] = rightString
        ////////////////////////////////////////// test for rules check
        if (curType === 'street') {
            if (result['housename'] === false)
                result['housename'] = true
            if (result['housenumber'] === false)
                result['housenumber'] = true
        }
        if (curType === 'ward') {
            if (result['housename'] === false)
                result['housename'] = true
            if (result['housenumber'] === false)
                result['housenumber'] = true
            if (result['street'] === false)
                result['street'] = true
        }
        if (curType === 'district') {
            if (result['housename'] === false)
                result['housename'] = true
            if (result['housenumber'] === false)
                result['housenumber'] = true
            if (result['street'] === false)
                result['street'] = true
            if (result['ward'] === false)
                result['ward'] = true
        }
        if (curType === 'city') {
            if (result['housename'] === false)
                result['housename'] = true
            if (result['housenumber'] === false)
                result['housenumber'] = true
            if (result['street'] === false)
                result['street'] = true
            if (result['ward'] === false)
                result['ward'] = true
            if (result['district'] === false)
                result['district'] = true
        }
        // if (curType === 'province') {
        //     if (result['housename'] === false)
        //         result['housename'] = true
        //     if (result['housenumber'] === false)
        //         result['housenumber'] = true
        //     if (result['street'] === false)
        //         result['street'] = true
        //     if (result['ward'] === false)
        //         result['ward'] = true
        //     if (result['district'] === false)
        //         result['district'] = true
        //     if (result['city'] === false)
        //         result['city'] = true
        // }
    }
    // console.log(curType, rightString)
    return result
}

// addressParser("Đường Phùng Hưg, Phườg 13 Quan 5").then(res => console.log(res))
// addressParser("90, Đường gò Công, Phường 13, Q5").then(res => console.log(res))
// addressParser("551, Đường bình đông, Phường 13, Quan 8").then(res => console.log(res))
// addressParser("103/4 đường cao xuân duc phuong 12 quan 8").then(res => console.log(res))
// addressParser("hẻm 103 cao xuân dục quận 8").then(res => console.log(res))
// addressParser("103/4 cao xuân dục quận 8").then(res => console.log(res))
// addressParser("Bệnh viện xóm củi số nhà 895 cao xuân dục phường 12 quận 8").then(res => console.log(res))
// addressParser("Bệnh viện Tâm thần, 766, đường Võ Văn Kiệt, Phường 1, Quận 5").then(res => console.log(res))
// addressParser("Trường Đại học Bách khoa TP.HCM, 268, Lý Thường Kiệt, Phường 15, Quận 11,").then(res => console.log(res))
// addressParser("17 Dương thị mưi Quan 12").then(res => console.log(res))
// addressParser("Đại Học Khoa học Tự Nhiên, 227, Nguyễn Văn Cừ, Phường 4, Quận 5").then(res => console.log(res))
// addressParser("com chay hoa hao, 92, ban Co, Phuong 3, Quan 3").then(res => console.log(res))
// addressParser("Phường Nguyễn Cư Trinh, Quận 1,").then(res => console.log(res))
// addressParser("Quận 5,").then(res => console.log(res))
// addressParser("Đại Học Khoa học Tự Nhiên, 227, Nguyễn Văn Cừ, Phường 4, Quận 5, Thành Phố Hồ Chí Minh").then(res => console.log(res))
// addressParser("Đường tỉnh 763, Phú Túc, Xã Phú Túc, Huyện Định Quán, Tỉnh Đồng Nai, Việt Nam ").then(res => console.log(res))
// addressParser("Bác Hồ - Bác Tôn, Đường Lê Duẩn, Phường Lê Đại Hành, Quận Hai Bà Trưng, Thành phố Hà Nội tỉnh thanh hóa").then(res => console.log(res))
// addressParser("268 Lý thường kiệt phường 1 quận 1 thành phố hồ chí minh").then(res => console.log(res))
// addressParser("thành phố hồ chí minh").then(res => console.log(res))
// addressHintHelper("thành phố hồ chí minh").then(res => console.log(res))
// addressHint("Đại học bách khoa, thành phố hồ chí minh").then(res => console.log(res))
// console.log(fuseForHousenumbers.search("26", {limit:10}))
// lỗi do trong name.json tồn tại phường 13? cản bằng "place khác suburb"
// phải xóa tất cả "phường trong" housenumber và name.json

// let test = '103 cao xuân dục'
// console.log(fuseForNames.search(test, { limit: 1 }))
// console.log(fuseForHousenumbers.search(test, { limit: 1 }))
// console.log(fuseForStreets.search(test, { limit: 1 }))
// console.log(fuseForWards.search(test, { limit: 1 }))
// console.log(fuseForDistricts.search(test, { limit: 1 }))
// console.log(fuseForCities.search(test, { limit: 1 }))
// console.log(fuseForProvinces.search(test, { limit: 1 }))


// process data xóa các từ ở vị trí quan trọng như "Duong Tat" ở housename, sẽ phá hỏng xác suất đối với "duong" trong street
// Trường Đại street 0.15812480392703832 Trường đại học Công nghệ Đồng Nai -> Bến xe Ngã tư Vũng Tàu false
// ví dụ thứ tự quan trọng ở mess e Sơn


// Huong phat trien do la mỗi thành phố (cỡ 1mb data) sẽ có 1 cái address_parser (parse nhưng ko có city)
// khi đó sẽ có 1 cái address_parser chung để phân biệt city, nhưng khi parse sẽ phải thêm city vào

// // test tìm theo O(N^2)
// let test = "103/4 cao xuân dục phường 12 quận 8 tphcm"
// let testTokens = test.split(' ')

function findFirstKind(stringArrays, type) {
    let forResult = []
    let notPossible = 0 // large than 1 means not possible
    for (let i = 0; i < stringArrays.length; i++) {
        let res
        if (type === 'city')
            res = fuseForCities.search(stringArrays[i], { limit: 5 })
        // else if(type==='province')
        //     res = fuseForProvinces.search(stringArrays[i], {limit:5})
        else if (type === 'district')
            res = fuseForDistricts.search(stringArrays[i], { limit: 5 })
        else if (type === 'ward')
            res = fuseForWards.search(stringArrays[i], { limit: 5 })
        else if (type === 'street')
            res = fuseForStreets.search(stringArrays[i], { limit: 5 })
        else if (type === 'housenumber')
            res = fuseForHousenumbers.search(stringArrays[i], { limit: 5 })
        else if (type === 'housename')
            res = fuseForNames.search(stringArrays[i], { limit: 5 })
        // console.log(res)
        if (res.length !== 0) {
            let resLowestScoreArray = []
            // res may have the same lowest score
            let lowestScore = res[0].score
            for (let j = 0; j < res.length; j++) {
                if (res[j].score === lowestScore) {
                    resLowestScoreArray.push(res[j])
                }
                else
                    break
            }

            if (resLowestScoreArray.length > 1) {
                // get the res with lowest score with levenshtein
                let resLowestScore = resLowestScoreArray[0]
                let distance = levenshtein.get(resLowestScore.item, stringArrays[i], { useCollator: true })
                for (let j = 1; j < resLowestScoreArray.length; j++) {
                    let tempDistance = levenshtein.get(resLowestScoreArray[j].item, stringArrays[i])
                    if (tempDistance < distance) {
                        resLowestScore = resLowestScoreArray[j]
                        distance = tempDistance
                    }
                }
                res = [resLowestScore]
            }
            else
                res = resLowestScoreArray
        }

        if (res.length > 0 && res[0].score < 0.6) {
            let a = new Fuse([stringArrays[i]], {
                includeScore: true,
                threshold: 0.5,
            })
            notPossible = 0
            let check = a.search(res[0].item)
            if (check.length > 0 && check[0].score < 0.6) {
                forResult.push({
                    score: res[0].score + check[0].score,
                    curString: stringArrays[i],
                    rightString: res[0].item,
                    distance: levenshtein.get(res[0].item, stringArrays[i], { useCollator: true }),
                    itemsLength: i + 1
                })
            }
            // console.log(stringArrays[i], res, check)
        }
        else
            notPossible++
        // console.log(stringArrays[i], res)
        if (notPossible > 2) {
            break
        }
    }
    // loop over forResult to find the smallest distance
    // console.log(forResult)
    let minDistance = 999
    for (let i = 0; i < forResult.length; i++) {
        if (forResult[i].distance < minDistance) {
            minDistance = forResult[i].distance
        }
    }
    // filter over forResult to find all items near the smallest distance
    forResult = forResult.filter(item => item.distance < minDistance + 2)

    // loop over forResult to find the longest itemsLength
    // console.log(forResult)
    let maxLength = 0
    for (let i = 0; i < forResult.length; i++) {
        if (forResult[i].itemsLength > maxLength) {
            maxLength = forResult[i].itemsLength
        }
    }
    // filter over forResult to find all items with the longest curString
    forResult = forResult.filter(item => item.itemsLength === maxLength)

    // loop over forResult to find the smallest score
    // console.log(forResult)
    let min = 999
    for (let i = 0; i < forResult.length; i++) {
        if (forResult[i].score < min) {
            min = forResult[i].score
            minIndex = i
        }
    }

    // filter over forResult to find all items with the smallest score
    let result = forResult.filter(item => item.score === min)

    // more than one result then get the last one
    if (result.length > 1) {
        result = [result[result.length - 1]]
    }

    return result
}
// console.log(findFirstKind("268 Lý thường kiệt phường 1 quận 1 thành phố hồ chí minh", 'city'))
// console.log(findFirstKind("Lý thường kiệt phường 1 quận 1 thành phố hồ chí minh", 'city'))
// console.log(findFirstKind("thường kiệt phường 1 quận 1 thành phố hồ chí minh", 'city'))
// console.log(findFirstKind("kiệt phường 1 quận 1 thành phố hồ chí minh", 'city'))
// console.log(findFirstKind("phường 1 quận 1 thành phố hồ chí minh", 'city'))
// console.log(findFirstKind("1 quận 1 thành phố hồ chí minh", 'city'))
// console.log(findFirstKind("quận 1 thành phố hồ chí minh", 'city'))
// console.log(findFirstKind("1 thành phố hồ chí minh", 'city'))
// console.log(findFirstKind("thành phô hồ chí minh", 'city'))
// console.log(findFirstKind("thanh pho ho chi minh", 'city'))
// let res = fuseForDistricts.search("Quan 8")
// let a = new Fuse(["Thành phố Hòa Bình"], {
//     includeScore: true,
//     threshold: 0.5,
// })
// let check = a.search("thanh pho hoa binh")
// console.log(check)
// console.log(findFirstKind("Quan 8", 'province'))
// console.log(findFirstKind("bàn cờ", 'city'))
// console.log(findFirstKind("bàn cờ", 'district'))
// console.log(findFirstKind("bàn cờ", 'ward'))
// console.log(findFirstKind("bàn cờ", 'street'))
// console.log(findFirstKind("bàn cờ", 'housenumber'))
// console.log(findFirstKind("bàn cờ", 'housename'))

async function addressParserV2(fullAddress) {
    let result = {
        housenumber: false,
        housename: false,
        street: false,
        ward: false,
        district: false,
        city: false,
        // province: false
    }
    if (fullAddress === '') return {
        housenumber: "",
        housename: "",
        street: "",
        ward: "",
        district: "",
        city: "",
        // province: ""
    }
    // delete all ','; '.';
    fullAddress = fullAddress.replace(/,/g, '')
    let stop = false
    while (!stop) {
        // split fullAddress into array of tokens
        let testTokens = fullAddress.split(' ')
        let stringArrays = []
        for (let i = 1; i <= testTokens.length; i++) {
            stringArrays.push(testTokens.slice(0, i).join(' '))
        }
        let probsArray = []
        if (result.housename === false) {
            let housenameProb = findFirstKind(stringArrays, 'housename')
            probsArray.push({
                type: 'housename',
                ...housenameProb[0]
            })
        }
        if (result.housenumber === false) {
            let housenumberProb = findFirstKind(stringArrays, 'housenumber')
            probsArray.push({
                type: 'housenumber',
                ...housenumberProb[0]
            })
        }
        if (result.street === false) {
            let streetProb = findFirstKind(stringArrays, 'street')
            probsArray.push({
                type: 'street',
                ...streetProb[0]
            })
        }
        if (result.ward === false) {
            let wardProb = findFirstKind(stringArrays, 'ward')
            probsArray.push({
                type: 'ward',
                ...wardProb[0]
            })
        }
        if (result.district === false) {
            let districtProb = findFirstKind(stringArrays, 'district')
            probsArray.push({
                type: 'district',
                ...districtProb[0]
            })
        }
        if (result.city === false) {
            let cityProb = findFirstKind(stringArrays, 'city')
            probsArray.push({
                type: 'city',
                ...cityProb[0]
            })
        }
        // if(result.province===false) 
        // {
        //     let provinceProb = findFirstKind(fullAddress, 'province')
        //     probsArray.push({
        //         type: 'province',
        //         ...provinceProb[0]
        //     })
        // }

        // filter lowest distance
        let minDistance = 999
        for (let i = 0; i < probsArray.length; i++) {
            if (probsArray[i].distance < minDistance) {
                minDistance = probsArray[i].distance
            }
        }
        probsArray = probsArray.filter(item => item.distance < minDistance + 2)

        // filter longest itemsLength
        let maxLength = 0
        for (let i = 0; i < probsArray.length; i++) {
            if (probsArray[i].itemsLength > maxLength) {
                maxLength = probsArray[i].itemsLength
            }
        }
        probsArray = probsArray.filter(item => item.itemsLength === maxLength)

        // filter smallest score
        let min = 999
        for (let i = 0; i < probsArray.length; i++) {
            if (probsArray[i].score < min) {
                min = probsArray[i].score
                minIndex = i
            }
        }

        if (probsArray.length > 0) {
            let tempType = probsArray[minIndex].type
            let tempRightString = probsArray[minIndex].rightString
            let tempString = probsArray[minIndex].curString
            result[tempType] = tempRightString
            fullAddress = fullAddress.replace(tempString, '')
            fullAddress = fullAddress.trim()
            if (tempType === 'street') {
                if (result['housename'] === false)
                    result['housename'] = true
                if (result['housenumber'] === false)
                    result['housenumber'] = true
            }
            if (tempType === 'ward') {
                if (result['housename'] === false)
                    result['housename'] = true
                if (result['housenumber'] === false)
                    result['housenumber'] = true
                if (result['street'] === false)
                    result['street'] = true
            }
            if (tempType === 'district') {
                if (result['housename'] === false)
                    result['housename'] = true
                if (result['housenumber'] === false)
                    result['housenumber'] = true
                if (result['street'] === false)
                    result['street'] = true
                if (result['ward'] === false)
                    result['ward'] = true
            }
            if (tempType === 'city') {
                if (result['housename'] === false)
                    result['housename'] = true
                if (result['housenumber'] === false)
                    result['housenumber'] = true
                if (result['street'] === false)
                    result['street'] = true
                if (result['ward'] === false)
                    result['ward'] = true
                if (result['district'] === false)
                    result['district'] = true
            }
            // if (tempType === 'province') {
            //     if (result['housename'] === false)
            //         result['housename'] = true
            //     if (result['housenumber'] === false)
            //         result['housenumber'] = true
            //     if (result['street'] === false)
            //         result['street'] = true
            //     if (result['ward'] === false)
            //         result['ward'] = true
            //     if (result['district'] === false)
            //         result['district'] = true
            //     if (result['city'] === false)
            //         result['city'] = true
            // }
        }
        else {
            stop = true
        }
        // console.log("loop")
    }
    // console.log("done")
    return result
}
// module.exports = addressParserV2
// addressParserV2("Đường Phùng Hưg, Phườg 13 Quận 5").then(res => console.log(res))
// addressParserV2("90, Đường gò Công, Phường 13, Quận 5").then(res => console.log(res))
// addressParserV2("551, Đường bình đông, Phường 13, Quan 8").then(res => console.log(res))
// addressParserV2("103/4 đường cao xuân duc phuong 12 quan 8").then(res => console.log(res))
// addressParserV2("hẻm 103 cao xuân dục quận 8").then(res => console.log(res))
// addressParserV2("103/4 cao xuân dục quận 8").then(res => console.log(res))
// addressParserV2("thanh pho hoa binh").then(res => console.log(res))
// addressParserV2("Bệnh viện xóm củi số nhà 895 cao xuân dục phường 12 quận 8").then(res => console.log(res))
// addressParserV2("Bệnh viện Tâm thần, 766, đường Võ Văn Kiệt, Phường 1, Quận 5").then(res => console.log(res))
// addressParserV2("Trường Đại học Bách khoa TP.HCM, 268, Lý Thường Kiệt, Phường 15, Quận 11, thanh pho hoa binh").then(res => console.log(res))
// addressParserV2("17 Dương thị mưi Quan 12").then(res => console.log(res))
// addressParserV2("Đại Học Khoa học Tự Nhiên, 227, Nguyễn Văn Cừ, Phường 4, Quận 5").then(res => console.log(res))
// addressParserV2("com chay hoa hao, 92, bàn cờ, Phuong 3, Quan 3").then(res => console.log(res))
// addressParserV2("Phường Nguyễn Cư Trinh, Quận 1,").then(res => console.log(res))
// addressParserV2("Quận 5,").then(res => console.log(res))
// addressParserV2("Đại Học Khoa học Tự Nhiên, 227, Nguyễn Văn Cừ, Phường 4, Quận 5, Thành Phố Hồ Chí Minh").then(res => {
//     console.log("V2:", res)
// })
// addressParserV2("Đường tỉnh 763, Xã Phú Túc, Huyện Định Quán, Tỉnh Đồng Nai, Việt Nam ").then(res => console.log(res))
// addressParserV2("Bác Hồ - Bác Tôn, Đường Lê Duẩn, Phường Lê Đại Hành, Quận Hai Bà Trưng, Thành phố Hà Nội tỉnh thanh hóa").then(res => console.log(res))
// addressParserV2("268 Lý thường kiệt phường 1 quận 1 thành phố hồ chí minh").then(res => console.log(res))
// addressParserV2("thành phố hồ chí minh").then(res => console.log(res))

////////////////////////////////////////////////////////////////////////
const { StaticPool } = require('node-worker-threads-pool');
async function addressParserV3WithThreads(fullAddress) {
    const pool = new StaticPool({
        size: 3,
        task: './main/worker.js'
    });
    let result = {
        housenumber: false,
        housename: false,
        street: false,
        ward: false,
        district: false,
        city: false,
        // province: false
    }
    if (fullAddress === '') return {
        housenumber: "",
        housename: "",
        street: "",
        ward: "",
        district: "",
        city: "",
        // province: ""
    }
    // delete all ','; '.';
    fullAddress = fullAddress.replace(/,/g, '')
    let stop = false
    while (!stop) {
        // split fullAddress into array of tokens
        let testTokens = fullAddress.split(' ')
        let stringArrays = []
        for (let i = 1; i <= testTokens.length; i++) {
            stringArrays.push(testTokens.slice(0, i).join(' '))
        }
        let order = ['city', 'district', 'ward', 'street', 'housenumber', 'housename'];
        let promises = [];
        for (let i = 0; i < order.length; i++) {
            if (result.housename === false && order[i] === 'housename') {
                promises.push(pool.exec({ stringArrays, type: order[i] }));
            }
            if (result.housenumber === false && order[i] === 'housenumber') {
                promises.push(pool.exec({ stringArrays, type: order[i] }));
            }
            if (result.street === false && order[i] === 'street') {
                promises.push(pool.exec({ stringArrays, type: order[i] }));
            }
            if (result.ward === false && order[i] === 'ward') {
                promises.push(pool.exec({ stringArrays, type: order[i] }));
            }
            if (result.district === false && order[i] === 'district') {
                promises.push(pool.exec({ stringArrays, type: order[i] }));
            }
            if (result.city === false && order[i] === 'city') {
                promises.push(pool.exec({ stringArrays, type: order[i] }));
            }
        }
        let probsArray = await Promise.all(promises)

        // filter lowest distance
        let minDistance = 999
        for (let i = 0; i < probsArray.length; i++) {
            if (probsArray[i].distance < minDistance) {
                minDistance = probsArray[i].distance
            }
        }
        probsArray = probsArray.filter(item => item.distance < minDistance + 2)

        // filter longest itemsLength
        let maxLength = 0
        for (let i = 0; i < probsArray.length; i++) {
            if (probsArray[i].itemsLength > maxLength) {
                maxLength = probsArray[i].itemsLength
            }
        }
        probsArray = probsArray.filter(item => item.itemsLength === maxLength)

        // filter smallest score
        let min = 999
        for (let i = 0; i < probsArray.length; i++) {
            if (probsArray[i].score < min) {
                min = probsArray[i].score
                minIndex = i
            }
        }

        if (probsArray.length > 0) {
            let tempType = probsArray[minIndex].type
            let tempRightString = probsArray[minIndex].rightString
            let tempString = probsArray[minIndex].curString
            result[tempType] = tempRightString
            fullAddress = fullAddress.replace(tempString, '')
            fullAddress = fullAddress.trim()
            if (tempType === 'street') {
                if (result['housename'] === false)
                    result['housename'] = true
                else if (result['housenumber'] === false)
                    result['housenumber'] = true
            }
            else if (tempType === 'ward') {
                if (result['housename'] === false)
                    result['housename'] = true
                else if (result['housenumber'] === false)
                    result['housenumber'] = true
                else if (result['street'] === false)
                    result['street'] = true
            }
            else if (tempType === 'district') {
                if (result['housename'] === false)
                    result['housename'] = true
                else if (result['housenumber'] === false)
                    result['housenumber'] = true
                else if (result['street'] === false)
                    result['street'] = true
                else if (result['ward'] === false)
                    result['ward'] = true
            }
            else if (tempType === 'city') {
                if (result['housename'] === false)
                    result['housename'] = true
                else if (result['housenumber'] === false)
                    result['housenumber'] = true
                else if (result['street'] === false)
                    result['street'] = true
                else if (result['ward'] === false)
                    result['ward'] = true
                else if (result['district'] === false)
                    result['district'] = true
            }
            // if (tempType === 'province') {
            //     if (result['housename'] === false)
            //         result['housename'] = true
            //     if (result['housenumber'] === false)
            //         result['housenumber'] = true
            //     if (result['street'] === false)
            //         result['street'] = true
            //     if (result['ward'] === false)
            //         result['ward'] = true
            //     if (result['district'] === false)
            //         result['district'] = true
            //     if (result['city'] === false)
            //         result['city'] = true
            // }
        }
        else {
            stop = true
        }
        // console.log("loop")
    }
    // console.log("done")
    await pool.destroy()
    return result
}
// addressParserV3WithThreads("Đại Học Khoa học Tự Nhiên, 227, Nguyễn Văn Cừ, Phường 4, Quận 5, Thành Phố Hồ Chí Minh").then(res => {
//     console.log("V3:", res)
// })
//////////////////////////////////////////////////////////////////////////////
// test for address hint
async function addressHint(fullAddress) {
    const pool = new StaticPool({
        size: 3,
        task: './main/worker.js'
    });
    // delete all ',';
    fullAddress = fullAddress.replace(/,/g, '')
    let testTokens = fullAddress.split(' ')
    let stringArrays = []
    for (let i = testTokens.length - 1; i >= 0; i--) {
        stringArrays.push(testTokens.slice(i, testTokens.length).join(' '))
    }

    let order = ['city', 'district', 'ward', 'street', 'housenumber', 'housename'];
    let promises = [];
    for (let i = 0; i < order.length; i++) {
        if (order[i] === 'housename') {
            promises.push(pool.exec({ stringArrays, type: order[i] }));
        }
        if (order[i] === 'housenumber') {
            promises.push(pool.exec({ stringArrays, type: order[i] }));
        }
        if (order[i] === 'street') {
            promises.push(pool.exec({ stringArrays, type: order[i] }));
        }
        if (order[i] === 'ward') {
            promises.push(pool.exec({ stringArrays, type: order[i] }));
        }
        if (order[i] === 'district') {
            promises.push(pool.exec({ stringArrays, type: order[i] }));
        }
        if (order[i] === 'city') {
            promises.push(pool.exec({ stringArrays, type: order[i] }));
        }
    }
    let result = await Promise.all(promises)
    // find the smallest distance
    let minDistance = 999
    for (let i = 0; i < result.length; i++) {
        if (result[i].distance < minDistance) {
            minDistance = result[i].distance
        }
    }
    // filter over result to find all items near the smallest distance
    result = result.filter(item => item.distance < minDistance + 2)

    // find the longest itemsLength
    let maxLength = 0
    for (let i = 0; i < result.length; i++) {
        if (result[i].itemsLength > maxLength) {
            maxLength = result[i].itemsLength
        }
    }

    // filter over result to find all items with the longest curString
    result = result.filter(item => item.itemsLength === maxLength)

    // find the smallest score
    let min = 999
    for (let i = 0; i < result.length; i++) {
        if (result[i].score < min) {
            min = result[i].score
            minIndex = i
        }
    }

    // filter over result to find all items with the smallest score
    result = result.filter(item => item.score === min)

    // more than one result then get the last one
    if (result.length > 1) {
        result = [result[result.length - 1]]
    }

    if (result.length === 0) {
        console.log("not found")
        return
    }

    let hintsList = []
    if (result[0].type === 'city') {
        hintsList = fuseForCities.search(result[0].curString, { limit: 10 })
    }
    else if (result[0].type === 'district') {
        hintsList = fuseForDistricts.search(result[0].curString, { limit: 10 })
    }
    else if (result[0].type === 'ward') {
        hintsList = fuseForWards.search(result[0].curString, { limit: 10 })
    }
    else if (result[0].type === 'street') {
        hintsList = fuseForStreets.search(result[0].curString, { limit: 10 })
    }
    else if (result[0].type === 'housenumber') {
        hintsList = fuseForHousenumbers.search(result[0].curString, { limit: 10 })
    }
    else if (result[0].type === 'housename') {
        hintsList = fuseForNames.search(result[0].curString, { limit: 10 })
    }

    // filter first 10 items with the smallest score < 0.5
    hintsList = hintsList.filter(item => item.score < 0.5)

    // replace fullAddress with the item in hintsList
    let addressHints = hintsList.map(item => {
        let tempFullAddress = fullAddress.replace(result[0].curString, item.item)
        return tempFullAddress
    })

    await pool.destroy()
    return addressHints
}
// let test = '103/4 cao xuân dục phường 12 quận 8 thành phố hồ chí minh'
// let test = 'Đại Học Khoa học Tự'
// console.log(fuseForNames.search(test, { limit: 1 }))
// console.log(fuseForHousenumbers.search(test, { limit: 1 }))
// console.log(fuseForStreets.search(test, { limit: 1 }))
// console.log(fuseForWards.search(test, { limit: 1 }))
// console.log(fuseForDistricts.search(test, { limit: 1 }))
// console.log(fuseForCities.search(test, { limit: 1 }))
// addressHint(test).then(res => console.log(res))
module.exports = {
    addressParserV2,
    addressParserV3WithThreads,
    addressHint
}
//////////////////////////////////////////////////////////////////////////////
// function testForFunForCity(test) {
//     // delete all ','; '.';
//     test = test.replace(/,/g, '')
//     let testTokens = test.split(' ')
//     let stringArrays = []
//     for (let i = 0; i < testTokens.length - 1; i++) {
//         for (let j = 0; j <= testTokens.length; j++) {
//             if (testTokens[j] !== testTokens[i] && j > i) {
//                 stringArrays.push(testTokens.slice(i, j + 1).join(' '))
//             }
//         }
//     }
//     let minIndex = 0;
//     let min = 999
//     for (let i = 0; i < stringArrays.length; i++) {
//         let res = fuseForCities.search(stringArrays[i], { limit: 1 })
//         if (res.length > 0 && res[0].score <= min) {
//             min = res[0].score
//             minIndex = i
//         }
//     }
//     console.log(min, stringArrays[minIndex])
// }
// testForFunForCity("Đại học bách khoa, thành phố thanh hóa")
// function testForFunForWard(test) {
//     // delete all ','; '.';
//     test = test.replace(/,/g, '')
//     let testTokens = test.split(' ')
//     let stringArrays = []
//     for(let i=0; i<testTokens.length-1; i++)
//     {
//         for(let j=0; j<=testTokens.length; j++)
//         {
//             if(testTokens[j]!==testTokens[i]&&j>i)
//             {
//                 stringArrays.push(testTokens.slice(i, j+1).join(' '))
//             }
//         }
//     }
//     let minIndex = 0;
//     let min = 999
//     for(let i=0; i<stringArrays.length; i++)
//     {
//         let res = fuseForWards.search(stringArrays[i], { limit: 1 })
//         if(res.length>0&&res[0].score<=min)
//         {
//             min = res[0].score
//             minIndex = i
//         }
//     }
//     console.log(min, stringArrays[minIndex])
// }
// function testForFunForDistrict(test) {
//     // delete all ','; '.';
//     test = test.replace(/,/g, '')
//     let testTokens = test.split(' ')
//     let stringArrays = []
//     for(let i=0; i<testTokens.length-1; i++)
//     {
//         for(let j=0; j<=testTokens.length; j++)
//         {
//             if(testTokens[j]!==testTokens[i]&&j>i)
//             {
//                 stringArrays.push(testTokens.slice(i, j+1).join(' '))
//             }
//         }
//     }
//     let minIndex = 0;
//     let min = 999
//     for(let i=0; i<stringArrays.length; i++)
//     {
//         let res = fuseForDistricts.search(stringArrays[i], { limit: 1 })
//         if(res.length>0&&res[0].score<=min)
//         {
//             min = res[0].score
//             minIndex = i
//         }
//     }
//     console.log(min, stringArrays[minIndex])
// }
// testForFunForDistrict("thành thái Đại học bách khoa, thành phố hồ chí minh")

// function testForFunForHousenumber(test) {
//     // delete all ','; '.';
//     test = test.replace(/,/g, '')
//     let testTokens = test.split(' ')
//     let stringArrays = []
//     for(let i=0; i<testTokens.length-1; i++)
//     {
//         for(let j=0; j<=testTokens.length; j++)
//         {
//             if(testTokens[j]!==testTokens[i]&&j>i)
//             {
//                 stringArrays.push(testTokens.slice(i, j).join(' '))
//             }
//         }
//     }
//     console.log(stringArrays)
//     let minIndex = 0;
//     let min = 999
//     for(let i=0; i<stringArrays.length; i++)
//     {
//         let res = fuseForHousenumbers.search(stringArrays[i], { limit: 1 })
//         console.log(res)
//         if(res.length>0&&res[0].score<=min)
//         {
//             min = res[0].score
//             minIndex = i
//         }
//     }
//     console.log(min, stringArrays[minIndex])
// }

// testForFunForDistrict(test)
// testForFunForHousenumber(test)

// // return all name in housenumbers start with "Phường" or "phường" with array method cut and bring it to ward.json
// let test = []
// console.log(housenumbers.length)
// for(let i=0; i<housenumbers.length; i++)
// {
//     if(housenumbers[i].startsWith("Phường")||housenumbers[i].startsWith("phường"))
//     {
//         test.push({name: housenumbers[i], index:i})
//         // remove at index i
//         housenumbers.splice(i, 1)
//     }
// }

// console.log(test.length)
// console.log(housenumbers.length)
// console.log(wards.length)

// // push into wards if not exist in wards
// for(let i=0; i<test.length; i++)
// {
//     let isExist = false
//     for(let j=0; j<wards.length; j++)
//     {
//         if(wards[j]===test[i].name)
//         {
//             isExist = true
//             break
//         }
//     }
//     if(isExist===false)
//     {
//         wards.push(test[i].name)
//     }
// }
// console.log(wards.length)


// // store wards to file
// const fs = require('fs')
// fs.writeFile(`ward.json`, JSON.stringify(wards), function (err) {
//     if (err) return console.log(err);
//     console.log('saved');
// }
// );

// // store names to file
// fs.writeFile(`housenumber.json`, JSON.stringify(housenumbers), function (err) {
//     if (err) return console.log(err);
//     console.log('saved');
// }
// );
