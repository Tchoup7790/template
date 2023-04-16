// Libs
const fs = require('fs');
const path = require('path');
const sass = require('node-sass');
const glob = require('glob');

// Modules
const logger = require('./utils/logger.js');

// Custom error when no/missing arguments
const ARGS_MISSING_ERROR = new Error("Missing arguments - node index.js [scss folder path]:[css output file]");
ARGS_MISSING_ERROR.code = "ERRARGS";

let args = process.argv.slice(2);   // Get only interesting args

const [ SCSS_PATH, OUTPUT_CSS ] = args[0].split(':');   // Sass folder path and css output file (arguments)
const MAIN_SCSS = path.join(SCSS_PATH, 'main.scss');    // Main scss file where all others scss file are imported (the file must be called main.scss)

if(!SCSS_PATH || !OUTPUT_CSS) {
    // No args given --> Error
    logger.error(ARGS_MISSING_ERROR);
    process.exit(1);
}

const getContent = async (src) => {
    return await glob(src + '/**/*.scss', (err, data) => {
        if(err) throw err;
        return data;
    });
};

const scssListen = (file_path) => {
    logger.debug(`Listening to \x1b[33m${file_path}\x1b[0m`);
    fs.watchFile(file_path, (curr, prev) => {
        logger.print('CHANGE', `Record new changement from ${file_path}`);
        try {
            compileMainScss();
        } catch(err) {
            logger.error(err);
        }
    });
}

const compileMainScss = () => {
    // Compile main.scss
    try {
        sass.render({
            file: MAIN_SCSS // file : main.css path
        }, (err, res) => {
            if(err) throw err;

            let start = new Date(res.stats.start);  // Date and time at start and 
            let end = new Date(res.stats.end);      // at the end of the rendering

            // Debug scss compilation stats
            logger.debug(
                '\n------Compile Stats------\n' +
                `Compiled File: \x1b[33m${res.stats.entry}\x1b[0m\n`+
                `Included Files:\n\x1b[33m    ${res.stats.includedFiles.join('\n    ')}\x1b[0m\n`+
                `Start: ${start.toLocaleString()}\n`+
                `End: ${end.toLocaleString()}\n`+
                '-------------------------'
            );

            fs.writeFileSync(OUTPUT_CSS, res.css); // Write rendering output in the output css file
        });
    } catch(err) {
        console.error(err);
    }
}

(async () => {
    if(!fs.existsSync(SCSS_PATH) || !fs.existsSync(OUTPUT_CSS)) {
        // Scss folder path is not valid or css file path is not valid
        logger.error(ARGS_MISSING_ERROR);
        process.exit(1);
    }

    try {
        let scss_files = await getContent(SCSS_PATH);
        scss_files.forEach(scss_file => {
            scssListen(scss_file);
        });
        logger.print('Ready', `SCSS compiler is ready !`);
    } catch(err) {
        logger.error(err);
    }
})();