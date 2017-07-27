"use strict";

/**
* Function of convert image from base 64 to Blob
* @param {string} base64Data - receive base 64 image
* @param {string} contentType - receive type of image
* @return - return image in format blob
*/
function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength =  byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

/**
* Function of create Image
* @param {int} size - receive size of image
* @return - returns the image with specified size
*/
function createImage(size) {
    /*Create new simple image for tests*/

    // Create canvas of image
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var context = canvas.getContext("2d");
    var imageData = context.createImageData(size, size);

    // Set image byte colors
    for (var i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 255;
        imageData.data[i+1] = 100;
        imageData.data[i+2] = 0;
        imageData.data[i+3] = 255;
    }

    // Put image in cavas
    context.putImageData(imageData, 0, 0);
    // Get base64 data of image
    imageData = canvas.toDataURL("image/jpeg", 1);

    var image = new File([base64toBlob(imageData.split(',')[1]),
        'image/jpeg'],
        'imageTest',
        {type: 'image/jpeg'});

    return image;
}