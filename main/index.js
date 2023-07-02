const importUrl = "../data/processed/"

const districts = require(`${importUrl}district.json`)
const wards = require(`${importUrl}ward.json`)
const streets = require(`${importUrl}street.json`)
const names = require(`${importUrl}name.json`)
const housenumbers = require(`${importUrl}housenumber.json`)

const Fuse = require('fuse.js')

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

    return res
}

async function addressParser(fullAddress) {
    let result = {
        housenumber: false,
        housename: false,
        street: false,
        ward: false,
        district: false,
        city: 'Thành phố Hồ Chí Minh'
    }
    if (fullAddress === '') return {
        housenumber: "",
        housename: "",
        street: "",
        ward: "",
        district: "",
        city: ""
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
        // count number of not [] in res
        let countCompatible = 0
        for (let j = 0; j < res.length; j++) {
            if (res[j].data.length > 0&&res[j].data[0].score < 0.2) {
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
            // cut the last word of curString
            // curString = addressTokens.slice(indexStart, i).join(' ')
            // result[curType] = curString

            // for autocomplete
            if(curType!==false)
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
    }
    // console.log(curType, rightString)
    return result
}

// addressParser("Đường Phùng Hưg, Phườg 13 Q5").then(res => console.log(res))
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
// addressParser("Quận 1,").then(res => console.log(res))
// addressParser("Đại Học Khoa học Tự Nhiên, 227, Nguyễn Văn Cừ, Phường 4, Quận 5").then(res => console.log(res))
// lỗi do trong name.json tồn tại phường 13? cản bằng "place khác suburb"
// phải xóa tất cả "phường trong" housenumber và name.json

// let test = '103/4 cao'
// console.log(fuseForNames.search(test, { limit: 1 }))
// console.log(fuseForHousenumbers.search(test, { limit: 1 }))
// console.log(fuseForStreets.search(test, { limit: 1 }))
// console.log(fuseForWards.search(test, { limit: 1 }))
// console.log(fuseForDistricts.search(test, { limit: 1 }))

// process data xóa các từ ở vị trí quan trọng như "Duong Tat" ở housename, sẽ phá hỏng xác suất đối với "duong" trong street
// Trường Đại street 0.15812480392703832 Trường đại học Công nghệ Đồng Nai -> Bến xe Ngã tư Vũng Tàu false
// ví dụ thứ tự quan trọng ở mess e Sơn


// Huong phat trien do la mỗi thành phố (cỡ 1mb data) sẽ có 1 cái address_parser (parse nhưng ko có city)
// khi đó sẽ có 1 cái address_parser chung để phân biệt city, nhưng khi parse sẽ phải thêm city vào

// // test tìm theo O(N^2)
// let test = "103/4 cao xuân dục phường 12 quận 8 tphcm"
// let testTokens = test.split(' ')

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