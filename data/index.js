// const fs = require('fs')
// // integrate 2 array names
// const point_name = require('./point_name.json')
// const polygon_name = require('./polygon_name.json')
// let name = point_name.concat(polygon_name)
// // make it become an array without key=name
// name = name.map(item => {
//     return item.name
// })
// fs.writeFile('./data/processed/name.json', JSON.stringify(name), function (err) {
//     if (err) throw err;
//     console.log('Saved!');
// })

// //  integrate 2 array housenumbers
// const point_housenumber = require('./point_housenumber.json')
// const polygon_housenumber = require('./polygon_housenumber.json')
// let housenumber = point_housenumber.concat(polygon_housenumber)
// // make it become an array without key="addr:housenumber"
// housenumber = housenumber.map(item => {
//     return item['addr:housenumber']
// })
// fs.writeFile('./data/processed/housenumber.json', JSON.stringify(housenumber), function (err) {
//     if (err) throw err;
//     console.log('Saved!');
// })

// // make distrct become an array without key=district
// const district_name = require('./district_name.json')
// let district = district_name.map(item => {
//     return item.district
// })
// fs.writeFile('./data/processed/district.json', JSON.stringify(district), function (err) {
//     if (err) throw err;
//     console.log('Saved!');
// })

// // make ward become an array without key=ward
// const ward_name = require('./ward_name.json')
// let ward = ward_name.map(item => {
//     return item.ward
// })
// fs.writeFile('./data/processed/ward.json', JSON.stringify(ward), function (err) {
//     if (err) throw err;
//     console.log('Saved!');
// })

// // make street become an array without key=name
// const line_name = require('./line_name.json')
// let line = line_name.map(item => {
//     return item.name
// })
// fs.writeFile('./data/processed/street.json', JSON.stringify(line), function (err) {
//     if (err) throw err;
//     console.log('Saved!');
// })