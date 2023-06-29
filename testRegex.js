// test this regex 
const regex = /[A-Za-z0-9 ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/g
const str = 'trí văn đẹp trai';
const result = regex.test(str);
console.log(result); // true
// i want to take those characters regconized
const regex1 = /[A-Za-z0-9 ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/g
const str1 = 'trí văn đẹp trai';
const result1 = str1.match(regex1);
console.log(result1); // [ 't', 'r', 'í', 'v', 'ă', 'n', 'đ', 'ẹ', 'p', 't', 'r', 'a', 'i' ]

const regex2 = /Phường|phường|P\.|p\.|Ward|ward/g
const str2 = 'phường 1';
const result2 = str2.match(regex2);
// const result2 = regex2.test(str2);
console.log(result2); // true