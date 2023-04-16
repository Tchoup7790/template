const fs = require('fs');

const IS_DEBUG = JSON.parse(fs.readFileSync('./package.json', 'utf-8')).debug;

/**
 * 
 * @param {string} type - Log subject
 * @param {string} str - Log message
 * @param {boolean} formatType - Force type to be uppercase and give a blue color to the type
 */
const print = (type, str, formatType = true) => {
    let date = new Date();
    let message = `${date.toLocaleString()}:[${formatType ? `\x1b[34m${type.toUpperCase()}\x1b[0m` : type}] ` + str;
    console.log(message);
}

/**
 * 
 * @param {string} str - Debug message 
 */
const debug = (str) => {
    if(!IS_DEBUG) return;
    print('\x1b[32mDEBUG\x1b[0m', str, false);
}

/**
 * 
 * @param {Error} err - Error
 */
const error = (err) => {
    print('\x1b[31mERROR\x1b[0m', `\n------ \x1b[31mError\x1b[0m ------\nCode: \x1b[31m${err.code}\x1b[0m\nMessage: \x1b[31m${err.message}\x1b[0m\n${err.cause ? `Cause: \x1b[31m${err.cause}\x1b[0m\n` : ''}-------------------`, false);
}

module.exports = {
    print, debug, error
}